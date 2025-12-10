import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { MessageModel } from '../models/Message';
import { OllamaService } from '../services/ollama';
import { Session } from '../types';
import { MAX_MESSAGE_LENGTH, MAX_CONTEXT_MESSAGES, UUID_PATTERN } from '../constants';

const router = Router();

function isValidSessionId(sessionId: string): boolean {
  return UUID_PATTERN.test(sessionId);
}

router.get('/messages', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.query;
    
    if (sessionId && typeof sessionId === 'string') {
      if (!isValidSessionId(sessionId)) {
        return res.status(400).json({ error: 'Invalid sessionId format' });
      }
    }
    
    const query = sessionId ? { sessionId } : {};
    
    const messages = await MessageModel.find(query)
      .sort({ createdAt: 1 })
      .select('role content createdAt sessionId')
      .lean();

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch messages',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/messages', async (req: Request, res: Response) => {
  try {
    const { content, sessionId } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    if (content.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ 
        error: `Message content must be ${MAX_MESSAGE_LENGTH} characters or less` 
      });
    }

    if (sessionId && typeof sessionId === 'string') {
      if (!isValidSessionId(sessionId)) {
        return res.status(400).json({ error: 'Invalid sessionId format' });
      }
    }

    const currentSessionId = sessionId || randomUUID();

    const userMessage = new MessageModel({
      role: 'user',
      content: content.trim(),
      sessionId: currentSessionId,
    });
    await userMessage.save();

    const previousMessages = await MessageModel.find({ sessionId: currentSessionId })
      .sort({ createdAt: -1 })
      .limit(MAX_CONTEXT_MESSAGES)
      .select('role content')
      .lean()
      .then(messages => messages.reverse());

    const ollamaMessages = OllamaService.convertToOllamaMessages(previousMessages);
    const aiContent = await OllamaService.getChatResponse(ollamaMessages);

    const aiMessage = new MessageModel({
      role: 'ai',
      content: aiContent,
      sessionId: currentSessionId,
    });
    await aiMessage.save();

    res.json({
      sessionId: currentSessionId,
      userMessage: {
        id: userMessage._id,
        role: userMessage.role,
        content: userMessage.content,
        createdAt: userMessage.createdAt,
        sessionId: currentSessionId,
      },
      aiMessage: {
        id: aiMessage._id,
        role: aiMessage.role,
        content: aiMessage.content,
        createdAt: aiMessage.createdAt,
        sessionId: currentSessionId,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('cannot connect to ollama') || 
          errorMessage.includes('econnrefused') ||
          errorMessage.includes('no response from ollama')) {
        return res.status(503).json({
          error: 'Ollama service unavailable',
          message: 'Cannot connect to Ollama. Please make sure Ollama is running.',
        });
      }
      
      if (errorMessage.includes('timeout') || errorMessage.includes('etimedout') || errorMessage.includes('econnaborted')) {
        return res.status(504).json({
          error: 'Ollama request timeout',
          message: 'Ollama is taking too long to respond. The model may be slow or system resources are constrained. Please try again.',
        });
      }
      
      if (errorMessage.includes('not found') || errorMessage.includes('404')) {
        return res.status(404).json({
          error: 'Model not found',
          message: error.message || 'The specified model is not available. Please pull it first using: ollama pull <model-name>',
        });
      }
      
      if (errorMessage.includes('ollama')) {
        return res.status(503).json({
          error: 'Ollama service error',
          message: error.message,
        });
      }
    }

    res.status(500).json({
      error: 'Failed to send message',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.delete('/messages', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.query;
    
    if (sessionId && typeof sessionId === 'string') {
      if (!isValidSessionId(sessionId)) {
        return res.status(400).json({ error: 'Invalid sessionId format' });
      }
    }
    
    const query = sessionId ? { sessionId } : {};
    
    const result = await MessageModel.deleteMany(query);
    res.json({
      message: sessionId ? 'Session messages cleared' : 'All messages cleared',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to clear messages',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/sessions', async (req: Request, res: Response) => {
  try {
    const sessions = await MessageModel.aggregate([
      {
        $match: { sessionId: { $exists: true, $ne: null } }
      },
      {
        $group: {
          _id: '$sessionId',
          messageCount: { $sum: 1 },
          createdAt: { $min: '$createdAt' },
          lastMessageAt: { $max: '$createdAt' }
        }
      },
      {
        $sort: { lastMessageAt: -1 }
      }
    ]);

    const sessionsWithTitles: Session[] = await Promise.all(
      sessions.map(async (session) => {
        const firstUserMessage = await MessageModel.findOne({
          sessionId: session._id,
          role: 'user'
        })
          .sort({ createdAt: 1 })
          .select('content')
          .lean();

        const lastMessage = await MessageModel.findOne({
          sessionId: session._id
        })
          .sort({ createdAt: -1 })
          .select('content')
          .lean();

        return {
          id: session._id,
          title: firstUserMessage?.content?.substring(0, 50) || 'New Chat',
          messageCount: session.messageCount,
          lastMessage: lastMessage?.content?.substring(0, 100) || '',
          createdAt: session.createdAt,
        };
      })
    );

    res.json({ sessions: sessionsWithTitles });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch sessions',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;


import axios, { AxiosError } from "axios";
import { OllamaRequest, OllamaResponse, OllamaMessage } from "../types";
import { OLLAMA_TIMEOUT } from "../constants";

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || "http://localhost:11434";
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || "llama3.2:1b";

export class OllamaService {
  static async getChatResponse(
    messages: OllamaMessage[],
    model: string = DEFAULT_MODEL
  ): Promise<string> {
    try {
      const requestBody: OllamaRequest = {
        model,
        messages,
        stream: false,
      };

      const response = await axios.post<OllamaResponse>(
        `${OLLAMA_API_URL}/api/chat`,
        requestBody,
        {
          timeout: OLLAMA_TIMEOUT,
        }
      );

      if (response.data && response.data.message) {
        return response.data.message.content;
      }

      throw new Error("Invalid response from Ollama API");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        if (axiosError.code === "ECONNREFUSED") {
          throw new Error(
            "Cannot connect to Ollama. Make sure Ollama is running on " +
              OLLAMA_API_URL
          );
        }

        if (axiosError.code === 'ECONNABORTED' || axiosError.message.includes('timeout')) {
          const timeoutSeconds = OLLAMA_TIMEOUT / 1000;
          throw new Error(`Ollama timeout after ${timeoutSeconds}s. The model "${model}" is too slow for your system. Try a smaller model like "llama3.2:1b" or "phi3:mini" for faster responses.`);
        }

        if (axiosError.response) {
          if (axiosError.response.status === 404) {
            throw new Error(
              `Model "${model}" not found. Please pull the model first by running: ollama pull ${model}`
            );
          }
          throw new Error(
            `Ollama API error: ${axiosError.response.status} - ${axiosError.response.statusText}`
          );
        }

        if (axiosError.request) {
          if (axiosError.code === 'ETIMEDOUT') {
            throw new Error(`Ollama timeout. The model "${model}" is too slow. Try a smaller/faster model.`);
          }
          throw new Error(
            "No response from Ollama API. Check if Ollama is running."
          );
        }
      }

      throw new Error(
        `Failed to get response from Ollama: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static convertToOllamaMessages(
    messages: Array<{ role: string; content: string }>
  ): OllamaMessage[] {
    return messages.map((msg) => ({
      role: msg.role === "ai" ? "assistant" : "user",
      content: msg.content,
    }));
  }
}

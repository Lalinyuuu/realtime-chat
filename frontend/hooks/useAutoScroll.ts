import { useEffect, useRef, useCallback } from 'react';
import { SCROLL_DELAY, SCROLL_RESET_DELAY } from '@/lib/constants';

export function useAutoScroll(messagesCount: number, isLoading: boolean) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isScrollingRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current && !isScrollingRef.current) {
      isScrollingRef.current = true;
      requestAnimationFrame(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'end' 
          });
          setTimeout(() => {
            isScrollingRef.current = false;
          }, SCROLL_RESET_DELAY);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    if (messagesCount > 0 || isLoading) {
      scrollTimeoutRef.current = setTimeout(() => {
        scrollToBottom();
      }, SCROLL_DELAY);
    }
    
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [messagesCount, isLoading, scrollToBottom]);

  return { messagesEndRef };
}

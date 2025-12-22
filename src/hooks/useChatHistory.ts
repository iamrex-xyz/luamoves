import { useState, useEffect, useCallback } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const CHAT_STORAGE_KEY = "lua_chat_history";
const MAX_MESSAGES = 50; // Limit stored messages to prevent localStorage overflow

export const useChatHistory = () => {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const stored = localStorage.getItem(CHAT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error loading chat history:", e);
    }
    // Default welcome message
    return [{
      role: "assistant" as const,
      content: "Hoi! Ik ben Lua 👋\nWaar kan ik je nu mee helpen bij je verhuizing?",
    }];
  });

  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      // Only keep the last MAX_MESSAGES to prevent storage overflow
      const messagesToStore = messages.slice(-MAX_MESSAGES);
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messagesToStore));
    } catch (e) {
      console.error("Error saving chat history:", e);
    }
  }, [messages]);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const updateLastMessage = useCallback((content: string) => {
    setMessages(prev => {
      const newMessages = [...prev];
      const lastIndex = newMessages.length - 1;
      if (lastIndex >= 0 && newMessages[lastIndex]?.role === "assistant") {
        newMessages[lastIndex] = { ...newMessages[lastIndex], content };
      }
      return newMessages;
    });
  }, []);

  const clearHistory = useCallback(() => {
    const initialMessage: Message = {
      role: "assistant",
      content: "Hoi! Ik ben Lua 👋\nWaar kan ik je nu mee helpen bij je verhuizing?",
    };
    setMessages([initialMessage]);
    localStorage.removeItem(CHAT_STORAGE_KEY);
  }, []);

  return {
    messages,
    setMessages,
    addMessage,
    updateLastMessage,
    clearHistory,
  };
};

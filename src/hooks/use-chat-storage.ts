import { useState, useEffect, useCallback } from "react";
import type { Chat, Message } from "@/lib/types";

const STORAGE_KEY = "ai-chat-app-chats";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function loadChats(): Chat[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load chats from localStorage:", e);
  }
  return [];
}

function saveChats(chats: Chat[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  } catch (e) {
    console.error("Failed to save chats to localStorage:", e);
  }
}

export function useChatStorage() {
  const [chats, setChats] = useState<Chat[]>(() => loadChats());
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // Persist chats whenever they change
  useEffect(() => {
    saveChats(chats);
  }, [chats]);

  const activeChat = chats.find((c) => c.id === activeChatId) ?? null;

  const createChat = useCallback((): string => {
    const newChat: Chat = {
      id: generateId(),
      title: "New Chat",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    return newChat.id;
  }, []);

  const deleteChat = useCallback((chatId: string) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    setActiveChatId((current) => (current === chatId ? null : current));
  }, []);

  const addMessage = useCallback(
    (chatId: string, role: "user" | "assistant", content: string): Message => {
      const message: Message = {
        id: generateId(),
        role,
        content,
        createdAt: Date.now(),
      };

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== chatId) return chat;

          // Auto-generate title from first user message
          const isFirstUserMessage =
            role === "user" && chat.messages.length === 0;
          const title = isFirstUserMessage
            ? content.slice(0, 40) + (content.length > 40 ? "..." : "")
            : chat.title;

          return {
            ...chat,
            title,
            messages: [...chat.messages, message],
            updatedAt: Date.now(),
          };
        })
      );

      return message;
    },
    []
  );

  const updateLastAssistantMessage = useCallback(
    (chatId: string, content: string) => {
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== chatId) return chat;

          const messages = [...chat.messages];
          const lastIdx = messages.length - 1;

          if (lastIdx >= 0 && messages[lastIdx].role === "assistant") {
            messages[lastIdx] = { ...messages[lastIdx], content };
          } else {
            // Create new assistant message if doesn't exist
            messages.push({
              id: generateId(),
              role: "assistant",
              content,
              createdAt: Date.now(),
            });
          }

          return { ...chat, messages, updatedAt: Date.now() };
        })
      );
    },
    []
  );

  return {
    chats,
    activeChat,
    activeChatId,
    setActiveChatId,
    createChat,
    deleteChat,
    addMessage,
    updateLastAssistantMessage,
  };
}

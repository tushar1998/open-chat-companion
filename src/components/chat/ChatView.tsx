import { useState, useCallback } from "react";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { streamChat } from "@/lib/openrouter";
import { useToast } from "@/hooks/use-toast";
import type { Chat, Message } from "@/lib/types";

interface ChatViewProps {
  chat: Chat | null;
  onAddMessage: (chatId: string, role: "user" | "assistant", content: string) => Message;
  onUpdateLastAssistant: (chatId: string, content: string) => void;
  onCreateChat: () => string;
}

export function ChatView({
  chat,
  onAddMessage,
  onUpdateLastAssistant,
  onCreateChat,
}: ChatViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSend = useCallback(
    async (content: string) => {
      // Create a new chat if none exists
      const chatId = chat?.id ?? onCreateChat();

      // Add user message
      onAddMessage(chatId, "user", content);

      setIsLoading(true);
      let assistantContent = "";

      // Build message history for API
      const existingMessages = chat?.messages ?? [];
      const apiMessages = [
        ...existingMessages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        { role: "user" as const, content },
      ];

      try {
        await streamChat(apiMessages, {
          onDelta: (text) => {
            assistantContent += text;
            onUpdateLastAssistant(chatId, assistantContent);
          },
          onDone: () => {
            // If no content was received, add an empty message
            if (!assistantContent) {
              onAddMessage(chatId, "assistant", "I couldn't generate a response. Please try again.");
            }
            setIsLoading(false);
          },
          onError: (error) => {
            console.error("Chat error:", error);
            toast({
              title: "Error",
              description: error.message || "Failed to get response from AI",
              variant: "destructive",
            });
            setIsLoading(false);
          },
        });
      } catch (error) {
        console.error("Chat error:", error);
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    },
    [chat, onAddMessage, onUpdateLastAssistant, onCreateChat, toast]
  );

  return (
    <div className="flex h-full flex-col">
      <MessageList messages={chat?.messages ?? []} isLoading={isLoading} />
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}

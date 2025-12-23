import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { Bot } from "lucide-react";
import type { Message } from "@/lib/types";

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Bot className="h-8 w-8 text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground">Start a conversation</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Send a message to begin chatting with AI
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin p-4 md:p-6">
      <div className="mx-auto max-w-3xl space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Loading indicator */}
        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-3 animate-fade-in">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
              <Bot className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-ai-bubble px-4 py-3">
              <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse-subtle" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse-subtle" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse-subtle" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

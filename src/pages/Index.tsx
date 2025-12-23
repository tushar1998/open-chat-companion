import { useState } from "react";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatView } from "@/components/chat/ChatView";
import { useChatStorage } from "@/hooks/use-chat-storage";
import { cn } from "@/lib/utils";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const {
    chats,
    activeChat,
    activeChatId,
    setActiveChatId,
    createChat,
    deleteChat,
    addMessage,
    updateLastAssistantMessage,
  } = useChatStorage();

  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onNewChat={createChat}
        onDeleteChat={deleteChat}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <main
        className={cn(
          "flex-1 transition-all duration-300",
          sidebarOpen ? "md:ml-72" : "ml-0"
        )}
      >
        <ChatView
          chat={activeChat}
          onAddMessage={addMessage}
          onUpdateLastAssistant={updateLastAssistantMessage}
          onCreateChat={createChat}
        />
      </main>
    </div>
  );
};

export default Index;

"use client";

import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";

interface Conversation {
  id: string;
  title: string;
  createdAt: number;
}

export default function ChatSidebar({
  currentId,
  onSelect,
  onNew,
}: {
  currentId: string;
  onSelect: (id: string) => void;
  onNew: (id: string) => void;
}) {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("all_conversations");
    if (stored) {
      setConversations(JSON.parse(stored));
    }
  }, []);

  const handleSelect = (id: string) => {
    onSelect(id);
  };

  const handleNewChat = () => {
    const newId = Date.now().toString();
    const newConv: Conversation = {
      id: newId,
      title: `שיחה חדשה • ${new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      createdAt: Date.now(),
    };
    const updated = [newConv, ...conversations];
    setConversations(updated);
    localStorage.setItem("all_conversations", JSON.stringify(updated));
    onNew(newId);
  };

  return (
    <div className="w-64 bg-gray-100 border-l h-full p-3 space-y-3 overflow-y-auto">
      <Button onClick={handleNewChat} className="w-full text-sm">
        + שיחה חדשה
      </Button>
      <div className="space-y-2">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => handleSelect(conv.id)}
            className={`cursor-pointer p-2 rounded text-sm hover:bg-gray-200 ${
              conv.id === currentId ? "bg-white border shadow-sm" : ""
            }`}
          >
            {conv.title}
          </div>
        ))}
      </div>
    </div>
  );
}

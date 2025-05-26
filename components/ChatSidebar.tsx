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

  const saveConversations = (list: Conversation[]) => {
    setConversations(list);
    localStorage.setItem("all_conversations", JSON.stringify(list));
  };

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
    saveConversations(updated);
    onNew(newId);
  };

  const handleRename = (id: string) => {
    const newTitle = prompt("שנה שם שיחה:");
    if (newTitle) {
      const updated = conversations.map((conv) =>
        conv.id === id ? { ...conv, title: newTitle } : conv
      );
      saveConversations(updated);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("למחוק את השיחה לצמיתות?")) {
      const updated = conversations.filter((conv) => conv.id !== id);
      saveConversations(updated);
      localStorage.removeItem(`chat_${id}`);
      if (currentId === id && updated.length > 0) {
        onSelect(updated[0].id);
      } else if (updated.length === 0) {
        handleNewChat();
      }
    }
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
            className={`group cursor-pointer p-2 rounded text-sm hover:bg-gray-200 ${
              conv.id === currentId ? "bg-white border shadow-sm" : ""
            }`}
          >
            <div
              className="flex justify-between items-center"
              onClick={() => handleSelect(conv.id)}
            >
              <span className="truncate w-[70%]">{conv.title}</span>
              <div className="hidden group-hover:flex gap-1 text-xs">
                <button
                  className="text-blue-500 hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRename(conv.id);
                  }}
                >ערוך</button>
                <button
                  className="text-red-500 hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(conv.id);
                  }}
                >מחק</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

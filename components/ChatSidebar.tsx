// components/ChatSidebar.tsx
"use client";

import React from "react";
import { Button } from "./ui/button";

interface ChatSidebarProps {
  chats: { id: string; title: string }[];
  currentChatId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewChat: () => void;
}

export default function ChatSidebar({
  chats,
  currentChatId,
  onSelect,
  onDelete,
  onNewChat,
}: ChatSidebarProps) {
  return (
    <div className="w-64 h-screen border-r bg-white p-4 space-y-4 overflow-y-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">💬 שיחות</h2>
        <Button size="sm" onClick={onNewChat}>שיחה חדשה</Button>
      </div>
      <ul className="space-y-2">
        {chats.map((chat) => (
          <li
            key={chat.id}
            className={`p-2 rounded cursor-pointer flex justify-between items-center text-sm ${
              chat.id === currentChatId ? "bg-blue-100" : "hover:bg-gray-100"
            }`}
          >
            <span onClick={() => onSelect(chat.id)} className="truncate flex-1">
              {chat.title || "שיחה ללא כותרת"}
            </span>
            <Button
              variant="ghost"
              className="text-xs text-red-500 ml-2"
              onClick={() => onDelete(chat.id)}
            >
              🗑️
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

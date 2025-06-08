"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface ChatSidebarProps {
  chats: { id: string; name: string }[];
  currentChatId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onNewChat: () => void;
}

export default function ChatSidebar({
  chats,
  currentChatId,
  onSelect,
  onDelete,
  onRename,
  onNewChat,
}: ChatSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  const handleRenameSubmit = (id: string) => {
    if (newName.trim() !== "") {
      onRename(id, newName.trim());
    }
    setEditingId(null);
    setNewName("");
  };

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
            className={`p-2 rounded flex justify-between items-center text-sm ${
              chat.id === currentChatId ? "bg-blue-100" : "hover:bg-gray-100"
            }`}
          >
            {editingId === chat.id ? (
              <input
                className="flex-1 mr-2 border px-1 rounded text-sm"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={() => handleRenameSubmit(chat.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameSubmit(chat.id);
                }}
                autoFocus
              />
            ) : (
              <span
                onClick={() => onSelect(chat.id)}
                onDoubleClick={() => {
                  setEditingId(chat.id);
                  setNewName(chat.name);
                }}
                className="truncate flex-1 cursor-pointer"
              >
                {chat.name || "שיחה ללא כותרת"}
              </span>
            )}
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

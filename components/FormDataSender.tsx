// components/FormDataSender.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import ChatSidebar from "@/components/ChatSidebar";
import axios from "axios";

interface Message {
  type: "user" | "bot";
  prompt: string;
  imageUrl?: string;
  response?: string;
  timestamp: number;
}

interface ChatThread {
  id: string;
  name: string;
}

export default function FormDataSender() {
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("chat_current");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  const [chats, setChats] = useState<ChatThread[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("current_chat_id") || "";
    }
    return "";
  });

  const handleNewChat = () => {
    const newId = Date.now().toString();
    const newChat = { id: newId, name: `שיחה חדשה ${chats.length + 1}` };
    setChats((prev) => [...prev, newChat]);
    setCurrentChatId(newId);
    setMessages([]);
    localStorage.setItem("chat_current", JSON.stringify([]));
    localStorage.setItem("current_chat_id", newId);
  };

  const handleSelectChat = (id: string) => {
    setCurrentChatId(id);
    const stored = localStorage.getItem(`chat_${id}`);
    setMessages(stored ? JSON.parse(stored) : []);
  };

  const handleDeleteChat = (id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
    localStorage.removeItem(`chat_${id}`);
    if (currentChatId === id) {
      setMessages([]);
      setCurrentChatId("");
      localStorage.removeItem("chat_current");
      localStorage.removeItem("current_chat_id");
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem(`chat_${currentChatId}`, JSON.stringify(messages));
      localStorage.setItem("chat_current", JSON.stringify(messages));
    }
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleSubmit = async () => {
    if (!prompt && !file) {
      setError("יש להזין טקסט או לבחור קובץ מדיה");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let imageUrl = "";

      if (file) {
        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("upload_preset", "unsigned_audio");

        const cloudinaryRes = await axios.post(
          "https://api.cloudinary.com/v1_1/db5injhva/image/upload",
          uploadData
        );

        imageUrl = cloudinaryRes.data.secure_url;
      }

      const formData = new FormData();
      formData.append("prompt", prompt);
      if (imageUrl) formData.append("image", imageUrl);
      formData.append(
        "history",
        JSON.stringify(
          messages.map((msg) => {
            if (msg.type === "user") {
              return {
                type: "user",
                prompt: msg.prompt,
                imageUrl: msg.imageUrl || null,
              };
            } else {
              return {
                type: "bot",
                response: msg.response,
              };
            }
          })
        )
      );

      const timestamp = Date.now();
      const newUserMessage: Message = {
        type: "user",
        prompt,
        imageUrl: imageUrl || undefined,
        timestamp,
      };

      setMessages((prev) => [...prev, newUserMessage]);

      const res = await fetch(
        process.env.NEXT_PUBLIC_LEGAL_ANALYSIS_API_URL || "",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "שגיאה לא ידועה בשרת");
      }

      const newBotMessage: Message = {
        type: "bot",
        prompt,
        response: data.summary,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, newBotMessage]);
      setPrompt("");
      setFile(null);
    } catch (e: any) {
      setError(e.message || "אירעה שגיאה בשליחה");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("chat_current");
    }
  };

  return (
    <div className="flex h-screen">
      <ChatSidebar
        chats={chats}
        currentChatId={currentChatId}
        onSelect={handleSelectChat}
        onDelete={handleDeleteChat}
        onNewChat={handleNewChat}
      />
      <div className="flex flex-col flex-1 h-screen max-w-4xl mx-auto border rounded shadow bg-white overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-xl shadow-sm whitespace-pre-wrap text-sm ${
                  msg.type === "user"
                    ? "bg-green-100 text-right"
                    : "bg-gray-100 text-left"
                }`}
              >
                <div className="text-[10px] text-gray-400 mb-1">
                  {msg.type === "user" ? "אתה" : "עורך הדין הווירטואלי"} • {formatTime(msg.timestamp)}
                </div>
                {msg.imageUrl && (
                  <img
                    src={msg.imageUrl}
                    alt="uploaded"
                    className="mb-2 max-w-xs rounded"
                  />
                )}
                {msg.type === "user" ? <p>{msg.prompt}</p> : <p>{msg.response}</p>}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-2 rounded-xl shadow-sm text-sm text-gray-500 animate-pulse">
                כותב תשובה...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t p-4 space-y-2">
          <div className="grid grid-cols-[auto_1fr_auto] gap-2 items-end w-full">
            <Input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-[36px] p-0 m-0 border-none text-xs file:mr-0"
              title="צרף קובץ"
            />
            <Textarea
              rows={1}
              placeholder="כתוב כאן שאלה או תיאור משפטי + אפשר לצרף קובץ"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[42px] resize-none"
            />
            <Button onClick={handleSubmit} disabled={loading} className="min-w-[72px]">
              {loading ? "⏳" : "שלח"}
            </Button>
          </div>
          <div className="flex justify-between">
            {error && <p className="text-red-600 text-sm">❌ {error}</p>}
            <Button
              className="text-xs text-gray-500 bg-transparent hover:bg-gray-100"
              onClick={handleReset}
            >
              נקה שיחה 🗑️
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// components/FormDataSender.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import ChatSidebar from "@/components/ChatSidebar";
import axios from "axios";
import { Menu } from "lucide-react";

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

const safeParse = (data: string | null): Message[] => {
  try {
    const parsed = JSON.parse(data || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (msg) =>
        msg &&
        typeof msg.type === "string" &&
        (msg.type === "user" || msg.type === "bot") &&
        typeof msg.timestamp === "number"
    );
  } catch {
    return [];
  }
};

export default function FormDataSender() {
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chats, setChats] = useState<ChatThread[]>(() => {
    if (typeof window !== "undefined") {
      const allKeys = Object.keys(localStorage);
      const chatKeys = allKeys.filter(
        (key) =>
          key.startsWith("chat_") &&
          !key.includes("_name") &&
          !key.includes("current")
      );
      return chatKeys.map((key) => {
        const id = key.replace("chat_", "");
        const name = localStorage.getItem(`chat_${id}_name`) || `שיחה ללא שם`;
        return { id, name };
      });
    }
    return [];
  });

  const [currentChatId, setCurrentChatId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("current_chat_id") || "";
    }
    return "";
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("chat_current");
      return safeParse(stored);
    }
    return [];
  });

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

  const isValidImageUrl = (url?: string) => {
    return !!url && url.startsWith("https") && /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  const handleSubmit = async () => {
    if (!prompt && !file) {
      setError("יש להזין טקסט או לבחור קובץ מדיה");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let finalImageUrl = imageUrl;

      if (file) {
        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("upload_preset", "unsigned_audio");

        const cloudinaryRes = await axios.post(
          "https://api.cloudinary.com/v1_1/db5injhva/image/upload",
          uploadData
        );

        finalImageUrl = cloudinaryRes.data.secure_url;
        setImageUrl(finalImageUrl);
      }

      const timestamp = Date.now();
      const newUserMessage: Message = {
        type: "user",
        prompt,
        imageUrl: isValidImageUrl(finalImageUrl) ? finalImageUrl : undefined,
        timestamp,
      };

      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("sessionId", currentChatId);

      if (file) {
        formData.append("image", file);
      } else if (isValidImageUrl(finalImageUrl)) {
        formData.append("image", finalImageUrl);
      }

      formData.append(
        "history",
        JSON.stringify(
          messages.map((msg) => {
            if (msg.type === "user") {
              return {
                type: "user",
                prompt: msg.prompt,
                imageUrl: isValidImageUrl(msg.imageUrl) ? msg.imageUrl : undefined,
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
      setImageUrl("");
    } catch (e: any) {
      setError(e.message || "אירעה שגיאה בשליחה");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setImageUrl("");
    localStorage.removeItem("chat_current");
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleNewChat = () => {
    const newId = Date.now().toString();
    const newName = `שיחה חדשה ${chats.length + 1}`;
    const newChat = { id: newId, name: newName };
    setChats((prev) => [...prev, newChat]);
    setCurrentChatId(newId);
    setMessages([]);
    setImageUrl("");
    localStorage.setItem("chat_current", JSON.stringify([]));
    localStorage.setItem("current_chat_id", newId);
    localStorage.setItem(`chat_${newId}_name`, newName);
  };

  const handleSelectChat = (id: string) => {
    setCurrentChatId(id);
    const stored = localStorage.getItem(`chat_${id}`);
    setMessages(safeParse(stored));
  };

  const handleDeleteChat = (id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
    localStorage.removeItem(`chat_${id}`);
    localStorage.removeItem(`chat_${id}_name`);
    if (currentChatId === id) {
      setMessages([]);
      setCurrentChatId("");
      setImageUrl("");
      localStorage.removeItem("chat_current");
      localStorage.removeItem("current_chat_id");
    }
  };

  const handleRenameChat = (id: string, newName: string) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === id ? { ...chat, name: newName } : chat
      )
    );
    localStorage.setItem(`chat_${id}_name`, newName);
  };

  return (
    <div className="flex h-screen flex-col">
      <div className="sm:hidden p-2">
        <Button variant="outline" onClick={() => setSidebarOpen((prev) => !prev)}>
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside
          className={`transition-all duration-300 z-10 sm:block bg-white border-r w-64 p-2 h-full overflow-y-auto shadow-lg ${
            sidebarOpen ? "block fixed" : "hidden"
          } sm:relative sm:w-64 sm:translate-x-0`}
        >
          <ChatSidebar
            chats={chats}
            currentChatId={currentChatId}
            onSelect={handleSelectChat}
            onDelete={handleDeleteChat}
            onRename={handleRenameChat}
            onNewChat={handleNewChat}
          />
        </aside>

        <div className="flex flex-col flex-1 max-w-4xl mx-auto border rounded shadow bg-white overflow-hidden">
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
                  <p>{msg.type === "user" ? msg.prompt : msg.response}</p>
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

          <div className="border-t p-4 w-full bg-white">
            <div className="flex flex-col sm:flex-row sm:items-end gap-2">
              <Textarea
                rows={1}
                placeholder="כתוב כאן שאלה או תיאור משפטי + אפשר לצרף קובץ"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[42px] resize-none flex-grow"
              />
              <div className="flex gap-2 items-center">
                <Input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="file:mr-2 text-xs"
                />
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="min-w-[72px]"
                >
                  {loading ? "⏳" : "שלח"}
                </Button>
              </div>
            </div>
            {error && <p className="text-red-600 text-sm mt-1">❌ {error}</p>}
            <div className="flex justify-end mt-2">
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
    </div>
  );
}

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<ChatThread[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>("");

  useEffect(() => {
    const storedChats = localStorage.getItem("chat_threads");
    if (storedChats) setChats(JSON.parse(storedChats));
  }, []);

  useEffect(() => {
    if (currentChatId) {
      const stored = localStorage.getItem(`chat_${currentChatId}`);
      setMessages(stored ? JSON.parse(stored) : []);
    }
  }, [currentChatId]);

  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem(`chat_${currentChatId}`, JSON.stringify(messages));
    }
  }, [messages, currentChatId]);

  const createNewChat = () => {
    const newId = Date.now().toString();
    const newChat = { id: newId, name: `שיחה ${chats.length + 1}` };
    const updatedChats = [...chats, newChat];
    setChats(updatedChats);
    localStorage.setItem("chat_threads", JSON.stringify(updatedChats));
    setCurrentChatId(newId);
    setMessages([]);
  };

  const handleDeleteChat = (id: string) => {
    const updatedChats = chats.filter((c) => c.id !== id);
    setChats(updatedChats);
    localStorage.setItem("chat_threads", JSON.stringify(updatedChats));
    localStorage.removeItem(`chat_${id}`);
    if (currentChatId === id) {
      setCurrentChatId("");
      setMessages([]);
    }
  };

  const handleRenameChat = (id: string, newName: string) => {
    const updatedChats = chats.map((c) => (c.id === id ? { ...c, name: newName } : c));
    setChats(updatedChats);
    localStorage.setItem("chat_threads", JSON.stringify(updatedChats));
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => { scrollToBottom(); }, [messages]);

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
      if (isValidImageUrl(imageUrl)) formData.append("image", imageUrl);
      formData.append("history", JSON.stringify(messages.map((msg) => ({
        type: msg.type,
        prompt: msg.prompt,
        imageUrl: msg.imageUrl,
        response: msg.response,
        timestamp: msg.timestamp,
      }))));

      const timestamp = Date.now();
      const newUserMessage: Message = {
        type: "user",
        prompt,
        imageUrl: isValidImageUrl(imageUrl) ? imageUrl : undefined,
        timestamp,
      };

      setMessages((prev) => [...prev, newUserMessage]);

      const res = await fetch(process.env.NEXT_PUBLIC_LEGAL_ANALYSIS_API_URL || "", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "שגיאה לא ידועה בשרת");

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

  return (
    <div className="flex h-screen">
      <ChatSidebar
        chats={chats}
        currentChatId={currentChatId}
        onSelect={setCurrentChatId}
        onDelete={handleDeleteChat}
        onRename={handleRenameChat}
        onNewChat={createNewChat}
      />

      <div className="flex flex-col flex-1 h-screen max-w-5xl mx-auto border rounded shadow bg-white">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] px-4 py-2 rounded-xl shadow-sm text-sm ${msg.type === "user" ? "bg-green-100 text-right" : "bg-gray-100 text-left"}`}>
                {msg.imageUrl && <img src={msg.imageUrl} alt="uploaded" className="mb-2 max-w-xs rounded" />}
                {msg.type === "user" ? <p>{msg.prompt}</p> : <p>{msg.response}</p>}
              </div>
            </div>
          ))}
          {loading && <div className="flex justify-start"><div className="bg-gray-100 px-4 py-2 rounded-xl shadow-sm text-sm text-gray-500 animate-pulse">כותב תשובה...</div></div>}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-32 text-xs" />
            <Textarea rows={1} placeholder="כתוב כאן שאלה או תיאור משפטי + אפשר לצרף קובץ" value={prompt} onChange={(e) => setPrompt(e.target.value)} className="resize-none flex-1 min-h-[42px]" />
            <Button onClick={handleSubmit} disabled={loading} className="min-w-[72px]">{loading ? "⏳" : "שלח"}</Button>
          </div>
          {error && <p className="text-red-600 text-sm mt-1">❌ {error}</p>}
        </div>
      </div>
    </div>
  );
}

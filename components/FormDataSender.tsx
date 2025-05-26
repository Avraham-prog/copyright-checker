"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import axios from "axios";

interface Message {
  type: "user" | "bot";
  prompt: string;
  imageUrl?: string;
  response?: string;
  timestamp: number;
}

export default function FormDataSender() {
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("chat_current");
      setMessages(stored ? JSON.parse(stored) : []);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("chat_current", JSON.stringify(messages));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleSubmit = async () => {
    if (!prompt && !file) {
      setError("יש להזין טקסט או לצרף קובץ מדיה");
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

        const uploadRes = await axios.post(
          "https://api.cloudinary.com/v1_1/db5injhva/image/upload",
          uploadData
        );

        imageUrl = uploadRes.data.secure_url;
      }

      const formData = new FormData();
      formData.append("prompt", prompt);
      if (imageUrl) formData.append("image", imageUrl);

      const timestamp = Date.now();
      setMessages((prev) => [
        ...prev,
        { type: "user", prompt, imageUrl: imageUrl || undefined, timestamp },
      ]);

      const res = await fetch(
        process.env.NEXT_PUBLIC_LEGAL_ANALYSIS_API_URL || "",
        { method: "POST", body: formData }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "שגיאה לא ידועה בשרת");

      setMessages((prev) => [
        ...prev,
        { type: "bot", prompt, response: data.summary, timestamp: Date.now() },
      ]);

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
    <div className="flex flex-col h-[90vh] max-w-3xl mx-auto border rounded shadow bg-white overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] px-4 py-2 rounded-xl shadow-sm whitespace-pre-wrap text-sm ${
                msg.type === "user" ? "bg-green-100 text-right" : "bg-gray-100 text-left"
              }`}
            >
              <div className="text-[10px] text-gray-400 mb-1">
                {msg.type === "user" ? "אתה" : "עורך הדין הווירטואלי"} • {formatTime(msg.timestamp)}
              </div>
              {msg.imageUrl && (
                <img src={msg.imageUrl} alt="uploaded" className="mb-2 max-w-xs rounded" />
              )}
              <p>{msg.prompt}</p>
              {msg.response && <p className="mt-2 text-gray-700">{msg.response}</p>}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-2">
        <form
          className="flex gap-2 items-end"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <Textarea
            placeholder="כתוב כאן שאלה או תיאור משפטי... + העלה תמונה / קובץ"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 resize-none min-h-[48px]"
          />
          <Input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-[40px] file:hidden"
            title="צרף קובץ"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "⏳" : "שלח"}
          </Button>
        </form>
        <div className="flex justify-between mt-1">
          {error && <p className="text-red-600 text-sm">❌ {error}</p>}
          <Button
            onClick={handleReset}
            className="text-xs text-gray-500 bg-transparent hover:bg-gray-100"
          >
            נקה שיחה 🗑️
          </Button>
        </div>
      </div>
    </div>
  );
}

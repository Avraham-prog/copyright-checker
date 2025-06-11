"use client";

import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
  const [chats, setChats] = useState<ChatThread[]>(() => {
    if (typeof window !== "undefined") {
      const allKeys = Object.keys(localStorage);
      const chatKeys = allKeys.filter((key) => key.startsWith("chat_") && !key.includes("_name") && !key.includes("current"));
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

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto px-2 pb-12">
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="כתוב את השאלה או התיאור שלך..."
      />

      <Input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "שולח..." : "שלח לבדיקה"}
      </Button>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="mt-6 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`rounded p-3 shadow bg-white ${
              msg.type === "user" ? "text-right bg-blue-50" : "text-left bg-gray-50"
            }`}
          >
            {msg.prompt && <p>{msg.prompt}</p>}
            {msg.imageUrl && (
              <img src={msg.imageUrl} alt="תמונה" className="mt-2 max-w-xs mx-auto" />
            )}
            {msg.response && <p className="mt-2 text-gray-700">{msg.response}</p>}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

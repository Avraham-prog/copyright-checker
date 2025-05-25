"use client";

import React, { useState } from "react";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import axios from "axios";

interface Message {
  type: "user" | "bot";
  prompt: string;
  imageUrl?: string;
  response?: string;
}

const LegalAssistantForm = () => {
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSubmit = async () => {
    if (!prompt && !file && !url) {
      setError("יש להזין טקסט, תמונה או קישור.");
      return;
    }
    setError("");
    setLoading(true);

    const newMessage: Message = {
      type: "user",
      prompt,
      imageUrl: file ? URL.createObjectURL(file) : url || undefined,
    };
    setMessages((prev) => [...prev, newMessage]);

    const formData = new FormData();
    formData.append("prompt", prompt);
    if (file) formData.append("file", file);
    if (url) formData.append("url", url);

    try {
      const res = await axios.post("/api/legal-assistant", formData);
      const botMessage: Message = {
        type: "bot",
        prompt,
        response: res.data?.result || "לא התקבלה תגובה."
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (e) {
      setError("אירעה שגיאה בשליחה.");
    } finally {
      setPrompt("");
      setFile(null);
      setUrl("");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder="הקלד את הבקשה המשפטית שלך..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <Input
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <Input
          placeholder="או הדבק לינק"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "שולח..." : "שלח לבדיקה"}
        </Button>
        {error && <div className="text-red-500">{error}</div>}
      </div>

      <div className="space-y-4">
        {messages.map((msg, idx) => (
          <Card key={idx} className={msg.type === "user" ? "bg-gray-100" : "bg-white"}>
            <CardContent className="space-y-2">
              <div className="font-semibold">
                {msg.type === "user" ? "🧑 אתה" : "🤖 עורך הדין הווירטואלי"}
              </div>
              {msg.imageUrl && (
                <img src={msg.imageUrl} alt="user upload" className="max-w-xs rounded" />
              )}
              <div>{msg.prompt}</div>
              {msg.response && (
                <div className="mt-2 border-t pt-2 text-sm text-gray-700 whitespace-pre-line">
                  {msg.response}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LegalAssistantForm;

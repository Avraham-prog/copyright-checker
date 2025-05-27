"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  image?: string;
}

export default function ChatBox() {
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);

  const handleSubmit = async () => {
    if (!prompt && !file) {
      setError("יש להזין טקסט או לבחור קובץ");
      return;
    }

    setLoading(true);
    setError("");

    let imageUrl = "";

    try {
      if (file) {
        const cloudinaryForm = new FormData();
        cloudinaryForm.append("file", file);
        cloudinaryForm.append("upload_preset", "ml_default");

        const cloudinaryRes = await fetch("https://api.cloudinary.com/v1_1/db5injhva/image/upload", {
          method: "POST",
          body: cloudinaryForm,
        });

        const cloudinaryData = await cloudinaryRes.json();

        if (!cloudinaryRes.ok || !cloudinaryData.secure_url) {
          throw new Error("העלאה ל־Cloudinary נכשלה");
        }

        imageUrl = cloudinaryData.secure_url;
      }

      setChatLog((prev) => [
        ...prev,
        { role: "user", content: prompt, image: imageUrl },
      ]);

      const formData = new FormData();
      formData.append("prompt", prompt);
      if (imageUrl) formData.append("image", imageUrl);

      const res = await fetch(process.env.NEXT_PUBLIC_LEGAL_ANALYSIS_API_URL || "", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "שגיאה לא ידועה בשרת");
      }

      setChatLog((prev) => [
        ...prev,
        { role: "assistant", content: data.summary },
      ]);

      setPrompt("");
      setFile(null);
    } catch (e: any) {
      setError(e.message || "אירעה שגיאה בשליחה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <CardContent className="space-y-4">
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {chatLog.map((msg, index) => (
            <div
              key={index}
              className={`text-sm ${msg.role === "user" ? "text-right" : "text-left"}`}
            >
              <div className="font-bold">
                {msg.role === "user" ? "אתה" : "העוזר המשפטי"}
              </div>
              {msg.image && (
                <img
                  src={msg.image}
                  alt="uploaded"
                  className="max-w-xs rounded my-1 border"
                />
              )}
              <div className="bg-gray-100 p-2 rounded whitespace-pre-line">
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        <textarea
          className="w-full border p-2 rounded"
          placeholder="כתוב כאן תיאור משפטי או שאלה"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "שולח..." : "שלח לבדיקה משפטית"}
        </Button>
        {error && <p className="text-red-600 text-sm">❌ {error}</p>}
      </CardContent>
    </Card>
  );
}

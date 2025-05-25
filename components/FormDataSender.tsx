"use client";

import React, { useState } from "react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import axios from "axios";

interface Message {
  type: "user" | "bot";
  prompt: string;
  imageUrl?: string;
  response?: string;
}

export default function FormDataSender() {
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSubmit = async () => {
    if (!prompt && !file && !url) {
      setError("יש להזין טקסט, לבחור קובץ או להדביק URL");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let imageUrl = url;

      if (!imageUrl && file) {
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

      setMessages((prev) => [
        ...prev,
        { type: "user", prompt, imageUrl },
        { type: "bot", prompt, response: data.summary },
      ]);

      setPrompt("");
      setFile(null);
      setUrl("");
    } catch (e: any) {
      setError(e.message || "אירעה שגיאה בשליחה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <CardContent className="space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className="bg-gray-100 p-2 rounded">
            <p className="font-semibold">
              {msg.type === "user" ? "🧑‍💼 אתה" : "🧠 עורך הדין הווירטואלי"}:
            </p>
            <p className="whitespace-pre-wrap">{msg.prompt}</p>
            {msg.imageUrl && (
              <img
                src={msg.imageUrl}
                alt="uploaded"
                className="mt-2 max-w-xs rounded"
              />
            )}
            {msg.response && (
              <p className="mt-2 whitespace-pre-wrap">{msg.response}</p>
            )}
          </div>
        ))}

        <Textarea
          placeholder="כתוב כאן תיאור משפטי או שאלה"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <Input
          type="text"
          placeholder="או הדבק כאן לינק לתמונה / YouTube"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "⏳ חושב..." : "שלח לבדיקה משפטית"}
        </Button>
        {error && <p className="text-red-600 text-sm">❌ {error}</p>}
      </CardContent>
    </Card>
  );
}

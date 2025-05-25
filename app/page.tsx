"use client";

import React, { useState } from "react";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import axios from "axios";

interface Message {
  type: "user" | "bot";
  prompt: string;
  imageUrl?: string;
  response?: string;
}

const LegalAnalysisForm = () => {
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
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-4 rounded shadow ${msg.type === "user" ? "bg-blue-50" : "bg-gray-50"}`}
          >
            <p className="font-semibold">
              {msg.type === "user" ? "🧑‍💼 אתה" : "🧠 עורך הדין הווירטואלי"}:
            </p>
            {msg.imageUrl && (
              <img
                src={msg.imageUrl}
                alt="uploaded"
                className="mt-2 max-w-xs rounded"
              />
            )}
            <p className="mt-2 whitespace-pre-wrap">{msg.prompt}</p>
            {msg.response && (
              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700 border-t pt-2">
                {msg.response}
              </p>
            )}
          </div>
        ))}
      </div>

      <Card className="p-4">
        <CardContent className="space-y-4">
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
    </div>
  );
};

export default LegalAnalysisForm;

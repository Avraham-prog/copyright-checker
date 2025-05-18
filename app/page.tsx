"use client";

import React, { useState } from "react";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import FileUpload from "../components/FileUpload";

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 שלום! אני עורך דין וירטואלי שלך. מה תרצה לבדוק מבחינת זכויות יוצרים בקמפיין שלך? אפשר להעלות טקסט, קובץ או קישור.",
    },
  ]);
  const [input, setInput] = useState("");
  const [upload, setUpload] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!input.trim() && !upload) return;

    const newMessages = [...messages, { role: "user", content: input || upload }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("prompt", input);
      if (upload) formData.append("fileUrl", upload);

      const res = await fetch(process.env.NEXT_PUBLIC_LEGAL_ANALYSIS_API_URL!, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "שגיאה לא ידועה מהשרת");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.summary }]);
    } catch (e: any) {
      console.error("Legal Assistant Error:", e);
      setMessages((prev) => [...prev, { role: "assistant", content: "❌ שגיאה בשליחת הבקשה ל־Legal Assistant API" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Card>
        <CardContent className="space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`text-${m.role === "user" ? "right" : "left"} text-sm`}>
              <strong>{m.role === "user" ? "👤" : "🧑‍⚖️"}</strong>: {m.content}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="mt-6 space-y-4">
        <Textarea
          placeholder="כתוב כאן שאלה או תיאור משפטי..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <FileUpload onUpload={(fileUrl) => setUpload(fileUrl)} />

        <Button onClick={handleSend} disabled={loading}>
          {loading ? "בודק..." : "שלח"}
        </Button>
        {error && <p className="text-red-600 text-sm">❌ {error}</p>}
      </div>
    </div>
  );
}

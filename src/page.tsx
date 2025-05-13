// src/App/page.tsx

import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import FileUpload from "./components/FileUpload";

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 שלום! אני עורך דין וירטואלי שלך. מה תרצה לבדוק מבחינת זכויות יוצרים בקמפיין שלך? אפשר להעלות טקסט, קובץ או קישור.",
    },
  ]);
  const [input, setInput] = useState("");
  const [upload, setUpload] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() && !upload) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const formData = new FormData();
    formData.append("prompt", input);
    if (upload) formData.append("file", upload);

    try {
      const res = await fetch("/api/legal-assistant", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.summary }]);
    } catch (e) {
      console.error("API Error:", e);
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
              <strong>{m.role === "user" ? "👤" : "🧑\u200d⚖️"}</strong>: {m.content}
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

        <FileUpload onUpload={(file) => setUpload(file)} />

        <Button onClick={handleSend} disabled={loading}>
          {loading ? "בודק..." : "שלח"}
        </Button>
      </div>
    </div>
  );
}

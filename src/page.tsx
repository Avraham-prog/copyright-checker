// src/page.tsx

import React, { useState } from "react";
import { Textarea } from "./components/ui/textarea";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import FileUpload from "./components/FileUpload";

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 שלום! אני עורך דין וירטואלי שלך. מה תרצה לבדוק מבחינת זכויות יוצרים בקמפיין שלך? אפשר להעלות טקסט, קובץ או קישור."
    }
  ]);
  const [input, setInput] = useState("");
  const [upload, setUpload] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleLegalCheck = async (url: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_LEGAL_ANALYSIS_API_URL!;
    const apiKey = process.env.NEXT_PUBLIC_LEGAL_ANALYSIS_API_KEY!;

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({ url })
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.summary }]);
    } catch (err) {
      console.error("Legal API error:", err);
      alert("⚠️ שגיאה בקשר עם השרת המשפטי");
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !upload) return;
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setInput("");
    setLoading(true);

    if (upload) {
      await handleLegalCheck(upload);
    } else {
      const formData = new FormData();
      formData.append("prompt", input);

      try {
        const res = await fetch("/api/legal-assistant", {
          method: "POST",
          body: formData
        });
        const data = await res.json();
        setMessages((prev) => [...prev, { role: "assistant", content: data.summary }]);
      } catch (e) {
        console.error("API Error:", e);
      }
    }

    setLoading(false);
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

        <FileUpload onUpload={(url) => setUpload(url)} />

        <Button onClick={handleSend} disabled={loading}>
          {loading ? "בודק..." : "שלח"}
        </Button>
      </div>
    </div>
  );
}

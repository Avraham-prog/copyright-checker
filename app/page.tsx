"use client";

import React, { useState } from "react";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import FileUpload from "../components/FileUpload";
import FormDataSender from "../components/FormDataSender";

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

  const handleSend = async () => {
    if (!input.trim() && !upload) return;

    const newMessages = [...messages, { role: "user", content: input || upload }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const formData = new FormData();
    formData.append("prompt", input);
    if (upload) {
      try {
        const fileResponse = await fetch(upload);
        const fileBlob = await fileResponse.blob();
        const fileName = upload.split("/").pop() || "uploaded_file";
        formData.append("file", new File([fileBlob], fileName, { type: fileBlob.type }));
      } catch (e) {
        console.error("File fetch error:", e);
      }
    }

    try {
      const res = await fetch(process.env.NEXT_PUBLIC_LEGAL_ANALYSIS_API_URL!, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_LEGAL_ANALYSIS_API_KEY}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.summary }]);
    } catch (e) {
      console.error("API Request failed:", e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "❌ שגיאה בשליחת הבקשה. בדוק חיבור או נסה שוב מאוחר יותר." },
      ]);
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

        <FormDataSender formData={{ prompt: input, file: upload }} onResult={(summary) => {
          setMessages((prev) => [...prev, { role: "assistant", content: summary }]);
        }} />
      </div>
    </div>
  );
}

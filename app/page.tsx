"use client";

import React, { useState } from "react";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import FileUpload from "../components/FileUpload";

function FormDataSender({ formData, onResult }: { formData: FormData; onResult: (res: string) => void }) {
  const [loading, setLoading] = useState(false);

  const send = async () => {
    setLoading(true);
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_LEGAL_ANALYSIS_API_URL!, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_LEGAL_ANALYSIS_API_KEY}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("API Error");
      const data = await res.json();
      onResult(data.summary);
    } catch (e) {
      console.error("FormDataSender error:", e);
      setMessages((prev) => [...prev, { role: "assistant", content: "❌ שגיאה בשליחת הבקשה ל־Legal Assistant API" }]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    send();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "\ud83d\udc4b \u05e9\u05dc\u05d5\u05dd! \u05d0\u05e0\u05d9 \u05e2\u05d5\u05e8\u05da \u05d3\u05d9\u05df \u05d5\u05d5\u05d9\u05e8\u05d8\u05d5\u05d0\u05dc\u05d9 \u05e9\u05dc\u05da. \u05de\u05d4 \u05ea\u05e8\u05e6\u05d4 \u05dc\u05d1\u05d3\u05d5\u05e7 \u05de\u05d1\u05d7\u05d9\u05e0\u05ea \u05d6\u05db\u05d5\u05d9\u05d5\u05ea \u05d9\u05d5\u05e6\u05e8\u05d9\u05dd \u05d1\u05e7\u05de\u05e4\u05d9\u05d9\u05df \u05e9\u05dc\u05da? \u05d0\u05e4\u05e9\u05e8 \u05dc\u05d4\u05e2\u05dc\u05d5\u05ea \u05d8\u05e7\u05e1\u05d8, \u05e7\u05d5\u05d1\u05e5 \u05d0\u05d5 \u05e7\u05d9\u05e9\u05d5\u05e8.",
    },
  ]);
  const [input, setInput] = useState("");
  const [upload, setUpload] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [formDataToSend, setFormDataToSend] = useState<FormData | null>(null);

  const handleSend = async () => {
    if (!input.trim() && !upload) return;

    const newMessages = [...messages, { role: "user", content: input || upload }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const formData = new FormData();
    formData.append("prompt", input);
    if (upload) formData.append("file", upload);
    setFormDataToSend(formData);
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

        {formDataToSend && (
          <FormDataSender
            formData={formDataToSend}
            onResult={(summary) => {
              setMessages((prev) => [...prev, { role: "assistant", content: summary }]);
              setLoading(false);
              setFormDataToSend(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

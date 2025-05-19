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
        body: formData,
      });

      if (!res.ok) throw new Error("API Error");
      const data = await res.json();
      onResult(data.summary);
    } catch (e) {
      console.error("FormDataSender error:", e);
      onResult("❌ שגיאה בשליחת הבקשה ל־Legal Assistant API");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    send();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="text-center text-sm mt-4">
      {loading && <span>🔎 חושב...</span>}
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "שלום! אני עורך דין וירטואלי שלך. מה תרצה לבדוק מבחינת זכויות יוצרים? אפשר להעלות טקסט, קובץ או לינק (YouTube, SoundCloud וכו').",
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

    // אם מדובר בלינק
    if (upload.startsWith("http")) {
      formData.append("link", upload);
    } else if (upload) {
      formData.append("file", upload);
    }

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

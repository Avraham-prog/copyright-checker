import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function App() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "שלום 👋 אני עורך הדין הווירטואלי שלך. מה תרצה לבדוק מבחינת זכויות יוצרים? תוכל לתאר את השימוש בפרסומת, או להעלות קובץ/לינק." }
  ]);
  const [input, setInput] = useState("");
  const [upload, setUpload] = useState(null);
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
        body: formData
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.summary }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", content: "❌ שגיאה בבדיקה המשפטית. נסה שוב או פנה לתמיכה." }]);
    }
    setUpload(null);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold text-center">בודק זכויות יוצרים</h1>

        <Card>
          <CardContent className="space-y-4 p-4 max-h-[60vh] overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className={`text-${msg.role === "user" ? "right" : "left"}`}>➤ <b>{msg.role === "user" ? "אתה" : "המערכת"}</b>: {msg.content}</div>
            ))}
            {loading && <div className="text-gray-500 italic">...בודק זכויות יוצרים</div>}
          </CardContent>
        </Card>

        <Textarea
          placeholder="כתוב את השאלה המשפטית שלך לגבי שימוש בתוכן..."
          rows={3}
          className="bg-white"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <div className="flex items-center gap-2">
          <Input type="file" onChange={(e) => setUpload(e.target.files?.[0] || null)} />
          <Button onClick={handleSend} disabled={loading} className="bg-blue-600 text-white">שלח</Button>
        </div>
      </div>
    </div>
  );
}

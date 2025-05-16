// components/FormDataSender.tsx
"use client";

import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

interface Props {
  onResult: (res: string) => void;
}

export default function FormDataSender({ onResult }: Props) {
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!prompt && !file) {
      setError("יש להזין טקסט או לבחור קובץ");
      return;
    }

    const endpoint = process.env.NEXT_PUBLIC_LEGAL_ANALYSIS_API_URL;
    if (!endpoint) {
      setError("NEXT_PUBLIC_LEGAL_ANALYSIS_API_URL לא מוגדר");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("prompt", prompt);
      if (file) formData.append("file", file);

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_LEGAL_ANALYSIS_API_KEY || ""}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "שגיאה לא ידועה בשרת");
      }

      onResult(data.summary);
    } catch (e: any) {
      setError(e.message || "אירעה שגיאה בשליחה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4">
      <CardContent className="space-y-4">
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

"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

export default function FormDataSender({ onResult }: { onResult: (response: string) => void }) {
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!prompt && !file) return;

    const formData = new FormData();
    formData.append("prompt", prompt);
    if (file) formData.append("file", file);

    try {
      setLoading(true);
      setError("");

      const res = await fetch(process.env.NEXT_PUBLIC_LEGAL_ANALYSIS_API_URL || "", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("API response not OK");

      const data = await res.json();
      onResult(data.summary);
    } catch (e: any) {
      console.error("FormData error:", e);
      setError("אירעה שגיאה בשליחה לשרת" + (e?.message ? ": " + e.message : ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="כתוב כאן שאלה משפטית או תיאור של השימוש"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <Button onClick={handleSubmit} disabled={loading || (!prompt && !file)}>
        {loading ? "שולח..." : "שלח ל־Legal Assistant"}
      </Button>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

export default function FormDataSender({ onResult }: { onResult: (res: string) => void }) {
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!prompt && !file) {
      setError("יש להזין טקסט או לבחור קובץ");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let imageUrl = "";

      // אם מדובר בקובץ מסוג תמונה נעלה אותו ל-Cloudinary
      if (file && file.type.startsWith("image/")) {
        const cloudData = new FormData();
        cloudData.append("file", file);
        cloudData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || "");
        const cloudRes = await fetch("https://api.cloudinary.com/v1_1/" + process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME + "/image/upload", {
          method: "POST",
          body: cloudData,
        });
        const uploaded = await cloudRes.json();
        if (!uploaded.secure_url) throw new Error("העלאת התמונה נכשלה");
        imageUrl = uploaded.secure_url;
      }

      const formData = new FormData();
      formData.append("prompt", prompt);
      if (file && !imageUrl) formData.append("file", file); // לצרף קובץ רק אם לא הועלה ל-Cloudinary
      if (imageUrl) formData.append("image", imageUrl); // אם יש URL, להעביר אותו לשרת

      const res = await fetch(process.env.NEXT_PUBLIC_LEGAL_ANALYSIS_API_URL || "", {
        method: "POST",
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

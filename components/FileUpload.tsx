// components/FileUpload.tsx
"use client";

import React, { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

interface Props {
  onUpload: (url: string) => void;
}

export default function FileUpload({ onUpload }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const uploadToCloudinary = async (fileOrUrl: File | string) => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      if (!cloudName || !uploadPreset) {
        throw new Error("הגדרות Cloudinary חסרות. ודא שהמשתנים קיימים ב־ENV שלך");
      }

      let data: FormData | string;
      let options: RequestInit;

      if (typeof fileOrUrl === "string") {
        data = JSON.stringify({
          file: fileOrUrl,
          upload_preset: uploadPreset,
        });
        options = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: data,
        };
      } else {
        data = new FormData();
        data.append("file", fileOrUrl);
        data.append("upload_preset", uploadPreset);
        options = {
          method: "POST",
          body: data,
        };
      }

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        options
      );
      const json = await res.json();

      if (!res.ok || !json.secure_url) {
        console.error("Cloudinary error:", json);
        throw new Error(json?.error?.message || "העלאה ל־Cloudinary נכשלה מסיבה לא ידועה");
      }

      onUpload(json.secure_url);
      setFile(null);
      setUrl("");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "אירעה שגיאה בהעלאה");
      console.error("Upload Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <Input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <Input
        type="text"
        placeholder="או הדבק כאן לינק ישיר לקובץ (MP3, YouTube וכו')"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <Button
        onClick={() => uploadToCloudinary(file || url)}
        disabled={loading || (!file && !url)}
      >
        {loading ? "מעלה..." : "העלה ל-Cloudinary"}
      </Button>
      {error && <p className="text-red-600 text-sm">❌ {error}</p>}
      {success && <p className="text-green-600 text-sm">✅ הקובץ הועלה בהצלחה</p>}
    </div>
  );
}

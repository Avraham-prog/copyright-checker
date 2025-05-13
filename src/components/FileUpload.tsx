import React, { useState } from "react";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";

export default function FileUpload({ onUpload }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cloudinaryUrl, setCloudinaryUrl] = useState("");

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    const res = await fetch("/api/upload-to-cloudinary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: file })
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setCloudinaryUrl(data.cloudinaryUrl);
      onUpload(data.cloudinaryUrl);
    } else {
      alert("Upload failed: " + (data.error || "unknown error"));
    }
  };

  return (
    <div className="space-y-4 mt-6">
      <Input
        type="text"
        placeholder="הדבק קישור לקובץ (למשל קובץ mp3, jpg או png)"
        onChange={(e) => setFile(e.target.value)}
      />
      <Button onClick={handleUpload} disabled={loading || !file}>
        {loading ? "מעלה..." : "העלה ל-Cloudinary"}
      </Button>
      {cloudinaryUrl && (
        <div className="text-sm text-green-700 mt-2">
          ✅ קובץ הועלה בהצלחה:
          <a
            href={cloudinaryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline ml-1"
          >
            צפייה בקובץ
          </a>
        </div>
      )}
    </div>
  );
}

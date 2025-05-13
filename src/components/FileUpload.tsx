import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface FileUploadProps {
  onUpload: (url: string) => void;
}

export default function FileUpload({ onUpload }: FileUploadProps) {
  const [file, setFile] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string>("");

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const res = await fetch("/api/upload-to-cloudinary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: file })
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok && data.cloudinaryUrl) {
        setCloudinaryUrl(data.cloudinaryUrl);
        onUpload(data.cloudinaryUrl);
      } else {
        alert("Upload failed: " + (data.error || "unknown error"));
      }
    } catch (err) {
      setLoading(false);
      alert("שגיאה במהלך ההעלאה");
    }
  };

  return (
    <div className="space-y-4 mt-6">
      <Input
        type="text"
        placeholder="הדבק קישור לקובץ (למשל mp3, jpg או png)"
        value={file}
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

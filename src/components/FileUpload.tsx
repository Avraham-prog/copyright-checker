import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface Props {
  onUpload: (url: string) => void;
}

export default function FileUpload({ onUpload }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [cloudinaryUrl, setCloudinaryUrl] = useState("");

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || "");

    const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`, {
      method: "POST",
      body: data,
    });

    const json = await res.json();
    setLoading(false);

    if (json.secure_url) {
      setCloudinaryUrl(json.secure_url);
      onUpload(json.secure_url);
    } else {
      alert("❌ שגיאה בהעלאה ל-Cloudinary");
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <Button onClick={handleUpload} disabled={loading || !file}>
        {loading ? "מעלה..." : "העלה ל-Cloudinary"}
      </Button>
      {cloudinaryUrl && (
        <div className="text-sm text-green-700 mt-2">
          ✅ קובץ הועלה בהצלחה:
          <a href={cloudinaryUrl} target="_blank" rel="noopener noreferrer" className="underline ml-1">
            צפייה בקובץ
          </a>
        </div>
      )}
    </div>
  );
}

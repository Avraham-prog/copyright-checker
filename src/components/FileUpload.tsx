import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface Props {
  onUpload: (url: string) => void;
}

export default function FileUpload({ onUpload }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadToCloudinary = async (fileOrUrl: File | string) => {
    setLoading(true);
    setError(null);

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !preset) {
        setError("הגדרות Cloudinary חסרות. ודא שהמשתנים קיימים ב־ENV שלך");
        setLoading(false);
        return;
      }

      let data: FormData | string;
      let options: RequestInit;

      if (typeof fileOrUrl === "string") {
        data = JSON.stringify({ file: fileOrUrl, upload_preset: preset });
        options = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: data
        };
      } else {
        data = new FormData();
        data.append("file", fileOrUrl);
        data.append("upload_preset", preset);
        options = {
          method: "POST",
          body: data
        };
      }

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, options);
      const json = await res.json();

      if (json.secure_url) {
        onUpload(json.secure_url);
      } else {
        const msg = json.error?.message || "שגיאה כללית בהעלאה ל-Cloudinary";
        setError(`❌ שגיאה: ${msg}`);
      }
    } catch (err: any) {
      setError("שגיאת רשת: לא ניתן היה ליצור קשר עם Cloudinary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <Input
        type="text"
        placeholder="או הדבק כאן לינק ישיר לקובץ (MP3, YouTube וכו')"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <Button onClick={() => uploadToCloudinary(file || url)} disabled={loading || (!file && !url)}>
        {loading ? "מעלה..." : "העלה ל-Cloudinary"}
      </Button>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}

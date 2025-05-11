import React, { useState } from "react";

export default function AudioLinkChecker() {
  const [audioUrl, setAudioUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!audioUrl) {
      setError("יש להזין קישור לקובץ אודיו.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/analyze-audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ audioUrl })
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || "קרתה שגיאה בזמן הבדיקה.");
      }
    } catch (err) {
      setError("שגיאת רשת או שרת.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border mt-8 rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">בדיקת זכויות שיר / סאונד</h2>
      <input
        type="text"
        placeholder="הדבק כאן קישור לקובץ סאונד או לינק ל-MP3"
        className="w-full border p-2 rounded mb-4"
        value={audioUrl}
        onChange={(e) => setAudioUrl(e.target.value)}
      />
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "בודק..." : "בדוק זכויות אודיו"}
      </button>

      {error && <p className="text-red-600 mt-4">⚠️ {error}</p>}

      {result && (
        <div className="mt-4 bg-gray-50 border p-4 rounded text-sm">
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
} 

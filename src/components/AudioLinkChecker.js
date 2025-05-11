import React, { useState } from 'react';

export default function AudioLinkChecker() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleCheck = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/analyze-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-xl shadow-md bg-white max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">בדיקת לינק לקובץ סאונד</h2>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full p-2 border rounded mb-3"
        placeholder="הדבק לינק לקובץ mp3 / wav / soundcloud / יוטיוב..."
      />
      <button
        onClick={handleCheck}
        disabled={loading || !url}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        בדיקה
      </button>

      {loading && <p className="mt-4 text-gray-500">בודק...</p>}

      {error && <p className="mt-4 text-red-500">שגיאה: {error}</p>}

      {result && (
        <div className="mt-4 bg-gray-100 p-3 rounded">
          <h3 className="font-semibold text-lg mb-2">תוצאה:</h3>
          {result.metadata?.music?.length ? (
            <div>
              <p><strong>שיר:</strong> {result.metadata.music[0].title}</p>
              <p><strong>אמן:</strong> {result.metadata.music[0].artists?.map(a => a.name).join(', ')}</p>
              {result.metadata.music[0].external_metadata?.youtube && (
                <a
                  href={`https://www.youtube.com/watch?v=${result.metadata.music[0].external_metadata.youtube.video_id}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-blue-700 underline"
                >
                  לינק ליוטיוב
                </a>
              )}
            </div>
          ) : (
            <p>לא זוהה שיר מוכר. ייתכן שזה קובץ מקורי או שלא ניתן לזהות אותו אוטומטית.</p>
          )}
        </div>
      )}
    </div>
  );
}

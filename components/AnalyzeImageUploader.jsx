import React, { useState } from 'react';
import axios from 'axios';

const AnalyzeImageUploader = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('יש לבחור קובץ תמונה');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      setLoading(true);
      setError('');
      setResult('');

      const response = await axios.post(
        'https://legal-analysis-api-i7ne.onrender.com',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setResult(response.data.caption);
    } catch (err) {
      setError('אירעה שגיאה בעת שליחת הבקשה');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold mb-4">ניתוח תמונה</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleSubmit} className="mt-4 p-2 bg-blue-500 text-white rounded">
        שלח לניתוח
      </button>

      {loading && <p>טוען...</p>}
      {result && (
        <div className="mt-4 p-2 border rounded">
          <h3 className="font-bold">תוצאה:</h3>
          <p>{result}</p>
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default AnalyzeImageUploader;

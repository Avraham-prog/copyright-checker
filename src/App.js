import React, { useState } from "react";

export default function App() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    contentType: "",
    source: "",
    hasLicense: "",
    hasIdentifiablePeopleOrBrands: "",
    freeText: ""
  });
  const [result, setResult] = useState("");

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const analyzeLegal = () => {
    const { contentType, source, hasLicense, hasIdentifiablePeopleOrBrands, freeText } = formData;
    let output = "";

    // שלב 1 - כללים בסיסיים
    if (!contentType || !source || !hasLicense) {
      output += "🟡 יש להשלים את כל השדות כדי לבצע בדיקה משפטית.\n";
    } else {
      if (source === "מהלקוח" && hasLicense === "לא") {
        output += "⚠️ נדרש רישיון כתוב מהלקוח לפני השימוש.\n";
      }
      if (source === "הורד מהרשת" && hasLicense === "לא") {
        output += "❌ אין להשתמש בתוכן מהרשת ללא רישיון ברור.\n";
      }
      if (hasLicense === "כן") {
        output += "✅ יש רישיון – מומלץ לוודא שהוא מכסה גם שימוש מסחרי.\n";
      }
    }

    if (hasIdentifiablePeopleOrBrands === "כן") {
      output += "📸 כולל אנשים או מותגים – נדרש אישור (Model Release או אישור מהמותג).\n";
    }

    // שלב 2 - ניתוח משפטי לפי טקסט חופשי
    const t = freeText.toLowerCase();
    const isInspired = t.includes("בהשראת") || t.includes("מזכיר") || t.includes("דומה ל");
    const isTrademark = t.includes("לוגו") || t.includes("מותג") || t.includes("סימן מסחר") || t.includes("שם מסחרי") || t.includes("חברה") || t.includes("קמפיין מוכר");

    if (isInspired) {
      output += "⚠️ זוהתה השראה מיצירה קיימת – לפי חוק זכות יוצרים סעיף 4 וסעיף 16, שימוש שנחשב להעתקה מהותית גם אם " +
        "הוא רק " + (t.includes("קונספט") ? "קונספטואלי" : "ויזואלי") +
        ", עשוי להיחשב להפרה.\n🔍 מומלץ: לוודא שינוי מהותי ברמת טקסט, גרפיקה וטון.\n";
    }

    if (isTrademark) {
      output += "⚠️ שימוש אפשרי בסימן מסחר או שם מותג – יש לבדוק האם מדובר בסימן רשום (רשם סימני מסחר / USPTO / EUIPO).\n" +
        "אם כן, חובה באישור מפורש מבעלי הזכויות כדי למנוע תביעת הפרת סימן מסחר.\n";
    }

    if (!output) {
      output = "✅ לא נמצאו אינדיקציות ברורות להפרת זכויות יוצרים, אך מומלץ תמיד לתעד מקור ורישוי.\n";
    }

    setResult(output);
    setStep(99);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">בודק זכויות יוצרים</h1>

        {step < 99 && (
          <div className="space-y-6">
            {step === 1 && (
              <div>
                <label className="font-medium">1. סוג התוכן:</label>
                <select className="mt-2 w-full border p-2 rounded" onChange={(e) => handleChange("contentType", e.target.value)}>
                  <option value="">בחר</option>
                  <option>תמונה</option>
                  <option>וידאו</option>
                  <option>טקסט</option>
                  <option>מוזיקה</option>
                  <option>פונט</option>
                </select>
                <div className="mt-4 flex justify-end">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setStep(2)}>הבא</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <label className="font-medium">2. מה מקור התוכן?</label>
                <select className="mt-2 w-full border p-2 rounded" onChange={(e) => handleChange("source", e.target.value)}>
                  <option value="">בחר</option>
                  <option>נוצר אצלנו</option>
                  <option>מהלקוח</option>
                  <option>הורד מהרשת</option>
                  <option>נרכש ממאגר</option>
                </select>
                <div className="mt-4 flex justify-between">
                  <button className="text-gray-600" onClick={() => setStep(1)}>חזור</button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setStep(3)}>הבא</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <label className="font-medium">3. האם יש רישיון לתוכן?</label>
                <select className="mt-2 w-full border p-2 rounded" onChange={(e) => handleChange("hasLicense", e.target.value)}>
                  <option value="">בחר</option>
                  <option>כן</option>
                  <option>לא</option>
                  <option>לא ידוע</option>
                </select>
                <div className="mt-4 flex justify-between">
                  <button className="text-gray-600" onClick={() => setStep(2)}>חזור</button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setStep(4)}>הבא</button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <label className="font-medium">4. האם התוכן כולל אנשים או מותגים מזוהים?</label>
                <select className="mt-2 w-full border p-2 rounded" onChange={(e) => handleChange("hasIdentifiablePeopleOrBrands", e.target.value)}>
                  <option value="">בחר</option>
                  <option>כן</option>
                  <option>לא</option>
                </select>
                <div className="mt-4 flex justify-between">
                  <button className="text-gray-600" onClick={() => setStep(3)}>חזור</button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setStep(5)}>הבא</button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <label className="font-medium">5. תיאור חופשי של הקמפיין או השימוש:</label>
                <textarea rows={4} className="mt-2 w-full border p-2 rounded" placeholder="לדוגמה: שימוש בהשראת קמפיין של WOBI, או טקסט שמזכיר מותג אחר..." onChange={(e) => handleChange("freeText", e.target.value)} />
                <div className="mt-4 flex justify-between">
                  <button className="text-gray-600" onClick={() => setStep(4)}>חזור</button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={analyzeLegal}>בדיקה משפטית</button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 99 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">תוצאה:</h2>
            <pre className="bg-gray-100 border p-4 whitespace-pre-wrap rounded text-sm text-gray-800">{result}</pre>
            <div className="mt-4 text-center">
              <button className="bg-gray-600 text-white px-4 py-2 rounded" onClick={() => setStep(1)}>בדיקה חדשה</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

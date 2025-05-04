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

  const evaluate = () => {
    const { contentType, source, hasLicense, hasIdentifiablePeopleOrBrands, freeText } = formData;
    let msg = "";

    if (!contentType || !source || !hasLicense) {
      msg = "נא למלא את כל השדות.";
    } else if (source === "מהלקוח" && hasLicense === "לא") {
      msg = "⚠️ נדרש רישיון כתוב מהלקוח.";
    } else if (source === "הורד מהרשת" && hasLicense === "לא") {
      msg = "❌ אין להשתמש בתוכן מהרשת ללא רישיון.";
    } else if (hasLicense === "כן") {
      msg = "✅ יש רישיון שימוש. ודא שהוא כולל שימוש מסחרי.";
    } else {
      msg = "⚠️ יש לבדוק ידנית. פנה לבעל הזכויות או ליועץ משפטי.";
    }

    if (hasIdentifiablePeopleOrBrands === "כן") {
      msg += "\n📸 כולל אנשים/מותגים – דרוש אישור מתאים (Model Release / אישור מותג).";
    }

    if (freeText.toLowerCase().includes("בהשראת") || freeText.toLowerCase().includes("דומה ל") || freeText.toLowerCase().includes("מזכיר")) {
      msg += "\n⚠️ זוהתה התייחסות ליצירה קיימת. שימוש בהשראה עלול להיחשב להעתקה אם יש דמיון מהותי. ודא שהקמפיין שונה מהותית או התייעץ עם עו"ד לזכויות יוצרים.";
    }

    if (freeText.toLowerCase().includes("לוגו") || freeText.toLowerCase().includes("מותג") || freeText.toLowerCase().includes("סימן מסחר") || freeText.toLowerCase().includes("שם מסחרי")) {
      msg += "\n⚠️ זוהה שימוש אפשרי בסימן מסחר – ודא שיש אישור מהמותג או הלקוח, במיוחד אם מדובר בשימוש מסחרי או בפרסום לציבור.";
    }

    setResult(msg);
    setStep(99);
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20, fontFamily: "sans-serif" }}>
      <h1>בודק זכויות יוצרים</h1>
      {step === 1 && (
        <>
          <label>1. סוג תוכן:</label>
          <select onChange={(e) => handleChange("contentType", e.target.value)}>
            <option>בחר</option>
            <option>תמונה</option>
            <option>מוזיקה</option>
            <option>וידאו</option>
            <option>פונט</option>
            <option>טקסט</option>
          </select>
          <br /><br />
          <button onClick={() => setStep(2)}>הבא</button>
        </>
      )}

      {step === 2 && (
        <>
          <label>2. מקור:</label>
          <select onChange={(e) => handleChange("source", e.target.value)}>
            <option>בחר</option>
            <option>נוצר אצלנו</option>
            <option>מהלקוח</option>
            <option>הורד מהרשת</option>
            <option>נרכש ממאגר</option>
          </select>
          <br /><br />
          <button onClick={() => setStep(1)}>חזור</button>
          <button onClick={() => setStep(3)}>הבא</button>
        </>
      )}

      {step === 3 && (
        <>
          <label>3. יש רישיון?</label>
          <select onChange={(e) => handleChange("hasLicense", e.target.value)}>
            <option>בחר</option>
            <option>כן</option>
            <option>לא</option>
            <option>לא ידוע</option>
          </select>
          <br /><br />
          <button onClick={() => setStep(2)}>חזור</button>
          <button onClick={() => setStep(4)}>הבא</button>
        </>
      )}

      {step === 4 && (
        <>
          <label>4. כולל אנשים/מותגים?</label>
          <select onChange={(e) => handleChange("hasIdentifiablePeopleOrBrands", e.target.value)}>
            <option>בחר</option>
            <option>כן</option>
            <option>לא</option>
          </select>
          <br /><br />
          <button onClick={() => setStep(3)}>חזור</button>
          <button onClick={() => setStep(5)}>הבא</button>
        </>
      )}

      {step === 5 && (
        <>
          <label>5. תיאור חופשי של הרעיון או השימוש:</label>
          <textarea rows={5} style={{ width: "100%" }} onChange={(e) => handleChange("freeText", e.target.value)} />
          <br /><br />
          <button onClick={() => setStep(4)}>חזור</button>
          <button onClick={evaluate}>בדיקה</button>
        </>
      )}

      {step === 99 && (
        <>
          <h3>תוצאה:</h3>
          <pre>{result}</pre>
          <button onClick={() => setStep(1)}>בדיקה חדשה</button>
        </>
      )}
    </div>
  );
}
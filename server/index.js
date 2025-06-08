import express from "express";
import formidable from "formidable";
import fs from "fs";
import cors from "cors";
import { OpenAI } from "openai";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());

app.post("/legal-assistant", (req, res) => {
  const form = new formidable.IncomingForm({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form error:", err);
      return res.status(500).json({ error: "Failed to parse form" });
    }

    // With multiples: false, values are single items, not arrays
    const prompt = fields.prompt || "";
    const file = files.file;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const systemMessage =
      "אתה עורך דין מומחה לדיני זכויות יוצרים, סימנים מסחריים ודיני פרסום. עבור כל קלט שאתה מקבל, הפק ניתוח משפטי מעמיק בעברית, כולל התייחסות לחוק זכות יוצרים הישראלי, דיני השוואה מסחרית, פסיקה, שימוש הוגן, והמלצות לפעולה.";

    const chatMessages = [
      { role: "system", content: systemMessage },
      { role: "user", content: prompt }
    ];

    if (file) {
      const fileBuffer = fs.readFileSync(file.filepath);
      const base64 = fileBuffer.toString("base64");
      const mimeType = file.mimetype;

      chatMessages.push({
        role: "user",
        content: [
          { type: "text", text: "מצורף הקובץ. נתח אותו לפי זכויות יוצרים." },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64}`,
              detail: "high"
            }
          }
        ]
      });
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: chatMessages,
        max_tokens: 1200
      });

      res.json({ summary: completion.choices[0].message.content });
    } catch (err) {
      console.error("OpenAI error:", err);
      res.status(500).json({ error: "AI analysis failed" });
    }
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Legal Assistant API running on port ${PORT}`);
});

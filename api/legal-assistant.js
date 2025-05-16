import formidable from "formidable";
import fs from "fs";
import path from "path";
import { Configuration, OpenAIApi } from "openai";

export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAIApi(
  new Configuration({ apiKey: process.env.OPENAI_API_KEY })
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = new formidable.IncomingForm();
  form.uploadDir = path.join(process.cwd(), "/tmp");
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    const prompt = fields.prompt?.[0] || "";
    const fileUrl = fields.file?.[0] || null;

    let systemPrompt =
      "אתה עורך דין מומחה בדיני זכויות יוצרים. נתח משפטית את המידע שהוזן על שימוש בקובץ לצרכים מסחריים.";

    if (!prompt && !fileUrl) {
      return res.status(400).json({ error: "Missing prompt or file" });
    }

    try {
      const messages = [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `השאלה: ${prompt}${fileUrl ? `\nהקובץ שצורף: ${fileUrl}` : ""}`,
        },
      ];

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages,
        temperature: 0.4,
      });

      const summary = completion.choices?.[0]?.message?.content || "";
      res.status(200).json({ summary });
    } catch (e) {
      console.error("Legal analysis error:", e);
      res.status(500).json({ error: "Failed to generate legal analysis" });
    }
  });
}

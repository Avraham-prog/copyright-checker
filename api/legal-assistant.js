import formidable from 'formidable';
import fs from 'fs';
import { OpenAI } from 'openai';

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new formidable.IncomingForm({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Formidable error:', err);
      return res.status(500).json({ error: 'Failed to parse form' });
    }

    const prompt = fields.prompt;
    const file = files.file;

    if (!prompt && !file) {
      return res.status(400).json({ error: 'Missing prompt or file' });
    }

    // כאן תוכל להעלות את הקובץ ל־Cloudinary או לקרוא אותו ל־Buffer
    // ואח״כ לשלוח את ה־prompt ל־OpenAI

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'אתה עורך דין מומחה בזכויות יוצרים' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4
    });

    return res.status(200).json({ summary: completion.choices[0].message.content });
  });
}

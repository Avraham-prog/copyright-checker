// /api/upload-to-cloudinary.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'Missing URL' });
  }

  try {
    const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/auto/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file: url,
        upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
      })
    });

    const data = await cloudinaryRes.json();

    if (!cloudinaryRes.ok || !data.secure_url) {
      return res.status(500).json({ error: 'Upload failed', detail: data });
    }

    return res.status(200).json({ cloudinaryUrl: data.secure_url });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Server error during upload' });
  }
}

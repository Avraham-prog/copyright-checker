// קובץ: /api/upload-to-cloudinary.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { fileUrl } = req.body;

  if (!fileUrl) {
    return res.status(400).json({ error: "Missing file URL" });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const timestamp = Math.floor(Date.now() / 1000);
  const crypto = await import("crypto");
  const signature = crypto.createHash("sha1")
    .update(`timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  const formData = new URLSearchParams();
  formData.append("file", fileUrl);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);

  try {
    const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData.toString()
    });

    const uploadResult = await uploadResponse.json();
    if (!uploadResponse.ok) {
      return res.status(uploadResponse.status).json({ error: uploadResult.error?.message || "Upload failed" });
    }

    return res.status(200).json(uploadResult);
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

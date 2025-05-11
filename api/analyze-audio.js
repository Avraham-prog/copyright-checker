export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { audioUrl } = req.body;

  if (!audioUrl) {
    return res.status(400).json({ error: "Missing audioUrl" });
  }

  const crypto = await import("crypto");
  const timestamp = Math.floor(Date.now() / 1000);
  const stringToSign = [
    "POST",
    "/v1/identify",
    process.env.VITE_ACRCLOUD_ACCESS_KEY,
    "audio",
    "1",
    timestamp
  ].join("\n");

  const hmac = crypto
    .createHmac("sha1", process.env.VITE_ACRCLOUD_SECRET_KEY)
    .update(stringToSign)
    .digest("base64");

  try {
    const response = await fetch(process.env.VITE_ACRCLOUD_HOST + "/v1/identify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sample_url: audioUrl,
        access_key: process.env.VITE_ACRCLOUD_ACCESS_KEY,
        data_type: "audio",
        signature: hmac,
        sample_bytes: 0,
        timestamp
      })
    });

    const result = await response.json();
    return res.status(200).json(result);
  } catch (err) {
    console.error("ACRCloud error:", err);
    return res.status(500).json({ error: "Failed to process audio" });
  }
}

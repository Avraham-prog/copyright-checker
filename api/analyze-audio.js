// קובץ API: /api/analyze-audio.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url: audioUrl } = req.body;

  if (!audioUrl || typeof audioUrl !== 'string') {
    return res.status(400).json({ error: "Missing or invalid audio URL" });
  }

  try {
    const response = await fetch("https://identify-eu-west-1.acrcloud.com/v1/identify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access-key": process.env.VITE_ACRCLOUD_ACCESS_KEY,
        "secret-key": process.env.VITE_ACRCLOUD_SECRET_KEY
      },
      body: JSON.stringify({ url: audioUrl })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || "Failed to analyze audio" });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error analyzing audio:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

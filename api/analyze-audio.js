import https from 'https';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "Missing audio URL" });
  }

  try {
    const audioBuffer = await fetchAudioAsBuffer(url);
    const timestamp = Math.floor(Date.now() / 1000);
    const accessKey = process.env.ACRCLOUD_ACCESS_KEY;
    const secretKey = process.env.ACRCLOUD_SECRET_KEY;
    const host = process.env.ACRCLOUD_HOST; // e.g. https://identify-eu-west-1.acrcloud.com

    const stringToSign = [
      "POST",
      "/v1/identify",
      accessKey,
      "audio",
      "1",
      timestamp
    ].join("\n");

    const signature = crypto
      .createHmac("sha1", secretKey)
      .update(stringToSign)
      .digest("base64");

    const formData = new FormData();
    formData.append("sample", new Blob([audioBuffer]), "sample.mp3");
    formData.append("access_key", accessKey);
    formData.append("data_type", "audio");
    formData.append("signature", signature);
    formData.append("signature_version", "1");
    formData.append("timestamp", timestamp.toString());
    formData.append("sample_bytes", audioBuffer.length);

    const response = await fetch(`${host}/v1/identify`, {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error analyzing audio:", error);
    return res.status(500).json({ error: "Failed to analyze audio." });
  }
}

async function fetchAudioAsBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

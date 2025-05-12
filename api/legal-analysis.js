export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'Missing audio URL' });
  }

  try {
    const response = await fetch(process.env.LEGAL_ANALYSIS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LEGAL_ANALYSIS_API_KEY || ''}`
      },
      body: JSON.stringify({ url })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Legal analysis failed');
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Legal analysis error:', err);
    return res.status(500).json({ error: 'Failed to perform legal analysis' });
  }
}

const { kv } = require('@vercel/kv');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { room } = req.query;
  if (!room) {
    return res.status(400).json({ error: 'Missing room parameter' });
  }

  try {
    const data = await kv.get('dating:' + room);
    if (data) {
      const parsed = JSON.parse(data);
      res.status(200).json({ data: [parsed] });
    } else {
      res.status(200).json({ data: [] });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Storage error' });
  }
};

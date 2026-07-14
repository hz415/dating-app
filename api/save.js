const { kv } = require('@vercel/kv');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { room, food, date, time } = req.body;
  if (!room || !food || !date || !time) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    // 存储回复，key: dating:{room}
    await kv.set('dating:' + room, JSON.stringify({ food, date, time, created_at: new Date().toISOString() }));
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Storage error' });
  }
};

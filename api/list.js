const mysql = require('mysql2/promise');

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
    return res.status(400).json({ error: 'Missing room' });
  }

  let conn;
  try {
    conn = await mysql.createConnection({
      host: 'mysql6.sqlpub.com',
      port: 3311,
      user: 'wwwaiqing',
      password: 'EVcOzR3W9RImaApx',
      database: 'geng0031',
    });

    const [rows] = await conn.execute(
      'SELECT food, date, time, created_at FROM dating_responses WHERE room = ? ORDER BY created_at DESC LIMIT 1',
      [room]
    );

    res.status(200).json({ data: rows });
  } catch (err) {
    console.error('List error:', err.message);
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) await conn.end();
  }
};

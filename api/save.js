const mysql = require('mysql2/promise');

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

  let conn;
  try {
    conn = await mysql.createConnection({
      host: 'mysql6.sqlpub.com',
      port: 3311,
      user: 'wwwaiqing',
      password: 'EVcOzR3W9RImaApx',
      database: 'geng0031',
    });

    // 先删除旧回复（只保留最新一条）
    await conn.execute('DELETE FROM dating_responses WHERE room = ?', [room]);
    // 插入新回复
    await conn.execute(
      'INSERT INTO dating_responses (room, food, date, time, created_at) VALUES (?, ?, ?, ?, NOW())',
      [room, food, date, time]
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Save error:', err.message);
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) await conn.end();
  }
};

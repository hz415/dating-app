const mysql = require('mysql2/promise');

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { room, nickname, food, date, time } = req.body;
  if (!room || !nickname || !food || !date || !time) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS dating_responses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room VARCHAR(20),
        nickname VARCHAR(100),
        food VARCHAR(100),
        date VARCHAR(50),
        time VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 兼容旧表：如果缺少 room 列则自动添加
    try {
      await conn.execute('ALTER TABLE dating_responses ADD COLUMN room VARCHAR(20)');
    } catch (e) {
      // 列已存在，忽略错误
    }

    await conn.execute(
      'INSERT INTO dating_responses (room, nickname, food, date, time) VALUES (?, ?, ?, ?, ?)',
      [room, nickname, food, date, time]
    );

    await conn.end();
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

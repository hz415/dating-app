const mysql = require('mysql2/promise');

module.exports = async (req, res) => {
  // 只允许 POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nickname, food, date, time } = req.body;
  if (!nickname || !food || !date || !time) {
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

    // 建表（如果不存在）
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS dating_responses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nickname VARCHAR(100),
        food VARCHAR(100),
        date VARCHAR(50),
        time VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.execute(
      'INSERT INTO dating_responses (nickname, food, date, time) VALUES (?, ?, ?, ?)',
      [nickname, food, date, time]
    );

    await conn.end();
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

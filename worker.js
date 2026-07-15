// ═════════════════════════════════════════════════════
// Dating App API - Cloudflare Worker
// 用 KV 存储回复数据，国内可访问
// ═════════════════════════════════════════════════════

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // GET /api/list?room=xxx
    if (path === '/api/list') {
      const room = url.searchParams.get('room');
      if (!room) {
        return json({ error: 'Missing room' }, 400);
      }

      try {
        const data = await env.DATING_KV.get('dating:' + room);
        if (data) {
          return json({ data: [JSON.parse(data)] });
        }
        return json({ data: [] });
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }

    // POST /api/save
    if (path === '/api/save') {
      try {
        const body = await request.json();
        const { room, food, date, time } = body;
        if (!room || !food || !date || !time) {
          return json({ error: 'Missing fields' }, 400);
        }

        const value = JSON.stringify({ food, date, time, created_at: new Date().toISOString() });
        await env.DATING_KV.put('dating:' + room, value);
        return json({ success: true });
      } catch (e) {
        return json({ error: e.message }, 500);
      }
    }

    return json({ error: 'Not found' }, 404);
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
  });
}

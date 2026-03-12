export const config = {
  runtime: 'edge'
};

const TELEGRAM_API_BASE = 'https://api.telegram.org';

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: 'method_not_allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json' }
    });
  }

  const token = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.CHAT_ID || process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return new Response(JSON.stringify({ ok: false, error: 'missing_env' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const text = typeof body.text === 'string' ? body.text : '';
    const parseMode = typeof body.parse_mode === 'string' ? body.parse_mode : 'HTML';

    if (!text) {
      return new Response(JSON.stringify({ ok: false, error: 'text_required' }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      });
    }

    const telegramResponse = await fetch(`${TELEGRAM_API_BASE}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode
      })
    });

    const data = await telegramResponse.json().catch(() => ({}));
    return new Response(JSON.stringify(data), {
      status: telegramResponse.status,
      headers: { 'content-type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: 'internal_error', details: String(error) }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}

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

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return new Response(JSON.stringify({ ok: false, error: 'missing_env' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }

  try {
    const inboundForm = await request.formData();
    const document = inboundForm.get('document');
    const caption = inboundForm.get('caption');

    if (!(document instanceof File)) {
      return new Response(JSON.stringify({ ok: false, error: 'document_required' }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      });
    }

    const outboundForm = new FormData();
    outboundForm.append('chat_id', chatId);
    outboundForm.append('document', document, document.name);
    if (typeof caption === 'string' && caption.trim()) {
      outboundForm.append('caption', caption);
    }

    const telegramResponse = await fetch(`${TELEGRAM_API_BASE}/bot${token}/sendDocument`, {
      method: 'POST',
      body: outboundForm
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

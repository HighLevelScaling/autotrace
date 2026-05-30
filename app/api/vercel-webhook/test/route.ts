import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
  const missing: string[] = [];
  if (!TELEGRAM_BOT_TOKEN) missing.push('TELEGRAM_BOT_TOKEN');
  if (!TELEGRAM_CHAT_ID) missing.push('TELEGRAM_CHAT_ID');

  if (missing.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        error: `Missing environment variables: ${missing.join(', ')}`,
        setup: {
          telegramBotFather: 'https://t.me/BotFather',
          howToGetChatId: 'Send a message to your bot, then visit: https://api.telegram.org/bot<TOKEN>/getUpdates',
        },
      },
      { status: 400 }
    );
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: `🧪 <b>AutoTrace Webhook Test</b>\n\nYour Vercel → Telegram integration is working.\nYou will receive alerts for deployment events.`,
        parse_mode: 'HTML',
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { ok: false, error: `Telegram API error: ${err}` },
        { status: 502 }
      );
    }

    const data = await res.json();

    return NextResponse.json({
      ok: true,
      telegramResponse: data,
      message: 'Test message sent to Telegram. Check your chat.',
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}

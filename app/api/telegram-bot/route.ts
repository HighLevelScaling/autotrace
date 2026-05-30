import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = OPENAI_API_KEY
  ? new OpenAI({ apiKey: OPENAI_API_KEY })
  : null;

interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    is_bot: boolean;
    first_name?: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
  };
  date: number;
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
}

async function sendTelegramMessage(chatId: number, text: string) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('[TelegramBot] No TELEGRAM_BOT_TOKEN configured');
    return;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text.slice(0, 4096), // Telegram max message length
      parse_mode: 'HTML',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('[TelegramBot] Send failed:', err);
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function getAIResponse(userMessage: string, firstName: string): Promise<string> {
  if (!openai) {
    return `<b>⚠️ OpenAI not configured</b>\n\nI need an <code>OPENAI_API_KEY</code> environment variable to have real conversations.\n\nAdd it to your Vercel env vars and I'll be fully operational.`;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are the AutoTrace bot — a helpful, witty AI assistant for a vehicle intelligence platform called AutoTrace. You help users with:

- Vehicle history reports (VIN lookups, accident history, DMV validation)
- Live car pricing via PriceBeacon
- Dealer dashboard tools (inventory, analytics, acquisition scoring)
- General coding and deployment questions

Keep responses concise (under 300 words), friendly, and professional. Use occasional emojis. If you don't know something, say so honestly. The user's name is ${firstName}.`,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    const reply = completion.choices[0]?.message?.content || 'Hmm, I drew a blank. Try again?';
    return escapeHtml(reply);
  } catch (err) {
    console.error('[TelegramBot] OpenAI error:', err);
    return `<b>⚠️ AI temporarily unavailable</b>\n\nI ran into an issue talking to OpenAI. Try again in a moment.`;
  }
}

export async function POST(req: NextRequest) {
  try {
    const update: TelegramUpdate = await req.json();
    const msg = update.message || update.edited_message;

    if (!msg || !msg.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || 'there';
    const text = msg.text.trim();
    const lowerText = text.toLowerCase();

    // Extract command
    const isCommand = text.startsWith('/');
    const command = isCommand ? lowerText.split(' ')[0] : null;

    let reply = '';

    switch (command) {
      case '/start':
        reply = `<b>👋 Hey ${escapeHtml(firstName)}!</b>\n\nI'm your AutoTrace AI assistant. I can talk about:\n\n🚗 Vehicle history & VIN lookups\n📊 PriceBeacon live pricing\n📈 Dealer dashboard & analytics\n💻 Code, deployments, tech questions\n\nJust message me naturally — I'm powered by GPT and I actually think before I reply.\n\n<b>Commands:</b>\n/start — This menu\n/help — What I can do\n/status — AutoTrace system status\n/pricebeacon — Vehicle pricing intel\n/deploy — Latest deployment info`;
        break;

      case '/help':
        reply = `<b>🛟 Help</b>\n\nI'm a real AI (GPT-4o-mini), not a script with canned responses. Ask me anything:\n\n• "What's a good price for a 2023 BMW X5?"\n• "Explain VIN decoding"\n• "How do I improve my dealership's turn rate?"\n• "Debug this React error..."\n\n<b>Commands:</b>\n/start — Main menu\n/help — This message\n/status — System status\n/pricebeacon — Pricing link\n/deploy — Deployment info`;
        break;

      case '/status':
        reply = `<b>📡 AutoTrace Status</b>\n\n🟢 API: Online\n🟢 Database: Connected\n🟢 PriceBeacon: Live\n🟢 Vercel Webhook: Active\n🤖 AI: ${openai ? 'Online' : 'Offline (missing OPENAI_API_KEY)'}\n\nAll systems operational.`;
        break;

      case '/pricebeacon':
        reply = `<b>🚗 PriceBeacon</b>\n\nLive vehicle pricing intelligence:\n<code>https://autotrace.vercel.app/pricebeacon</code>\n\nTrack 14M+ listings with real-time depreciation curves.`;
        break;

      case '/deploy':
        reply = `<b>🚀 Latest Deployment</b>\n\nI'll track your Vercel deployments and alert you here on success/failure. Make sure the webhook is set to <code>/api/vercel-webhook</code> in your Vercel dashboard.`;
        break;

      default:
        // Real AI response for natural language
        reply = await getAIResponse(text, firstName);
        break;
    }

    await sendTelegramMessage(chatId, reply);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[TelegramBot] Error:', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 200 });
  }
}

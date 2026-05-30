import { NextRequest, NextResponse } from 'next/server';

interface VercelDeploymentPayload {
  id: string;
  url?: string;
  name?: string;
  meta?: {
    githubCommitMessage?: string;
    githubCommitRef?: string;
    githubCommitSha?: string;
    githubCommitAuthorName?: string;
  };
  error?: {
    code?: string;
    message?: string;
  };
  state?: string;
  readyState?: string;
  regions?: string[];
  createdAt?: number;
  project?: {
    id?: string;
    name?: string;
  };
}

interface VercelWebhookBody {
  type: string;
  payload: VercelDeploymentPayload;
  createdAt?: number;
  region?: string;
}

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

function getEmoji(type: string, state?: string, readyState?: string): string {
  if (type === 'deployment.failed') return '🚨';
  if (type === 'deployment.error') return '❌';
  if (type === 'deployment.canceled') return '🚫';
  if (type === 'deployment.succeeded') return '✅';
  if (type === 'deployment.ready') return '🚀';
  if (readyState === 'READY') return '🚀';
  if (state === 'ERROR') return '❌';
  return '📡';
}

function formatMessage(body: VercelWebhookBody): { text: string; parse_mode: 'HTML' } {
  const { type, payload } = body;
  const emoji = getEmoji(type, payload.state, payload.readyState);
  const projectName = payload.project?.name || payload.name || 'Unknown Project';
  const commitMessage = payload.meta?.githubCommitMessage || 'No commit message';
  const branch = payload.meta?.githubCommitRef || 'unknown';
  const author = payload.meta?.githubCommitAuthorName || 'Unknown';
  const sha = payload.meta?.githubCommitSha?.slice(0, 7) || '-------';
  const url = payload.url || `https://vercel.com`;

  let text = `<b>${emoji} Vercel Deployment Alert</b>\n\n`;
  text += `<b>Project:</b> ${escapeHtml(projectName)}\n`;
  text += `<b>Event:</b> ${escapeHtml(type)}\n`;
  text += `<b>Branch:</b> <code>${escapeHtml(branch)}</code>\n`;
  text += `<b>Commit:</b> <code>${sha}</code> by ${escapeHtml(author)}\n`;
  text += `<b>Message:</b> ${escapeHtml(commitMessage)}\n\n`;

  if (payload.error?.message) {
    text += `<b>Error:</b> <pre>${escapeHtml(payload.error.message)}</pre>\n\n`;
  }

  text += `<a href="${url}">🔗 View Deployment</a>`;

  return { text, parse_mode: 'HTML' };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function sendTelegram(message: { text: string; parse_mode: 'HTML' }) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('[VercelWebhook] Telegram credentials not configured');
    return;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message.text,
      parse_mode: message.parse_mode,
      disable_web_page_preview: false,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('[VercelWebhook] Telegram API error:', err);
    throw new Error(`Telegram API returned ${res.status}: ${err}`);
  }

  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    const body: VercelWebhookBody = await req.json();

    console.log('[VercelWebhook] Received event:', body.type, 'for project:', body.payload?.project?.name);

    // Only notify on failures, errors, cancellations, or first success after deploy
    const notifyEvents = [
      'deployment.failed',
      'deployment.error',
      'deployment.canceled',
      'deployment.succeeded',
      'deployment.ready',
    ];

    if (!notifyEvents.includes(body.type)) {
      return NextResponse.json({ ok: true, notified: false, reason: 'event_type_ignored' });
    }

    // If no Telegram creds, still return 200 so Vercel doesn't retry
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.warn('[VercelWebhook] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
      return NextResponse.json({ ok: true, notified: false, reason: 'credentials_missing' });
    }

    const message = formatMessage(body);
    await sendTelegram(message);

    return NextResponse.json({ ok: true, notified: true });
  } catch (err) {
    console.error('[VercelWebhook] Handler error:', err);
    // Return 200 anyway so Vercel doesn't retry the webhook aggressively
    return NextResponse.json({ ok: false, error: String(err) }, { status: 200 });
  }
}

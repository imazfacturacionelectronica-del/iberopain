const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const CHAT_ID_ADMIN = process.env.TELEGRAM_CHAT_ID_ADMIN!
const CHAT_ID_EQUIPO = process.env.TELEGRAM_CHAT_ID_EQUIPO!

export async function sendTelegramMessage(text: string, chatId = CHAT_ID_ADMIN) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })
  if (!res.ok) {
    const err = await res.json()
    console.error('Telegram error:', err)
  }
}

export async function notifyEquipoTelegram(text: string) {
  await sendTelegramMessage(text, CHAT_ID_EQUIPO)
}

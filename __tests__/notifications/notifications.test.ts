jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({ id: 'email-id', error: null }),
    },
  })),
}))

import { notifyAdminDraftReady, notifyTeamProtocolPublished } from '@/lib/notifications/email'
import { sendTelegramMessage } from '@/lib/notifications/telegram'

global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) })

test('notifyAdminDraftReady sends email without throwing', async () => {
  await expect(
    notifyAdminDraftReady('Protocolo APS', 'aps-dolor-agudo-postoperatorio')
  ).resolves.not.toThrow()
})

test('notifyTeamProtocolPublished sends email without throwing', async () => {
  await expect(
    notifyTeamProtocolPublished('Protocolo APS', 'aps-dolor-agudo-postoperatorio')
  ).resolves.not.toThrow()
})

test('sendTelegramMessage calls Telegram API', async () => {
  await sendTelegramMessage('Protocolo actualizado')
  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining('api.telegram.org'),
    expect.any(Object)
  )
})

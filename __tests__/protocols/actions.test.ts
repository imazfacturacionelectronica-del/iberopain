jest.mock('@/lib/supabase/server', () => ({ createServiceClient: jest.fn() }))
jest.mock('@/lib/notifications/email', () => ({ notifyTeamProtocolPublished: jest.fn().mockResolvedValue(undefined) }))
jest.mock('@/lib/notifications/telegram', () => ({ sendTelegramMessage: jest.fn().mockResolvedValue(undefined) }))

import { approveProtocolDraft, rejectProtocolDraft } from '@/lib/protocols/actions'
import { createServiceClient } from '@/lib/supabase/server'

const mockUpdateEq = jest.fn().mockResolvedValue({ error: null })
const mockSingle = jest.fn().mockResolvedValue({
  data: { id: 'prot-1', title: 'Protocolo APS', slug: 'aps' },
  error: null,
})

beforeEach(() => {
  jest.clearAllMocks()
  ;(createServiceClient as jest.Mock).mockResolvedValue({
    from: jest.fn().mockReturnValue({
      update: jest.fn().mockReturnValue({ eq: mockUpdateEq }),
      select: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ single: mockSingle }) }),
    }),
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-admin-1' } } }),
    },
  })
})

test('approveProtocolDraft returns success', async () => {
  const result = await approveProtocolDraft('prot-1', 'version-1')
  expect(result.success).toBe(true)
})

test('rejectProtocolDraft returns success', async () => {
  const result = await rejectProtocolDraft('prot-1', 'version-1')
  expect(result.success).toBe(true)
})

import { getPublishedProtocols, getProtocolBySlug, getProtocolVersionHistory, getProtocolDraft } from '@/lib/protocols/queries'

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

import { createClient } from '@/lib/supabase/server'

const mockProtocol = {
  id: 'uuid-1',
  slug: 'aps-dolor-agudo-postoperatorio',
  title: 'Protocolo APS',
  type: 'agudo' as const,
  status: 'published' as const,
  current_version_id: 'version-uuid-1',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

const mockVersion = {
  id: 'version-uuid-1',
  protocol_id: 'uuid-1',
  version_number: 1,
  content: { objetivo: 'Controlar el dolor agudo postoperatorio' },
  bibliography: [],
  generated_by: 'manual' as const,
  approved_by: null,
  approved_at: null,
  published_at: '2026-01-01T00:00:00Z',
  search_summary: null,
  created_at: '2026-01-01T00:00:00Z',
}

beforeEach(() => {
  jest.clearAllMocks()
})

test('getPublishedProtocols returns list of published protocols', async () => {
  ;(createClient as jest.Mock).mockResolvedValue({
    from: () => ({
      select: () => ({
        eq: () => ({
          order: jest.fn().mockResolvedValue({ data: [mockProtocol], error: null }),
        }),
      }),
    }),
  })

  const result = await getPublishedProtocols()
  expect(result).toHaveLength(1)
  expect(result[0].slug).toBe('aps-dolor-agudo-postoperatorio')
})

test('getProtocolBySlug returns protocol with versions', async () => {
  ;(createClient as jest.Mock).mockResolvedValue({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: jest.fn().mockResolvedValue({
            data: { ...mockProtocol, protocol_versions: [mockVersion] },
            error: null,
          }),
        }),
      }),
    }),
  })

  const result = await getProtocolBySlug('aps-dolor-agudo-postoperatorio')
  expect(result).not.toBeNull()
  expect(result!.slug).toBe('aps-dolor-agudo-postoperatorio')
})

test('getProtocolBySlug returns null when not found', async () => {
  ;(createClient as jest.Mock).mockResolvedValue({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
        }),
      }),
    }),
  })

  const result = await getProtocolBySlug('no-existe')
  expect(result).toBeNull()
})

test('getProtocolVersionHistory returns versions ordered by number desc', async () => {
  ;(createClient as jest.Mock).mockResolvedValue({
    from: () => ({
      select: () => ({
        eq: () => ({
          order: jest.fn().mockResolvedValue({ data: [mockVersion], error: null }),
        }),
      }),
    }),
  })

  const result = await getProtocolVersionHistory('uuid-1')
  expect(result).toHaveLength(1)
  expect(result[0].version_number).toBe(1)
})

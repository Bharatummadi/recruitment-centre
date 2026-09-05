import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 'study-1', slug: 'test-study' }]),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    }),
  },
}))

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

import { createStudy, updateStudy } from '@/actions/studies'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

describe('createStudy', () => {
  beforeEach(() => vi.clearAllMocks())

  it('throws Unauthorized if caller is not admin', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'participant', id: 'u1' } } as any)

    await expect(createStudy({
      title: 'Study A',
      slug: 'study-a',
      description: 'desc',
      summary: 'sum',
      contactEmail: 'pi@example.com',
      eligibilityCriteria: { questions: [], criteria: {} },
    })).rejects.toThrow('Unauthorized')
  })

  it('inserts study and redirects when admin', async () => {
    const { redirect } = await import('next/navigation')
    vi.mocked(auth).mockResolvedValue({ user: { role: 'admin', id: 'admin-1' } } as any)

    await createStudy({
      title: 'Study A',
      slug: 'study-a',
      description: 'desc',
      summary: 'sum',
      contactEmail: 'pi@example.com',
      eligibilityCriteria: { questions: [], criteria: {} },
    })

    expect(db.insert).toHaveBeenCalled()
    expect(redirect).toHaveBeenCalledWith('/admin/studies')
  })
})

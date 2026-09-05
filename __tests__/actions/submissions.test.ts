import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock db
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 'sub-123', studyId: 'study-1', userId: 'user-1' }]),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    }),
    query: {
      interestSubmissions: {
        findFirst: vi.fn(),
      },
      enrollments: {
        findFirst: vi.fn(),
      },
    },
  },
}))

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

import { approveSubmission, rejectSubmission } from '@/actions/submissions'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

describe('approveSubmission', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws Unauthorized if caller is not admin', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'participant', id: 'u1' } } as any)

    await expect(approveSubmission('sub-123')).rejects.toThrow('Unauthorized')
  })

  it('creates enrollment and updates submission status when admin', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'admin', id: 'admin-1' } } as any)
    vi.mocked(db.query.interestSubmissions.findFirst).mockResolvedValue({
      id: 'sub-123',
      studyId: 'study-1',
      userId: 'user-1',
      status: 'screened',
    } as any)

    await approveSubmission('sub-123')

    expect(db.insert).toHaveBeenCalled()
    expect(db.update).toHaveBeenCalled()
  })
})

describe('rejectSubmission', () => {
  it('throws Unauthorized if caller is not admin', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'participant', id: 'u1' } } as any)

    await expect(rejectSubmission('sub-123')).rejects.toThrow('Unauthorized')
  })

  it('updates submission status to rejected when admin', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'admin', id: 'admin-1' } } as any)

    await rejectSubmission('sub-123')

    expect(db.update).toHaveBeenCalled()
  })
})

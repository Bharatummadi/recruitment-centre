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


import { approveSubmission, rejectSubmission, submitInterest } from '@/actions/submissions'
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
    vi.mocked(db.query.enrollments.findFirst).mockResolvedValue(undefined)

    await approveSubmission('sub-123')

    expect(db.insert).toHaveBeenCalled()
    expect(db.update).toHaveBeenCalled()
  })

  it('skips enrollment insert if enrollment already exists', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'admin', id: 'admin-1' } } as any)
    vi.mocked(db.query.interestSubmissions.findFirst).mockResolvedValue({
      id: 'sub-123',
      studyId: 'study-1',
      userId: 'user-1',
      status: 'screened',
    } as any)
    vi.mocked(db.query.enrollments.findFirst).mockResolvedValue({
      id: 'enroll-1',
      userId: 'user-1',
      studyId: 'study-1',
    } as any)

    await approveSubmission('sub-123')

    expect(db.insert).not.toHaveBeenCalled()
    expect(db.update).toHaveBeenCalled()
  })
})

describe('submitInterest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws if unauthenticated and no guest info provided', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    await expect(submitInterest('study-1', {})).rejects.toThrow('Name and email are required')
  })

  it('inserts guest submission when unauthenticated but guest info provided', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    const result = await submitInterest('study-1', { q1: 'yes' }, { name: 'Jane', email: 'jane@example.com' })

    expect(db.insert).toHaveBeenCalled()
    expect(result).toEqual({ id: 'sub-123', studyId: 'study-1', userId: 'user-1' })
  })

  it('returns existing submission without inserting if duplicate', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1', role: 'participant' } } as any)
    const existing = { id: 'sub-existing', studyId: 'study-1', userId: 'user-1' }
    vi.mocked(db.query.interestSubmissions.findFirst).mockResolvedValue(existing as any)

    const result = await submitInterest('study-1', {})

    expect(result).toEqual(existing)
    expect(db.insert).not.toHaveBeenCalled()
  })

  it('inserts new submission when no duplicate exists', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1', role: 'participant' } } as any)
    vi.mocked(db.query.interestSubmissions.findFirst).mockResolvedValue(undefined)

    const result = await submitInterest('study-1', { q1: 'yes' })

    expect(db.insert).toHaveBeenCalled()
    expect(result).toEqual({ id: 'sub-123', studyId: 'study-1', userId: 'user-1' })
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

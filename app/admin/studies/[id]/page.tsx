import { db } from '@/lib/db'
import { studies } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { updateStudy } from '@/actions/studies'
import Link from 'next/link'

export default async function EditStudyPage({ params }: { params: { id: string } }) {
  const study = await db.query.studies.findFirst({
    where: eq(studies.id, params.id),
  })
  if (!study) notFound()

  async function handleUpdate(formData: FormData) {
    'use server'
    await updateStudy(params.id, {
      title: formData.get('title') as string,
      summary: formData.get('summary') as string,
      description: formData.get('description') as string,
      contactEmail: formData.get('contactEmail') as string,
      status: formData.get('status') as 'draft' | 'active' | 'closed',
      eligibilityCriteria: JSON.parse(formData.get('eligibilityCriteria') as string),
    })
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 400 }}>Edit Study</h1>
        <Link href="/admin/submissions" style={{ color: 'var(--accent-ink)' }}>
          View Submissions
        </Link>
      </div>
      <form action={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Title</label>
          <input name="title" defaultValue={study.title} required
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Status</label>
          <select name="status" defaultValue={study.status}
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8 }}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Summary</label>
          <input name="summary" defaultValue={study.summary} required
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Contact Email</label>
          <input name="contactEmail" type="email" defaultValue={study.contactEmail} required
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Description</label>
          <textarea name="description" defaultValue={study.description} required rows={8}
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Eligibility Criteria (JSON)</label>
          <textarea name="eligibilityCriteria" defaultValue={JSON.stringify(study.eligibilityCriteria, null, 2)}
            required rows={12}
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8, fontFamily: 'monospace', fontSize: 13 }} />
        </div>
        <button type="submit"
          style={{ alignSelf: 'flex-start', padding: '12px 32px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600 }}>
          Save Changes
        </button>
      </form>
    </div>
  )
}

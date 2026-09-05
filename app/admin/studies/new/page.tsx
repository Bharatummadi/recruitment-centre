import { createStudy } from '@/actions/studies'

export default function NewStudyPage() {
  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 400, marginBottom: 40 }}>New Study</h1>
      <form action={createStudy} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Field name="title" label="Title" />
        <Field name="slug" label="URL Slug (e.g. heart-health-2026)" />
        <Field name="summary" label="Summary (short, shown on cards)" />
        <Field name="contactEmail" label="Contact Email" type="email" />
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Description</label>
          <textarea name="description" required rows={8}
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>
            Eligibility Criteria (JSON)
          </label>
          <textarea name="eligibilityCriteria" required rows={12}
            defaultValue={JSON.stringify({
              questions: [
                { id: 'age', label: 'What is your age?', type: 'number' },
                { id: 'conditions', label: 'List any current medical conditions', type: 'textarea' },
                { id: 'medications', label: 'List any current medications', type: 'textarea' },
              ],
              criteria: {
                minAge: 18,
                maxAge: 75,
                note: 'Describe any exclusion criteria here for the AI agent',
              },
            }, null, 2)}
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8, fontFamily: 'monospace', fontSize: 13 }} />
        </div>
        <button type="submit"
          style={{ alignSelf: 'flex-start', padding: '12px 32px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600 }}>
          Create Study
        </button>
      </form>
    </div>
  )
}

function Field({ name, label, type = 'text' }: { name: string; label: string; type?: string }) {
  return (
    <div>
      <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>{label}</label>
      <input name={name} type={type} required
        style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8 }} />
    </div>
  )
}

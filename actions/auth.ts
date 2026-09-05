'use server'

import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData): Promise<void> {
  const email = formData.get('email') as string
  const name = formData.get('name') as string
  const password = formData.get('password') as string

  if (!email || !name || !password) {
    redirect('/auth/signup?error=missing_fields')
  }

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  })
  if (existing) {
    redirect('/auth/signup?error=email_taken')
  }

  const passwordHash = await bcrypt.hash(password, 12)
  await db.insert(users).values({ email, name, passwordHash })

  redirect('/auth/signin')
}

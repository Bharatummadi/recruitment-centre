'use server'

import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const name = formData.get('name') as string
  const password = formData.get('password') as string

  if (!email || !name || !password) {
    return { error: 'All fields are required' }
  }

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  })
  if (existing) {
    return { error: 'An account with this email already exists' }
  }

  const passwordHash = await bcrypt.hash(password, 12)
  await db.insert(users).values({ email, name, passwordHash })

  redirect('/auth/signin')
}

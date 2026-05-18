'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const PASSWORD = '0000'
const COOKIE_NAME = 'cf_auth'

export async function signIn(formData: FormData) {
  const password = formData.get('password') as string

  if (password !== PASSWORD) {
    return { error: 'Incorrect password.' }
  }

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })

  redirect('/dashboard')
}

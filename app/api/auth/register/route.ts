import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { name, storeName, email, password } = await req.json()
    if (!name || !storeName || !email || !password)
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    if (password.length < 6)
      return NextResponse.json({ error: 'Password min 6 characters' }, { status: 400 })
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { name, email, password: hashed } })
    await prisma.store.create({ data: { name: storeName, userId: user.id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

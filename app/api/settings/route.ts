import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const store = await prisma.store.update({
    where: { userId: (session.user as any).id },
    data: { name:body.name, phone:body.phone, address:body.address, gst:body.gst, currency:body.currency, taxRate:body.taxRate }
  })
  return NextResponse.json(store)
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getStore(session: any) {
  return prisma.store.findUnique({ where: { userId: session.user.id } })
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const store = await getStore(session)
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })
  const orders = await prisma.order.findMany({ where: { storeId: store.id }, include: { items: true }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const store = await getStore(session)
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })
  const { items, subtotal, discount, tax, total, payment } = await req.json()
  const order = await prisma.$transaction(async (tx) => {
    const o = await tx.order.create({
      data: { subtotal, discount, tax, total, payment, storeId: store.id,
        items: { create: items.map((i:any) => ({ productId:i.id, name:i.name, price:i.price, qty:i.qty })) }
      },
      include: { items: true }
    })
    for (const item of items) {
      await tx.product.update({ where: { id: item.id }, data: { stock: { decrement: item.qty } } })
    }
    return o
  })
  return NextResponse.json(order)
}

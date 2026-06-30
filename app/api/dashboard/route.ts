import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const store = await prisma.store.findUnique({ where: { userId: (session.user as any).id } })
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })
  const today = new Date(); today.setHours(0,0,0,0)
  const [todayOrders, products, allOrders] = await Promise.all([
    prisma.order.findMany({ where: { storeId: store.id, createdAt: { gte: today } }, include: { items: true } }),
    prisma.product.findMany({ where: { storeId: store.id } }),
    prisma.order.findMany({ where: { storeId: store.id }, include: { items: true }, orderBy: { createdAt: 'desc' }, take: 8 })
  ])
  const salesByDay: Record<string,number> = {}
  for (let i=6;i>=0;i--) {
    const d = new Date(); d.setDate(d.getDate()-i); d.setHours(0,0,0,0)
    salesByDay[d.toISOString().slice(0,10)] = 0
  }
  const weekOrders = await prisma.order.findMany({ where: { storeId: store.id, createdAt: { gte: new Date(Date.now()-7*24*60*60*1000) } } })
  weekOrders.forEach(o => {
    const key = o.createdAt.toISOString().slice(0,10)
    if (salesByDay[key]!==undefined) salesByDay[key] += o.total
  })
  return NextResponse.json({ todaySales: todayOrders.reduce((s,o)=>s+o.total,0), todayOrders: todayOrders.length, totalProducts: products.length, lowStock: products.filter(p=>p.stock<=p.lowStock).length, recentOrders: allOrders, salesByDay, store })
}

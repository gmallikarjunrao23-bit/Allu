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
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const products = await prisma.product.findMany({
    where: { storeId: store.id, ...(search?{name:{contains:search,mode:'insensitive'}}:{}), ...(category&&category!=='all'?{category}:{}) },
    orderBy: { name: 'asc' }
  })
  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const store = await getStore(session)
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })
  const body = await req.json()
  const product = await prisma.product.create({ data: { ...body, storeId: store.id } })
  return NextResponse.json(product)
}

'use client'
import { useEffect, useState } from 'react'

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [store, setStore] = useState<any>(null)

  useEffect(() => {
    fetch('/api/dashboard').then(r=>r.json()).then(d=>setStore(d.store))
    fetch('/api/orders').then(r=>r.json()).then(setOrders)
  }, [])

  const cur = store?.currency || '₹'
  const filtered = orders.filter(o => o.id.slice(-6).toLowerCase().includes(search.toLowerCase()) || (o.payment||'').toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-7">
      <div className="mb-6"><h1 className="text-2xl font-extrabold tracking-tight">Orders</h1><p className="text-sm mt-1" style={{color:'#9999bb'}}>All transaction history.</p></div>
      <div className="flex gap-3 mb-5">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search orders..." className="rounded-xl px-4 py-2.5 text-sm outline-none border" style={{background:'#1c1c28',borderColor:'#2a2a3d',color:'#f0f0ff',maxWidth:300}}/>
      </div>
      <div className="rounded-xl border overflow-hidden" style={{background:'#13131a',borderColor:'#2a2a3d'}}>
        <table className="w-full text-sm">
          <thead><tr>{['#','Items','Payment','Subtotal','Discount','Tax','Total','Time'].map(h=><th key={h} className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider" style={{color:'#5a5a7a',borderBottom:'1px solid #2a2a3d'}}>{h}</th>)}</tr></thead>
          <tbody>
            {!filtered.length && <tr><td colSpan={8} className="text-center py-12" style={{color:'#5a5a7a'}}>No orders yet.</td></tr>}
            {filtered.map((o:any) => (
              <tr key={o.id} className="

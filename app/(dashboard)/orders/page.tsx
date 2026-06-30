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
  const filtered = orders.filter(o => o.id.slice(-6).toLowerCase().includes(search.toLowerCase()) || (o.payment || '').toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-7">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Orders</h1>
        <p className="text-sm mt-1" style={{color:'#9999bb'}}>All transaction history.</p>
      </div>
      <div className="flex gap-3 mb-5">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search orders..." className="rounded-xl px-4 py-2.5 text-sm outline-none border" style={{background:'#1c1c28',borderColor:'#2a2a3d',color:'#f0f0ff',maxWidth:300}}/>
      </div>
      <div className="rounded-xl border overflow-hidden" style={{background:'#13131a',borderColor:'#2a2a3d'}}>
        <table className="w-full text-sm">
          <thead>
            <tr>
              {['#','Items','Payment','Subtotal','Discount','Tax','Total','Time'].map(h=>(
                <th key={h} className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider" style={{color:'#5a5a7a',borderBottom:'1px solid #2a2a3d'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!filtered.length && (
              <tr><td colSpan={8} className="text-center py-12" style={{color:'#5a5a7a'}}>No orders yet.</td></tr>
            )}
            {filtered.map((o:any) => (
              <tr key={o.id} className="border-b" style={{borderColor:'rgba(255,255,255,0.04)'}}>
                <td className="py-3 px-4 font-mono text-xs" style={{color:'#a78bfa'}}>#{o.id.slice(-6).toUpperCase()}</td>
                <td className="py-3 px-4 max-w-xs truncate" style={{color:'#9999bb'}}>{o.items?.map((i:any)=>`${i.name}x${i.qty}`).join(', ')}</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{background:'rgba(108,99,255,0.12)',color:'#a78bfa'}}>{o.payment}</span></td>
                <td className="py-3 px-4 font-mono">{cur}{parseFloat(o.subtotal).toFixed(2)}</td>
                <td className="py-3 px-4 font-mono" style={{color:'#22d3a0'}}>-{cur}{parseFloat(o.discount||0).toFixed(2)}</td>
                <td className="py-3 px-4 font-mono">{cur}{parseFloat(o.tax||0).toFixed(2)}</td>
                <td className="py-3 px-4 font-mono font-bold" style={{color:'#22d3a0'}}>{cur}{parseFloat(o.total).toFixed(2)}</td>
                <td className="py-3 px-4 text-xs" style={{color:'#5a5a7a'}}>{new Date(o.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

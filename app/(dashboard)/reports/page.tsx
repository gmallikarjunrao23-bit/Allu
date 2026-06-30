'use client'
import { useEffect, useState } from 'react'

export default function ReportsPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [store, setStore] = useState<any>(null)

  useEffect(() => {
    fetch('/api/dashboard').then(r=>r.json()).then(d=>setStore(d.store))
    fetch('/api/orders').then(r=>r.json()).then(setOrders)
  }, [])

  const cur = store?.currency || '₹'
  const total = orders.reduce((s,o)=>s+o.total,0)
  const avg = orders.length ? total/orders.length : 0

  const productSales: Record<string,{qty:number,rev:number}> = {}
  orders.forEach(o => o.items?.forEach((i:any) => {
    if (!productSales[i.name]) productSales[i.name] = {qty:0,rev:0}
    productSales[i.name].qty += i.qty
    productSales[i.name].rev += i.price*i.qty
  }))
  const topProducts = Object.entries(productSales).sort((a,b)=>b[1].rev-a[1].rev).slice(0,10)

  const payMethods: Record<string,number> = {}
  orders.forEach(o => { payMethods[o.payment||'Cash'] = (payMethods[o.payment||'Cash']||0)+1 })

  const monthData: Record<string,number> = {}
  orders.forEach(o => {
    const m = new Date(o.createdAt).toLocaleDateString('en',{month:'short',year:'numeric'})
    monthData[m] = (monthData[m]||0) + o.total
  })
  const months = Object.entries(monthData).slice(-6)
  const maxMonth = Math.max(...months.map(([,v])=>v), 1)

  return (
    <div className="p-7">
      <div className="mb-6"><h1 className="text-2xl font-extrabold tracking-tight">Reports</h1><p className="text-sm mt-1" style={{color:'#9999bb'}}>Analytics & business insights.</p></div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {label:'Total Revenue',value:cur+total.toFixed(2),color:'#22d3a0'},
          {label:'Total Orders',value:orders.length,color:'#a78bfa'},
          {label:'Avg Order Value',value:cur+avg.toFixed(2),color:'#f0f0ff'},
        ].map(s=>(
          <div key={s.label} className="rounded-xl border p-5" style={{background:'#13131a',borderColor:'#2a2a3d'}}>
            <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{color:'#9999bb'}}>{s.label}</div>
            <div className="text-3xl font-extrabold font-mono" style={{color:s.color}}>{s.value}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl border p-5" style={{background:'#13131a',borderColor:'#2a2a3d'}}>
          <div className="font-bold mb-4">Monthly Revenue</div>
          {months.length===0?<div style={{color:'#5a5a7a'}} className="text-center py-8">No data yet</div>:(
            <div className="flex items-end gap-2 h-36">
              {months.map(([m,v])=>(
                <div key={m} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-xs font-mono" style={{color:'#a78bfa'}}>{v>0?cur+v.toFixed(0):''}</div>
                  <div className="w-full rounded-t-md" style={{height:`${Math.max((v/maxMonth)*100,4)}%`,background:'linear-gradient(180deg,#6c63ff,#a78bfa)'}}/>
                  <div className="text-xs" style={{color:'#5a5a7a'}}>{m}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-xl border p-5" style={{background:'#13131a',borderColor:'#2a2a3d'}}>
          <div className="font-bold mb-4">Payment Methods</div>
          <div className="space-y-3">
            {Object.entries(payMethods).map(([method,count])=>(
              <div key={method}>
                <div className="flex justify-between text-sm mb-1"><span style={{color:'#9999bb'}}>{method}</span><span className="font-mono font-bold">{count}</span></div>
                <div className="h-2 rounded-full" style={{background:'#252535'}}>
                  <div className="h-2 rounded-full" style={{width:`${(count/orders.length)*100}%`,background:'linear-gradient(90deg,#6c63ff,#a78bfa)'}}/>
                </div>
              </div>
            ))}
            {!Object.keys(payMethods).length && <div style={{color:'#5a5a7a'}} className="text-center py-8">No data yet</div>}
          </div>
        </div>
      </div>
      <div className="rounded-xl border p-5" style={{background:'#13131a',borderColor:'#2a2a3d'}}>
        <div className="font-bold mb-4">Top Selling Products</div>
        {!topProducts.length ? <div style={{color:'#5a5a7a'}} className="text-center py-8">No sales data yet</div> : (
          <table className="w-full text-sm">
            <thead><tr>{['Product','Qty Sold','Revenue'].map(h=><th key={h} className="text-left py-2 px-3 text-xs font-bold uppercase tracking-wider" style={{color:'#5a5a7a',borderBottom:'1px solid #2a2a3d'}}>{h}</th>)}</tr></thead>
            <tbody>{topProducts.map(([name,d])=>(
              <tr key={name} className="border-b" style={{borderColor:'rgba(255,255,255,0.04)'}}>
                <td className="py-3 px-3 font-medium">{name}</td>
                <td className="py-3 px-3 font-mono">{d.qty}</td>
                <td className="py-3 px-3 font-mono font-bold" style={{color:'#a78bfa'}}>{cur}{d.rev.toFixed(2)}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  )
}

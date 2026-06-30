'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/dashboard').then(r=>r.json()).then(setData)
  }, [])

  const cur = data?.store?.currency || '₹'
  const days = data ? Object.entries(data.salesByDay) : []
  const maxSale = Math.max(...days.map(([,v]:any)=>v), 1)

  return (
    <div className="p-7">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Dashboard</h1>
        <p style={{color:'#9999bb'}} className="text-sm mt-1">Welcome back, {session?.user?.name}! 👋</p>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label:"Today's Sales", value: data ? cur+data.todaySales.toFixed(2) : '—', color:'#22d3a0' },
          { label:'Orders Today', value: data?.todayOrders ?? '—', color:'#a78bfa' },
          { label:'Total Products', value: data?.totalProducts ?? '—', color:'#f0f0ff' },
          { label:'Low Stock', value: data?.lowStock ?? '—', color:'#f59e0b' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border p-5 hover:-translate-y-1 transition-all" style={{background:'#13131a',borderColor:'#2a2a3d'}}>
            <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{color:'#9999bb'}}>{s.label}</div>
            <div className="text-3xl font-extrabold font-mono" style={{color:s.color}}>{s.value}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="col-span-2 rounded-xl border p-5" style={{background:'#13131a',borderColor:'#2a2a3d'}}>
          <div className="font-bold mb-4">Sales — Last 7 Days</div>
          <div className="flex items-end gap-2 h-36">
            {days.map(([date, val]:any) => (
              <div key={date} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs font-mono" style={{color:'#a78bfa'}}>{val>0?cur+val.toFixed(0):''}</div>
                <div className="w-full rounded-t-md transition-all" style={{height:`${Math.max((val/maxSale)*100,4)}%`,background:val>0?'linear-gradient(180deg,#6c63ff,#a78bfa)':'#252535'}}/>
                <div className="text-xs" style={{color:'#5a5a7a'}}>{new Date(date).toLocaleDateString('en',{weekday:'short'})}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border p-5" style={{background:'#13131a',borderColor:'#2a2a3d'}}>
          <div className="font-bold mb-4">Quick Stats</div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span style={{color:'#9999bb'}}>Avg Order</span><span className="font-mono font-bold">{data&&data.todayOrders>0?cur+(data.todaySales/data.todayOrders).toFixed(2):'—'}</span></div>
            <div className="flex justify-between"><span style={{color:'#9999bb'}}>In Stock</span><span className="font-mono font-bold" style={{color:'#22d3a0'}}>{data?(data.totalProducts-data.lowStock):0}</span></div>
            <div className="flex justify-between"><span style={{color:'#9999bb'}}>Low Stock</span><span className="font-mono font-bold" style={{color:'#f59e0b'}}>{data?.lowStock??0}</span></div>
          </div>
        </div>
      </div>
      <div className="rounded-xl border p-5" style={{background:'#13131a',borderColor:'#2a2a3d'}}>
        <div className="font-bold mb-4">Recent Orders</div>
        {!data?.recentOrders?.length ? (
          <div className="text-center py-8" style={{color:'#5a5a7a'}}>No orders yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr>{['Order','Items','Payment','Total','Time'].map(h=><th key={h} className="text-left py-2 px-3 text-xs font-bold uppercase tracking-wider" style={{color:'#5a5a7a',borderBottom:'1px solid #2a2a3d'}}>{h}</th>)}</tr></thead>
            <tbody>
              {data.recentOrders.map((o:any)=>(
                <tr key={o.id} className="border-b" style={{borderColor:'rgba(255,255,255,0.04)'}}>
                  <td className="py-3 px-3 font-mono text-xs" style={{color:'#a78bfa'}}>#{o.id.slice(-6).toUpperCase()}</td>
                  <td className="py-3 px-3" style={{color:'#9999bb'}}>{o.items?.map((i:any)=>i.name).join(', ').slice(0,40)}</td>
                  <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{background:'rgba(108,99,255,0.15)',color:'#a78bfa'}}>{o.payment}</span></td>
                  <td className="py-3 px-3 font-mono font-bold" style={{color:'#22d3a0'}}>{cur}{parseFloat(o.total).toFixed(2)}</td>
                  <td className="py-3 px-3 text-xs" style={{color:'#5a5a7a'}}>{new Date(o.createdAt).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
        }

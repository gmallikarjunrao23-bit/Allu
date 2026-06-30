'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { href:'/dashboard', icon:'📊', label:'Dashboard' },
  { href:'/pos', icon:'🛒', label:'Point of Sale' },
  { href:'/inventory', icon:'📦', label:'Inventory' },
  { href:'/orders', icon:'🧾', label:'Orders' },
  { href:'/reports', icon:'📈', label:'Reports' },
  { href:'/settings', icon:'⚙️', label:'Settings' },
]

export default function Sidebar() {
  const path = usePathname()
  return (
    <div className="w-56 flex flex-col border-r py-4 px-3 gap-1 flex-shrink-0" style={{background:'#13131a',borderColor:'#2a2a3d'}}>
      <div className="flex items-center gap-2.5 px-3 py-2 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{background:'linear-gradient(135deg,#6c63ff,#a78bfa)'}}>🏦</div>
        <span className="font-extrabold text-lg tracking-tight">Vault<span style={{color:'#a78bfa'}}>POS</span></span>
      </div>
      <div className="text-xs font-bold uppercase tracking-widest px-3 mb-1" style={{color:'#5a5a7a'}}>Main</div>
      {nav.slice(0,2).map(n=>(
        <Link key={n.href} href={n.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border border-transparent"
          style={path===n.href?{background:'rgba(108,99,255,0.15)',color:'#a78bfa',borderColor:'rgba(108,99,255,0.25)'}:{color:'#9999bb'}}>
          <span className="text-lg">{n.icon}</span>{n.label}
        </Link>
      ))}
      <div className="text-xs font-bold uppercase tracking-widest px-3 mt-3 mb-1" style={{color:'#5a5a7a'}}>Manage</div>
      {nav.slice(2).map(n=>(
        <Link key={n.href} href={n.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border border-transparent"
          style={path===n.href?{background:'rgba(108,99,255,0.15)',color:'#a78bfa',borderColor:'rgba(108,99,255,0.25)'}:{color:'#9999bb'}}>
          <span className="text-lg">{n.icon}</span>{n.label}
        </Link>
      ))}
    </div>
  )
}

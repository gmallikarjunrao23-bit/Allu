'use client'
import { useEffect, useState } from 'react'

export default function Topbar({ user }: { user: any }) {
  const [time, setTime] = useState('')
  const [store, setStore] = useState('')
  useEffect(() => {
    setInterval(() => setTime(new Date().toLocaleTimeString()), 1000)
    fetch('/api/dashboard').then(r=>r.json()).then(d=>setStore(d.store?.name||'My Store'))
  }, [])
  return (
    <div className="h-14 flex items-center px-6 gap-4 border-b flex-shrink-0" style={{background:'#13131a',borderColor:'#2a2a3d'}}>
      <span className="px-3 py-1 rounded-full text-sm border" style={{background:'#1c1c28',borderColor:'#2a2a3d',color:'#9999bb'}}>{store}</span>
      <div className="ml-auto flex items-center gap-3">
        <span className="font-mono text-sm" style={{color:'#9999bb'}}>{time}</span>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{background:'linear-gradient(135deg,#6c63ff,#a78bfa)'}}>
          {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
        </div>
      </div>
    </div>
  )
}

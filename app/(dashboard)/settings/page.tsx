'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useSession, signOut } from 'next-auth/react'

export default function SettingsPage() {
  const { data: session } = useSession()
  const [form, setForm] = useState({ name:'', phone:'', address:'', gst:'', currency:'₹', taxRate:18 })
  const set = (k: string, v: any) => setForm(f=>({...f,[k]:v}))

  useEffect(() => {
    fetch('/api/dashboard').then(r=>r.json()).then(d=>{
      if (d.store) { setForm({name:d.store.name||'',phone:d.store.phone||'',address:d.store.address||'',gst:d.store.gst||'',currency:d.store.currency||'₹',taxRate:d.store.taxRate||18}) }
    })
  }, [])

  async function save() {
    const res = await fetch('/api/settings', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    if (res.ok) toast.success('Settings saved ✓')
    else toast.error('Save failed')
  }

  return (
    <div className="p-7 max-w-2xl">
      <div className="mb-6"><h1 className="text-2xl font-extrabold tracking-tight">Settings</h1><p className="text-sm mt-1" style={{color:'#9999bb'}}>Configure your store.</p></div>
      <div className="rounded-xl border p-6 mb-4" style={{background:'#13131a',borderColor:'#2a2a3d'}}>
        <div className="font-bold mb-5">Store Information</div>
        <div className="space-y-4">
          {[{k:'name',l:'Store Name',t:'text',p:'My Store'},{k:'phone',l:'Phone',t:'text',p:'+91 9999999999'},{k:'address',l:'Address',t:'text',p:'Store address'},{k:'gst',l:'GST Number',t:'text',p:'22AAAAA0000A1Z5'}].map(f=>(
            <div key={f.k}>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'#9999bb'}}>{f.l}</label>
              <input type={f.t} value={(form as any)[f.k]} onChange={e=>set(f.k,e.target.value)} placeholder={f.p}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border" style={{background:'#1c1c28',borderColor:'#2a2a3d',color:'#f0f0ff'}}/>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'#9999bb'}}>Currency</label>
              <select value={form.currency} onChange={e=>set('currency',e.target.value)} className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border" style={{background:'#1c1c28',borderColor:'#2a2a3d',color:'#f0f0ff'}}>
                <option value="₹">₹ Rupee</option><option value="$">$ Dollar</option><option value="€">€ Euro</option><option value="£">£ Pound</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'#9999bb'}}>Tax Rate (%)</label>
              <input type="number" value={form.taxRate} onChange={e=>set('taxRate',parseFloat(e.target.value))} min={0} max={100}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border" style={{background:'#1c1c28',borderColor:'#2a2a3d',color:'#f0f0ff'}}/>
            </div>
          </div>
        </div>
        <button onClick={save} className="mt-6 px-6 py-3 rounded-xl text-sm font-bold text-white" style={{background:'linear-gradient(135deg,#6c63ff,#a78bfa)'}}>Save Settings</button>
      </div>
      <div className="rounded-xl border p-6" style={{background:'#13131a',borderColor:'#2a2a3d'}}>
        <div className="font-bold mb-4">Account</div>
        <div className="text-sm mb-4" style={{color:'#9999bb'}}>Logged in as <strong style={{color:'#f0f0ff'}}>{session?.user?.email}</strong></div>
        <button onClick={()=>signOut({callbackUrl:'/login'})} className="px-6 py-3 rounded-xl text-sm font-bold border" style={{background:'rgba(239,68,68,0.08)',borderColor:'rgba(239,68,68,0.2)',color:'#ef4444'}}>Sign Out</button>
      </div>
    </div>
  )
      }

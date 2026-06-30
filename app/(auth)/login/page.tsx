'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'login'|'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name:'', storeName:'', email:'', password:'' })
  const set = (k: string, v: string) => setForm(f => ({...f, [k]: v}))

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    const res = await signIn('credentials', { email: form.email, password: form.password, redirect: false })
    setLoading(false)
    if (res?.error) { toast.error('Invalid email or password'); return }
    router.push('/dashboard')
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.storeName || !form.email || !form.password) { toast.error('Fill all fields'); return }
    if (form.password.length < 6) { toast.error('Password min 6 characters'); return }
    setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error || 'Signup failed'); setLoading(false); return }
    const login = await signIn('credentials', { email: form.email, password: form.password, redirect: false })
    setLoading(false)
    if (login?.error) { toast.error('Login failed'); return }
    router.push('/dashboard')
  }

  async function handleGoogle() {
    setLoading(true)
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  const inputStyle = { background:'#1c1c28', color:'#f0f0ff', borderColor:'#2a2a3d' }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'radial-gradient(ellipse at 60% 30%, rgba(108,99,255,0.12) 0%, transparent 60%), #0a0a0f'}}>
      <div className="w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 text-3xl" style={{background:'linear-gradient(135deg,#6c63ff,#a78bfa)',boxShadow:'0 0 30px rgba(108,99,255,0.4)'}}>🏦</div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Vault<span style={{color:'#a78bfa'}}>POS</span></h1>
          <p className="text-sm mt-1" style={{color:'#9999bb'}}>Smart Point of Sale for modern businesses</p>
        </div>
        <div className="rounded-2xl border p-8" style={{background:'#13131a',borderColor:'#2a2a3d',boxShadow:'0 4px 40px rgba(0,0,0,0.5)'}}>
          <div className="flex gap-1 p-1 rounded-xl mb-6" style={{background:'#1c1c28'}}>
            {(['login','signup'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={tab===t?{background:'#6c63ff',color:'#fff'}:{color:'#9999bb'}}>
                {t==='login'?'Sign In':'Sign Up'}
              </button>
            ))}
          </div>
          <button onClick={handleGoogle} disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border text-sm font-semibold mb-5"
            style={{background:'#1c1c28',borderColor:'#2a2a3d',color:'#f0f0ff'}}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{background:'#2a2a3d'}}/>
            <span className="text-xs" style={{color:'#5a5a7a'}}>or</span>
            <div className="flex-1 h-px" style={{background:'#2a2a3d'}}/>
          </div>
          {tab==='login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              {[{k:'email',l:'Email',t:'email',p:'you@business.com'},{k:'password',l:'Password',t:'password',p:'••••••••'}].map(f=>(
                <div key={f.k}>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{color:'#9999bb'}}>{f.l}</label>
                  <input type={f.t} value={(form as any)[f.k]} onChange={e=>set(f.k,e.target.value)} placeholder={f.p} required
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none border" style={inputStyle}/>
                </div>
              ))}
              <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl text-sm font-bold text-white"
                style={{background:'linear-gradient(135deg,#6c63ff,#a78bfa)'}}>
                {loading?'Signing in...':'Sign In →'}
              </button>
            </form>
          )}
          {tab==='signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              {[
                {k:'storeName',l:'Store Name',t:'text',p:'My Awesome Store'},
                {k:'name',l:'Your Name',t:'text',p:'John Doe'},
                {k:'email',l:'Email',t:'email',p:'you@business.com'},
                {k:'password',l:'Password',t:'password',p:'Min 6 characters'},
              ].map(f=>(
                <div key={f.k}>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{color:'#9999bb'}}>{f.l}</label>
                  <input type={f.t} value={(form as any)[f.k]} onChange={e=>set(f.k,e.target.value)} placeholder={f.p} required
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none border" style={inputStyle}/>
                </div>
              ))}
              <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl text-sm font-bold text-white"
                style={{background:'linear-gradient(135deg,#6c63ff,#a78bfa)'}}>
                {loading?'Creating account...':'Create Account →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
      }

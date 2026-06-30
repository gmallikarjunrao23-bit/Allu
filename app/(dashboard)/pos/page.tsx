'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Product { id:string; name:string; price:number; stock:number; emoji:string; category:string|null; barcode:string|null }
interface CartItem extends Product { qty: number }

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [categories, setCategories] = useState<string[]>([])
  const [discount, setDiscount] = useState(0)
  const [payment, setPayment] = useState('Cash')
  const [loading, setLoading] = useState(false)
  const [store, setStore] = useState<any>(null)

  useEffect(() => {
    fetch('/api/dashboard').then(r=>r.json()).then(d=>setStore(d.store))
    loadProducts()
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (window as any)._usbBuffer?.length > 2) {
        const code = (window as any)._usbBuffer.trim()
        ;(window as any)._usbBuffer = ''
        addByBarcode(code)
      } else if (e.key.length === 1) {
        (window as any)._usbBuffer = ((window as any)._usbBuffer || '') + e.key
        clearTimeout((window as any)._usbTimer)
        ;(window as any)._usbTimer = setTimeout(() => { (window as any)._usbBuffer = '' }, 300)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [products])

  async function loadProducts() {
    const r = await fetch('/api/products')
    const data = await r.json()
    setProducts(data)
    const cats = [...new Set(data.map((p:Product)=>p.category).filter(Boolean))] as string[]
    setCategories(cats)
  }

  function addByBarcode(code: string) {
    const p = products.find(p => p.barcode === code && p.stock > 0)
    if (p) addToCart(p)
    else toast.error('Product not found: ' + code)
  }

  function addToCart(p: Product) {
    setCart(prev => {
      const ex = prev.find(c => c.id === p.id)
      if (ex) {
        if (ex.qty >= p.stock) { toast.error('Max stock!'); return prev }
        return prev.map(c => c.id===p.id ? {...c,qty:c.qty+1} : c)
      }
      return [...prev, {...p, qty:1}]
    })
    toast.success(`${p.emoji} ${p.name} added`)
  }

  function changeQty(id: string, delta: number) {
    setCart(prev => prev.map(c => c.id===id ? {...c,qty:c.qty+delta} : c).filter(c=>c.qty>0))
  }

  const filtered = products.filter(p => {
    const ms = p.name.toLowerCase().includes(search.toLowerCase()) || (p.barcode||'').includes(search)
    const mc = category==='all' || p.category===category
    return ms && mc && p.stock > 0
  })

  const cur = store?.currency || '₹'
  const subtotal = cart.reduce((s,c)=>s+(c.price*c.qty),0)
  const discAmt = subtotal * discount/100
  const tax = (subtotal-discAmt) * (store?.taxRate||18)/100
  const total = subtotal - discAmt + tax

  async function checkout() {
    if (!cart.length) return
    setLoading(true)
    const res = await fetch('/api/orders', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ items:cart, subtotal, discount:discAmt, tax, total, payment })
    })
    setLoading(false)
    if (!res.ok) { toast.error('Checkout failed'); return }
    toast.success('Sale completed! 🎉')
    setCart([]); setDiscount(0); loadProducts()
  }

  return (
    <div className="flex gap-4 p-4 h-full">
      <div className="flex-1 flex flex-col rounded-xl border overflow-hidden" style={{background:'#13131a',borderColor:'#2a2a3d'}}>
        <div className="p-4 border-b flex gap-3" style={{borderColor:'#2a2a3d'}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search or scan barcode..."
            className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none border" style={{background:'#1c1c28',borderColor:'#2a2a3d',color:'#f0f0ff'}}/>
        </div>
        <div className="flex gap-2 px-4 py-2 border-b overflow-x-auto" style={{borderColor:'#2a2a3d'}}>
          {['all',...categories].map(cat=>(
            <button key={cat} onClick={()=>setCategory(cat)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all"
              style={category===cat?{background:'#6c63ff',borderColor:'#6c63ff',color:'#fff'}:{borderColor:'#2a2a3d',color:'#9999bb'}}>
              {cat==='all'?'All':cat}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-4 grid gap-3" style={{gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))'}}>
          {filtered.length===0&&<div className="col-span-full text-center py-16" style={{color:'#5a5a7a'}}>No products found</div>}
          {filtered.map(p=>(
            <div key={p.id} onClick={()=>addToCart(p)} className="rounded-xl border p-3 cursor-pointer hover:-translate-y-1 transition-all flex flex-col gap-2" style={{background:'#1c1c28',borderColor:'#2a2a3d'}}>
              <div className="text-3xl text-center">{p.emoji}</div>
              <div className="text-xs font-semibold">{p.name}</div>
              <div className="font-mono font-bold text-sm" style={{color:'#a78bfa'}}>{cur}{p.price.toFixed(2)}</div>
              <div className="text-xs" style={{color:'#5a5a7a'}}>Stock: {p.stock}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-80 flex flex-col rounded-xl border" style={{background:'#13131a',borderColor:'#2a2a3d'}}>
        <div className="p-4 border-b flex justify-between font-bold" style={{borderColor:'#2a2a3d'}}>
          <span>🛒 Cart</span>
          <span className="font-mono text-sm" style={{color:'#9999bb'}}>{cart.reduce((s,c)=>s+c.qty,0)} items</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length===0&&<div className="text-center py-12" style={{color:'#5a5a7a'}}><div className="text-4xl mb-2">🛒</div>Cart is empty</div>}
          {cart.map(item=>(
            <div key={item.id} className="flex items-center gap-2 p-2.5 rounded-xl border" style={{background:'#1c1c28',borderColor:'#2a2a3d'}}>
              <span className="text-lg">{item.emoji}</span>
              <div className="flex-1 text-xs font-medium">{item.name}</div>
              <div className="flex items-center gap-1">
                <button onClick={()=>changeQty(item.id,-1)} className="w-6 h-6 rounded-md text-xs font-bold" style={{background:'#252535'}}>−</button>
                <span className="font-mono text-xs w-5 text-center">{item.qty}</span>
                <button onClick={()=>changeQty(item.id,1)} className="w-6 h-6 rounded-md text-xs font-bold" style={{background:'#252535'}}>+</button>
              </div>
              <span className="font-mono text-xs font-bold" style={{color:'#a78bfa'}}>{cur}{(item.price*item.qty).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="p-4 border-t space-y-3" style={{borderColor:'#2a2a3d'}}>
          <div className="flex gap-2">
            <input type="number" value={discount||''} onChange={e=>setDiscount(parseFloat(e.target.value)||0)} placeholder="Discount %" min={0} max={100}
              className="flex-1 rounded-xl px-3 py-2 text-sm outline-none border" style={{background:'#1c1c28',borderColor:'#2a2a3d',color:'#f0f0ff'}}/>
            <select value={payment} onChange={e=>setPayment(e.target.value)} className="rounded-xl px-3 py-2 text-sm outline-none border" style={{background:'#1c1c28',borderColor:'#2a2a3d',color:'#f0f0ff'}}>
              <option>Cash</option><option>Card</option><option>UPI</option>
            </select>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between" style={{color:'#9999bb'}}><span>Subtotal</span><span className="font-mono">{cur}{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between" style={{color:'#22d3a0'}}><span>Discount</span><span className="font-mono">-{cur}{discAmt.toFixed(2)}</span></div>
            <div className="flex justify-between" style={{color:'#9999bb'}}><span>Tax ({store?.taxRate||18}%)</span><span className="font-mono">{cur}{tax.toFixed(2)}</span></div>
            <div className="flex justify-between pt-2 border-t font-bold text-lg" style={{borderColor:'#2a2a3d'}}><span>Total</span><span className="font-mono">{cur}{total.toFixed(2)}</span></div>
          </div>
          <button onClick={checkout} disabled={!cart.length||loading} className="w-full py-3.5 rounded-xl font-bold text-white disabled:opacity-40" style={{background:'linear-gradient(135deg,#22d3a0,#10b981)'}}>
            {loading?'Processing...':'Complete Sale ✓'}
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Product { id:string; name:string; category:string|null; price:number; cost:number; stock:number; lowStock:number; barcode:string|null; emoji:string; description:string|null }
const EMPTY: any = { name:'', category:'', price:0, cost:0, stock:0, lowStock:5, barcode:'', emoji:'📦', description:'' }

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<string|null>(null)
  const [form, setForm] = useState<any>(EMPTY)

  useEffect(() => { load() }, [])
  async function load() {
    const r = await fetch('/api/products')
    setProducts(await r.json())
  }

  function set(k: string, v: any) { setForm((f:any) => ({...f, [k]: v})) }
  function openAdd() { setForm(EMPTY); setEditing(null); setModal(true) }
  function openEdit(p: Product) { setForm(p); setEditing(p.id); setModal(true) }

  async function save() {
    if (!form.name) { toast.error('Product name required'); return }
    const body = { ...form, price: parseFloat(form.price), cost: parseFloat(form.cost||0), stock: parseInt(form.stock), lowStock: parseInt(form.lowStock||5) }
    if (editing) {
      await fetch(`/api/products/${editing}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
      toast.success('Product updated ✓')
    } else {
      await fetch('/api/products', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
      toast.success('Product added ✓')
    }
    setModal(false); load()
  }

  async function del(id: string) {
    if (!confirm('Delete this product?')) return
    await fetch(`/api/products/${id}`, { method:'DELETE' })
    toast.success('Deleted'); load()
  }

  function genBarcode() { set('barcode', 'VP' + Date.now().toString().slice(-8)) }

  function exportCSV() {
    const csv = ['Name,Category,Price,Cost,Stock,Barcode', ...products.map(p => `"${p.name}","${p.category||''}",${p.price},${p.cost||0},${p.stock},"${p.barcode||''}"`)]
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv.join('\n')], {type:'text/csv'}))
    a.download = 'inventory.csv'; a.click()
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.barcode||'').includes(search) || (p.category||'').toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-7">
      <div className="mb-6"><h1 className="text-2xl font-extrabold tracking-tight">Inventory</h1><p className="text-sm mt-1" style={{color:'#9999bb'}}>Manage your products and stock.</p></div>
      <div className="flex gap-3 mb-5">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search products..." className="rounded-xl px-4 py-2.5 text-sm outline-none border" style={{background:'#1c1c28',borderColor:'#2a2a3d',color:'#f0f0ff',maxWidth:300}}/>
        <button onClick={openAdd} className="px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{background:'linear-gradient(135deg,#6c63ff,#a78bfa)'}}>＋ Add Product</button>
        <button onClick={exportCSV} className="px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{background:'linear-gradient(135deg,#22d3a0,#10b981)'}}>⬇ Export CSV</button>
      </div>
      <div className="rounded-xl border overflow-hidden" style={{background:'#13131a',borderColor:'#2a2a3d'}}>
        <table className="w-full text-sm">
          <thead><tr>{['Barcode','Product','Category','Price','Stock','Status','Actions'].map(h=><th key={h} className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider" style={{color:'#5a5a7a',borderBottom:'1px solid #2a2a3d'}}>{h}</th>)}</tr></thead>
          <tbody>
            {!filtered.length && <tr><td colSpan={7} className="text-center py-12" style={{color:'#5a5a7a'}}>No products. Click "+ Add Product" to start.</td></tr>}
            {filtered.map(p => {
              const st = p.stock<=0?{bg:'rgba(239,68,68,0.12)',c:'#ef4444',t:'Out of Stock'}:p.stock<=p.lowStock?{bg:'rgba(245,158,11,0.12)',c:'#f59e0b',t:'Low Stock'}:{bg:'rgba(34,211,160,0.12)',c:'#22d3a0',t:'In Stock'}
              return (
                <tr key={p.id} className="border-b" style={{borderColor:'rgba(255,255,255,0.04)'}}>
                  <td className="py-3 px-4 font-mono text-xs" style={{color:'#5a5a7a'}}>{p.barcode||'—'}</td>
                  <td className="py-3 px-4"><span className="mr-2">{p.emoji}</span><strong>{p.name}</strong>{p.description&&<div className="text-xs" style={{color:'#5a5a7a'}}>{p.description}</div>}</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{background:'rgba(108,99,255,0.12)',color:'#a78bfa'}}>{p.category||'General'}</span></td>
                  <td className="py-3 px-4 font-mono font-bold" style={{color:'#a78bfa'}}>₹{p.price.toFixed(2)}</td>
                  <td className="py-3 px-4 font-mono font-bold">{p.stock}</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{background:st.bg,color:st.c}}>{st.t}</span></td>
                  <td className="py-3 px-4 flex gap-2">
                    <button onClick={()=>openEdit(p)} className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all" style={{background:'#1c1c28',borderColor:'#2a2a3d',color:'#9999bb'}}>✏️ Edit</button>
                    <button onClick={()=>del(p.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all" style={{background:'rgba(239,68,68,0.08)',borderColor:'rgba(239,68,68,0.2)',color:'#ef4444'}}>🗑</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{background:'rgba(0,0,0,0.7)'}}>
          <div className="rounded-2xl border p-8 w-full max-w-lg max-h-screen overflow-y-auto" style={{background:'#13131a',borderColor:'#2a2a3d'}}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-extrabold">{editing?'Edit Product':'Add Product'}</h2>
              <button onClick={()=>setModal(false)} style={{color:'#5a5a7a',fontSize:22}}>✕</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[{k:'name',l:'Name *',t:'text',full:true},{k:'category',l:'Category',t:'text'},{k:'price',l:'Price *',t:'number'},{k:'cost',l:'Cost Price',t:'number'},{k:'stock',l:'Stock *',t:'number'},{k:'lowStock',l:'Low Stock Alert',t:'number'},{k:'emoji',l:'Emoji',t:'text'},{k:'description',l:'Description',t:'text',full:true}].map(f=>(
                <div key={f.k} className={f.full?'col-span-2':''}>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'#9999bb'}}>{f.l}</label>
                  <input type={f.t} value={form[f.k]||''} onChange={e=>set(f.k,e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border" style={{background:'#1c1c28',borderColor:'#2a2a3d',color:'#f0f0ff'}}/>
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'#9999bb'}}>Barcode</label>
                <div className="flex gap-2">
                  <input value={form.barcode||''} onChange={e=>set('barcode',e.target.value)} className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none border" style={{background:'#1c1c28',borderColor:'#2a2a3d',color:'#f0f0ff'}}/>
                  <button onClick={genBarcode} className="px-4 py-2.5 rounded-xl text-sm font-semibold border" style={{background:'#1c1c28',borderColor:'#2a2a3d',color:'#9999bb'}}>Generate</button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={()=>setModal(false)} className="flex-1 py-3 rounded-xl text-sm font-semibold border" style={{background:'#1c1c28',borderColor:'#2a2a3d',color:'#9999bb'}}>Cancel</button>
              <button onClick={save} className="flex-1 py-3 rounded-xl text-sm font-bold text-white" style={{background:'linear-gradient(135deg,#6c63ff,#a78bfa)'}}>Save Product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
         }

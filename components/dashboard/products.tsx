"use client"

import { useState } from "react"
import { ImagePlus, Pencil, Plus, ShieldCheck } from "lucide-react"
import { useBakery } from "@/lib/bakery/store"
import { saveProduct } from "@/lib/bakery/operations"
import { money, readImageAsDataUrl, uid } from "@/lib/bakery/format"
import { ALLERGENS, type Product } from "@/lib/bakery/types"
import { Button, Field, Modal, PageHeading, Pill, inputClass } from "./ui"

export function ProductsPage() {
  const { state, commit, can } = useBakery()
  const [editing, setEditing] = useState<Product | null>(null)
  const manage = can("products.manage")
  const blank = (): Product => ({ id: uid("p"), name: "", description: "", category: "Birthday", image: "", pricePerKg: 35, sizes: ["0.5 kg", "1 kg", "2 kg"], flavors: ["Classic"], allergens: ["Gluten", "Eggs", "Milk"], available: true, prepMinutes: 120 })
  return (
    <div className="space-y-6">
      <PageHeading eyebrow="Cakes & products" title="Your bake catalogue" description="Prices, sizes, flavors, and the 14 EU allergens (LMIV). Available products appear on the website and in the order form."
        actions={manage && <Button onClick={() => setEditing(blank())}><Plus size={14} /> Add product</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {state.products.map((product) => {
          return (
            <article key={product.id} className={`overflow-hidden rounded-2xl border border-[#e9e4dc] bg-white transition hover:shadow-md ${product.available ? "" : "opacity-60"}`}>
              {product.image ? <img loading="lazy" src={product.image} alt={product.name} className="h-40 w-full object-cover" /> : <div className="grid h-40 place-items-center bg-[#f6f0ea] text-xs text-[#9b8f87]">No image</div>}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2"><div><h3 className="font-serif text-lg font-bold">{product.name}</h3><p className="text-xs text-[#8f8981]">{product.category} · {product.prepMinutes} min prep</p></div><span className="text-sm font-bold text-[#b86e53]">{money(product.pricePerKg)}/kg</span></div>
                <p className="mt-2 text-xs text-[#6f675f]">{product.sizes.join(" · ")} · {product.flavors.join(", ")}</p>
                <div className="mt-3 flex flex-wrap gap-1">{product.allergens.map((allergen) => <Pill key={allergen}>{allergen}</Pill>)}</div>
                <div className="mt-4 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" disabled={!manage} checked={product.available} onChange={() => commit((s, a) => saveProduct(s, a, { ...product, available: !product.available }), product.available ? `${product.name} hidden from ordering` : `${product.name} is available again`)} className="accent-[#ee9633]" /> Available</label>
                  {manage && <Button tone="ghost" onClick={() => setEditing(product)}><Pencil size={13} /> Edit</Button>}
                </div>
              </div>
            </article>
          )
        })}
      </div>
      {editing && <ProductModal product={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}

function ProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { commit } = useBakery()
  const [draft, setDraft] = useState(product)
  const [uploading, setUploading] = useState(false)
  const set = (patch: Partial<Product>) => setDraft({ ...draft, ...patch })
  const list = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean)
  return (
    <Modal title={product.name ? `Edit ${product.name}` : "Add product"} onClose={onClose}>
      <div className="mt-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Name *" className="sm:col-span-2"><input value={draft.name} onChange={(event) => set({ name: event.target.value })} className={inputClass} /></Field>
          <Field label="Description" className="sm:col-span-2"><input value={draft.description} onChange={(event) => set({ description: event.target.value })} className={inputClass} /></Field>
          <Field label="Category"><input value={draft.category} onChange={(event) => set({ category: event.target.value })} className={inputClass} /></Field>
          <Field label="Price per kg (€)"><input type="number" min={0} value={draft.pricePerKg} onChange={(event) => set({ pricePerKg: Number(event.target.value) || 0 })} className={inputClass} /></Field>
          <Field label="Sizes (comma separated)"><input defaultValue={draft.sizes.join(", ")} onBlur={(event) => set({ sizes: list(event.target.value) })} className={inputClass} /></Field>
          <Field label="Flavors (comma separated)"><input defaultValue={draft.flavors.join(", ")} onBlur={(event) => set({ flavors: list(event.target.value) })} className={inputClass} /></Field>
          <Field label="Preparation time (min)"><input type="number" min={0} value={draft.prepMinutes} onChange={(event) => set({ prepMinutes: Number(event.target.value) || 0 })} className={inputClass} /></Field>
          <Field label="Image">
            <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[#d7b9a9] p-2 text-xs">
              {uploading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#c67a5d] border-r-transparent" /> : draft.image ? <img src={draft.image} alt="" className="h-9 w-9 rounded object-cover" /> : <ImagePlus size={16} />}
              {uploading ? "Processing photo…" : "Upload photo"}
              <input type="file" accept="image/*" className="hidden" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; setUploading(true); try { set({ image: await readImageAsDataUrl(file) }) } finally { setUploading(false) } }} />
            </label>
          </Field>
          <div className="sm:col-span-2">
            <p className="flex items-center gap-1 text-xs font-bold"><ShieldCheck size={13} className="text-[#d58a68]" /> Allergens (EU 14)</p>
            <div className="mt-2 flex flex-wrap gap-1.5">{ALLERGENS.map((allergen) => <button key={allergen} onClick={() => set({ allergens: draft.allergens.includes(allergen) ? draft.allergens.filter((item) => item !== allergen) : [...draft.allergens, allergen] })} className={`rounded-full border px-2.5 py-1 text-[11px] font-bold transition ${draft.allergens.includes(allergen) ? "border-[#ee9633] bg-[#fff2df] text-[#c76a10]" : "border-[#e4dcd5] text-[#8f8981]"}`}>{allergen}</button>)}</div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2"><Button tone="ghost" onClick={onClose}>Cancel</Button><Button disabled={!draft.name.trim() || !draft.sizes.length || uploading} onClick={() => { commit((s, a) => saveProduct(s, a, draft), `${draft.name} saved`); onClose() }}>Save product</Button></div>
    </Modal>
  )
}

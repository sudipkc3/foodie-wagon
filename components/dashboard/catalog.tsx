"use client"

import { useState } from "react"
import { AlertTriangle, Boxes, Download, ImagePlus, Minus, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react"
import { useBakery } from "@/lib/bakery/store"
import { adjustStock, logWaste, saveIngredient, saveProduct } from "@/lib/bakery/operations"
import { addDays, dayKey, downloadCsv, formatDateTime, money, readImageAsDataUrl, uid } from "@/lib/bakery/format"
import { ALLERGENS, type Ingredient, type Product, type StockMovement, type WasteReason } from "@/lib/bakery/types"
import { Button, Card, Empty, Field, Metric, Modal, PageHeading, Pill, Table, Td, Tabs, inputClass } from "./ui"

// Ingredient cost of one kg of a product, from its recipe.
const costPerKg = (product: Product, ingredients: Ingredient[]) =>
  product.recipe.reduce((sum, line) => sum + line.perKg * (ingredients.find((item) => item.id === line.ingredientId)?.costPerUnit ?? 0), 0)

export function ProductsPage() {
  const { state, commit, can } = useBakery()
  const [editing, setEditing] = useState<Product | null>(null)
  const manage = can("products.manage")
  const blank = (): Product => ({ id: uid("p"), name: "", description: "", category: "Birthday", image: "", pricePerKg: 35, sizes: ["0.5 kg", "1 kg", "2 kg"], flavors: ["Classic"], allergens: ["Gluten", "Eggs", "Milk"], available: true, prepMinutes: 120, recipe: [] })
  return (
    <div className="space-y-6">
      <PageHeading eyebrow="Cakes & products" title="Your bake catalogue" description="Prices, sizes, flavors, the 14 EU allergens (LMIV) and recipes. Available products appear on the website and in the order form."
        actions={manage && <Button onClick={() => setEditing(blank())}><Plus size={14} /> Add product</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {state.products.map((product) => {
          const cost = costPerKg(product, state.ingredients)
          const margin = product.pricePerKg ? 1 - cost / product.pricePerKg : 0
          return (
            <article key={product.id} className={`overflow-hidden rounded-2xl border border-[#e9e4dc] bg-white transition hover:shadow-md ${product.available ? "" : "opacity-60"}`}>
              {product.image ? <img loading="lazy" src={product.image} alt={product.name} className="h-40 w-full object-cover" /> : <div className="grid h-40 place-items-center bg-[#f6f0ea] text-xs text-[#9b8f87]">No image</div>}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2"><div><h3 className="font-serif text-lg font-bold">{product.name}</h3><p className="text-xs text-[#8f8981]">{product.category} · {product.prepMinutes} min prep</p></div><span className="text-sm font-bold text-[#b86e53]">{money(product.pricePerKg)}/kg</span></div>
                <p className="mt-2 text-xs text-[#6f675f]">{product.sizes.join(" · ")} · {product.flavors.join(", ")}</p>
                <div className="mt-3 flex flex-wrap gap-1">{product.allergens.map((allergen) => <Pill key={allergen}>{allergen}</Pill>)}</div>
                {can("reports.view") && product.recipe.length > 0 && <p className="mt-3 text-[11px] text-[#8f8981]">Ingredient cost {money(cost)}/kg · margin <strong className={margin < 0.6 ? "text-amber-700" : "text-emerald-700"}>{Math.round(margin * 100)}%</strong></p>}
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
  const { state, commit } = useBakery()
  const [draft, setDraft] = useState(product)
  const [uploading, setUploading] = useState(false)
  const set = (patch: Partial<Product>) => setDraft({ ...draft, ...patch })
  const list = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean)
  return (
    <Modal wide title={product.name ? `Edit ${product.name}` : "Add product"} onClose={onClose}>
      <div className="mt-5 grid gap-6 lg:grid-cols-2">
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
        <div>
          <p className="text-xs font-bold">Recipe per kg of cake</p>
          <p className="text-[11px] text-[#8f8981]">Used for the bake list and to deduct stock when preparation starts.</p>
          <div className="mt-3 space-y-2">
            {draft.recipe.map((line, index) => (
              <div key={index} className="flex gap-2">
                <select value={line.ingredientId} onChange={(event) => set({ recipe: draft.recipe.map((item, i) => (i === index ? { ...item, ingredientId: event.target.value } : item)) })} className="flex-1 rounded-lg border border-[#e4dfd7] px-2 py-2 text-xs">{state.ingredients.map((ingredient) => <option key={ingredient.id} value={ingredient.id}>{ingredient.name}</option>)}</select>
                <input type="number" step="0.01" min={0} value={line.perKg} onChange={(event) => set({ recipe: draft.recipe.map((item, i) => (i === index ? { ...item, perKg: Number(event.target.value) || 0 } : item)) })} className="w-20 rounded-lg border border-[#e4dfd7] px-2 py-2 text-xs" />
                <span className="w-8 self-center text-[11px] text-[#8f8981]">{state.ingredients.find((item) => item.id === line.ingredientId)?.unit}</span>
                <button onClick={() => set({ recipe: draft.recipe.filter((_, i) => i !== index) })} className="text-red-500" aria-label="Remove ingredient"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
          <Button className="mt-2" tone="ghost" onClick={() => set({ recipe: [...draft.recipe, { ingredientId: state.ingredients[0]?.id ?? "", perKg: 0.1 }] })}><Plus size={13} /> Add ingredient</Button>
          <p className="mt-4 rounded-lg bg-[#fcf8f3] p-3 text-xs">Ingredient cost {money(costPerKg(draft, state.ingredients))}/kg · price {money(draft.pricePerKg)}/kg</p>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2"><Button tone="ghost" onClick={onClose}>Cancel</Button><Button disabled={!draft.name.trim() || !draft.sizes.length || uploading} onClick={() => { commit((s, a) => saveProduct(s, a, draft), `${draft.name} saved`); onClose() }}>Save product</Button></div>
    </Modal>
  )
}

// ---- Inventory ---------------------------------------------------------------------------

const INVENTORY_TABS = ["Stock", "Movements", "Waste log"] as const
type Adjusting = { ingredient: Ingredient; reason: StockMovement["reason"] }

export function InventoryPage() {
  const { state, can } = useBakery()
  const [tab, setTab] = useState<(typeof INVENTORY_TABS)[number]>("Stock")
  const [adjusting, setAdjusting] = useState<Adjusting | null>(null)
  const [editing, setEditing] = useState<Ingredient | null>(null)
  const manage = can("inventory.manage")
  const low = state.ingredients.filter((item) => item.stock <= item.reorderLevel)
  const weekWaste = state.waste.filter((entry) => new Date(entry.at).getTime() > addDays(new Date(), -7).getTime())
  const exportReorder = () => downloadCsv(`reorder-${dayKey()}.csv`, [["Supplier", "Ingredient", "In stock", "Reorder level", "Suggested order", "Unit", "Est. cost"], ...low.sort((a, b) => a.supplier.localeCompare(b.supplier)).map((item) => { const qty = Math.max(0, item.reorderLevel * 2 - item.stock); return [item.supplier, item.name, item.stock, item.reorderLevel, qty.toFixed(2), item.unit, (qty * item.costPerUnit).toFixed(2)] })])
  return (
    <div className="space-y-6">
      <PageHeading eyebrow="Inventory" title="Ingredients & stock" description="Stock is deducted automatically from recipes when the kitchen starts an order. Receive deliveries, correct counts and log waste here."
        actions={<>{low.length > 0 && <Button tone="neutral" onClick={exportReorder}><Download size={14} /> Reorder list</Button>}{manage && <Button onClick={() => setEditing({ id: uid("ing"), name: "", unit: "kg", stock: 0, reorderLevel: 1, costPerUnit: 0, supplier: "" })}><Plus size={14} /> Add ingredient</Button>}</>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Stock value" value={money(state.ingredients.reduce((sum, item) => sum + item.stock * item.costPerUnit, 0))} icon={Boxes} />
        <Metric label="Low stock" value={low.length} icon={AlertTriangle} tone={low.length ? "bad" : "good"} hint={low.length ? low.map((item) => item.name.split(" ")[0]).join(", ") : "All above reorder level"} />
        <Metric label="Waste this week" value={money(weekWaste.reduce((sum, entry) => sum + entry.cost, 0))} icon={Trash2} hint={`${weekWaste.length} entries`} />
      </div>
      <Tabs tabs={INVENTORY_TABS} active={tab} onChange={setTab} />
      {tab === "Stock" && (
        <Card>
          <Table minWidth={860} headings={["Ingredient", "In stock", "Reorder at", "Status", "Supplier", "Value", ""]}>
            {state.ingredients.map((item) => {
              const ratio = item.stock / Math.max(item.reorderLevel * 2, 0.001)
              return (
                <tr key={item.id}>
                  <Td className="font-semibold">{item.name}</Td>
                  <Td><span className="font-bold">{item.stock}</span> {item.unit}<div className="mt-1 h-1 w-24 rounded-full bg-[#eee6df]"><div className={`h-full rounded-full ${item.stock <= item.reorderLevel ? "bg-red-500" : "bg-[#e8a05a]"}`} style={{ width: `${Math.min(100, ratio * 100)}%` }} /></div></Td>
                  <Td>{item.reorderLevel} {item.unit}</Td>
                  <Td>{item.stock <= 0 ? <Pill tone="urgent">Out</Pill> : item.stock <= item.reorderLevel ? <Pill tone="warn">Reorder</Pill> : <Pill tone="good">OK</Pill>}</Td>
                  <Td className="text-xs">{item.supplier || "—"}</Td>
                  <Td>{money(item.stock * item.costPerUnit)}</Td>
                  <Td>{manage && <div className="flex justify-end gap-1"><Button tone="neutral" onClick={() => setAdjusting({ ingredient: item, reason: "Received" })}><Plus size={12} /> Receive</Button><Button tone="neutral" onClick={() => setAdjusting({ ingredient: item, reason: "Adjustment" })}>Count</Button><Button tone="ghost" onClick={() => setAdjusting({ ingredient: item, reason: "Waste" })}><Minus size={12} /> Waste</Button><button onClick={() => setEditing(item)} className="rounded p-1.5 text-[#c76a10] hover:bg-[#fff3e2]" aria-label={`Edit ${item.name}`}><Pencil size={13} /></button></div>}</Td>
                </tr>
              )
            })}
          </Table>
        </Card>
      )}
      {tab === "Movements" && (
        <Card>
          {state.stockMovements.length === 0 ? <Empty text="No stock movements yet. Starting an order in the kitchen deducts its recipe." /> : (
            <Table minWidth={680} headings={["When", "Ingredient", "Change", "Reason", "Reference", "By"]}>
              {state.stockMovements.slice(0, 150).map((movement) => { const ingredient = state.ingredients.find((item) => item.id === movement.ingredientId); return <tr key={movement.id}><Td className="text-xs">{formatDateTime(movement.at)}</Td><Td>{ingredient?.name}</Td><Td className={movement.change < 0 ? "font-bold text-red-600" : "font-bold text-emerald-700"}>{movement.change > 0 ? "+" : ""}{movement.change} {ingredient?.unit}</Td><Td>{movement.reason}</Td><Td className="text-xs">{movement.ref ?? "—"}</Td><Td className="text-xs">{movement.by}</Td></tr> })}
            </Table>
          )}
        </Card>
      )}
      {tab === "Waste log" && <WasteLog />}
      {adjusting && <AdjustModal {...adjusting} onClose={() => setAdjusting(null)} />}
      {editing && <IngredientModal ingredient={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}

function AdjustModal({ ingredient, reason, onClose }: Adjusting & { onClose: () => void }) {
  const { commit } = useBakery()
  const [value, setValue] = useState(reason === "Adjustment" ? String(ingredient.stock) : "")
  const amount = Number(value)
  const change = reason === "Adjustment" ? +(amount - ingredient.stock).toFixed(3) : reason === "Waste" ? -amount : amount
  const label = reason === "Received" ? "Receive delivery" : reason === "Adjustment" ? "Stock count" : "Log waste"
  const save = () => {
    commit((s, a) => {
      let next = adjustStock(s, a, ingredient.id, change, reason)
      if (reason === "Waste") next = logWaste(next, a, { item: ingredient.name, quantity: amount, unit: ingredient.unit, cost: +(amount * ingredient.costPerUnit).toFixed(2), reason: "Expired" })
      return next
    }, `${ingredient.name}: ${change > 0 ? "+" : ""}${change} ${ingredient.unit}`)
    onClose()
  }
  return (
    <Modal narrow title={`${label} · ${ingredient.name}`} onClose={onClose}>
      <Field label={reason === "Adjustment" ? `Counted quantity (${ingredient.unit})` : `Quantity (${ingredient.unit})`} className="mt-4"><input autoFocus type="number" min={0} step="0.1" value={value} onChange={(event) => setValue(event.target.value)} className={inputClass} /></Field>
      <p className="mt-2 text-xs text-[#8f8981]">Currently {ingredient.stock} {ingredient.unit}{Number.isFinite(change) && change !== 0 && ` → ${+(ingredient.stock + change).toFixed(3)} ${ingredient.unit}`}</p>
      <div className="mt-6 flex justify-end gap-2"><Button tone="ghost" onClick={onClose}>Cancel</Button><Button disabled={!value || !Number.isFinite(amount) || amount < 0 || change === 0} onClick={save}>Save</Button></div>
    </Modal>
  )
}

function IngredientModal({ ingredient, onClose }: { ingredient: Ingredient; onClose: () => void }) {
  const { commit } = useBakery()
  const [draft, setDraft] = useState(ingredient)
  return (
    <Modal title={ingredient.name ? `Edit ${ingredient.name}` : "Add ingredient"} onClose={onClose}>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Field label="Name *" className="sm:col-span-2"><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className={inputClass} /></Field>
        <Field label="Unit"><select value={draft.unit} onChange={(event) => setDraft({ ...draft, unit: event.target.value as Ingredient["unit"] })} className={inputClass}>{["kg", "L", "pcs"].map((unit) => <option key={unit}>{unit}</option>)}</select></Field>
        <Field label="Supplier"><input value={draft.supplier} onChange={(event) => setDraft({ ...draft, supplier: event.target.value })} className={inputClass} /></Field>
        <Field label="Stock"><input type="number" min={0} value={draft.stock} onChange={(event) => setDraft({ ...draft, stock: Number(event.target.value) || 0 })} className={inputClass} /></Field>
        <Field label="Reorder level"><input type="number" min={0} value={draft.reorderLevel} onChange={(event) => setDraft({ ...draft, reorderLevel: Number(event.target.value) || 0 })} className={inputClass} /></Field>
        <Field label="Cost per unit (€)"><input type="number" min={0} step="0.01" value={draft.costPerUnit} onChange={(event) => setDraft({ ...draft, costPerUnit: Number(event.target.value) || 0 })} className={inputClass} /></Field>
      </div>
      <div className="mt-6 flex justify-end gap-2"><Button tone="ghost" onClick={onClose}>Cancel</Button><Button disabled={!draft.name.trim()} onClick={() => { commit((s, a) => saveIngredient(s, a, draft), `${draft.name} saved`); onClose() }}>Save</Button></div>
    </Modal>
  )
}

function WasteLog() {
  const { state, commit, can } = useBakery()
  const [item, setItem] = useState(state.products[0]?.name ?? "")
  const [quantity, setQuantity] = useState(1)
  const [unit, setUnit] = useState("pcs")
  const [cost, setCost] = useState(0)
  const [reason, setReason] = useState<WasteReason>("Unsold")
  const [note, setNote] = useState("")
  const byReason = (["Expired", "Damaged", "Production error", "Unsold", "Customer return"] as WasteReason[]).map((r) => [r, state.waste.filter((entry) => entry.reason === r).reduce((sum, entry) => sum + entry.cost, 0)] as const)
  return (
    <div className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
      {can("inventory.manage") && (
        <Card title="Log waste" subtitle="Unsold, damaged or expired items — tracked to reduce loss">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Item" className="sm:col-span-2"><input list="waste-items" value={item} onChange={(event) => setItem(event.target.value)} className={inputClass} /><datalist id="waste-items">{[...state.products.map((product) => product.name), ...state.ingredients.map((ingredient) => ingredient.name)].map((name) => <option key={name} value={name} />)}</datalist></Field>
            <Field label="Quantity"><input type="number" min={0} value={quantity} onChange={(event) => setQuantity(Number(event.target.value) || 0)} className={inputClass} /></Field>
            <Field label="Unit"><select value={unit} onChange={(event) => setUnit(event.target.value)} className={inputClass}>{["pcs", "kg", "L", "slices"].map((option) => <option key={option}>{option}</option>)}</select></Field>
            <Field label="Cost (€)"><input type="number" min={0} step="0.5" value={cost} onChange={(event) => setCost(Number(event.target.value) || 0)} className={inputClass} /></Field>
            <Field label="Reason"><select value={reason} onChange={(event) => setReason(event.target.value as WasteReason)} className={inputClass}>{byReason.map(([r]) => <option key={r}>{r}</option>)}</select></Field>
            <Field label="Note" className="sm:col-span-2"><input value={note} onChange={(event) => setNote(event.target.value)} className={inputClass} /></Field>
          </div>
          <Button className="mt-4 w-full" disabled={!item.trim() || quantity <= 0} onClick={() => { commit((s, a) => logWaste(s, a, { item, quantity, unit, cost, reason, note: note || undefined }), "Waste logged"); setNote("") }}>Log waste</Button>
        </Card>
      )}
      <Card title="Waste history" subtitle={byReason.filter(([, value]) => value).map(([r, value]) => `${r} ${money(value)}`).join(" · ")}>
        {state.waste.length === 0 ? <Empty text="No waste logged." /> : (
          <Table minWidth={620} headings={["When", "Item", "Qty", "Cost", "Reason", "By"]}>
            {state.waste.map((entry) => <tr key={entry.id}><Td className="text-xs">{formatDateTime(entry.at)}</Td><Td>{entry.item}{entry.note && <span className="block text-[11px] text-[#8f8981]">{entry.note}</span>}</Td><Td>{entry.quantity} {entry.unit}</Td><Td>{money(entry.cost)}</Td><Td><Pill>{entry.reason}</Pill></Td><Td className="text-xs">{entry.by}</Td></tr>)}
          </Table>
        )}
      </Card>
    </div>
  )
}

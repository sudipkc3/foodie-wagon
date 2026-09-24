"use client"

import { useMemo, useState } from "react"
import { AlertTriangle, ImagePlus, Plus, Trash2, Zap } from "lucide-react"
import { useBakery } from "@/lib/bakery/store"
import { createOrder, type NewOrderInput } from "@/lib/bakery/workflow"
import { addDays, dayKey, money, parseWeight, readImageAsDataUrl } from "@/lib/bakery/format"
import { ORDER_SOURCES, type FulfillmentType, type OrderItem, type OrderSource, type PaymentMethod } from "@/lib/bakery/types"
import { Button, Field, Modal, inputClass } from "./ui"

const toLocalInput = (date: Date) => `${dayKey(date)}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`

export function OrderForm({ prefill, onClose, onCreated }: { prefill?: Partial<NewOrderInput>; onClose: () => void; onCreated: (id: string) => void }) {
  const { state, commit, can } = useBakery()
  const products = state.products.filter((product) => product.available)
  const blankItem = (): OrderItem => {
    const product = products[0]
    return { productId: product?.id, name: product?.name ?? "Custom cake", image: product?.image ?? "", flavor: product?.flavors[0] ?? "Classic", size: product?.sizes[1] ?? product?.sizes[0] ?? "1 kg", weightKg: parseWeight(product?.sizes[1] ?? "1 kg"), quantity: 1, unitPrice: (product?.pricePerKg ?? 0) * parseWeight(product?.sizes[1] ?? "1 kg"), message: "", design: "House finish" }
  }
  const [source, setSource] = useState<OrderSource>(prefill?.source ?? "Reception")
  const [urgent, setUrgent] = useState(prefill?.urgent ?? false)
  const [type, setType] = useState<FulfillmentType>(prefill?.type ?? "Pickup")
  const [customer, setCustomer] = useState(prefill?.customer ?? { name: "", phone: "", email: "" })
  const [items, setItems] = useState<OrderItem[]>(prefill?.items?.length ? prefill.items.map((item) => ({ ...item })) : [blankItem()])
  const [reference, setReference] = useState<string | undefined>(prefill?.referenceImage)
  // Emergency cakes default to 90 minutes from now; everything else to tomorrow noon.
  const [due, setDue] = useState(() => {
    if (prefill?.dueAt) return toLocalInput(new Date(prefill.dueAt))
    if (prefill?.source === "Emergency") return toLocalInput(new Date(Date.now() + 90 * 60000))
    const date = addDays(new Date(), 1)
    date.setHours(12, 0, 0, 0)
    return toLocalInput(date)
  })
  const [address, setAddress] = useState(prefill?.address && prefill.address !== "Bakery pickup" ? prefill.address : "")
  const [deliveryFee, setDeliveryFee] = useState(state.settings.deliveryFee)
  const [discount, setDiscount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash")
  const [deposit, setDeposit] = useState(0)
  const [customerNote, setCustomerNote] = useState("")
  const [internalNote, setInternalNote] = useState("")
  const [chef, setChef] = useState("")
  const [error, setError] = useState("")

  const emergency = source === "Emergency" || urgent
  const known = useMemo(() => (customer.phone.replace(/\D/g, "").length >= 6 ? state.orders.filter((order) => order.customer.phone.replace(/\D/g, "") === customer.phone.replace(/\D/g, "")) : []), [customer.phone, state.orders])
  const profile = state.customers.find((item) => item.phone === known[0]?.customer.phone)
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const total = subtotal + (type === "Delivery" ? deliveryFee : 0) - discount
  const dueDate = new Date(due)
  const cakesThatDay = state.orders.filter((order) => order.status !== "Cancelled" && dayKey(order.dueAt) === dayKey(dueDate)).reduce((sum, order) => sum + order.items.reduce((count, item) => count + item.quantity, 0), 0)
  const overCapacity = cakesThatDay + items.reduce((count, item) => count + item.quantity, 0) > state.settings.dailyCakeCapacity
  const insideLeadTime = dueDate.getTime() - Date.now() < state.settings.minLeadHours * 3600000
  const allergens = [...new Set(items.flatMap((item) => state.products.find((product) => product.id === item.productId)?.allergens ?? []))]

  const updateItem = (index: number, patch: Partial<OrderItem>) => setItems((current) => current.map((item, i) => {
    if (i !== index) return item
    const next = { ...item, ...patch }
    const product = state.products.find((candidate) => candidate.id === next.productId)
    if (patch.productId && product) Object.assign(next, { name: product.name, image: product.image, flavor: product.flavors[0], size: product.sizes.includes(next.size) ? next.size : product.sizes[0] })
    if (patch.productId || patch.size) { next.weightKg = parseWeight(next.size); if (product) next.unitPrice = +(product.pricePerKg * next.weightKg).toFixed(2) }
    return next
  }))

  const chooseSource = (value: OrderSource) => {
    setSource(value)
    if (value === "Emergency") { setUrgent(true); const soon = new Date(Date.now() + 90 * 60000); setDue(toLocalInput(soon)) }
  }

  const submit = () => {
    if (!customer.name.trim() || !customer.phone.trim()) return setError("Customer name and phone are required.")
    if (type === "Delivery" && !address.trim()) return setError("Delivery address is required.")
    if (Number.isNaN(dueDate.getTime())) return setError("Choose a valid due date and time.")
    let createdId = ""
    commit((current, actor) => {
      const result = createOrder(current, actor, {
        source, type, urgent: emergency, dueAt: dueDate.toISOString(), customer: { name: customer.name.trim(), phone: customer.phone.trim(), email: customer.email.trim() },
        items, referenceImage: reference, address: address.trim(), deliveryFee, discount, paymentMethod, deposit: can("payments.collect") ? deposit : 0,
        customerNote: customerNote.trim(), internalNote: internalNote.trim(), chef: can("orders.assign") ? chef : "",
      })
      createdId = result.order.id
      return result.state
    })
    onCreated(createdId)
  }

  return (
    <Modal wide title={emergency ? <span className="flex items-center gap-2"><Zap className="text-red-600" size={22} /> Quick emergency order</span> : "Create order"} onClose={onClose}>
      <p className="text-xs text-[#8f8981]">One order form for walk-in, reception, phone and emergency orders. Website orders arrive automatically.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {ORDER_SOURCES.filter((item) => item !== "Website").map((item) => (
          <button key={item} onClick={() => chooseSource(item)} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${source === item ? (item === "Emergency" ? "border-red-600 bg-red-600 text-white" : "border-[#ee9633] bg-[#fff2df] text-[#c76a10]") : "border-[#e4dcd5] text-[#6f675f]"}`}>{item}</button>
        ))}
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <section className="grid gap-3 sm:grid-cols-3">
            <Field label="Phone (WhatsApp) *"><input value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} className={inputClass} placeholder="+49 ..." /></Field>
            <Field label="Customer name *"><input value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} className={inputClass} placeholder="Full name" /></Field>
            <Field label="Email"><input value={customer.email} onChange={(event) => setCustomer({ ...customer, email: event.target.value })} className={inputClass} placeholder="optional" /></Field>
            {known.length > 0 && (
              <div className="rounded-lg bg-[#f1f8f1] p-3 text-xs text-[#3f5a3f] sm:col-span-3">
                Returning customer · {known.length} previous order(s){profile?.notes && ` · ${profile.notes}`}
                {!customer.name && <button className="ml-2 font-bold underline" onClick={() => setCustomer({ ...known[0].customer })}>Fill details</button>}
              </div>
            )}
          </section>

          {items.map((item, index) => {
            const product = state.products.find((candidate) => candidate.id === item.productId)
            return (
              <section key={index} className="rounded-xl border border-[#eeeae3] p-4">
                <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wider text-[#aaa59d]">Cake {items.length > 1 ? index + 1 : ""}</p>{items.length > 1 && <button onClick={() => setItems(items.filter((_, i) => i !== index))} className="text-red-500" aria-label="Remove cake"><Trash2 size={14} /></button>}</div>
                <div className="mt-2 grid gap-3 sm:grid-cols-4">
                  <Field label="Cake" className="sm:col-span-2">
                    <select value={item.productId ?? ""} onChange={(event) => updateItem(index, { productId: event.target.value })} className={inputClass}>
                      {products.map((option) => <option key={option.id} value={option.id}>{option.name} · {money(option.pricePerKg)}/kg</option>)}
                    </select>
                  </Field>
                  <Field label="Size"><select value={item.size} onChange={(event) => updateItem(index, { size: event.target.value })} className={inputClass}>{(product?.sizes ?? ["1 kg"]).map((size) => <option key={size}>{size}</option>)}</select></Field>
                  <Field label="Flavor"><select value={item.flavor} onChange={(event) => updateItem(index, { flavor: event.target.value })} className={inputClass}>{(product?.flavors ?? ["Classic"]).map((flavor) => <option key={flavor}>{flavor}</option>)}</select></Field>
                  <Field label="Message on cake" className="sm:col-span-2"><input value={item.message} onChange={(event) => updateItem(index, { message: event.target.value })} className={inputClass} placeholder="Happy Birthday Sita ❤️" /></Field>
                  <Field label="Design / customization" className="sm:col-span-2"><input value={item.design} onChange={(event) => updateItem(index, { design: event.target.value })} className={inputClass} placeholder="Colours, toppers, theme…" /></Field>
                  <Field label="Qty"><input type="number" min={1} value={item.quantity} onChange={(event) => updateItem(index, { quantity: Math.max(1, Number(event.target.value) || 1) })} className={inputClass} /></Field>
                  <Field label="Unit price (€)"><input type="number" min={0} step="0.5" value={item.unitPrice} onChange={(event) => updateItem(index, { unitPrice: Number(event.target.value) || 0 })} className={inputClass} /></Field>
                  <p className="self-end pb-2 text-[11px] text-[#8f8279] sm:col-span-2">{product?.allergens.length ? `Contains: ${product.allergens.join(", ")}` : ""}</p>
                </div>
              </section>
            )
          })}
          <Button tone="ghost" onClick={() => setItems([...items, blankItem()])}><Plus size={14} /> Add another cake</Button>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#d7b9a9] p-4 text-xs font-bold text-[#765e53]">
            {reference ? <img src={reference} alt="Reference" className="h-16 w-16 rounded-lg object-cover" /> : <ImagePlus size={22} className="text-[#c67a5d]" />}
            <span>{reference ? "Reference photo attached — click to replace" : "Capture / upload the customer's cake photo"}<span className="block font-normal text-[#9b8f87]">Shown large on the kitchen screen</span></span>
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={async (event) => { const file = event.target.files?.[0]; if (file) setReference(await readImageAsDataUrl(file)) }} />
          </label>

          <section className="grid gap-3 sm:grid-cols-2">
            <Field label="Customer instructions"><textarea value={customerNote} onChange={(event) => setCustomerNote(event.target.value)} rows={2} className={inputClass} placeholder="Eggless, extra cream on the side…" /></Field>
            <Field label="Internal reception note"><textarea value={internalNote} onChange={(event) => setInternalNote(event.target.value)} rows={2} className={inputClass} placeholder="Visible to staff only" /></Field>
          </section>
        </div>

        <aside className="space-y-4 rounded-2xl bg-[#fcf8f3] p-4">
          <div className="grid grid-cols-2 gap-2">
            {(["Pickup", "Delivery"] as const).map((option) => <button key={option} onClick={() => setType(option)} className={`rounded-lg border py-2 text-xs font-bold ${type === option ? "border-[#ee9633] bg-white text-[#c76a10]" : "border-[#e4dcd5] text-[#6f675f]"}`}>{option}</button>)}
          </div>
          <Field label={`${type} date & time *`}><input type="datetime-local" value={due} onChange={(event) => setDue(event.target.value)} className={inputClass} /></Field>
          {type === "Delivery" && <>
            <Field label="Delivery address *"><textarea rows={2} value={address} onChange={(event) => setAddress(event.target.value)} className={inputClass} placeholder="Street, postcode, city" /></Field>
            <Field label="Delivery fee (€)"><input type="number" min={0} step="0.5" value={deliveryFee} onChange={(event) => setDeliveryFee(Number(event.target.value) || 0)} className={inputClass} /></Field>
          </>}
          <label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={emergency} disabled={source === "Emergency"} onChange={(event) => setUrgent(event.target.checked)} className="accent-red-600" /> Urgent — put at the top of the kitchen queue</label>
          {insideLeadTime && !emergency && <p className="flex gap-2 rounded-lg bg-amber-50 p-2 text-[11px] text-amber-800"><AlertTriangle size={14} className="shrink-0" /> Inside the {state.settings.minLeadHours}h lead time. Consider marking it urgent.</p>}
          {overCapacity && <p className="flex gap-2 rounded-lg bg-red-50 p-2 text-[11px] text-red-700"><AlertTriangle size={14} className="shrink-0" /> {cakesThatDay} cakes already due that day (capacity {state.settings.dailyCakeCapacity}).</p>}
          {can("orders.assign") && (
            <Field label="Assign chef now (optional)">
              <select value={chef} onChange={(event) => setChef(event.target.value)} className={inputClass}><option value="">Let the kitchen pick it up</option>{state.staff.filter((member) => member.role === "Chef" && member.status === "Active").map((member) => <option key={member.id}>{member.name}</option>)}</select>
            </Field>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Field label="Payment"><select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)} className={inputClass}>{["Cash", "Card", "Online", "Bank transfer"].map((method) => <option key={method}>{method}</option>)}</select></Field>
            <Field label="Discount (€)"><input type="number" min={0} value={discount} onChange={(event) => setDiscount(Number(event.target.value) || 0)} className={inputClass} /></Field>
            {can("payments.collect") && <Field label="Paid now / deposit (€)" className="col-span-2"><input type="number" min={0} step="0.5" value={deposit} onChange={(event) => setDeposit(Number(event.target.value) || 0)} className={inputClass} /></Field>}
          </div>
          <div className="space-y-1 border-t border-[#efe6dc] pt-3 text-xs">
            <div className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></div>
            {type === "Delivery" && <div className="flex justify-between"><span>Delivery</span><span>{money(deliveryFee)}</span></div>}
            {discount > 0 && <div className="flex justify-between"><span>Discount</span><span>−{money(discount)}</span></div>}
            <div className="flex justify-between font-serif text-lg font-bold"><span>Total</span><span>{money(total)}</span></div>
            {allergens.length > 0 && <p className="pt-1 text-[11px] text-[#8f8279]">Tell the customer — contains {allergens.join(", ")}.</p>}
          </div>
          {error && <p className="text-xs font-bold text-red-600">{error}</p>}
          <Button className="w-full py-3" tone={emergency ? "danger" : "primary"} onClick={submit}>{emergency ? "Create urgent order" : "Create order"}</Button>
        </aside>
      </div>
    </Modal>
  )
}

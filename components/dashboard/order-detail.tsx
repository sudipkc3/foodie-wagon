"use client"

import { useState } from "react"
import { Check, Clock3, MessageCircle, Phone, Printer, RotateCcw, Send, ShieldCheck, Zap } from "lucide-react"
import { useBakery, useNow } from "@/lib/bakery/store"
import {
  ACTION_META, addOrderNote, assignStaff, availableActions, recordTransaction, resendWhatsApp, sendWhatsApp, toggleUrgent, transitionOrder,
  type OrderAction,
} from "@/lib/bakery/workflow"
import {
  formatDateTime, formatTime, minutesUntil, money, orderBalance, orderImage, orderPaid, orderSubtotal, orderTitle, orderTotal, paymentStatus,
} from "@/lib/bakery/format"
import type { AccountabilityKey, NoteKind, Order, PaymentMethod, WhatsAppEvent } from "@/lib/bakery/types"
import { Button, Info, Modal, PaymentBadge, Pill, Select, StatusBadge, inputClass } from "./ui"

const ACCOUNTABILITY: [AccountabilityKey, string][] = [
  ["createdBy", "Order created by"], ["acceptedBy", "Order accepted by"], ["chefAssignedBy", "Chef assigned by"], ["chefAcceptedBy", "Chef accepted by"],
  ["prepStartedBy", "Preparation started by"], ["completedByChef", "Cake completed by"], ["riderAssignedBy", "Delivery assigned by"],
  ["riderPickedUpBy", "Picked up by rider"], ["deliveredBy", "Delivered by"], ["handedOverBy", "Handed over by"], ["completedBy", "Order completed by"], ["cancelledBy", "Cancelled by"],
]

export function Countdown({ order, className = "" }: { order: Order; className?: string }) {
  const now = useNow(30000)
  if (["Completed", "Cancelled", "Delivered"].includes(order.status)) return null
  const minutes = minutesUntil(order.dueAt, now)
  const late = minutes < 0
  const text = late ? `${formatDurationShort(-minutes)} overdue` : `${formatDurationShort(minutes)} left`
  const tone = late ? "bg-red-600 text-white" : minutes < 60 ? "bg-red-50 text-red-700" : minutes < 180 ? "bg-amber-50 text-amber-700" : "bg-[#f6f3ee] text-[#6f675f]"
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold ${tone} ${className}`}><Clock3 size={11} />{text}</span>
}

const formatDurationShort = (minutes: number) => (minutes >= 1440 ? `${Math.floor(minutes / 1440)}d ${Math.floor((minutes % 1440) / 60)}h` : minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`)

export function OrderDetail({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const { state, actor, commit, can } = useBakery()
  const order = state.orders.find((item) => item.id === orderId)
  const [pending, setPending] = useState<OrderAction | null>(null)
  const [actionInput, setActionInput] = useState("")
  const [noteKind, setNoteKind] = useState<NoteKind>(actor?.role === "Chef" ? "Kitchen" : actor?.role === "Rider" ? "Delivery" : "Reception")
  const [noteText, setNoteText] = useState("")
  const [payAmount, setPayAmount] = useState("")
  const [payMethod, setPayMethod] = useState<PaymentMethod>("Cash")
  const [waEvent, setWaEvent] = useState<WhatsAppEvent>("pickupReady")
  if (!order) return null

  const actions = availableActions(state, order, actor)
  const balance = orderBalance(order)
  const chefs = state.staff.filter((member) => member.role === "Chef" && member.status === "Active")
  const riders = state.staff.filter((member) => member.role === "Rider" && member.status === "Active")
  const showMoney = can("payments.view") || can("payments.collect")
  const settleFirst = (action: OrderAction) => ["handover", "complete", "delivered"].includes(action) && balance > 0 && can("payments.collect")

  const run = (action: OrderAction) => {
    const meta = ACTION_META[action]
    if ((meta.input || settleFirst(action)) && pending !== action) { setPending(action); setActionInput(""); return }
    if (meta.input === "reason" && !actionInput.trim()) return
    commit((current, who) => transitionOrder(current, who, order.id, action, actionInput.trim()))
    setPending(null)
  }
  const collectAndRun = (action: OrderAction) => {
    commit((current, who) => transitionOrder(recordTransaction(current, who, order.id, balance, payMethod, "Payment", "Collected at handover"), who, order.id, action, actionInput.trim()))
    setPending(null)
  }

  return (
    <Modal wide onClose={onClose} title={<span className="flex flex-wrap items-center gap-2">{order.id} <StatusBadge status={order.status} />{order.urgent && <Pill tone="urgent"><Zap size={10} /> URGENT</Pill>}<Countdown order={order} /></span>}>
      <p className="mt-1 text-xs text-[#8f8981]">{order.source} order · created {formatDateTime(order.createdAt)} by {order.accountability.createdBy}</p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        {/* ---- Left column: what to make, for whom, when ---- */}
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-[220px_1fr]">
            {orderImage(order) ? <img src={orderImage(order)} alt={`${orderTitle(order)} reference`} className="h-56 w-full rounded-2xl object-cover" /> : <div className="grid h-56 place-items-center rounded-2xl bg-[#f6f0ea] text-xs text-[#9b8f87]">No image</div>}
            <div className="space-y-3">
              <div className="rounded-xl border border-[#eeeae3] p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#aaa59d]">Customer</p>
                <p className="mt-1 font-semibold">{order.customer.name}</p>
                <p className="text-xs text-[#8f8981]">{order.customer.phone}{order.customer.email && ` · ${order.customer.email}`}</p>
                {order.customer.phone && (
                  <div className="mt-2 flex gap-2">
                    <a href={`tel:${order.customer.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1 rounded-lg border border-[#e4dcd5] px-2 py-1 text-[11px] font-bold"><Phone size={12} /> Call</a>
                    <a target="_blank" rel="noreferrer" href={`https://wa.me/${order.customer.phone.replace(/[^\d]/g, "")}`} className="inline-flex items-center gap-1 rounded-lg border border-[#e4dcd5] px-2 py-1 text-[11px] font-bold"><MessageCircle size={12} /> WhatsApp</a>
                  </div>
                )}
              </div>
              <Info label="Fulfillment" value={<>{order.type} · {formatDateTime(order.dueAt)}<p className="mt-1 text-xs font-normal text-[#7d746c]">{order.address}</p></>} />
            </div>
          </div>

          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="rounded-xl border border-[#eeeae3] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-serif text-lg font-bold">{item.quantity > 1 && `${item.quantity}× `}{item.name}</p>
                    <p className="mt-1 text-xs text-[#7d746c]">{item.size} · {item.weightKg * item.quantity} kg · {item.flavor} · design: {item.design || "House finish"}</p>
                  </div>
                  {showMoney && <span className="text-sm font-bold">{money(item.unitPrice * item.quantity)}</span>}
                </div>
                {item.message && <p className="mt-3 rounded-lg bg-[#fff5e7] p-3 text-center font-serif text-lg font-bold text-[#6c4a2a]">“{item.message}”</p>}
                {(() => {
                  const product = state.products.find((candidate) => candidate.id === item.productId)
                  return product?.allergens.length ? <p className="mt-2 text-[11px] text-[#8f8279]"><ShieldCheck size={11} className="mr-1 inline text-[#d58a68]" />Allergens: {product.allergens.join(", ")}</p> : null
                })()}
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-sm font-bold">Notes & special instructions</h3>
            <div className="mt-2 space-y-2">
              {order.notes.length === 0 && <p className="text-xs text-[#9b8f87]">No notes yet.</p>}
              {order.notes.map((note) => (
                <div key={note.id} className={`rounded-lg p-3 text-xs ${note.kind === "Customer" ? "bg-[#fff5e7]" : note.kind === "Kitchen" ? "bg-amber-50" : note.kind === "Delivery" ? "bg-violet-50" : "bg-[#f6f3ee]"}`}>
                  <p className="font-bold">{note.kind} note <span className="font-normal text-[#8f8981]">· {note.by} · {formatDateTime(note.at)}</span></p>
                  <p className="mt-1 text-[#4f4841]">{note.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Select label="Note type" value={noteKind} onChange={(value) => setNoteKind(value as NoteKind)} options={["Reception", "Kitchen", "Delivery", "Customer"]} />
              <input value={noteText} onChange={(event) => setNoteText(event.target.value)} placeholder="Add an internal note..." className="flex-1 rounded-lg border border-[#e4dfd7] px-3 py-2 text-xs" onKeyDown={(event) => { if (event.key === "Enter") { commit((s, a) => addOrderNote(s, a, order.id, noteKind, noteText)); setNoteText("") } }} />
              <Button tone="neutral" onClick={() => { commit((s, a) => addOrderNote(s, a, order.id, noteKind, noteText)); setNoteText("") }} disabled={!noteText.trim()}>Add note</Button>
            </div>
          </div>

          {showMoney && (
            <div className="rounded-xl border border-[#eeeae3] p-4">
              <div className="flex items-center justify-between"><h3 className="text-sm font-bold">Payment</h3><PaymentBadge status={paymentStatus(order)} /></div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <Info label="Subtotal" value={money(orderSubtotal(order))} />
                <Info label="Delivery" value={money(order.deliveryFee)} />
                <Info label="Paid" value={money(orderPaid(order))} />
                <Info label="Balance" value={<span className={balance > 0 ? "text-red-600" : "text-emerald-700"}>{money(balance)}</span>} />
              </div>
              <p className="mt-2 text-xs text-[#8f8981]">Total {money(orderTotal(order))} · preferred method: {order.paymentMethod}</p>
              {order.transactions.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-[#6f675f]">
                  {order.transactions.map((tx) => <li key={tx.id}>{tx.kind === "Refund" ? "↩︎" : "✓"} {money(tx.amount)} · {tx.method} · {tx.by} · {formatDateTime(tx.at)}{tx.note && ` · ${tx.note}`}</li>)}
                </ul>
              )}
              {can("payments.collect") && balance > 0 && order.status !== "Cancelled" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <input type="number" min={0} step="0.5" value={payAmount} onChange={(event) => setPayAmount(event.target.value)} placeholder={balance.toFixed(2)} className="w-28 rounded-lg border border-[#e4dfd7] px-3 py-2 text-xs" />
                  <Select label="Payment method" value={payMethod} onChange={(value) => setPayMethod(value as PaymentMethod)} options={["Cash", "Card", "Online", "Bank transfer"]} />
                  <Button tone="dark" onClick={() => { commit((s, a) => recordTransaction(s, a, order.id, Number(payAmount) || balance, payMethod, "Payment")); setPayAmount("") }}>Record payment</Button>
                </div>
              )}
              {can("payments.refund") && orderPaid(order) > 0 && order.status === "Cancelled" && (
                <Button className="mt-3" tone="danger" onClick={() => commit((s, a) => recordTransaction(s, a, order.id, orderPaid(order), order.transactions[0]?.method ?? "Cash", "Refund", "Cancelled order refund"))}><RotateCcw size={13} /> Refund {money(orderPaid(order))}</Button>
              )}
            </div>
          )}
        </div>

        {/* ---- Right column: actions, people, history ---- */}
        <div className="space-y-5">
          <div className="rounded-xl bg-[#fcf8f3] p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#aaa59d]">Next steps for {actor?.role}</p>
            {actions.length === 0 && <p className="mt-2 text-xs text-[#8f8981]">{nextStepHint(order)}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              {actions.map((action) => <Button key={action} tone={ACTION_META[action].tone === "danger" ? "danger" : ACTION_META[action].tone === "neutral" ? "neutral" : "primary"} onClick={() => run(action)}>{ACTION_META[action].label}</Button>)}
            </div>
            {pending && (
              <div className="mt-3 space-y-2 rounded-lg border border-[#eadccf] bg-white p-3">
                {ACTION_META[pending].input && <input autoFocus value={actionInput} onChange={(event) => setActionInput(event.target.value)} placeholder={ACTION_META[pending].input === "reason" ? "Reason (required)" : "Proof / received by (optional)"} className="w-full rounded-lg border border-[#e4dfd7] px-3 py-2 text-xs" />}
                {settleFirst(pending) && <p className="text-xs text-amber-700">Outstanding balance {money(balance)}. Collect it now or continue without payment.</p>}
                <div className="flex flex-wrap gap-2">
                  {settleFirst(pending) && <Button onClick={() => collectAndRun(pending)}>Collect {money(balance)} ({payMethod}) & continue</Button>}
                  <Button tone={settleFirst(pending) ? "neutral" : ACTION_META[pending].tone === "danger" ? "danger" : "primary"} disabled={ACTION_META[pending].input === "reason" && !actionInput.trim()} onClick={() => run(pending)}>{settleFirst(pending) ? "Continue without payment" : `Confirm: ${ACTION_META[pending].label}`}</Button>
                  <Button tone="ghost" onClick={() => setPending(null)}>Back</Button>
                </div>
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-2 border-t border-[#efe6dc] pt-3">
              {can("orders.edit") && order.status !== "Completed" && order.status !== "Cancelled" && <Button tone="ghost" onClick={() => commit((s, a) => toggleUrgent(s, a, order.id))}><Zap size={13} /> {order.urgent ? "Remove urgent" : "Mark urgent"}</Button>}
              <Button tone="ghost" onClick={() => printTicket(order, showMoney)}><Printer size={13} /> Print ticket</Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-bold">Assigned chef
              <select disabled={!can("orders.assign") || ["Ready", "Completed", "Cancelled"].includes(order.status)} value={order.chef} onChange={(event) => commit((s, a) => assignStaff(s, a, order.id, "chef", event.target.value))} className={inputClass}>
                <option value="">Unassigned</option>
                {chefs.map((chef) => <option key={chef.id}>{chef.name}</option>)}
              </select>
            </label>
            <label className="text-xs font-bold">Delivery rider
              <select disabled={!can("orders.assign") || order.type !== "Delivery" || ["Out for Delivery", "Delivered", "Completed", "Cancelled"].includes(order.status)} value={order.rider} onChange={(event) => commit((s, a) => assignStaff(s, a, order.id, "rider", event.target.value))} className={inputClass}>
                <option value="">{order.type === "Delivery" ? "Unassigned" : "Not required (pickup)"}</option>
                {riders.map((rider) => <option key={rider.id}>{rider.name}</option>)}
              </select>
            </label>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold"><ShieldCheck size={15} className="text-[#d58a68]" /> Accountability</h3>
            <div className="mt-2 divide-y divide-[#f0ede8] rounded-xl border border-[#eeeae3] text-xs">
              {ACCOUNTABILITY.filter(([key]) => order.accountability[key] || !["cancelledBy", "handedOverBy", "riderAssignedBy", "riderPickedUpBy", "deliveredBy"].includes(key) || order.type === "Delivery").map(([key, label]) => (
                <div key={key} className="flex justify-between gap-3 px-3 py-2"><span className="text-[#8f8981]">{label}</span><strong className={order.accountability[key] ? "" : "font-normal text-[#c3bbb3]"}>{order.accountability[key] || "—"}</strong></div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold"><Clock3 size={15} className="text-[#d58a68]" /> Order timeline</h3>
            <ol className="mt-3 space-y-3 border-l border-[#eadfd4] pl-4">
              {order.timeline.map((event, index) => (
                <li key={`${event.at}-${index}`} className="relative text-xs">
                  <span className="absolute -left-[21px] top-0.5 grid h-2.5 w-2.5 place-items-center rounded-full bg-emerald-500" />
                  <strong>{event.label}</strong>
                  <p className="text-[#9b8f87]">{formatDateTime(event.at)} · {event.by}{event.role !== event.by && ` (${event.role})`}</p>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold"><Send size={15} className="text-[#d58a68]" /> WhatsApp history</h3>
            <div className="mt-3 space-y-2">
              {order.whatsapp.length === 0 && <p className="text-xs text-[#9b8f87]">No messages sent yet.</p>}
              {order.whatsapp.map((message) => (
                <div key={message.id} className="rounded-lg bg-[#f1f8f1] p-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <strong>{state.templates.find((template) => template.id === message.templateId)?.name ?? message.templateId}</strong>
                    <span className="flex items-center gap-2">
                      <span className={message.status === "Failed" ? "text-red-600" : message.status === "Queued" ? "text-amber-600" : "text-emerald-700"}>{message.status === "Read" || message.status === "Delivered" ? <Check size={12} className="mr-0.5 inline" /> : null}{message.status}</span>
                      {can("whatsapp.send") && <button onClick={() => commit((s, a) => resendWhatsApp(s, a, order.id, message.id))} className="font-bold text-[#c76a10]">Resend</button>}
                    </span>
                  </div>
                  <p className="mt-1 text-[#4f4841]">{message.text}</p>
                  <p className="mt-1 text-[#9b8f87]">{formatTime(message.at)} · {message.by}</p>
                </div>
              ))}
            </div>
            {can("whatsapp.send") && (
              <div className="mt-3 flex gap-2">
                <Select label="WhatsApp template" className="flex-1" value={waEvent} onChange={(value) => setWaEvent(value as WhatsAppEvent)} options={state.templates.map((template) => ({ value: template.id, label: template.name }))} />
                <Button tone="neutral" onClick={() => commit((s, a) => sendWhatsApp(s, a, order.id, waEvent))}><Send size={13} /> Send</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

function nextStepHint(order: Order) {
  switch (order.status) {
    case "New": return "Waiting for the front desk to accept this order."
    case "Accepted": return order.chef ? `Waiting for ${order.chef} to start preparation.` : "Waiting for a chef to be assigned."
    case "Preparing": return `${order.chef || "The kitchen"} is preparing this cake.`
    case "Ready": return order.type === "Pickup" ? "Ready — waiting for the customer to collect." : order.rider ? `Waiting for ${order.rider} to pick it up.` : "Ready — assign a rider."
    case "Picked Up": case "Out for Delivery": return `${order.rider} is delivering this order.`
    case "Delivered": return "Delivered — front desk can close the order."
    case "Delivery Failed": return `Delivery failed: ${order.failedReason}. A manager or reception can re-dispatch.`
    default: return "No further actions."
  }
}

export function printTicket(order: Order, withMoney: boolean) {
  const popup = window.open("", "_blank", "width=420,height=640")
  if (!popup) return
  const escape = (value: string) => value.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]!)
  popup.document.write(`<html><head><title>${order.id}</title><style>body{font-family:ui-monospace,monospace;padding:16px;font-size:13px}h1{font-size:20px;margin:0}hr{border:0;border-top:1px dashed #999}.msg{font-size:18px;font-weight:bold;border:2px solid #000;padding:8px;text-align:center;margin:8px 0}</style></head><body>
    <h1>${escape(order.id)} ${order.urgent ? "· URGENT" : ""}</h1><p>${escape(order.type)} · ${escape(formatDateTime(order.dueAt))}<br/>${escape(order.customer.name)} · ${escape(order.customer.phone)}</p><hr/>
    ${order.items.map((item) => `<p><b>${item.quantity}× ${escape(item.name)}</b><br/>${escape(item.size)} · ${escape(item.flavor)}<br/>Design: ${escape(item.design || "House finish")}</p>${item.message ? `<div class="msg">${escape(item.message)}</div>` : ""}`).join("")}
    <hr/>${order.notes.map((note) => `<p><b>${note.kind}:</b> ${escape(note.text)}</p>`).join("")}
    ${order.type === "Delivery" ? `<p><b>Deliver to:</b> ${escape(order.address)}</p>` : ""}
    <p>Chef: ${escape(order.chef || "—")} ${order.rider ? `· Rider: ${escape(order.rider)}` : ""}</p>
    ${withMoney ? `<hr/><p>Total ${money(orderTotal(order))} · Balance ${money(orderBalance(order))}</p>` : ""}
    <script>window.print()</script></body></html>`)
  popup.document.close()
}

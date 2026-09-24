"use client"

import { useState } from "react"
import { AlertTriangle, ChefHat, Clock3, PackageCheck, Printer, ShieldCheck, UserRound, Zap } from "lucide-react"
import { useBakery } from "@/lib/bakery/store"
import { ACTION_META, addOrderNote, availableActions, transitionOrder } from "@/lib/bakery/workflow"
import { addDays, dayKey, formatDateTime, formatDay, formatTime, orderImage, orderWeightKg } from "@/lib/bakery/format"
import type { Order } from "@/lib/bakery/types"
import { useDashboardNav } from "./nav-context"
import { byPriority } from "./orders"
import { Button, Card, Countdown, Empty, Metric, PageHeading, Pill, StatusBadge, Table, Tabs, Td } from "./ui"

export function KitchenPage() {
  const { state, actor } = useBakery()
  const isChef = actor?.role === "Chef"
  const [scope, setScope] = useState<"Mine" | "All">(isChef ? "Mine" : "All")
  const open = state.orders.filter((order) => ["New", "Accepted", "Preparing", "Ready"].includes(order.status))
  const mine = (order: Order) => scope === "All" || !order.chef || order.chef === actor?.name
  const toAccept = open.filter((order) => order.status === "Accepted" && mine(order)).sort(byPriority)
  const preparing = open.filter((order) => order.status === "Preparing" && mine(order)).sort(byPriority)
  const ready = open.filter((order) => order.status === "Ready" && mine(order) && dayKey(order.dueAt) <= dayKey(addDays(new Date(), 1))).sort(byPriority)
  const awaiting = open.filter((order) => order.status === "New").sort(byPriority)

  return (
    <div className="space-y-6">
      <PageHeading eyebrow="Kitchen dashboard" title={isChef ? `Good bake, ${actor?.name.split(" ")[0]}` : "Kitchen queue"} description="Customer photos, requirements, cake messages and deadlines — urgent cakes always first."
        actions={<Tabs tabs={["Mine", "All"] as const} active={scope} onChange={setScope} />} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="Waiting for chef" value={toAccept.length} icon={PackageCheck} />
        <Metric label="My orders" value={open.filter((order) => order.chef === actor?.name && order.status !== "Ready").length} icon={UserRound} />
        <Metric label="Preparing" value={preparing.length} icon={ChefHat} />
        <Metric label="Ready" value={ready.length} icon={Clock3} />
        <Metric label="Urgent" value={open.filter((order) => order.urgent && order.status !== "Ready").length} icon={Zap} tone="bad" hint={open.some((order) => order.urgent && order.status !== "Ready") ? "Do these first" : "None right now"} />
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        <Lane title="To accept / start" orders={toAccept} empty="No orders waiting." />
        <Lane title="Preparing" orders={preparing} empty="Nothing in the oven." />
        <Lane title="Ready" orders={ready} empty="No finished cakes waiting." compact />
      </div>
      {awaiting.length > 0 && (
        <Card title="Coming up — awaiting front-desk acceptance" subtitle="Visible so you can plan; they move to your queue once accepted.">
          <div className="flex flex-wrap gap-2">{awaiting.map((order) => <MiniOrder key={order.id} order={order} />)}</div>
        </Card>
      )}
    </div>
  )
}

function Lane({ title, orders, empty, compact }: { title: string; orders: Order[]; empty: string; compact?: boolean }) {
  return (
    <section className="space-y-4">
      <h3 className="flex items-center justify-between font-serif text-xl font-bold">{title}<span className="rounded-full bg-[#f1ede7] px-2 py-0.5 font-sans text-xs text-[#7d766e]">{orders.length}</span></h3>
      {orders.length ? orders.map((order) => <KitchenCard key={order.id} order={order} compact={compact} />) : <div className="rounded-2xl border border-dashed border-[#e2d9cf]"><Empty text={empty} /></div>}
    </section>
  )
}

function MiniOrder({ order }: { order: Order }) {
  const { openOrder } = useDashboardNav()
  return <button onClick={() => openOrder(order.id)} className="flex items-center gap-2 rounded-xl border border-[#eeeae3] p-2 text-left text-xs">{orderImage(order) && <img src={orderImage(order)} alt="" className="h-10 w-10 rounded-lg object-cover" />}<span><strong>{order.id}</strong> {order.urgent && <Pill tone="urgent">URGENT</Pill>}<span className="block text-[#8f8981]">{order.items[0]?.name} · {formatDateTime(order.dueAt)}</span></span></button>
}

function KitchenCard({ order, compact }: { order: Order; compact?: boolean }) {
  const { state, actor, commit } = useBakery()
  const { openOrder } = useDashboardNav()
  const [note, setNote] = useState("")
  const actions = availableActions(state, order, actor).filter((action) => ["claim", "start", "ready"].includes(action))
  const customerNotes = order.notes.filter((item) => item.kind === "Customer")
  const kitchenNotes = order.notes.filter((item) => item.kind === "Kitchen")
  const allergens = [...new Set(order.items.flatMap((item) => state.products.find((product) => product.id === item.productId)?.allergens ?? []))]
  return (
    <article className={`overflow-hidden rounded-2xl border bg-white ${order.urgent ? "border-red-300 ring-2 ring-red-100" : "border-[#e9e4dc]"}`}>
      {order.urgent && <div className="flex items-center justify-between bg-red-600 px-4 py-1.5 text-xs font-black tracking-widest text-white"><span className="flex items-center gap-1"><Zap size={13} /> URGENT</span><span>due {formatTime(order.dueAt)}</span></div>}
      {!compact && orderImage(order) && <button onClick={() => openOrder(order.id)} className="block w-full"><img src={orderImage(order)} alt={`${order.items[0]?.name} reference`} className="h-48 w-full object-cover" /></button>}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div><p className="text-xs font-bold text-[#b86e53]">{order.id} · {order.type}</p><h4 className="mt-1 font-serif text-xl font-bold">{order.items.map((item) => `${item.quantity > 1 ? `${item.quantity}× ` : ""}${item.name}`).join(" + ")}</h4></div>
          <div className="flex flex-col items-end gap-1"><StatusBadge status={order.status} /><Countdown order={order} /></div>
        </div>
        <p className="mt-1 text-xs text-[#7d746c]">{order.items.map((item) => `${item.size} · ${item.flavor}`).join(" | ")} · {orderWeightKg(order)} kg total · due {formatDateTime(order.dueAt)}</p>
        {!compact && <>
          {order.items.filter((item) => item.message).map((item, index) => <p key={index} className="mt-3 rounded-lg bg-[#fff5e7] p-3 text-center font-serif text-2xl font-bold leading-tight text-[#6c4a2a]">“{item.message}”</p>)}
          <p className="mt-3 text-xs"><strong>Design:</strong> {order.items.map((item) => item.design).join(" | ")}</p>
          {customerNotes.map((item) => <p key={item.id} className="mt-2 flex gap-1.5 rounded-lg bg-amber-50 p-2 text-xs font-semibold text-amber-900"><AlertTriangle size={13} className="mt-0.5 shrink-0" />{item.text}</p>)}
          {allergens.length > 0 && <p className="mt-2 text-[11px] text-[#8f8279]"><ShieldCheck size={11} className="mr-1 inline text-[#d58a68]" />{allergens.join(", ")}</p>}
          {kitchenNotes.map((item) => <p key={item.id} className="mt-2 text-xs text-[#6f675f]"><strong>{item.by}:</strong> {item.text}</p>)}
        </>}
        <p className="mt-3 text-xs text-[#8f8981]">Chef: <strong className="text-[#3d3731]">{order.chef || "Unassigned"}</strong>{order.accountability.chefAcceptedBy && " ✓ accepted"}{order.accountability.prepStartedBy && ` · started ${formatTime(order.timeline.find((event) => event.key === "prepStartedBy")?.at)}`}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {actions.map((action) => <Button key={action} className="flex-1 py-2.5" onClick={() => commit((s, a) => transitionOrder(s, a, order.id, action), `${order.id} ${ACTION_META[action].done}`)}>{ACTION_META[action].label.replace("Chef: a", "A")}</Button>)}
          <Button tone="neutral" onClick={() => openOrder(order.id)}>Details</Button>
        </div>
        {!compact && (
          <div className="mt-2 flex gap-2">
            <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Kitchen note / issue…" className="flex-1 rounded-lg border border-[#e4dfd7] px-3 py-1.5 text-xs" />
            <Button tone="ghost" disabled={!note.trim()} onClick={() => { commit((s, a) => addOrderNote(s, a, order.id, "Kitchen", note), "Kitchen note added"); setNote("") }}>Add</Button>
          </div>
        )}
      </div>
    </article>
  )
}

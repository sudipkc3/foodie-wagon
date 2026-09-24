"use client"

import { useState } from "react"
import { AlertTriangle, ChefHat, Clock3, PackageCheck, Printer, ShieldCheck, UserRound, Zap } from "lucide-react"
import { useBakery } from "@/lib/bakery/store"
import { ACTION_META, addOrderNote, availableActions, recipeUsage, transitionOrder } from "@/lib/bakery/workflow"
import { addDays, dayKey, formatDateTime, formatDay, formatTime, orderImage, orderWeightKg } from "@/lib/bakery/format"
import type { Order } from "@/lib/bakery/types"
import { useDashboardNav } from "./nav-context"
import { Countdown } from "./order-detail"
import { byPriority } from "./orders"
import { Button, Card, Empty, Metric, PageHeading, Pill, StatusBadge, Table, Td, Tabs } from "./ui"

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
          {actions.map((action) => <Button key={action} className="flex-1 py-2.5" onClick={() => commit((s, a) => transitionOrder(s, a, order.id, action))}>{ACTION_META[action].label.replace("Chef: a", "A")}</Button>)}
          <Button tone="neutral" onClick={() => openOrder(order.id)}>Details</Button>
        </div>
        {!compact && (
          <div className="mt-2 flex gap-2">
            <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Kitchen note / issue…" className="flex-1 rounded-lg border border-[#e4dfd7] px-3 py-1.5 text-xs" />
            <Button tone="ghost" disabled={!note.trim()} onClick={() => { commit((s, a) => addOrderNote(s, a, order.id, "Kitchen", note)); setNote("") }}>Add</Button>
          </div>
        )}
      </div>
    </article>
  )
}

// ---- Production plan -------------------------------------------------------------------

export function ProductionPage() {
  const { state } = useBakery()
  const [offset, setOffset] = useState(0)
  const date = addDays(new Date(), offset)
  const orders = state.orders.filter((order) => dayKey(order.dueAt) === dayKey(date) && !["Cancelled"].includes(order.status)).sort((a, b) => a.dueAt.localeCompare(b.dueAt))
  const toBake = orders.filter((order) => ["New", "Accepted", "Preparing"].includes(order.status))
  const lines = new Map<string, { product: string; flavor: string; size: string; count: number; kg: number }>()
  for (const order of toBake) for (const item of order.items) {
    const key = `${item.name}|${item.flavor}|${item.size}`
    const line = lines.get(key) ?? { product: item.name, flavor: item.flavor, size: item.size, count: 0, kg: 0 }
    line.count += item.quantity
    line.kg += item.weightKg * item.quantity
    lines.set(key, line)
  }
  const usage = recipeUsage(state, toBake.filter((order) => !order.stockDeducted).flatMap((order) => order.items))
  const needs = [...usage.entries()].map(([id, amount]) => ({ ingredient: state.ingredients.find((item) => item.id === id)!, amount })).filter((row) => row.ingredient).sort((a, b) => a.ingredient.name.localeCompare(b.ingredient.name))

  return (
    <div className="space-y-6">
      <PageHeading eyebrow="Production planning" title="Bake list" description="Everything due on a day, grouped for the kitchen, with a start-by time and the ingredients still needed from stock."
        actions={<><Tabs tabs={["Today", "Tomorrow", "+2 days", "+3 days"] as const} active={(["Today", "Tomorrow", "+2 days", "+3 days"] as const)[offset]} onChange={(tab) => setOffset(["Today", "Tomorrow", "+2 days", "+3 days"].indexOf(tab))} /><Button tone="neutral" onClick={() => window.print()}><Printer size={14} /> Print</Button></>} />
      <div className="grid gap-4 sm:grid-cols-4">
        <Metric label="Orders due" value={orders.length} icon={PackageCheck} hint={formatDay(date.toISOString())} />
        <Metric label="Still to bake" value={toBake.length} icon={ChefHat} />
        <Metric label="Cake weight to bake" value={`${[...lines.values()].reduce((sum, line) => sum + line.kg, 0).toFixed(1)} kg`} icon={Clock3} />
        <Metric label="Ingredient shortages" value={needs.filter((row) => row.amount > row.ingredient.stock).length} icon={AlertTriangle} tone={needs.some((row) => row.amount > row.ingredient.stock) ? "bad" : "good"} hint={needs.some((row) => row.amount > row.ingredient.stock) ? "Order stock now" : "Stock covers the plan"} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <Card title="What to bake" subtitle="Grouped by cake, flavor and size">
          {lines.size === 0 ? <Empty text="Nothing left to bake for this day." /> : (
            <Table minWidth={420} headings={["Cake", "Flavor", "Size", "Qty", "Total kg"]}>
              {[...lines.values()].map((line) => <tr key={`${line.product}${line.flavor}${line.size}`}><Td className="font-semibold">{line.product}</Td><Td>{line.flavor}</Td><Td>{line.size}</Td><Td className="font-bold">{line.count}</Td><Td>{line.kg.toFixed(1)}</Td></tr>)}
            </Table>
          )}
        </Card>
        <Card title="Ingredients needed" subtitle="From recipes for orders not yet started">
          {needs.length === 0 ? <Empty text="No ingredient needs." /> : (
            <Table minWidth={380} headings={["Ingredient", "Needed", "In stock", ""]}>
              {needs.map(({ ingredient, amount }) => <tr key={ingredient.id}><Td>{ingredient.name}</Td><Td>{amount.toFixed(2)} {ingredient.unit}</Td><Td>{ingredient.stock} {ingredient.unit}</Td><Td>{amount > ingredient.stock ? <Pill tone="urgent">SHORT</Pill> : ingredient.stock - amount < ingredient.reorderLevel ? <Pill tone="warn">Reorder</Pill> : <Pill tone="good">OK</Pill>}</Td></tr>)}
            </Table>
          )}
        </Card>
      </div>
      <Card title="Schedule" subtitle="Start-by time uses each product's preparation time">
        <Table minWidth={720} headings={["Start by", "Due", "Order", "Cake", "Message", "Chef", "Status"]}>
          {orders.map((order) => {
            const prep = Math.max(...order.items.map((item) => state.products.find((product) => product.id === item.productId)?.prepMinutes ?? 120))
            const startBy = new Date(new Date(order.dueAt).getTime() - prep * 60000)
            const late = startBy.getTime() < Date.now() && ["New", "Accepted"].includes(order.status)
            return <ScheduleRow key={order.id} order={order} startBy={startBy} late={late} />
          })}
        </Table>
      </Card>
    </div>
  )
}

function ScheduleRow({ order, startBy, late }: { order: Order; startBy: Date; late: boolean }) {
  const { openOrder } = useDashboardNav()
  return (
    <tr onClick={() => openOrder(order.id)} className="cursor-pointer hover:bg-[#fdfbf8]">
      <Td className={late ? "font-bold text-red-600" : ""}>{formatTime(startBy.toISOString())}{late && " ⚠"}</Td>
      <Td>{formatTime(order.dueAt)}</Td>
      <Td><span className="font-bold">{order.id}</span> {order.urgent && <Pill tone="urgent">URGENT</Pill>}</Td>
      <Td>{order.items.map((item) => `${item.quantity}× ${item.name} ${item.size}`).join(", ")}</Td>
      <Td className="text-xs">{order.items.map((item) => item.message).filter(Boolean).join(" | ") || "—"}</Td>
      <Td className="text-xs">{order.chef || "—"}</Td>
      <Td><StatusBadge status={order.status} /></Td>
    </tr>
  )
}

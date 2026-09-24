"use client"

import { useState } from "react"
import { Check, MapPin, MessageCircle, Navigation, Phone, Truck, UserRound, XCircle } from "lucide-react"
import { useBakery } from "@/lib/bakery/store"
import { ACTION_META, assignStaff, availableActions, transitionOrder } from "@/lib/bakery/workflow"
import { dayKey, formatDateTime, formatTime, money, orderBalance, orderTitle } from "@/lib/bakery/format"
import type { Order } from "@/lib/bakery/types"
import { useDashboardNav } from "./nav-context"
import { byPriority } from "./orders"
import { Button, Card, Countdown, Empty, Metric, PageHeading, Pill, StatusBadge, Table, Tabs, Td, inputClass } from "./ui"

const STEPS = ["Assigned", "Picked Up", "Out for Delivery", "Delivered"] as const

export function DeliveryPage() {
  const { can } = useBakery()
  return can("delivery.viewAll") ? <Dispatch /> : <RiderView />
}

function RiderView() {
  const { state, actor } = useBakery()
  const mine = state.orders.filter((order) => order.type === "Delivery" && order.rider === actor?.name)
  const active = mine.filter((order) => ["Accepted", "Preparing", "Ready", "Picked Up", "Out for Delivery", "Delivery Failed"].includes(order.status)).sort(byPriority)
  const history = mine.filter((order) => ["Delivered", "Completed"].includes(order.status)).sort((a, b) => b.dueAt.localeCompare(a.dueAt))
  const today = history.filter((order) => dayKey(order.dueAt) === dayKey())
  return (
    <div className="space-y-6">
      <PageHeading eyebrow="My deliveries" title={`Drive safe, ${actor?.name.split(" ")[0]}`} description="Your assigned cakes, customer contacts and one-tap status updates." />
      <div className="grid grid-cols-3 gap-3">
        <Metric label="Assigned" value={active.length} icon={Truck} />
        <Metric label="Delivered today" value={today.length} icon={Check} tone="good" />
        <Metric label="Cash to collect" value={money(active.reduce((sum, order) => sum + orderBalance(order), 0))} icon={UserRound} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">{active.length ? active.map((order) => <RiderCard key={order.id} order={order} />) : <Card className="md:col-span-2"><Empty text="No deliveries assigned to you right now." /></Card>}</div>
      <Card title="Delivery history" subtitle={`${history.length} completed deliveries`}>
        <Table minWidth={520} headings={["Order", "Customer", "Address", "Delivered"]}>
          {history.slice(0, 30).map((order) => <tr key={order.id}><Td className="font-bold">{order.id}</Td><Td>{order.customer.name}</Td><Td className="text-xs">{order.address}</Td><Td className="text-xs">{formatDateTime(order.timeline.find((event) => event.key === "deliveredBy")?.at ?? order.dueAt)}</Td></tr>)}
        </Table>
      </Card>
    </div>
  )
}

function RiderCard({ order }: { order: Order }) {
  const { state, actor, commit } = useBakery()
  const { openOrder } = useDashboardNav()
  const actions = availableActions(state, order, actor).filter((action) => ["riderPickup", "outForDelivery", "delivered", "failed"].includes(action))
  const stepIndex = order.status === "Picked Up" ? 1 : order.status === "Out for Delivery" ? 2 : order.status === "Delivered" ? 3 : 0
  const phone = order.customer.phone.replace(/[^\d+]/g, "")
  const balance = orderBalance(order)
  const deliveryNotes = order.notes.filter((note) => note.kind === "Delivery" || note.kind === "Customer")
  return (
    <article className={`rounded-2xl border bg-white p-5 ${order.urgent ? "border-red-300" : "border-[#e9e4dc]"}`}>
      <div className="flex items-start justify-between gap-2">
        <div><p className="text-xs font-bold text-[#b86e53]">{order.id} {order.urgent && <Pill tone="urgent">URGENT</Pill>}</p><h3 className="mt-1 font-serif text-2xl font-bold">{order.customer.name}</h3></div>
        <div className="flex flex-col items-end gap-1"><StatusBadge status={order.status === "Ready" ? "Assigned" : order.status} /><Countdown order={order} /></div>
      </div>
      <p className="mt-3 flex gap-2 text-sm text-[#4f4841]"><MapPin size={17} className="shrink-0 text-[#d58a68]" />{order.address}</p>
      <p className="mt-1 text-xs text-[#8f8981]">Deliver by {formatDateTime(order.dueAt)} · {orderTitle(order)}</p>
      {deliveryNotes.map((note) => <p key={note.id} className="mt-2 rounded-lg bg-violet-50 p-2 text-xs text-violet-900">{note.text}</p>)}
      {balance > 0 && <p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs font-bold text-amber-800">Collect {money(balance)} on delivery</p>}
      {order.status === "Delivery Failed" && <p className="mt-2 rounded-lg bg-red-50 p-2 text-xs text-red-700">Failed: {order.failedReason}. Bring the cake back to the bakery.</p>}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <a href={`tel:${phone}`} className="flex flex-col items-center gap-1 rounded-xl border border-[#e4dcd5] py-2.5 text-[11px] font-bold"><Phone size={17} />Call</a>
        <a target="_blank" rel="noreferrer" href={`https://wa.me/${phone.replace("+", "")}`} className="flex flex-col items-center gap-1 rounded-xl border border-[#e4dcd5] py-2.5 text-[11px] font-bold"><MessageCircle size={17} />WhatsApp</a>
        <a target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.address)}`} className="flex flex-col items-center gap-1 rounded-xl border border-[#e4dcd5] py-2.5 text-[11px] font-bold"><Navigation size={17} />Navigate</a>
      </div>
      <ol className="mt-4 flex items-center gap-1">
        {STEPS.map((step, index) => <li key={step} className="flex flex-1 flex-col items-center gap-1 text-center"><span className={`h-1.5 w-full rounded-full ${index <= stepIndex ? "bg-[#ee9633]" : "bg-[#eee6df]"}`} /><span className={`text-[10px] ${index <= stepIndex ? "font-bold text-[#c76a10]" : "text-[#a79d95]"}`}>{step}</span></li>)}
      </ol>
      {["Accepted", "Preparing"].includes(order.status) && <p className="mt-3 text-center text-xs text-[#8f8981]">Cake is still in the kitchen.</p>}
      <div className="mt-4 flex gap-2">
        {actions.map((action) => (
          ACTION_META[action].input || (action === "delivered" && balance > 0)
            ? <Button key={action} className="flex-1 py-3" tone={action === "failed" ? "danger" : "primary"} onClick={() => openOrder(order.id)}>{action === "failed" ? <XCircle size={14} /> : null}{ACTION_META[action].label}</Button>
            : <Button key={action} className="flex-1 py-3" onClick={() => commit((s, a) => transitionOrder(s, a, order.id, action))}>{ACTION_META[action].label}</Button>
        ))}
      </div>
    </article>
  )
}

const DISPATCH_TABS = ["Pending delivery", "Assigned", "Out for delivery", "Delivered", "Failed"] as const
type DispatchTab = (typeof DISPATCH_TABS)[number]

function Dispatch() {
  const { state, commit, can } = useBakery()
  const { openOrder } = useDashboardNav()
  const [tab, setTab] = useState<DispatchTab>("Pending delivery")
  const deliveries = state.orders.filter((order) => order.type === "Delivery")
  const groups: Record<DispatchTab, Order[]> = {
    "Pending delivery": deliveries.filter((order) => ["New", "Accepted", "Preparing", "Ready"].includes(order.status) && !order.rider),
    Assigned: deliveries.filter((order) => ["Accepted", "Preparing", "Ready"].includes(order.status) && order.rider),
    "Out for delivery": deliveries.filter((order) => ["Picked Up", "Out for Delivery"].includes(order.status)),
    Delivered: deliveries.filter((order) => ["Delivered", "Completed"].includes(order.status) && dayKey(order.dueAt) === dayKey()),
    Failed: deliveries.filter((order) => order.status === "Delivery Failed"),
  }
  const riders = state.staff.filter((member) => member.role === "Rider")
  const onShift = (id: string) => state.attendance.some((record) => record.staffId === id && !record.checkOut)
  return (
    <div className="space-y-6">
      <PageHeading eyebrow="Delivery management" title="Routes, riders & ready cakes" description="Assign riders, watch deliveries move, and handle failed attempts." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {riders.map((rider) => {
          const load = deliveries.filter((order) => order.rider === rider.name && !["Delivered", "Completed", "Cancelled"].includes(order.status)).length
          return <div key={rider.id} className="rounded-2xl border border-[#e9e4dc] bg-white p-4"><div className="flex items-center justify-between"><p className="font-bold">{rider.name}</p><Pill tone={onShift(rider.id) ? "good" : "default"}>{onShift(rider.id) ? "On shift" : "Off shift"}</Pill></div><p className="mt-2 text-xs text-[#8f8981]">{load} active deliveries · {deliveries.filter((order) => order.rider === rider.name && order.accountability.deliveredBy && dayKey(order.dueAt) === dayKey()).length} delivered today</p></div>
        })}
      </div>
      <Tabs tabs={DISPATCH_TABS} active={tab} onChange={setTab} counts={Object.fromEntries(DISPATCH_TABS.map((item) => [item, groups[item].length]))} />
      <Card>
        {groups[tab].length === 0 ? <Empty text="Nothing here." /> : (
          <Table minWidth={900} headings={["Order", "Customer & address", "Due", "Status", "Rider", ""]}>
            {groups[tab].sort(byPriority).map((order) => (
              <tr key={order.id} className="hover:bg-[#fdfbf8]">
                <Td><button onClick={() => openOrder(order.id)} className="font-bold text-[#c76a10] hover:underline">{order.id}</button> {order.urgent && <Pill tone="urgent">URGENT</Pill>}</Td>
                <Td><p className="font-semibold">{order.customer.name}</p><p className="text-xs text-[#8f8981]">{order.address}</p></Td>
                <Td className="text-xs">{formatDateTime(order.dueAt)}<div className="mt-1"><Countdown order={order} /></div></Td>
                <Td><StatusBadge status={order.status} />{order.failedReason && order.status === "Delivery Failed" && <p className="mt-1 text-[11px] text-red-600">{order.failedReason}</p>}</Td>
                <Td>
                  <select disabled={!can("orders.assign") || ["Out for Delivery", "Picked Up", "Delivered", "Completed"].includes(order.status)} value={order.rider} onChange={(event) => commit((s, a) => assignStaff(s, a, order.id, "rider", event.target.value))} className={`${inputClass} mt-0 py-1.5 text-xs`}>
                    <option value="">Unassigned</option>
                    {riders.filter((rider) => rider.status === "Active").map((rider) => <option key={rider.id} value={rider.name}>{rider.name}{onShift(rider.id) ? " · on shift" : ""}</option>)}
                  </select>
                </Td>
                <Td className="text-right text-xs text-[#8f8981]">{order.status === "Delivered" ? `at ${formatTime(order.timeline.find((event) => event.key === "deliveredBy")?.at)}` : <Button tone="ghost" onClick={() => openOrder(order.id)}>Open</Button>}</Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  )
}

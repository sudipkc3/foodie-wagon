"use client"

import { useState, type ReactNode } from "react"
import { AlertTriangle, Check, ChefHat, Clock3, CreditCard, PackageCheck, Plus, Search, ShoppingBag, Truck, UserCheck, Users, Zap } from "lucide-react"
import { useBakery, useNow } from "@/lib/bakery/store"
import { transitionOrder } from "@/lib/bakery/workflow"
import { openRecord, shiftFor, lateMinutes } from "@/lib/bakery/operations"
import { dayKey, formatDateTime, money, orderBalance, orderImage, orderPaid, orderTitle, orderTotal, relativeTime } from "@/lib/bakery/format"
import type { BakeryState, Order } from "@/lib/bakery/types"
import { useDashboardNav, type PageId } from "./nav-context"
import { byPriority, OrderTable } from "./orders"
import { Avatar, Button, Card, Countdown, Empty, Metric, PageHeading, Pill, StatusBadge } from "./ui"

export function useAlerts() {
  const { state, can } = useBakery()
  const now = useNow(60000)
  const today = dayKey()
  const alerts: { text: string; page: PageId; tone: "bad" | "warn" }[] = []
  const overdue = state.orders.filter((order) => new Date(order.dueAt).getTime() < now && ["New", "Accepted", "Preparing", "Ready", "Picked Up", "Out for Delivery"].includes(order.status))
  if (overdue.length && can("orders.view")) alerts.push({ text: `${overdue.length} order(s) past their due time`, page: "Orders", tone: "bad" })
  const incoming = state.orders.filter((order) => order.status === "New")
  if (incoming.length && can("orders.edit")) alerts.push({ text: `${incoming.length} new order(s) waiting for acceptance`, page: can("orders.create") ? "Front desk" : "Orders", tone: "warn" })
  const low = state.ingredients.filter((item) => item.stock <= item.reorderLevel)
  if (low.length && can("inventory.view")) alerts.push({ text: `${low.length} ingredient(s) at or below reorder level`, page: "Inventory", tone: "warn" })
  const outOfRange = state.temperatureLogs.filter((log) => dayKey(log.at) === today).filter((log) => { const eq = state.equipment.find((item) => item.id === log.equipmentId); return eq && (log.value < eq.min || log.value > eq.max) && !log.action })
  if (outOfRange.length && can("foodsafety.log")) alerts.push({ text: `${outOfRange.length} temperature reading(s) out of range without corrective action`, page: "Food safety", tone: "bad" })
  const missingTemps = state.equipment.filter((eq) => !state.temperatureLogs.some((log) => log.equipmentId === eq.id && dayKey(log.at) === today))
  if (missingTemps.length && can("foodsafety.log") && new Date(now).getHours() >= 9) alerts.push({ text: `${missingTemps.length} unit(s) without a temperature check today`, page: "Food safety", tone: "warn" })
  if (can("attendance.checkin") && !can("attendance.team")) {
    const expected = notCheckedIn(state, now)
    if (expected.length) alerts.push({ text: `${expected.length} worker(s) expected but not checked in`, page: "Staff check-in", tone: "warn" })
  }
  if (can("attendance.team")) {
    const missing = notCheckedIn(state, now)
    if (missing.length) alerts.push({ text: `${missing.map((item) => item.name.split(" ")[0]).join(", ")} scheduled but not checked in`, page: "Attendance", tone: "warn" })
    const leave = state.leave.filter((item) => item.status === "Pending")
    if (leave.length && can("attendance.manage")) alerts.push({ text: `${leave.length} leave request(s) to review`, page: "Attendance", tone: "warn" })
  }
  return alerts
}

export const notCheckedIn = (state: BakeryState, now = Date.now()) =>
  state.staff.filter((member) => {
    const shift = shiftFor(state, member.id)
    if (!shift || member.status !== "Active") return false
    const start = new Date(`${shift.date}T${shift.start}:00`).getTime()
    const hasRecord = state.attendance.some((record) => record.staffId === member.id && record.date === shift.date)
    return !hasRecord && now > start + state.settings.lateGraceMinutes * 60000 && now < new Date(`${shift.date}T${shift.end}:00`).getTime()
  })

function AlertList() {
  const alerts = useAlerts()
  const { navigate } = useDashboardNav()
  if (!alerts.length) return null
  return (
    <div className="grid gap-2 md:grid-cols-2">
      {alerts.map((alert) => <button key={alert.text} onClick={() => navigate(alert.page)} className={`flex items-center gap-2 rounded-xl border p-3 text-left text-xs font-semibold ${alert.tone === "bad" ? "border-red-200 bg-red-50 text-red-800" : "border-amber-200 bg-amber-50 text-amber-900"}`}><AlertTriangle size={15} className="shrink-0" />{alert.text}<span className="ml-auto text-[10px] underline">Open</span></button>)}
    </div>
  )
}

export function OverviewPage() {
  const { state, actor, can } = useBakery()
  const { navigate, openOrder } = useDashboardNav()
  const today = dayKey()
  const dueToday = state.orders.filter((order) => dayKey(order.dueAt) === today && order.status !== "Cancelled")
  const open = state.orders.filter((order) => !["Completed", "Cancelled"].includes(order.status))
  const urgent = open.filter((order) => order.urgent).sort(byPriority)
  const completedToday = state.orders.filter((order) => order.status === "Completed" && order.timeline.some((event) => (event.key === "completedBy" || event.key === "handedOverBy") && dayKey(event.at) === today))
  const collectedToday = state.orders.flatMap((order) => order.transactions).filter((tx) => dayKey(tx.at) === today).reduce((sum, tx) => sum + (tx.kind === "Payment" ? tx.amount : -tx.amount), 0)
  const salesToday = dueToday.reduce((sum, order) => sum + orderTotal(order), 0)
  const onShift = state.attendance.filter((record) => !record.checkOut)
  return (
    <div className="space-y-6">
      <PageHeading eyebrow={new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} title={`Hello, ${actor?.name.split(" ")[0]}`} description="Today's bakery at a glance." />
      <AlertList />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
        <Metric label="Due today" value={dueToday.length} icon={ShoppingBag} onClick={() => navigate("Orders")} />
        <Metric label="Pending" value={open.filter((order) => order.status === "New").length} icon={Clock3} hint="awaiting acceptance" />
        <Metric label="Preparing" value={open.filter((order) => ["Accepted", "Preparing"].includes(order.status)).length} icon={ChefHat} onClick={() => navigate("Kitchen")} />
        <Metric label="Ready" value={open.filter((order) => order.status === "Ready").length} icon={PackageCheck} />
        <Metric label="Deliveries" value={open.filter((order) => order.type === "Delivery" && ["Ready", "Picked Up", "Out for Delivery"].includes(order.status)).length} icon={Truck} onClick={() => navigate("Delivery")} />
        <Metric label="Completed today" value={completedToday.length} icon={Check} tone="good" />
        {can("payments.view") && <Metric label="Collected today" value={money(collectedToday)} icon={CreditCard} hint={`${money(salesToday)} booked for today`} />}
      </div>

      <div className={`grid gap-6 ${can("attendance.team") ? "xl:grid-cols-[1.25fr_.75fr]" : ""}`}>
        <Card title="Urgent orders" subtitle="Emergency and urgent cakes, soonest first" action={<Zap size={18} className="text-red-500" />}>
          <div className="space-y-3">
            {urgent.length ? urgent.map((order) => (
              <button key={order.id} onClick={() => openOrder(order.id)} className="flex w-full items-center gap-3 rounded-xl bg-red-50/60 p-3 text-left">
                {orderImage(order) && <img src={orderImage(order)} alt="" className="h-14 w-14 rounded-lg object-cover" />}
                <span className="min-w-0 flex-1"><strong className="block text-sm">{order.id} · {order.customer.name}</strong><span className="mt-1 block text-xs text-[#897c73]">{orderTitle(order)} · {order.chef || "no chef yet"}</span></span>
                <span className="flex flex-col items-end gap-1"><StatusBadge status={order.status} /><Countdown order={order} /></span>
              </button>
            )) : <Empty text="No urgent orders right now." />}
          </div>
        </Card>
        {can("attendance.team") && (
          <Card title="Team on shift" subtitle={`${onShift.length} checked in`} action={<Button tone="ghost" onClick={() => navigate("Attendance")}>Attendance</Button>}>
            <TeamNow />
          </Card>
        )}
      </div>

      <Card title="Order pipeline" subtitle="Open orders by stage">
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {(["New", "Accepted", "Preparing", "Ready", "Out for Delivery", "Delivered"] as const).map((status) => {
            const count = open.filter((order) => order.status === status || (status === "Out for Delivery" && order.status === "Picked Up")).length
            return <div key={status} className="rounded-xl bg-[#fcfaf8] p-4"><p className="text-xs text-[#8d8178]">{status}</p><p className="mt-2 text-2xl font-bold">{count}</p><div className="mt-3 h-1.5 rounded-full bg-[#eee6df]"><div className="h-full rounded-full bg-[#e8a05a]" style={{ width: `${open.length ? (count / open.length) * 100 : 0}%` }} /></div></div>
          })}
        </div>
      </Card>

      <div className={`grid gap-6 ${actor?.role === "Admin" ? "xl:grid-cols-[1.25fr_.75fr]" : ""}`}>
        <Card title="Today's orders" subtitle="Everything due today">
          <OrderTable compact orders={[...dueToday].sort(byPriority)} />
        </Card>
        {actor?.role === "Admin" && <ActivityFeed />}
      </div>
    </div>
  )
}

function TeamNow() {
  const { state } = useBakery()
  const now = useNow(60000)
  const missing = notCheckedIn(state, now)
  return (
    <div className="space-y-2">
      {state.staff.filter((member) => openRecord(state, member.id)).map((member) => {
        const record = openRecord(state, member.id)!
        const late = lateMinutes(state, record)
        const breakActive = record.breaks.some((item) => !item.end)
        return <div key={member.id} className="flex items-center gap-3 text-sm"><Avatar name={member.name} initials={member.initials} size={30} /><span className="flex-1"><strong>{member.name}</strong><span className="block text-[11px] text-[#8f8981]">{member.role} · since {new Date(record.checkIn).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span></span>{breakActive ? <Pill tone="warn">On break</Pill> : late ? <Pill tone="warn">Late {late}m</Pill> : <Pill tone="good">Working</Pill>}</div>
      })}
      {missing.map((member) => <div key={member.id} className="flex items-center gap-3 text-sm opacity-80"><Avatar name={member.name} initials={member.initials} size={30} /><span className="flex-1"><strong>{member.name}</strong><span className="block text-[11px] text-[#8f8981]">Shift started {shiftFor(state, member.id)?.start}</span></span><Pill tone="urgent">Not in</Pill></div>)}
    </div>
  )
}

export function ActivityFeed({ limit = 8 }: { limit?: number }) {
  const { state } = useBakery()
  const orderEvents = state.orders.flatMap((order) => order.timeline.map((event) => ({ at: event.at, text: `${event.by} · ${event.label.toLowerCase()}`, ref: order.id })))
  const events = [...state.activity.map((event) => ({ at: event.at, text: `${event.by} ${event.action}`, ref: event.ref })), ...orderEvents].sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit)
  return (
    <Card title="Staff activity" subtitle="Admin only">
      <div className="space-y-3">{events.map((event, index) => <div key={index} className="flex gap-3 text-xs"><Check size={14} className="mt-0.5 shrink-0 text-emerald-500" /><span><strong>{event.ref}</strong> {event.text} <span className="text-[#9a8e86]">· {relativeTime(event.at)}</span></span></div>)}</div>
    </Card>
  )
}

// ---- Reception / front desk ---------------------------------------------------------------

export function FrontDeskPage() {
  const { state, commit, can } = useBakery()
  const { newOrder, openOrder, navigate } = useDashboardNav()
  const [query, setQuery] = useState("")
  const open = state.orders.filter((order) => !["Completed", "Cancelled"].includes(order.status))
  const incoming = open.filter((order) => order.status === "New").sort(byPriority)
  const urgent = open.filter((order) => order.urgent && order.status !== "New").sort(byPriority)
  const pickups = open.filter((order) => order.type === "Pickup" && order.status === "Ready").sort(byPriority)
  const needsRider = open.filter((order) => order.type === "Delivery" && !order.rider && ["Accepted", "Preparing", "Ready"].includes(order.status)).sort(byPriority)
  const delivered = open.filter((order) => order.status === "Delivered")
  const unpaidToday = open.filter((order) => dayKey(order.dueAt) === dayKey() && orderBalance(order) > 0)
  const q = query.trim().toLowerCase()
  const results = q.length >= 2 ? state.orders.filter((order) => `${order.id} ${order.customer.name} ${order.customer.phone}`.toLowerCase().includes(q)).slice(0, 8) : []
  return (
    <div className="space-y-6">
      <PageHeading eyebrow="Reception" title="Front desk" description="Accept incoming orders, serve walk-ins fast, hand over cakes and collect payments."
        actions={can("orders.create") && <>{can("attendance.checkin") && <Button tone="neutral" onClick={() => navigate("Staff check-in")}><UserCheck size={14} /> Staff check-in</Button>}<Button tone="danger" onClick={() => newOrder({ source: "Emergency", urgent: true })}><Zap size={14} /> Emergency cake</Button><Button tone="neutral" onClick={() => newOrder({ source: "Walk-in" })}><Users size={14} /> Walk-in</Button><Button onClick={() => newOrder({ source: "Reception" })}><Plus size={14} /> New order</Button></>} />
      <div className="relative">
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aaa59d]" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-2xl border border-[#e5e1da] bg-white py-3.5 pl-11 pr-4 text-sm" placeholder="Customer search — name, phone or order ID" />
        {results.length > 0 && (
          <div className="absolute inset-x-0 top-full z-20 mt-2 rounded-2xl border border-[#e9e4dc] bg-white p-2 shadow-xl">
            {results.map((order) => <button key={order.id} onClick={() => { openOrder(order.id); setQuery("") }} className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-[#faf8f4]"><span><strong>{order.id}</strong> · {order.customer.name} <span className="text-xs text-[#8f8981]">{order.customer.phone}</span></span><StatusBadge status={order.status} /></button>)}
          </div>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Metric label="Incoming" value={incoming.length} icon={ShoppingBag} tone={incoming.length ? "warn" : "default"} hint={`${incoming.filter((order) => order.source === "Website").length} from website`} />
        <Metric label="Urgent in progress" value={urgent.length} icon={Zap} />
        <Metric label="Ready for pickup" value={pickups.length} icon={PackageCheck} />
        <Metric label="Need a rider" value={needsRider.length} icon={Truck} />
        {can("payments.view") && <Metric label="Unpaid today" value={money(unpaidToday.reduce((sum, order) => sum + orderBalance(order), 0))} icon={CreditCard} />}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Incoming orders" subtitle="Website, phone and other new orders to accept">
          <div className="space-y-2">{incoming.length ? incoming.map((order) => <DeskRow key={order.id} order={order} action={can("orders.edit") ? <Button onClick={() => commit((s, a) => transitionOrder(s, a, order.id, "accept"), `${order.id} accepted`)}>Accept</Button> : null} />) : <Empty text="All caught up." />}</div>
        </Card>
        <Card title="Pickup counter" subtitle="Cakes ready for customers to collect">
          <div className="space-y-2">{pickups.length ? pickups.map((order) => <DeskRow key={order.id} order={order} action={<Button tone="dark" onClick={() => openOrder(order.id)}>{orderBalance(order) > 0 ? `Collect ${money(orderBalance(order))} & hand over` : "Hand over"}</Button>} />) : <Empty text="No cakes waiting for pickup." />}</div>
        </Card>
        <Card title="Emergency & urgent" subtitle="Keep the customer updated">
          <div className="space-y-2">{urgent.length ? urgent.map((order) => <DeskRow key={order.id} order={order} />) : <Empty text="No urgent cakes in progress." />}</div>
        </Card>
        <Card title="Delivery desk" subtitle="Assign riders and close delivered orders">
          <div className="space-y-2">
            {needsRider.map((order) => <DeskRow key={order.id} order={order} action={<Button tone="neutral" onClick={() => openOrder(order.id)}>Assign rider</Button>} />)}
            {delivered.map((order) => <DeskRow key={order.id} order={order} action={can("orders.complete") ? <Button onClick={() => openOrder(order.id)}>Close order</Button> : null} />)}
            {!needsRider.length && !delivered.length && <Empty text="Nothing needs attention." />}
          </div>
        </Card>
      </div>
    </div>
  )
}

function DeskRow({ order, action }: { order: Order; action?: ReactNode }) {
  const { openOrder } = useDashboardNav()
  return (
    <div className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 ${order.urgent ? "border-red-200 bg-red-50/40" : "border-[#eeeae3]"}`}>
      {orderImage(order) && <img src={orderImage(order)} alt="" className="h-12 w-12 rounded-lg object-cover" />}
      <button onClick={() => openOrder(order.id)} className="min-w-0 flex-1 text-left">
        <p className="text-sm font-bold">{order.id} · {order.customer.name} {order.urgent && <Pill tone="urgent">URGENT</Pill>}</p>
        <p className="text-xs text-[#8f8981]">{order.source} · {orderTitle(order)} · {order.type} {formatDateTime(order.dueAt)}{orderPaid(order) > 0 && ` · paid ${money(orderPaid(order))}`}</p>
      </button>
      <div className="flex items-center gap-2"><StatusBadge status={order.status} /><Countdown order={order} />{action}</div>
    </div>
  )
}

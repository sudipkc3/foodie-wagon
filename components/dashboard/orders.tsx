"use client"

import { useMemo, useState } from "react"
import { CalendarDays, Download, List, MapPin, Plus, Search, Zap } from "lucide-react"
import { useBakery } from "@/lib/bakery/store"
import { addDays, dayKey, downloadCsv, formatDateTime, formatDay, money, orderBalance, orderImage, orderTitle, orderTotal, paymentStatus } from "@/lib/bakery/format"
import { ORDER_SOURCES, type Order } from "@/lib/bakery/types"
import { useDashboardNav } from "./nav-context"
import { Button, Card, Countdown, Empty, PageHeading, PaymentBadge, Pill, Select, StatusBadge, Table, Tabs, Td } from "./ui"

const TABS = ["All", "New", "Preparing", "Ready", "Pickup", "Delivery", "Completed", "Cancelled"] as const
type Tab = (typeof TABS)[number]

const inTab = (order: Order, tab: Tab) => {
  switch (tab) {
    case "All": return true
    case "New": return order.status === "New"
    case "Preparing": return ["Accepted", "Preparing"].includes(order.status)
    case "Ready": return order.status === "Ready"
    case "Pickup": return order.type === "Pickup" && !["Completed", "Cancelled"].includes(order.status)
    case "Delivery": return order.type === "Delivery" && !["Completed", "Cancelled"].includes(order.status)
    case "Completed": return order.status === "Completed"
    case "Cancelled": return order.status === "Cancelled"
  }
}

// Orders sorted by what needs attention: urgent first, then soonest due.
export const byPriority = (a: Order, b: Order) => Number(b.urgent) - Number(a.urgent) || a.dueAt.localeCompare(b.dueAt)

export function OrdersPage() {
  const { state, can } = useBakery()
  const { newOrder } = useDashboardNav()
  const [tab, setTab] = useState<Tab>("All")
  const [view, setView] = useState<"list" | "calendar">("list")
  const [query, setQuery] = useState("")
  const [source, setSource] = useState("All sources")
  const [date, setDate] = useState("All dates")
  const [chef, setChef] = useState("All chefs")
  const [staff, setStaff] = useState("Any staff")

  const staffNames = state.staff.map((member) => member.name)
  const filtered = useMemo(() => {
    const today = dayKey()
    const tomorrow = dayKey(addDays(new Date(), 1))
    const weekEnd = addDays(new Date(), 7).getTime()
    const q = query.trim().toLowerCase()
    return state.orders.filter((order) => {
      const due = dayKey(order.dueAt)
      if (q && !`${order.id} ${order.customer.name} ${order.customer.phone} ${orderTitle(order)}`.toLowerCase().includes(q)) return false
      if (source !== "All sources" && order.source !== source) return false
      if (date === "Today" && due !== today) return false
      if (date === "Tomorrow" && due !== tomorrow) return false
      if (date === "Next 7 days" && (new Date(order.dueAt).getTime() > weekEnd || due < today)) return false
      if (date === "Overdue" && !(new Date(order.dueAt).getTime() < Date.now() && !["Completed", "Cancelled", "Delivered"].includes(order.status))) return false
      if (chef !== "All chefs" && order.chef !== chef) return false
      if (staff !== "Any staff" && !Object.values(order.accountability).includes(staff) && order.chef !== staff && order.rider !== staff) return false
      return true
    })
  }, [state.orders, query, source, date, chef, staff])
  const visible = filtered.filter((order) => inTab(order, tab)).sort(tab === "Completed" || tab === "Cancelled" || tab === "All" ? (a, b) => b.dueAt.localeCompare(a.dueAt) : byPriority)
  const counts = Object.fromEntries(TABS.map((item) => [item, filtered.filter((order) => inTab(order, item)).length])) as Record<Tab, number>

  const exportCsv = () => downloadCsv(`orders-${dayKey()}.csv`, [
    ["Order", "Status", "Source", "Type", "Due", "Customer", "Phone", "Items", "Total", "Balance", "Payment", "Chef", "Rider", "Created by"],
    ...visible.map((order) => [order.id, order.status, order.source, order.type, formatDateTime(order.dueAt), order.customer.name, order.customer.phone, order.items.map((item) => `${item.quantity}x ${item.name} ${item.size}`).join("; "), orderTotal(order).toFixed(2), orderBalance(order).toFixed(2), paymentStatus(order), order.chef, order.rider, order.accountability.createdBy ?? ""]),
  ])

  return (
    <div className="space-y-5">
      <PageHeading eyebrow="Orders" title="Every order, one workflow" description="Website, walk-in, reception, phone and emergency orders share the same lifecycle, timeline and accountability trail."
        actions={<>
          <Button tone="neutral" onClick={() => setView(view === "list" ? "calendar" : "list")}>{view === "list" ? <><CalendarDays size={14} /> Capacity calendar</> : <><List size={14} /> List view</>}</Button>
          {can("reports.view") && <Button tone="neutral" onClick={exportCsv}><Download size={14} /> Export</Button>}
          {can("orders.create") && <Button tone="danger" onClick={() => newOrder({ source: "Emergency", urgent: true })}><Zap size={14} /> Emergency</Button>}
          {can("orders.create") && <Button onClick={() => newOrder()}><Plus size={14} /> New order</Button>}
        </>} />
      {view === "calendar" ? <CapacityCalendar /> : <>
        <Tabs tabs={TABS} active={tab} onChange={setTab} counts={counts} />
        <Card>
          <div className="mb-4 flex flex-wrap gap-2">
            <div className="relative min-w-[220px] flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa59d]" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-lg border border-[#e5e1da] py-2 pl-8 pr-3 text-xs" placeholder="Search order ID, customer name or phone" /></div>
            <Select label="Date" value={date} onChange={setDate} options={["All dates", "Overdue", "Today", "Tomorrow", "Next 7 days"]} />
            <Select label="Source" value={source} onChange={setSource} options={["All sources", ...ORDER_SOURCES]} />
            <Select label="Chef" value={chef} onChange={setChef} options={["All chefs", ...state.staff.filter((member) => member.role === "Chef").map((member) => member.name)]} />
            <Select label="Staff member" value={staff} onChange={setStaff} options={["Any staff", ...staffNames]} />
          </div>
          <OrderTable orders={visible.slice(0, 150)} />
          {visible.length > 150 && <p className="mt-3 text-center text-xs text-[#9b8f87]">Showing 150 of {visible.length}. Narrow the filters to see more.</p>}
        </Card>
      </>}
    </div>
  )
}

export function OrderTable({ orders, compact }: { orders: Order[]; compact?: boolean }) {
  const { can } = useBakery()
  const { openOrder } = useDashboardNav()
  const showMoney = can("payments.view")
  if (!orders.length) return <Empty text="No orders here." />
  return (
    <Table minWidth={compact ? 640 : 960} headings={compact ? ["Order", "Customer", "Cake", "Due", "Status"] : ["Order", "Customer", "Cake details", "Fulfillment", "Staff", showMoney ? "Payment" : "", "Status"]}>
      {orders.map((order) => (
        <tr key={order.id} onClick={() => openOrder(order.id)} className="cursor-pointer hover:bg-[#fdfbf8]">
          <Td><span className="font-bold">{order.id}</span> {order.urgent && <Pill tone="urgent">URGENT</Pill>}<p className="mt-1 text-xs text-[#9d978e]">{order.source}</p></Td>
          <Td><p className="font-semibold">{order.customer.name}</p><p className="mt-1 text-xs text-[#9d978e]">{order.customer.phone}</p></Td>
          <Td>
            <div className="flex items-center gap-2">
              {orderImage(order) && <img src={orderImage(order)} alt="" className="h-10 w-10 rounded-lg object-cover" />}
              <div><p className="font-semibold">{orderTitle(order)}</p><p className="mt-1 text-xs text-[#9d978e]">{order.items[0]?.size} · {order.items[0]?.flavor}</p></div>
            </div>
          </Td>
          {compact ? <Td><p className="text-xs">{formatDateTime(order.dueAt)}</p><Countdown order={order} className="mt-1" /></Td> : <>
            <Td><span className="inline-flex items-center gap-1 text-xs"><MapPin size={13} className="text-[#e39131]" />{order.type}</span><p className="mt-1 text-xs text-[#9d978e]">{formatDateTime(order.dueAt)}</p><Countdown order={order} className="mt-1" /></Td>
            <Td className="text-xs text-[#746960]"><p>{order.chef || "No chef"}</p><p className="mt-1">{order.type === "Delivery" ? order.rider || "No rider" : ""}</p></Td>
            <Td>{showMoney && <><p className="text-xs font-bold">{money(orderTotal(order))}</p><PaymentBadge status={paymentStatus(order)} /></>}</Td>
          </>}
          <Td><StatusBadge status={order.status} /></Td>
        </tr>
      ))}
    </Table>
  )
}

function CapacityCalendar() {
  const { state } = useBakery()
  const { openOrder } = useDashboardNav()
  const days = Array.from({ length: 14 }, (_, index) => addDays(new Date(), index))
  const capacity = state.settings.dailyCakeCapacity
  return (
    <Card title="Capacity calendar" subtitle={`Cakes due per day against the daily capacity of ${capacity}. Change capacity in Settings.`}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {days.map((day) => {
          const orders = state.orders.filter((order) => order.status !== "Cancelled" && dayKey(order.dueAt) === dayKey(day)).sort(byPriority)
          const cakes = orders.reduce((sum, order) => sum + order.items.reduce((count, item) => count + item.quantity, 0), 0)
          const ratio = cakes / capacity
          return (
            <div key={dayKey(day)} className="rounded-xl border border-[#eeeae3] p-3">
              <p className="text-xs font-bold">{formatDay(day.toISOString())}</p>
              <p className="text-[10px] text-[#9b8f87]">{day.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>
              <div className="mt-2 h-1.5 rounded-full bg-[#eee6df]" title={`${cakes} of ${capacity} cakes`}><div className={`h-full rounded-full ${ratio >= 1 ? "bg-red-500" : ratio > 0.75 ? "bg-amber-500" : "bg-[#e8a05a]"}`} style={{ width: `${Math.min(100, ratio * 100)}%` }} /></div>
              <p className={`mt-1 text-[11px] font-bold ${ratio >= 1 ? "text-red-600" : "text-[#6f675f]"}`}>{cakes}/{capacity} cakes</p>
              <div className="mt-2 space-y-1">
                {orders.slice(0, 5).map((order) => <button key={order.id} onClick={() => openOrder(order.id)} className={`block w-full truncate rounded px-1.5 py-1 text-left text-[10px] ${order.urgent ? "bg-red-50 text-red-700" : "bg-[#f8f4f0]"}`}>{new Date(order.dueAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} {orderTitle(order)}</button>)}
                {orders.length > 5 && <p className="text-[10px] text-[#9b8f87]">+{orders.length - 5} more</p>}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

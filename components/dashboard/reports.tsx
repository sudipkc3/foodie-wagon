"use client"

import { useMemo, useState } from "react"
import { CreditCard, Download, Percent, ShoppingBag, Timer, Trash2, Truck, XCircle } from "lucide-react"
import { useBakery } from "@/lib/bakery/store"
import { addDays, dayKey, downloadCsv, formatDuration, money, orderBalance, orderPaid, orderTotal, workedMs } from "@/lib/bakery/format"
import { ORDER_SOURCES, type Order } from "@/lib/bakery/types"
import { Card, Empty, Metric, PageHeading, Pill, Table, Td, Tabs, Button } from "./ui"

const RANGES = ["7 days", "14 days", "30 days"] as const

// Single-series vertical bars: one hue, rounded data ends, hover tooltip, optional table view.
function BarChart({ data, format }: { data: { label: string; value: number; detail?: string }[]; format: (value: number) => string }) {
  const [asTable, setAsTable] = useState(false)
  const max = Math.max(1, ...data.map((item) => item.value))
  if (asTable) return <><Table minWidth={320} headings={["Day", "Value"]}>{data.map((item) => <tr key={item.label}><Td>{item.label}</Td><Td className="font-bold">{format(item.value)}</Td></tr>)}</Table><button onClick={() => setAsTable(false)} className="mt-2 text-xs font-bold text-[#c76a10]">Show chart</button></>
  return (
    <div>
      <div className="relative flex h-48 items-end gap-[2px] border-b border-[#e9e2da]">
        {[0.5, 1].map((line) => <div key={line} className="pointer-events-none absolute inset-x-0 border-t border-dashed border-[#f0ebe5]" style={{ bottom: `${line * 100}%` }}><span className="absolute -top-2 right-0 bg-white pl-1 text-[9px] text-[#aaa59d]">{format(max * line)}</span></div>)}
        {data.map((item) => (
          <div key={item.label} className="group relative flex h-full flex-1 items-end">
            <div className="w-full rounded-t-[4px] bg-[#e8a05a] transition-colors group-hover:bg-[#c76a10]" style={{ height: `${(item.value / max) * 100}%`, minHeight: item.value ? 2 : 0 }} />
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#302c28] px-2 py-1 text-[11px] text-white group-hover:block">{item.label}: <strong>{format(item.value)}</strong>{item.detail && <span className="block text-white/70">{item.detail}</span>}</div>
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-[2px] text-[9px] text-[#aaa59d]">{data.map((item, index) => <span key={item.label} className="flex-1 truncate text-center">{index % Math.ceil(data.length / 10) === 0 ? item.label : ""}</span>)}</div>
      <button onClick={() => setAsTable(true)} className="mt-2 text-xs font-bold text-[#c76a10]">View as table</button>
    </div>
  )
}

// Horizontal share bars for categorical breakdowns; the label and value are always printed.
function ShareBars({ rows, format = String }: { rows: [string, number][]; format?: (value: number) => string }) {
  const max = Math.max(1, ...rows.map(([, value]) => value))
  return (
    <div className="space-y-3">
      {rows.map(([label, value]) => (
        <div key={label}>
          <div className="flex justify-between text-xs"><span>{label}</span><strong>{format(value)}</strong></div>
          <div className="mt-1 h-2 rounded-full bg-[#f3ece5]"><div className="h-full rounded-full bg-[#e8a05a]" style={{ width: `${(value / max) * 100}%` }} /></div>
        </div>
      ))}
    </div>
  )
}

const eventAt = (order: Order, key: string) => order.timeline.find((event) => event.key === key)?.at

export function ReportsPage() {
  const { state, can } = useBakery()
  const [range, setRange] = useState<(typeof RANGES)[number]>("14 days")
  const days = Number.parseInt(range)
  const report = useMemo(() => {
    const from = dayKey(addDays(new Date(), -(days - 1)))
    const to = dayKey()
    const inRange = state.orders.filter((order) => { const key = dayKey(order.dueAt); return key >= from && key <= to })
    const valid = inRange.filter((order) => order.status !== "Cancelled")
    const cancelled = inRange.filter((order) => order.status === "Cancelled")
    const gross = valid.reduce((sum, order) => sum + orderTotal(order), 0)
    const daily = Array.from({ length: days }, (_, index) => {
      const key = dayKey(addDays(new Date(), -(days - 1 - index)))
      const dayOrders = valid.filter((order) => dayKey(order.dueAt) === key)
      return { label: new Date(`${key}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" }), value: dayOrders.reduce((sum, order) => sum + orderTotal(order), 0), detail: `${dayOrders.length} orders` }
    })
    const cakes = new Map<string, { qty: number; revenue: number }>()
    valid.forEach((order) => order.items.forEach((item) => { const row = cakes.get(item.name) ?? { qty: 0, revenue: 0 }; row.qty += item.quantity; row.revenue += item.unitPrice * item.quantity; cakes.set(item.name, row) }))
    const staffRow = (name: string) => {
      const prepared = valid.filter((order) => order.accountability.completedByChef === name)
      const prepTimes = prepared.map((order) => { const start = eventAt(order, "prepStartedBy"); const end = eventAt(order, "completedByChef"); return start && end ? new Date(end).getTime() - new Date(start).getTime() : 0 }).filter(Boolean)
      return {
        prepared: prepared.length, avgPrep: prepTimes.length ? prepTimes.reduce((a, b) => a + b, 0) / prepTimes.length : 0,
        created: inRange.filter((order) => order.accountability.createdBy === name).length, accepted: inRange.filter((order) => order.accountability.acceptedBy === name).length,
        delivered: inRange.filter((order) => order.accountability.deliveredBy === name).length, failed: inRange.filter((order) => order.rider === name && order.timeline.some((event) => event.label.startsWith("Delivery failed"))).length,
      }
    }
    const attendance = state.attendance.filter((record) => record.date >= from && record.date <= to)
    const hours = attendance.reduce((sum, record) => sum + workedMs(record), 0)
    const labour = attendance.reduce((sum, record) => sum + (workedMs(record) / 3600000) * (state.staff.find((member) => member.id === record.staffId)?.hourlyRate ?? 0), 0)
    const whatsapp = inRange.flatMap((order) => order.whatsapp)
    return { inRange, valid, cancelled, gross, daily, cakes, staffRow, hours, labour, whatsapp }
  }, [state, days])

  const { valid, cancelled, gross, daily } = report
  const exportCsv = () => downloadCsv(`sales-${dayKey()}-${days}d.csv`, [["Day", "Gross sales", "Orders"], ...daily.map((item) => [item.label, item.value.toFixed(2), item.detail ?? ""])])
  const people = (role: string) => state.staff.filter((member) => member.role === role)
  return (
    <div className="space-y-6">
      <PageHeading eyebrow="Reports & analytics" title="Know what is moving" description="Sales, sources, fulfilment, products, team performance and communication — computed from live data."
        actions={<><Tabs tabs={RANGES} active={range} onChange={setRange} /><Button tone="neutral" onClick={exportCsv}><Download size={14} /> Export</Button></>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Gross sales" value={money(gross)} icon={CreditCard} hint={`${valid.length} orders`} />
        <Metric label="Average order" value={money(valid.length ? gross / valid.length : 0)} icon={ShoppingBag} />
        <Metric label="Collected / outstanding" value={money(valid.reduce((sum, order) => sum + orderPaid(order), 0))} icon={Percent} hint={`${money(valid.reduce((sum, order) => sum + orderBalance(order), 0))} still open`} tone="warn" />
        <Metric label="Cancellations" value={cancelled.length} icon={XCircle} hint={`${report.inRange.length ? Math.round((cancelled.length / report.inRange.length) * 100) : 0}% of orders`} />
        {can("attendance.team") && <Metric label="Labour" value={`${Math.round(report.hours / 3600000)} h`} icon={Timer} hint={`${money(report.labour)} gross pay`} />}
        <Metric label="Deliveries" value={valid.filter((order) => order.type === "Delivery").length} icon={Truck} hint={`${valid.filter((order) => order.type === "Pickup").length} pickups`} />
        <Metric label="WhatsApp delivered" value={report.whatsapp.length ? `${Math.round((report.whatsapp.filter((m) => ["Delivered", "Read"].includes(m.status)).length / report.whatsapp.length) * 100)}%` : "—"} icon={CreditCard} hint={`${report.whatsapp.length} sent · ${report.whatsapp.filter((m) => m.status === "Failed").length} failed`} />
      </div>
      <Card title="Daily gross sales" subtitle="By due date, cancelled orders excluded"><BarChart data={daily} format={(value) => money(value)} /></Card>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Order sources"><ShareBars rows={ORDER_SOURCES.map((source) => [source, valid.filter((order) => order.source === source).length])} /></Card>
        <Card title="Pickup vs delivery"><ShareBars rows={[["Pickup", valid.filter((order) => order.type === "Pickup").length], ["Delivery", valid.filter((order) => order.type === "Delivery").length]]} /></Card>
        <Card title="Payment status"><ShareBars rows={[["Paid", valid.filter((order) => orderBalance(order) === 0).length], ["Partial", valid.filter((order) => orderPaid(order) > 0 && orderBalance(order) > 0).length], ["Unpaid", valid.filter((order) => orderPaid(order) <= 0 && orderTotal(order) > 0).length]]} /></Card>
      </div>
      <Card title="Popular cakes">
        <Table minWidth={480} headings={["Cake", "Sold", "Revenue", "Share"]}>
          {[...report.cakes.entries()].sort((a, b) => b[1].revenue - a[1].revenue).map(([name, row]) => <tr key={name}><Td className="font-semibold">{name}</Td><Td>{row.qty}</Td><Td>{money(row.revenue)}</Td><Td>{gross ? Math.round((row.revenue / gross) * 100) : 0}%</Td></tr>)}
        </Table>
      </Card>
      <div className="grid gap-6 xl:grid-cols-3">
        <Card title="Chef report"><Table minWidth={300} headings={["Chef", "Cakes", "Avg prep"]}>{people("Chef").map((member) => { const row = report.staffRow(member.name); return <tr key={member.id}><Td>{member.name}</Td><Td className="font-bold">{row.prepared}</Td><Td>{row.avgPrep ? formatDuration(row.avgPrep) : "—"}</Td></tr> })}</Table></Card>
        <Card title="Reception report"><Table minWidth={300} headings={["Staff", "Created", "Accepted"]}>{[...people("Reception"), ...people("Manager")].map((member) => { const row = report.staffRow(member.name); return <tr key={member.id}><Td>{member.name}</Td><Td className="font-bold">{row.created}</Td><Td>{row.accepted}</Td></tr> })}</Table></Card>
        <Card title="Rider report"><Table minWidth={300} headings={["Rider", "Delivered", "Failed"]}>{people("Rider").map((member) => { const row = report.staffRow(member.name); return <tr key={member.id}><Td>{member.name}</Td><Td className="font-bold">{row.delivered}</Td><Td>{row.failed ? <Pill tone="urgent">{row.failed}</Pill> : 0}</Td></tr> })}</Table></Card>
      </div>
      <Card title="Cancelled orders" subtitle="Reason, value and who cancelled">
        {cancelled.length === 0 ? <Empty text="No cancellations in this period." /> : <Table minWidth={560} headings={["Order", "Customer", "Amount", "Reason", "Cancelled by"]}>{cancelled.map((order) => <tr key={order.id}><Td className="font-bold">{order.id}</Td><Td>{order.customer.name}</Td><Td>{money(orderTotal(order))}</Td><Td className="text-xs">{order.cancelReason ?? order.timeline.find((event) => event.key === "cancelledBy")?.label.replace("Cancelled · ", "") ?? "—"}</Td><Td className="text-xs">{order.accountability.cancelledBy ?? "—"}</Td></tr>)}</Table>}
      </Card>
    </div>
  )
}

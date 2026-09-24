"use client"

import { useMemo, useState } from "react"
import { Cake, CreditCard, Download, RotateCcw, Search, Users } from "lucide-react"
import { useBakery } from "@/lib/bakery/store"
import { saveCustomerProfile } from "@/lib/bakery/operations"
import { recordTransaction } from "@/lib/bakery/workflow"
import { addDays, dayKey, downloadCsv, formatDateTime, formatDay, formatTime, money, orderBalance, orderPaid, orderTitle, orderTotal, paymentStatus } from "@/lib/bakery/format"
import type { Order, PaymentMethod } from "@/lib/bakery/types"
import { useDashboardNav } from "./nav-context"
import { Avatar, Button, Card, Empty, Field, Metric, PageHeading, PaymentBadge, Pill, Select, StatusBadge, Table, Td, Tabs, inputClass } from "./ui"

type CustomerSummary = { phone: string; name: string; email: string; orders: Order[]; spend: number; last: Order; favorite: string; favoriteFlavor: string }

const mostCommon = (values: string[]) => {
  const counts = new Map<string, number>()
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1))
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—"
}

export function useCustomers() {
  const { state } = useBakery()
  return useMemo(() => {
    const groups = new Map<string, Order[]>()
    for (const order of state.orders) {
      const key = order.customer.phone.replace(/[^\d]/g, "") || order.customer.name
      groups.set(key, [...(groups.get(key) ?? []), order])
    }
    return [...groups.values()].map((orders): CustomerSummary => {
      const sorted = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      const valid = sorted.filter((order) => order.status !== "Cancelled")
      return {
        phone: sorted[0].customer.phone, name: sorted[0].customer.name, email: sorted.find((order) => order.customer.email)?.customer.email ?? "", orders: sorted,
        spend: valid.reduce((sum, order) => sum + orderTotal(order), 0), last: sorted[0],
        favorite: mostCommon(valid.flatMap((order) => order.items.map((item) => item.name))), favoriteFlavor: mostCommon(valid.flatMap((order) => order.items.map((item) => item.flavor))),
      }
    }).sort((a, b) => b.last.createdAt.localeCompare(a.last.createdAt))
  }, [state.orders])
}

export function CustomersPage() {
  const { state, can } = useBakery()
  const customers = useCustomers()
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<string | null>(null)
  const q = query.trim().toLowerCase()
  const visible = customers.filter((customer) => !q || `${customer.name} ${customer.phone} ${customer.email}`.toLowerCase().includes(q))
  const current = customers.find((customer) => customer.phone === selected) ?? null
  const upcoming = state.customers.filter((profile) => profile.birthday).map((profile) => {
    const [month, day] = profile.birthday!.split("-").map(Number)
    let next = new Date(new Date().getFullYear(), month - 1, day)
    if (dayKey(next) < dayKey()) next = new Date(new Date().getFullYear() + 1, month - 1, day)
    return { profile, next, customer: customers.find((item) => item.phone === profile.phone) }
  }).filter((item) => item.next.getTime() - Date.now() < 30 * 86400000 && item.customer).sort((a, b) => a.next.getTime() - b.next.getTime())

  return (
    <div className="space-y-6">
      <PageHeading eyebrow="Customer management" title="People behind the celebrations" description="Order history, cake preferences, notes and one-click repeat orders."
        actions={can("reports.view") && <Button tone="neutral" onClick={() => downloadCsv(`customers-${dayKey()}.csv`, [["Name", "Phone", "Email", "Orders", "Spend", "Last order", "Favorite"], ...customers.map((c) => [c.name, c.phone, c.email, c.orders.length, c.spend.toFixed(2), dayKey(c.last.createdAt), c.favorite])])}><Download size={14} /> Export</Button>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Customers" value={customers.length} icon={Users} />
        <Metric label="Repeat customers" value={customers.filter((customer) => customer.orders.length > 1).length} icon={RotateCcw} hint={`${Math.round((customers.filter((customer) => customer.orders.length > 1).length / Math.max(1, customers.length)) * 100)}% come back`} />
        <Metric label="Birthdays in 30 days" value={upcoming.length} icon={Cake} hint="Reach out with a reminder" />
      </div>
      {upcoming.length > 0 && (
        <Card title="Upcoming celebrations" subtitle="Saved birthdays — a friendly WhatsApp reminder drives repeat orders">
          <div className="flex flex-wrap gap-2">{upcoming.map(({ profile, next, customer }) => <button key={profile.phone} onClick={() => setSelected(customer!.phone)} className="rounded-xl border border-[#eeeae3] px-3 py-2 text-left text-xs"><strong>{customer!.name}</strong><span className="block text-[#8f8981]">🎂 {formatDay(next.toISOString())} · usually {customer!.favorite}</span></button>)}</div>
        </Card>
      )}
      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <Card>
          <div className="relative mb-4"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa59d]" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-lg border border-[#e5e1da] py-2 pl-8 pr-3 text-xs" placeholder="Search name, phone or email" /></div>
          <div className="max-h-[640px] space-y-2 overflow-y-auto">
            {visible.map((customer) => (
              <button key={customer.phone} onClick={() => setSelected(customer.phone)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${selected === customer.phone ? "border-[#ee9633] bg-[#fff8ee]" : "border-[#eeeae3]"}`}>
                <Avatar name={customer.name} />
                <span className="min-w-0 flex-1"><strong className="block text-sm">{customer.name}</strong><span className="text-xs text-[#8f8981]">{customer.phone} · {customer.orders.length} orders{can("payments.view") && ` · ${money(customer.spend)}`}</span></span>
                <span className="text-[11px] text-[#9b8f87]">{formatDay(customer.last.createdAt)}</span>
              </button>
            ))}
          </div>
        </Card>
        {current ? <CustomerProfileCard key={current.phone} customer={current} /> : <Card><Empty text="Select a customer to see their profile." /></Card>}
      </div>
    </div>
  )
}

function CustomerProfileCard({ customer }: { customer: CustomerSummary }) {
  const { state, commit, can } = useBakery()
  const { openOrder, newOrder } = useDashboardNav()
  const profile = state.customers.find((item) => item.phone === customer.phone) ?? { phone: customer.phone, notes: "" }
  const [notes, setNotes] = useState(profile.notes)
  const [birthday, setBirthday] = useState(profile.birthday ?? "")
  const messages = customer.orders.flatMap((order) => order.whatsapp.map((message) => ({ ...message, orderId: order.id }))).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8)
  const repeat = () => {
    const last = customer.orders.find((order) => order.status !== "Cancelled") ?? customer.last
    const due = addDays(new Date(), 1); due.setHours(12, 0, 0, 0)
    newOrder({ source: "Phone", type: last.type, customer: { ...last.customer }, items: last.items.map((item) => ({ ...item })), address: last.address, dueAt: due.toISOString() })
  }
  return (
    <Card title={customer.name} subtitle={`${customer.phone}${customer.email ? ` · ${customer.email}` : ""}`} action={can("orders.create") && <Button onClick={repeat}><RotateCcw size={14} /> Repeat last order</Button>}>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-[#fcf8f3] p-3 text-xs"><p className="text-[#8f8981]">Orders</p><p className="mt-1 text-lg font-bold">{customer.orders.length}</p></div>
        <div className="rounded-lg bg-[#fcf8f3] p-3 text-xs"><p className="text-[#8f8981]">Favorite cake</p><p className="mt-1 font-bold">{customer.favorite}</p></div>
        <div className="rounded-lg bg-[#fcf8f3] p-3 text-xs"><p className="text-[#8f8981]">Favorite flavor</p><p className="mt-1 font-bold">{customer.favoriteFlavor}</p></div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_140px]">
        <Field label="Customer notes & preferences"><textarea disabled={!can("customers.edit")} rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} className={inputClass} placeholder="Allergies, preferred designs, VIP…" /></Field>
        <Field label="Birthday (MM-DD)"><input disabled={!can("customers.edit")} value={birthday} onChange={(event) => setBirthday(event.target.value)} className={inputClass} placeholder="04-18" /></Field>
      </div>
      {can("customers.edit") && <Button className="mt-2" tone="neutral" onClick={() => commit((s, a) => saveCustomerProfile(s, a, { ...profile, notes, birthday: /^\d{2}-\d{2}$/.test(birthday) ? birthday : undefined }))}>Save notes</Button>}
      <h4 className="mt-5 text-sm font-bold">Order history</h4>
      <Table minWidth={520} headings={["Order", "Cake", "Date", can("payments.view") ? "Amount" : "", "Status"]}>
        {customer.orders.map((order) => <tr key={order.id} onClick={() => openOrder(order.id)} className="cursor-pointer hover:bg-[#fdfbf8]"><Td className="font-bold">{order.id}</Td><Td>{orderTitle(order)}<span className="block text-[11px] text-[#8f8981]">{order.items[0]?.message && `“${order.items[0].message}”`}</span></Td><Td className="text-xs">{formatDay(order.dueAt)}</Td><Td>{can("payments.view") && money(orderTotal(order))}</Td><Td><StatusBadge status={order.status} /></Td></tr>)}
      </Table>
      <h4 className="mt-5 text-sm font-bold">WhatsApp history</h4>
      <div className="mt-2 space-y-2">{messages.length ? messages.map((message) => <div key={message.id} className="rounded-lg bg-[#f1f8f1] p-2 text-xs"><strong>{message.orderId}</strong> · {message.text}<span className="block text-[#8f8981]">{formatDateTime(message.at)} · {message.status}</span></div>) : <p className="text-xs text-[#9b8f87]">No messages.</p>}</div>
    </Card>
  )
}

// ---- Payments -------------------------------------------------------------------------------

export function PaymentsPage() {
  const { state, commit, can } = useBakery()
  const { openOrder } = useDashboardNav()
  const [tab, setTab] = useState<"Outstanding" | "Paid" | "Transactions">("Outstanding")
  const [method, setMethod] = useState<PaymentMethod>("Cash")
  const today = dayKey()
  const transactions = state.orders.flatMap((order) => order.transactions.map((tx) => ({ ...tx, order }))).sort((a, b) => b.at.localeCompare(a.at))
  const todayTx = transactions.filter((tx) => dayKey(tx.at) === today)
  const outstanding = state.orders.filter((order) => order.status !== "Cancelled" && orderBalance(order) > 0).sort((a, b) => a.dueAt.localeCompare(b.dueAt))
  const paid = state.orders.filter((order) => paymentStatus(order) === "Paid").sort((a, b) => b.dueAt.localeCompare(a.dueAt)).slice(0, 60)
  const byMethod = (["Cash", "Card", "Online", "Bank transfer"] as PaymentMethod[]).map((m) => [m, todayTx.filter((tx) => tx.method === m && tx.kind === "Payment").reduce((sum, tx) => sum + tx.amount, 0)] as const)
  const refundsDue = state.orders.filter((order) => order.status === "Cancelled" && orderPaid(order) > 0)
  return (
    <div className="space-y-6">
      <PageHeading eyebrow="Payments" title="Every euro accounted for" description="Outstanding balances, deposits, today's takings by method and refunds for cancelled orders."
        actions={<Button tone="neutral" onClick={() => downloadCsv(`transactions-${today}.csv`, [["Date", "Time", "Order", "Customer", "Kind", "Method", "Amount", "By", "Note"], ...transactions.map((tx) => [dayKey(tx.at), formatTime(tx.at), tx.order.id, tx.order.customer.name, tx.kind, tx.method, tx.amount.toFixed(2), tx.by, tx.note ?? ""])])}><Download size={14} /> Export</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Collected today" value={money(todayTx.reduce((sum, tx) => sum + (tx.kind === "Payment" ? tx.amount : -tx.amount), 0))} icon={CreditCard} hint={byMethod.filter(([, value]) => value).map(([m, value]) => `${m} ${money(value)}`).join(" · ") || "No payments yet"} />
        <Metric label="Outstanding" value={money(outstanding.reduce((sum, order) => sum + orderBalance(order), 0))} icon={CreditCard} tone="warn" hint={`${outstanding.length} orders`} />
        <Metric label="Due today unpaid" value={money(outstanding.filter((order) => dayKey(order.dueAt) === today).reduce((sum, order) => sum + orderBalance(order), 0))} icon={CreditCard} />
        <Metric label="Refunds to issue" value={refundsDue.length} icon={RotateCcw} tone={refundsDue.length ? "bad" : "default"} />
      </div>
      <Tabs tabs={["Outstanding", "Paid", "Transactions"] as const} active={tab} onChange={setTab} />
      <Card>
        {tab === "Outstanding" && (outstanding.length === 0 ? <Empty text="Nothing outstanding." /> : <>
          {can("payments.collect") && <div className="mb-3 flex items-center gap-2 text-xs">Collect with <Select label="Method" value={method} onChange={(value) => setMethod(value as PaymentMethod)} options={["Cash", "Card", "Online", "Bank transfer"]} /></div>}
          <Table minWidth={820} headings={["Order", "Customer", "Due", "Total", "Paid", "Balance", "Status", ""]}>
            {outstanding.map((order) => (
              <tr key={order.id} className="hover:bg-[#fdfbf8]">
                <Td><button onClick={() => openOrder(order.id)} className="font-bold text-[#c76a10] hover:underline">{order.id}</button></Td>
                <Td>{order.customer.name}</Td><Td className="text-xs">{formatDateTime(order.dueAt)}</Td>
                <Td>{money(orderTotal(order))}</Td><Td>{money(orderPaid(order))}</Td><Td className="font-bold text-red-600">{money(orderBalance(order))}</Td>
                <Td><PaymentBadge status={paymentStatus(order)} /></Td>
                <Td>{can("payments.collect") && <Button tone="dark" onClick={() => commit((s, a) => recordTransaction(s, a, order.id, orderBalance(order), method, "Payment"))}>Collect</Button>}</Td>
              </tr>
            ))}
          </Table>
        </>)}
        {tab === "Paid" && <Table minWidth={620} headings={["Order", "Customer", "Due", "Total", "Method"]}>{paid.map((order) => <tr key={order.id} onClick={() => openOrder(order.id)} className="cursor-pointer hover:bg-[#fdfbf8]"><Td className="font-bold">{order.id}</Td><Td>{order.customer.name}</Td><Td className="text-xs">{formatDay(order.dueAt)}</Td><Td>{money(orderTotal(order))}</Td><Td>{[...new Set(order.transactions.map((tx) => tx.method))].join(", ")}</Td></tr>)}</Table>}
        {tab === "Transactions" && <Table minWidth={720} headings={["When", "Order", "Kind", "Method", "Amount", "By"]}>{transactions.slice(0, 120).map((tx) => <tr key={tx.id}><Td className="text-xs">{formatDateTime(tx.at)}</Td><Td className="font-bold">{tx.order.id}</Td><Td>{tx.kind === "Refund" ? <Pill tone="urgent">Refund</Pill> : <Pill tone="good">Payment</Pill>}</Td><Td>{tx.method}</Td><Td className="font-bold">{money(tx.amount)}</Td><Td className="text-xs">{tx.by}</Td></tr>)}</Table>}
      </Card>
      {refundsDue.length > 0 && (
        <Card title="Cancelled orders with payments" subtitle="Refund or keep as credit">
          <Table minWidth={560} headings={["Order", "Customer", "Paid", "Reason", ""]}>
            {refundsDue.map((order) => <tr key={order.id}><Td className="font-bold">{order.id}</Td><Td>{order.customer.name}</Td><Td>{money(orderPaid(order))}</Td><Td className="text-xs">{order.cancelReason}</Td><Td>{can("payments.refund") && <Button tone="danger" onClick={() => commit((s, a) => recordTransaction(s, a, order.id, orderPaid(order), order.transactions[0]?.method ?? "Cash", "Refund", "Cancelled order"))}>Refund</Button>}</Td></tr>)}
          </Table>
        </Card>
      )}
    </div>
  )
}

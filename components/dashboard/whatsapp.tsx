"use client"

import { useState } from "react"
import { Check, Clock3, Send, Wifi, WifiOff } from "lucide-react"
import { useBakery } from "@/lib/bakery/store"
import { saveTemplate } from "@/lib/bakery/operations"
import { renderTemplate, resendWhatsApp } from "@/lib/bakery/workflow"
import { dayKey, formatDateTime } from "@/lib/bakery/format"
import type { WhatsAppTemplate } from "@/lib/bakery/types"
import { useDashboardNav } from "./nav-context"
import { Button, Card, Empty, Metric, PageHeading, Pill, Select, Table, Td, Tabs } from "./ui"

const PLACEHOLDERS = ["{customer}", "{order}", "{cake}", "{due}", "{time}", "{address}", "{total}", "{balance}", "{rider}", "{bakery}", "{bakeryAddress}"]

export function WhatsAppPage() {
  const { state, can } = useBakery()
  const [tab, setTab] = useState<"Messages" | "Templates">("Messages")
  const today = dayKey()
  const messages = state.orders.flatMap((order) => order.whatsapp.map((message) => ({ ...message, order }))).sort((a, b) => b.at.localeCompare(a.at))
  const todays = messages.filter((message) => dayKey(message.at) === today)
  const delivered = todays.filter((message) => ["Delivered", "Read"].includes(message.status)).length
  return (
    <div className="space-y-6">
      <PageHeading eyebrow="WhatsApp" title="Keep customers in the loop" description="Messages are queued automatically as orders move: confirmed → accepted → ready → pickup / out for delivery → delivered / collected." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Connection" value={state.settings.whatsappConnected ? "Connected" : "Offline"} icon={state.settings.whatsappConnected ? Wifi : WifiOff} tone={state.settings.whatsappConnected ? "good" : "bad"} hint={state.settings.whatsappConnected ? state.settings.whatsappNumber : "Messages are queued until reconnected"} />
        <Metric label="Sent today" value={todays.length} icon={Send} />
        <Metric label="Delivered / read" value={todays.length ? `${Math.round((delivered / todays.length) * 100)}%` : "—"} icon={Check} />
        <Metric label="Queued or failed" value={messages.filter((message) => ["Queued", "Failed"].includes(message.status)).length} icon={Clock3} tone="warn" />
      </div>
      <Tabs tabs={can("whatsapp.manage") ? (["Messages", "Templates"] as const) : (["Messages"] as const)} active={tab} onChange={setTab} />
      {tab === "Messages" ? <MessageLog messages={messages} /> : (
        <div className="grid gap-4 lg:grid-cols-2">{state.templates.map((template) => <TemplateEditor key={template.id} template={template} />)}</div>
      )}
    </div>
  )
}

function MessageLog({ messages }: { messages: { id: string; templateId: string; text: string; at: string; status: string; by: string; order: { id: string; customer: { name: string; phone: string } } }[] }) {
  const { state, commit, can } = useBakery()
  const { openOrder } = useDashboardNav()
  const [status, setStatus] = useState("All statuses")
  const visible = messages.filter((message) => status === "All statuses" || message.status === status)
  return (
    <Card action={<Select label="Status" value={status} onChange={setStatus} options={["All statuses", "Queued", "Sent", "Delivered", "Read", "Failed"]} />} title="Message history" subtitle="Per-order log with provider status">
      {visible.length === 0 ? <Empty text="No messages." /> : (
        <Table minWidth={860} headings={["When", "Order", "Template", "Message", "Status", ""]}>
          {visible.slice(0, 120).map((message) => (
            <tr key={message.id}>
              <Td className="whitespace-nowrap text-xs">{formatDateTime(message.at)}<span className="block text-[#aaa59d]">{message.by}</span></Td>
              <Td><button onClick={() => openOrder(message.order.id)} className="font-bold text-[#c76a10] hover:underline">{message.order.id}</button><span className="block text-[11px] text-[#8f8981]">{message.order.customer.name}</span></Td>
              <Td className="text-xs">{state.templates.find((template) => template.id === message.templateId)?.name ?? message.templateId}</Td>
              <Td className="max-w-sm text-xs text-[#4f4841]">{message.text}</Td>
              <Td><Pill tone={message.status === "Failed" ? "urgent" : message.status === "Queued" ? "warn" : "good"}>{message.status}</Pill></Td>
              <Td>{can("whatsapp.send") && <Button tone="ghost" onClick={() => commit((s, a) => resendWhatsApp(s, a, message.order.id, message.id), "Message resent")}>Resend</Button>}</Td>
            </tr>
          ))}
        </Table>
      )}
    </Card>
  )
}

function TemplateEditor({ template }: { template: WhatsAppTemplate }) {
  const { state, commit } = useBakery()
  const [draft, setDraft] = useState(template)
  const sample = state.orders.find((order) => order.status !== "Cancelled")
  const dirty = draft.body !== template.body || draft.auto !== template.auto
  return (
    <Card title={template.name} action={<label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={draft.auto} onChange={(event) => setDraft({ ...draft, auto: event.target.checked })} className="accent-[#ee9633]" /> Send automatically</label>}>
      <textarea rows={3} value={draft.body} onChange={(event) => setDraft({ ...draft, body: event.target.value })} className="w-full rounded-lg border border-[#e4dfd7] p-3 text-sm" />
      <div className="mt-2 flex flex-wrap gap-1">{PLACEHOLDERS.map((placeholder) => <button key={placeholder} onClick={() => setDraft({ ...draft, body: `${draft.body} ${placeholder}` })} className="rounded bg-[#f6f3ee] px-1.5 py-0.5 font-mono text-[10px] text-[#6f675f] hover:bg-[#f1e6da]">{placeholder}</button>)}</div>
      {sample && <p className="mt-3 rounded-lg bg-[#f1f8f1] p-3 text-xs text-[#3f5a3f]"><strong>Preview:</strong> {renderTemplate(draft.body, sample, state)}</p>}
      <div className="mt-3 flex justify-end gap-2">{dirty && <Button tone="ghost" onClick={() => setDraft(template)}>Reset</Button>}<Button disabled={!dirty || !draft.body.trim()} onClick={() => commit((s, a) => saveTemplate(s, a, draft), `Template “${draft.name}” saved`)}>Save template</Button></div>
    </Card>
  )
}

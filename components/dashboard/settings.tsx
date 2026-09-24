"use client"

import { useState } from "react"
import { RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { resetState, useBakery } from "@/lib/bakery/store"
import { saveSettings } from "@/lib/bakery/operations"
import type { Settings } from "@/lib/bakery/types"
import { Button, Card, ConfirmModal, Field, PageHeading, Pill, inputClass } from "./ui"

export function SettingsPage() {
  const { state, commit, can, replace } = useBakery()
  const [draft, setDraft] = useState<Settings>(state.settings)
  const [confirmReset, setConfirmReset] = useState(false)
  const editable = can("settings.manage")
  const dirty = JSON.stringify(draft) !== JSON.stringify(state.settings)
  const text = (key: keyof Settings, label: string, type = "text") => <Field label={label}><input disabled={!editable} type={type} value={String(draft[key])} onChange={(event) => setDraft({ ...draft, [key]: type === "number" ? Number(event.target.value) || 0 : event.target.value })} className={inputClass} /></Field>
  const toggle = (key: keyof Settings, label: string, hint: string) => <label className="flex items-start gap-3 rounded-lg border border-[#eeeae3] p-3 text-sm"><input disabled={!editable} type="checkbox" checked={Boolean(draft[key])} onChange={(event) => setDraft({ ...draft, [key]: event.target.checked })} className="mt-1 accent-[#ee9633]" /><span><strong>{label}</strong><span className="block text-xs text-[#8f8981]">{hint}</span></span></label>
  return (
    <div className="space-y-6">
      <PageHeading eyebrow="Settings" title="Bakery settings" description={editable ? "These rules drive order capacity, lateness, delivery fees and WhatsApp." : "Read-only — only admins can change settings."}
        actions={editable && <><Button tone="ghost" disabled={!dirty} onClick={() => setDraft(state.settings)}>Discard</Button><Button disabled={!dirty} onClick={() => commit((s, a) => saveSettings(s, a, draft), "Settings saved")}>Save changes</Button></>} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Bakery information"><div className="grid gap-3 sm:grid-cols-2">{text("bakeryName", "Name")}{text("phone", "Phone")}<div className="sm:col-span-2">{text("address", "Address")}</div>{text("openingTime", "Opens", "time")}{text("closingTime", "Closes", "time")}</div></Card>
        <Card title="Order settings"><div className="grid gap-3 sm:grid-cols-2">{text("dailyCakeCapacity", "Daily cake capacity", "number")}{text("minLeadHours", "Minimum lead time (hours)", "number")}{text("urgentWindowMinutes", "Urgent window (minutes)", "number")}{text("deliveryFee", "Delivery fee (€)", "number")}<div className="sm:col-span-2">{toggle("autoAcceptStaffOrders", "Auto-accept staff-created orders", "Walk-in, phone and emergency orders skip the acceptance step.")}</div></div></Card>
        <Card title="Attendance rules"><div className="grid gap-3 sm:grid-cols-2">{text("lateGraceMinutes", "Late after (minutes grace)", "number")}{text("overtimeAfterHours", "Overtime after (hours / day)", "number")}</div></Card>
        <Card title="WhatsApp" action={<Pill tone={draft.whatsappConnected ? "good" : "urgent"}>{draft.whatsappConnected ? "Connected" : "Offline"}</Pill>}><div className="grid gap-3">{text("whatsappNumber", "Business number")}{toggle("whatsappConnected", "WhatsApp Business API connected", "When offline, messages are kept as Queued.")}</div></Card>
      </div>
      {editable && (
        <Card title="Demo data" subtitle="All data lives in this browser. Resetting restores the sample bakery.">
          <Button tone="danger" onClick={() => setConfirmReset(true)}><RotateCcw size={14} /> Reset demo data</Button>
        </Card>
      )}
      {confirmReset && <ConfirmModal tone="danger" title="Reset all demo data?" message="Orders, attendance, stock, settings and staff changes in this browser will be replaced with the sample data." confirmLabel="Reset data" onClose={() => setConfirmReset(false)} onConfirm={() => { const fresh = resetState(); replace(fresh); setDraft(fresh.settings); toast.success("Demo data restored") }} />}
    </div>
  )
}

const COVERAGE: [string, string, boolean][] = [
  ["One order workflow", "Website, walk-in, reception, emergency and phone orders share one entity, status machine, timeline and accountability trail.", true],
  ["Role dashboards", "Front desk, kitchen, production plan, rider view and dispatch — each action gated by the permission matrix.", true],
  ["Attendance", "Reception checks workers in/out (with breaks) at the front desk; Admin and Manager see the team board, roster, lateness, overtime, timesheets with CSV export, audited corrections and leave.", true],
  ["Bakery operations", "Allergens (EU 14), recipes with food-cost margin, automatic stock deduction, reorder list, waste log, HACCP temperatures and checklists, capacity calendar.", true],
  ["Customers & payments", "Profiles, preferences, notes, birthdays, repeat orders, deposits, balance collection at handover, refunds.", true],
  ["Reports & audit", "Sales, sources, fulfilment, products, chef / reception / rider performance, labour and waste; admin activity log.", true],
  ["Needs production services", "Data is stored in the browser. A database + API, real authentication, the WhatsApp Business API and a payment gateway are required for production.", false],
]

export function FeatureCoveragePage() {
  return (
    <div className="space-y-6">
      <PageHeading eyebrow="Implementation status · Admin" title="Feature coverage" description="What works in this build and what still needs production services." />
      <div className="grid gap-4 md:grid-cols-2">
        {COVERAGE.map(([title, description, done]) => (
          <Card key={title} title={title} action={<Pill tone={done ? "good" : "warn"}>{done ? "Implemented" : "Integration needed"}</Pill>}>
            <p className="text-sm leading-6 text-[#81756d]">{description}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}

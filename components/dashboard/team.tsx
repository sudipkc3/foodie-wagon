"use client"

import { useMemo, useState } from "react"
import { Download, Lock, Pencil, Plus, Search, ShieldCheck } from "lucide-react"
import { useBakery } from "@/lib/bakery/store"
import { saveStaff, togglePermission, openRecord } from "@/lib/bakery/operations"
import { PERMISSION_GROUPS } from "@/lib/bakery/permissions"
import { dayKey, downloadCsv, formatDateTime, initials, money, relativeTime, uid } from "@/lib/bakery/format"
import { ROLES, type Staff } from "@/lib/bakery/types"
import { Avatar, Button, Card, ConfirmModal, Empty, Field, Modal, PageHeading, Pill, Select, Table, Td, inputClass } from "./ui"

export function StaffPage() {
  const { state, commit, can } = useBakery()
  const [editing, setEditing] = useState<Staff | null>(null)
  const [deactivating, setDeactivating] = useState<Staff | null>(null)
  const [query, setQuery] = useState("")
  const [role, setRole] = useState("All roles")
  const visible = state.staff.filter((member) => (role === "All roles" || member.role === role) && `${member.name} ${member.email} ${member.phone}`.toLowerCase().includes(query.toLowerCase()))
  const handled = (name: string) => state.orders.filter((order) => Object.values(order.accountability).includes(name)).length
  return (
    <div className="space-y-6">
      <PageHeading eyebrow="Staff management" title="The people behind the bake" description="Employees, roles, kiosk PINs and status. Roles control what each person can see and do."
        actions={can("staff.manage") && <Button onClick={() => setEditing({ id: uid("st"), name: "", email: "", password: "", pin: String(Math.floor(1000 + Math.random() * 9000)), phone: "", role: "Reception", status: "Active", hourlyRate: 15, initials: "", joinedAt: dayKey() })}><Plus size={14} /> Add employee</Button>} />
      <Card>
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="relative min-w-[220px] flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa59d]" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-lg border border-[#e5e1da] py-2 pl-8 pr-3 text-xs" placeholder="Search employees" /></div>
          <Select label="Role" value={role} onChange={setRole} options={["All roles", ...ROLES]} />
        </div>
        {visible.length === 0 ? <Empty text="No employees found." /> : (
          <Table minWidth={820} headings={["Employee", "Role", "Contact", "Status", "Orders handled", can("staff.manage") ? "Rate" : "", ""]}>
            {visible.map((member) => (
              <tr key={member.id}>
                <Td><div className="flex items-center gap-2"><Avatar name={member.name} initials={member.initials} size={32} /><span><strong>{member.name}</strong><span className="block text-[11px] text-[#8f8981]">since {member.joinedAt}</span></span></div></Td>
                <Td><Pill>{member.role}</Pill></Td>
                <Td className="text-xs">{member.email}<span className="block text-[#8f8981]">{member.phone}</span></Td>
                <Td><div className="flex flex-wrap gap-1"><Pill tone={member.status === "Active" ? "good" : member.status === "On leave" ? "info" : "default"}>{member.status}</Pill>{openRecord(state, member.id) && <Pill tone="good">On shift</Pill>}</div></Td>
                <Td>{handled(member.name)}</Td>
                <Td>{can("staff.manage") && `${money(member.hourlyRate)}/h`}</Td>
                <Td>{can("staff.manage") && <div className="flex justify-end gap-1"><button onClick={() => setEditing(member)} className="rounded p-1.5 text-[#c76a10] hover:bg-[#fff3e2]" aria-label={`Edit ${member.name}`}><Pencil size={14} /></button>{member.status !== "Inactive" && member.role !== "Admin" && <Button tone="ghost" onClick={() => setDeactivating(member)}>Deactivate</Button>}</div>}</Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
      {editing && <StaffModal staff={editing} onClose={() => setEditing(null)} />}
      {deactivating && <ConfirmModal tone="danger" title={`Deactivate ${deactivating.name}?`} message="They will no longer be able to sign in or use the kiosk. Their history and accountability records are kept." confirmLabel="Deactivate" onClose={() => setDeactivating(null)} onConfirm={() => commit((s, a) => saveStaff(s, a, { ...deactivating, status: "Inactive" }), `${deactivating.name} deactivated`)} />}
    </div>
  )
}

function StaffModal({ staff, onClose }: { staff: Staff; onClose: () => void }) {
  const { state, commit } = useBakery()
  const [draft, setDraft] = useState(staff)
  const set = (patch: Partial<Staff>) => setDraft({ ...draft, ...patch })
  const emailTaken = state.staff.some((member) => member.id !== draft.id && member.email === draft.email.trim().toLowerCase())
  const pinTaken = state.staff.some((member) => member.id !== draft.id && member.pin === draft.pin)
  const valid = draft.name.trim() && /\S+@\S+/.test(draft.email) && draft.password.length >= 6 && /^\d{4}$/.test(draft.pin) && !emailTaken && !pinTaken
  return (
    <Modal title={staff.name ? `Edit ${staff.name}` : "Add employee"} onClose={onClose}>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Field label="Full name *"><input value={draft.name} onChange={(event) => set({ name: event.target.value, initials: initials(event.target.value) })} className={inputClass} /></Field>
        <Field label="Phone"><input value={draft.phone} onChange={(event) => set({ phone: event.target.value })} className={inputClass} /></Field>
        <Field label="Email (sign-in) *"><input value={draft.email} onChange={(event) => set({ email: event.target.value })} className={inputClass} />{emailTaken && <span className="mt-1 block font-normal text-red-600">Email already in use</span>}</Field>
        <Field label="Password * (min 6)"><input type="text" value={draft.password} onChange={(event) => set({ password: event.target.value })} className={inputClass} /></Field>
        <Field label="Role"><select disabled={staff.role === "Admin" && Boolean(staff.name)} value={draft.role} onChange={(event) => set({ role: event.target.value as Staff["role"] })} className={inputClass}>{ROLES.map((item) => <option key={item}>{item}</option>)}</select></Field>
        <Field label="Status"><select value={draft.status} onChange={(event) => set({ status: event.target.value as Staff["status"] })} className={inputClass}>{["Active", "On leave", "Inactive"].map((item) => <option key={item}>{item}</option>)}</select></Field>
        <Field label="Kiosk PIN (4 digits) *"><input inputMode="numeric" maxLength={4} value={draft.pin} onChange={(event) => set({ pin: event.target.value.replace(/\D/g, "") })} className={inputClass} />{pinTaken && <span className="mt-1 block font-normal text-red-600">PIN already used by someone else</span>}</Field>
        <Field label="Hourly rate (€)"><input type="number" min={0} step="0.5" value={draft.hourlyRate} onChange={(event) => set({ hourlyRate: Number(event.target.value) || 0 })} className={inputClass} /></Field>
      </div>
      <div className="mt-6 flex justify-end gap-2"><Button tone="ghost" onClick={onClose}>Cancel</Button><Button disabled={!valid} onClick={() => { commit((s, a) => saveStaff(s, a, draft), `${draft.name} saved`); onClose() }}>Save employee</Button></div>
    </Modal>
  )
}

export function PermissionsPage() {
  const { state, commit, can } = useBakery()
  const editable = can("roles.manage")
  return (
    <div className="space-y-6">
      <PageHeading eyebrow="Roles & permissions" title="Access that fits the role" description={editable ? "Toggle a permission to grant or revoke it immediately. Navigation and actions follow these settings. Admin always has full access." : "Only admins can change permissions."} />
      <Card>
        <Table minWidth={860} headings={["Permission", ...ROLES]}>
          {PERMISSION_GROUPS.map((group) => [
            <tr key={group.title}><td colSpan={ROLES.length + 1} className="bg-[#fcf8f3] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#a8601b]">{group.title}</td></tr>,
            ...group.items.map((item) => (
              <tr key={item.key}>
                <Td className="text-sm">{item.label}<span className="block text-[10px] text-[#aaa59d]">{item.key}</span></Td>
                {ROLES.map((role) => {
                  const on = state.permissions[role].includes(item.key)
                  const locked = role === "Admin" || !editable
                  return (
                    <Td key={role}>
                      <button role="switch" aria-checked={on} aria-label={`${item.label} for ${role}`} disabled={locked} onClick={() => commit((s, a) => togglePermission(s, a, role, item.key), `${on ? "Revoked" : "Granted"} “${item.label}” for ${role}`)} className={`relative h-5 w-9 rounded-full transition ${on ? "bg-[#ee9633]" : "bg-[#e4dcd5]"} ${locked ? "cursor-not-allowed opacity-60" : ""}`}>
                        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${on ? "left-[18px]" : "left-0.5"}`} />
                      </button>
                      {role === "Admin" && <Lock size={10} className="ml-1 inline text-[#aaa59d]" />}
                    </Td>
                  )
                })}
              </tr>
            )),
          ])}
        </Table>
      </Card>
      <p className="flex items-center gap-2 text-xs text-[#8f8981]"><ShieldCheck size={14} /> Activity logs and the feature-coverage page are always Admin-only.</p>
    </div>
  )
}

// Admin only (enforced by the navigation in the shell).
export function ActivityLogsPage() {
  const { state } = useBakery()
  const [area, setArea] = useState("All areas")
  const [person, setPerson] = useState("Everyone")
  const [query, setQuery] = useState("")
  const events = useMemo(() => {
    const orderEvents = state.orders.flatMap((order) => order.timeline.map((event, index) => ({ id: `${order.id}-${index}`, at: event.at, by: event.by, role: event.role, action: event.label.toLowerCase(), area: "Orders", ref: order.id })))
    return [...state.activity, ...orderEvents].sort((a, b) => b.at.localeCompare(a.at))
  }, [state.activity, state.orders])
  const areas = ["All areas", ...new Set(events.map((event) => event.area))]
  const visible = events.filter((event) => (area === "All areas" || event.area === area) && (person === "Everyone" || event.by === person) && `${event.by} ${event.action} ${event.ref ?? ""}`.toLowerCase().includes(query.toLowerCase()))
  return (
    <div className="space-y-6">
      <PageHeading eyebrow="Activity & audit" title="Activity logs" description="Every employee action — orders, kitchen, deliveries, payments, attendance, stock and settings."
        actions={<Button tone="neutral" onClick={() => downloadCsv(`activity-${dayKey()}.csv`, [["When", "Employee", "Role", "Area", "Action", "Reference"], ...visible.map((event) => [formatDateTime(event.at), event.by, event.role, event.area, event.action, event.ref ?? ""])])}><Download size={14} /> Export</Button>} />
      <Card>
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="relative min-w-[220px] flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa59d]" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-lg border border-[#e5e1da] py-2 pl-8 pr-3 text-xs" placeholder="Search actions or order ID" /></div>
          <Select label="Area" value={area} onChange={setArea} options={areas} />
          <Select label="Employee" value={person} onChange={setPerson} options={["Everyone", ...new Set(events.map((event) => event.by))]} />
        </div>
        {visible.length === 0 ? <Empty text="No activity matches these filters." /> : (
          <Table minWidth={720} headings={["When", "Employee", "Action", "Area", "Reference"]}>
            {visible.slice(0, 200).map((event) => <tr key={event.id}><Td className="whitespace-nowrap text-xs">{relativeTime(event.at)}<span className="block text-[#aaa59d]">{formatDateTime(event.at)}</span></Td><Td><strong>{event.by}</strong><span className="block text-[11px] text-[#8f8981]">{event.role}</span></Td><Td>{event.action}</Td><Td><Pill>{event.area}</Pill></Td><Td className="text-xs font-bold">{event.ref ?? "—"}</Td></tr>)}
          </Table>
        )}
        {visible.length > 200 && <p className="mt-3 text-center text-xs text-[#9b8f87]">Showing the latest 200 of {visible.length}. Export for the full log.</p>}
      </Card>
    </div>
  )
}

"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Coffee, Copy, Download, LogIn, LogOut, Pencil, Plus, Search, Timer, CalendarDays } from "lucide-react"
import { useBakery, useNow } from "@/lib/bakery/store"
import { clock, copyWeekRoster, correctAttendance, decideLeave, lateMinutes, openRecord, recordLeave, removeShift, saveShift, shiftFor, type ClockAction } from "@/lib/bakery/operations"
import { addDays, atTime, breakMs, dayKey, downloadCsv, formatDay, formatDuration, formatTime, money, onBreak, uid, workedMs } from "@/lib/bakery/format"
import type { AttendanceRecord, LeaveType, Shift, Staff } from "@/lib/bakery/types"
import { notCheckedIn } from "./overview"
import { Avatar, Button, Card, Empty, Field, Metric, Modal, PageHeading, Pill, Table, Td, Tabs, inputClass } from "./ui"

const mondayOf = (date: Date) => { const monday = addDays(date, -((date.getDay() + 6) % 7)); monday.setHours(0, 0, 0, 0); return monday }
const weekDays = (monday: Date) => Array.from({ length: 7 }, (_, index) => addDays(monday, index))
const shiftHours = (shift: Shift) => (atTime(shift.date, shift.end).getTime() - atTime(shift.date, shift.start).getTime()) / 3600000

// ---- Front-desk check-in (Reception) ---------------------------------------------------------
// Reception selects a worker and records check-in, breaks and check-out. It shows only the current
// status each worker needs to be checked out; hours, lateness and history are for Admin/Manager.

export function CheckInDeskPage() {
  const { state, commit } = useBakery()
  const now = useNow(30000)
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const today = dayKey()
  const workers = state.staff.filter((member) => member.status !== "Inactive" && `${member.name} ${member.role}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => Number(Boolean(shiftFor(state, b.id))) - Number(Boolean(shiftFor(state, a.id))) || a.name.localeCompare(b.name))
  const selected = state.staff.find((member) => member.id === selectedId)
  const record = selected ? openRecord(state, selected.id) : undefined
  const statusOf = (id: string) => {
    const open = openRecord(state, id)
    if (open) return onBreak(open) ? { label: "On break", tone: "warn" as const } : { label: `In since ${formatTime(open.checkIn)}`, tone: "good" as const }
    if (state.attendance.some((item) => item.staffId === id && item.date === today && item.checkOut)) return { label: "Checked out", tone: "default" as const }
    const shift = shiftFor(state, id)
    if (shift && now > atTime(today, shift.start).getTime()) return { label: `Expected ${shift.start}`, tone: "urgent" as const }
    return { label: shift ? `Shift ${shift.start}` : "Not scheduled", tone: "default" as const }
  }
  const act = (action: ClockAction) => {
    if (!selected) return
    commit((s, a) => clock(s, a, selected.id, action), `${selected.name}: ${ACTION_LABEL[action]}`)
    setSelectedId(null)
  }
  const inside = state.staff.filter((member) => openRecord(state, member.id)).length
  return (
    <div className="space-y-6">
      <PageHeading eyebrow="Front desk" title="Staff check-in" description="Select a worker as they arrive or leave, then record check-in, breaks and check-out." />
      <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
        <Card title="Select a worker" subtitle={`${inside} currently checked in`}>
          <div className="relative mb-4"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa59d]" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-lg border border-[#e5e1da] py-2 pl-8 pr-3 text-xs" placeholder="Search by name or role" /></div>
          {workers.length === 0 ? <Empty text="No workers found." /> : (
            <div className="grid gap-2 sm:grid-cols-2">
              {workers.map((member) => {
                const status = statusOf(member.id)
                return (
                  <button key={member.id} onClick={() => setSelectedId(member.id)} aria-pressed={selectedId === member.id} className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${selectedId === member.id ? "border-[#ee9633] bg-[#fff8ee] shadow-sm" : "border-[#eeeae3] hover:border-[#e7c9a6]"}`}>
                    <Avatar name={member.name} initials={member.initials} />
                    <span className="min-w-0 flex-1"><strong className="block truncate text-sm">{member.name}</strong><span className="text-[11px] text-[#8f8981]">{member.role}</span></span>
                    <Pill tone={status.tone}>{status.label}</Pill>
                  </button>
                )
              })}
            </div>
          )}
        </Card>
        <div className="xl:sticky xl:top-24 xl:self-start">
          {selected ? (
            <div key={selected.id} className="motion-pop rounded-2xl bg-[#302c28] p-6 text-white">
              <div className="flex items-center gap-3"><Avatar name={selected.name} initials={selected.initials} size={44} /><div><p className="font-serif text-2xl font-bold">{selected.name}</p><p className="text-xs text-white/60">{selected.role}{shiftFor(state, selected.id) && ` · shift ${shiftFor(state, selected.id)!.start}–${shiftFor(state, selected.id)!.end}`}</p></div></div>
              <p className="mt-4 text-sm text-white/70">{!record ? "Not checked in" : onBreak(record) ? "On break" : `Checked in at ${formatTime(record.checkIn)}`}</p>
              <div className="mt-5 grid gap-2">
                {!record && <DeskAction icon={LogIn} className="bg-emerald-500 text-white hover:bg-emerald-600" onClick={() => act("checkIn")}>Check in</DeskAction>}
                {record && !onBreak(record) && <DeskAction icon={Coffee} className="bg-white/10 hover:bg-white/20" onClick={() => act("breakStart")}>Start break</DeskAction>}
                {record && onBreak(record) && <DeskAction icon={Timer} className="bg-amber-400 text-[#302c28]" onClick={() => act("breakEnd")}>End break</DeskAction>}
                {record && <DeskAction icon={LogOut} className="bg-[#e4a385] text-[#302c28]" onClick={() => act("checkOut")}>Check out</DeskAction>}
                <button onClick={() => setSelectedId(null)} className="py-2 text-xs font-bold text-white/60 hover:text-white">Cancel</button>
              </div>
            </div>
          ) : <Card><Empty text="Select a worker to check them in or out." /></Card>}
        </div>
      </div>
    </div>
  )
}

const ACTION_LABEL: Record<ClockAction, string> = { checkIn: "checked in", breakStart: "break started", breakEnd: "break ended", checkOut: "checked out" }

function DeskAction({ icon: Icon, className, onClick, children }: { icon: typeof LogIn; className: string; onClick: () => void; children: string }) {
  return <button onClick={onClick} className={`flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition active:scale-[.98] ${className}`}><Icon size={17} />{children}</button>
}

// ---- Attendance data (Admin / Manager) -------------------------------------------------------

const TABS = ["Team today", "Timesheets", "Leave"] as const
type Tab = (typeof TABS)[number]

export function AttendancePage() {
  const [tab, setTab] = useState<Tab>("Team today")
  return (
    <div className="space-y-6">
      <PageHeading eyebrow="Attendance · Admin & Manager" title="Attendance" description="Check-ins recorded by the front desk, compared with the roster: lateness, breaks, overtime, timesheets and leave." />
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === "Team today" && <TeamToday />}
      {tab === "Timesheets" && <Timesheets />}
      {tab === "Leave" && <Leave />}
    </div>
  )
}

function RecordTable({ records, showStaff, onEdit }: { records: AttendanceRecord[]; showStaff?: boolean; onEdit?: (record: AttendanceRecord) => void }) {
  const { state } = useBakery()
  const now = useNow(30000)
  if (!records.length) return <Empty text="No attendance records." />
  return (
    <Table minWidth={640} headings={[...(showStaff ? ["Employee"] : []), "Date", "In", "Out", "Breaks", "Worked", "Recorded by", "Flags", ...(onEdit ? [""] : [])]}>
      {records.map((record) => {
        const member = state.staff.find((item) => item.id === record.staffId)
        const late = lateMinutes(state, record)
        const hours = workedMs(record, now) / 3600000
        return (
          <tr key={record.id}>
            {showStaff && <Td className="font-semibold">{member?.name}</Td>}
            <Td>{formatDay(record.checkIn)}</Td>
            <Td>{formatTime(record.checkIn)}</Td>
            <Td>{record.checkOut ? formatTime(record.checkOut) : <Pill tone="good">On shift</Pill>}</Td>
            <Td>{formatDuration(breakMs(record, now))}</Td>
            <Td className="font-bold">{formatDuration(workedMs(record, now))}</Td>
            <Td className="text-xs">{record.recordedBy}</Td>
            <Td><div className="flex flex-wrap gap-1">{late > 0 && <Pill tone="warn">Late {late}m</Pill>}{hours > state.settings.overtimeAfterHours && <Pill tone="info">Overtime</Pill>}{record.edited && <Pill tone="info">Edited · {record.edited.by}</Pill>}</div></Td>
            {onEdit && <Td><button onClick={() => onEdit(record)} className="rounded p-1 text-[#c76a10] hover:bg-[#fff3e2]" aria-label="Correct record"><Pencil size={14} /></button></Td>}
          </tr>
        )
      })}
    </Table>
  )
}

function TeamToday() {
  const { state, can } = useBakery()
  const now = useNow(30000)
  const [editing, setEditing] = useState<AttendanceRecord | null>(null)
  const today = dayKey()
  const active = state.staff.filter((member) => member.status !== "Inactive")
  const missing = new Set(notCheckedIn(state, now).map((member) => member.id))
  const onLeave = (member: Staff) => state.leave.some((item) => item.staffId === member.id && item.status === "Approved" && item.from <= today && item.to >= today)
  const working = active.filter((member) => openRecord(state, member.id) && !onBreak(openRecord(state, member.id)))
  const breaking = active.filter((member) => onBreak(openRecord(state, member.id)))
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <Metric label="Working now" value={working.length} icon={LogIn} tone="good" />
        <Metric label="On break" value={breaking.length} icon={Coffee} />
        <Metric label="Late / missing" value={missing.size} icon={Timer} tone={missing.size ? "bad" : "default"} hint={missing.size ? "Scheduled, not checked in" : "Everyone is in"} />
        <Metric label="Scheduled today" value={state.shifts.filter((shift) => shift.date === today).length} icon={CalendarDays} />
      </div>
      <Card title="Team board" action={can("attendance.manage") && <Button tone="neutral" onClick={() => setEditing({ id: uid("att"), staffId: active[0]?.id, date: today, checkIn: new Date().toISOString(), breaks: [], method: "Manager correction", recordedBy: "" })}><Plus size={14} /> Add record</Button>}>
        <Table minWidth={760} headings={["Employee", "Shift today", "Status", "In", "Out", "Worked", ""]}>
          {active.map((member) => {
            const shift = shiftFor(state, member.id)
            const records = state.attendance.filter((record) => record.staffId === member.id && record.date === today)
            const record = openRecord(state, member.id) ?? records[0]
            const late = record ? lateMinutes(state, record) : 0
            const status = onLeave(member) ? <Pill tone="info">On leave</Pill> : !record ? (missing.has(member.id) ? <Pill tone="urgent">Not checked in</Pill> : shift ? <Pill>Starts {shift.start}</Pill> : <Pill>Day off</Pill>) : record.checkOut ? <Pill>Checked out</Pill> : onBreak(record) ? <Pill tone="warn">On break</Pill> : <Pill tone="good">Working</Pill>
            return (
              <tr key={member.id}>
                <Td><div className="flex items-center gap-2"><Avatar name={member.name} initials={member.initials} size={30} /><span><strong>{member.name}</strong><span className="block text-[11px] text-[#8f8981]">{member.role}</span></span></div></Td>
                <Td className="text-xs">{shift ? `${shift.start}–${shift.end} · ${shift.station}` : "—"}</Td>
                <Td><div className="flex flex-wrap gap-1">{status}{late > 0 && <Pill tone="warn">Late {late}m</Pill>}</div></Td>
                <Td>{record ? formatTime(record.checkIn) : "—"}</Td>
                <Td>{record?.checkOut ? formatTime(record.checkOut) : "—"}</Td>
                <Td className="font-bold">{records.length ? formatDuration(records.reduce((sum, item) => sum + workedMs(item, now), 0)) : "—"}</Td>
                <Td>{can("attendance.manage") && record && <button onClick={() => setEditing(record)} className="rounded p-1 text-[#c76a10] hover:bg-[#fff3e2]" aria-label={`Correct ${member.name}`}><Pencil size={14} /></button>}</Td>
              </tr>
            )
          })}
        </Table>
      </Card>
      {editing && <CorrectionModal record={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}

function CorrectionModal({ record, onClose }: { record: AttendanceRecord; onClose: () => void }) {
  const { state, commit } = useBakery()
  const isNew = !state.attendance.some((item) => item.id === record.id)
  const [staffId, setStaffId] = useState(record.staffId)
  const [date, setDate] = useState(record.date)
  const [checkIn, setCheckIn] = useState(formatTime(record.checkIn))
  const [checkOut, setCheckOut] = useState(record.checkOut ? formatTime(record.checkOut) : "")
  const [breakMinutes, setBreakMinutes] = useState(Math.round(breakMs(record) / 60000))
  const [reason, setReason] = useState("")
  const save = () => {
    const start = atTime(date, checkIn)
    const end = checkOut ? atTime(date, checkOut) : undefined
    if (end && end <= start) end.setDate(end.getDate() + 1)
    const breakStart = new Date(start.getTime() + 3 * 3600000)
    commit((s, a) => correctAttendance(s, a, {
      ...record, staffId, date, checkIn: start.toISOString(), checkOut: end?.toISOString(),
      breaks: breakMinutes > 0 ? [{ start: breakStart.toISOString(), end: new Date(breakStart.getTime() + breakMinutes * 60000).toISOString() }] : [],
    }, reason.trim()))
    onClose()
  }
  return (
    <Modal title={isNew ? "Add attendance record" : "Correct attendance"} onClose={onClose}>
      <p className="mt-1 text-xs text-[#8f8981]">Every correction keeps who changed it and why, for payroll and labour-law records.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Employee"><select disabled={!isNew} value={staffId} onChange={(event) => setStaffId(event.target.value)} className={inputClass}>{state.staff.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></Field>
        <Field label="Date"><input type="date" value={date} onChange={(event) => setDate(event.target.value)} className={inputClass} /></Field>
        <Field label="Check in"><input type="time" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} className={inputClass} /></Field>
        <Field label="Check out (empty = still working)"><input type="time" value={checkOut} onChange={(event) => setCheckOut(event.target.value)} className={inputClass} /></Field>
        <Field label="Total break (minutes)"><input type="number" min={0} value={breakMinutes} onChange={(event) => setBreakMinutes(Number(event.target.value) || 0)} className={inputClass} /></Field>
        <Field label="Reason *"><input value={reason} onChange={(event) => setReason(event.target.value)} className={inputClass} placeholder="Forgot to check out…" /></Field>
      </div>
      <div className="mt-6 flex justify-end gap-2"><Button tone="ghost" onClick={onClose}>Cancel</Button><Button disabled={!reason.trim() || !checkIn} onClick={save}>Save record</Button></div>
    </Modal>
  )
}

function Timesheets() {
  const { state, can } = useBakery()
  const now = useNow(60000)
  const [monday, setMonday] = useState(() => mondayOf(new Date()))
  const [editing, setEditing] = useState<AttendanceRecord | null>(null)
  const [detailFor, setDetailFor] = useState<string | null>(null)
  const days = weekDays(monday)
  const showPay = can("attendance.manage")
  const rows = state.staff.filter((member) => member.status !== "Inactive").map((member) => {
    const perDay = days.map((day) => state.attendance.filter((record) => record.staffId === member.id && record.date === dayKey(day)).reduce((sum, record) => sum + workedMs(record, now), 0) / 3600000)
    const scheduled = state.shifts.filter((shift) => shift.staffId === member.id && days.some((day) => dayKey(day) === shift.date)).reduce((sum, shift) => sum + shiftHours(shift), 0)
    const records = state.attendance.filter((record) => record.staffId === member.id && days.some((day) => dayKey(day) === record.date))
    const total = perDay.reduce((sum, hours) => sum + hours, 0)
    const overtime = perDay.reduce((sum, hours) => sum + Math.max(0, hours - state.settings.overtimeAfterHours), 0)
    return { member, perDay, total, scheduled, overtime, late: records.filter((record) => lateMinutes(state, record) > 0).length, pay: total * member.hourlyRate, records }
  })
  const exportCsv = () => downloadCsv(`timesheet-${dayKey(monday)}.csv`, [
    ["Employee", "Role", ...days.map((day) => dayKey(day)), "Total h", "Scheduled h", "Overtime h", "Late", ...(showPay ? ["Rate", "Gross pay"] : [])],
    ...rows.map((row) => [row.member.name, row.member.role, ...row.perDay.map((hours) => hours.toFixed(2)), row.total.toFixed(2), row.scheduled.toFixed(2), row.overtime.toFixed(2), row.late, ...(showPay ? [row.member.hourlyRate, row.pay.toFixed(2)] : [])]),
  ])
  const detail = rows.find((row) => row.member.id === detailFor)
  return (
    <div className="space-y-6">
      <Card title={`Week of ${monday.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`} subtitle="Hours worked (breaks excluded). Click an employee to see and correct records."
        action={<div className="flex gap-2"><Button tone="neutral" onClick={() => setMonday(addDays(monday, -7))} title="Previous week"><ChevronLeft size={14} /></Button><Button tone="neutral" onClick={() => setMonday(mondayOf(new Date()))}>This week</Button><Button tone="neutral" onClick={() => setMonday(addDays(monday, 7))} title="Next week"><ChevronRight size={14} /></Button><Button tone="dark" onClick={exportCsv}><Download size={14} /> CSV</Button></div>}>
        <Table minWidth={900} headings={["Employee", ...days.map((day) => day.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" })), "Total", "Sched.", "Overtime", "Late", ...(showPay ? ["Gross pay"] : [])]}>
          {rows.map((row) => (
            <tr key={row.member.id} onClick={() => setDetailFor(row.member.id)} className={`cursor-pointer hover:bg-[#fdfbf8] ${detailFor === row.member.id ? "bg-[#fff8ee]" : ""}`}>
              <Td><strong>{row.member.name}</strong><span className="block text-[11px] text-[#8f8981]">{row.member.role}</span></Td>
              {row.perDay.map((hours, index) => <Td key={index} className={hours > state.settings.overtimeAfterHours ? "font-bold text-sky-700" : hours ? "" : "text-[#c3bbb3]"}>{hours ? hours.toFixed(1) : "–"}</Td>)}
              <Td className="font-bold">{row.total.toFixed(1)}h</Td>
              <Td>{row.scheduled.toFixed(1)}h</Td>
              <Td>{row.overtime ? <Pill tone="info">{row.overtime.toFixed(1)}h</Pill> : "–"}</Td>
              <Td>{row.late ? <Pill tone="warn">{row.late}</Pill> : "–"}</Td>
              {showPay && <Td>{money(row.pay)}</Td>}
            </tr>
          ))}
        </Table>
        <p className="mt-3 text-xs text-[#8f8981]">Team total {rows.reduce((sum, row) => sum + row.total, 0).toFixed(1)}h{showPay && ` · labour cost ${money(rows.reduce((sum, row) => sum + row.pay, 0))}`}</p>
      </Card>
      {detail && <Card title={`${detail.member.name} — records`}><RecordTable records={detail.records} onEdit={can("attendance.manage") ? setEditing : undefined} /></Card>}
      {editing && <CorrectionModal record={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}

function Leave() {
  const { state, commit } = useBakery()
  const active = state.staff.filter((member) => member.status !== "Inactive")
  const [staffId, setStaffId] = useState(active[0]?.id ?? "")
  const [type, setType] = useState<LeaveType>("Vacation")
  const [from, setFrom] = useState(dayKey(addDays(new Date(), 7)))
  const [to, setTo] = useState(dayKey(addDays(new Date(), 7)))
  const [reason, setReason] = useState("")
  return (
    <div className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
      <Card title="Record leave" subtitle="Leave shows on the roster and excuses the day from lateness alerts">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Employee" className="sm:col-span-2"><select value={staffId} onChange={(event) => setStaffId(event.target.value)} className={inputClass}>{active.map((member) => <option key={member.id} value={member.id}>{member.name} · {member.role}</option>)}</select></Field>
          <Field label="Type" className="sm:col-span-2"><select value={type} onChange={(event) => setType(event.target.value as LeaveType)} className={inputClass}>{["Vacation", "Sick", "Personal", "Unpaid"].map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Field label="From"><input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className={inputClass} /></Field>
          <Field label="To"><input type="date" value={to} min={from} onChange={(event) => setTo(event.target.value)} className={inputClass} /></Field>
          <Field label="Reason" className="sm:col-span-2"><input value={reason} onChange={(event) => setReason(event.target.value)} className={inputClass} /></Field>
        </div>
        <Button className="mt-4 w-full" disabled={!staffId || to < from} onClick={() => { commit((s, a) => recordLeave(s, a, { staffId, type, from, to, reason }), "Leave recorded"); setReason("") }}>Record leave</Button>
      </Card>
      <Card title="Leave">
        {state.leave.length === 0 ? <Empty text="No leave recorded." /> : (
          <Table minWidth={560} headings={["Employee", "Type", "Dates", "Reason", "Status"]}>
            {state.leave.map((item) => (
              <tr key={item.id}>
                <Td className="font-semibold">{state.staff.find((member) => member.id === item.staffId)?.name}</Td>
                <Td>{item.type}</Td>
                <Td className="text-xs">{item.from === item.to ? item.from : `${item.from} → ${item.to}`}</Td>
                <Td className="text-xs">{item.reason || "—"}</Td>
                <Td>{item.status === "Pending" ? <div className="flex gap-1"><Button onClick={() => commit((s, a) => decideLeave(s, a, item.id, "Approved"), "Leave approved")}>Approve</Button><Button tone="danger" onClick={() => commit((s, a) => decideLeave(s, a, item.id, "Rejected"), "Leave rejected")}>Reject</Button></div> : <Pill tone={item.status === "Approved" ? "good" : "urgent"}>{item.status}{item.decidedBy && ` · ${item.decidedBy}`}</Pill>}</Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  )
}

// ---- Roster ------------------------------------------------------------------------------------

export function RosterPage() {
  const { state, commit, can } = useBakery()
  const [monday, setMonday] = useState(() => mondayOf(new Date()))
  const [editing, setEditing] = useState<Shift | null>(null)
  const days = weekDays(monday)
  const manage = can("attendance.manage")
  const staff = state.staff.filter((member) => member.status !== "Inactive")
  const onLeave = (staffId: string, date: string) => state.leave.find((item) => item.staffId === staffId && item.status === "Approved" && item.from <= date && item.to >= date)
  return (
    <div className="space-y-6">
      <PageHeading eyebrow="Shift roster" title="Who works when" description="Weekly shifts drive lateness detection, the kiosk and timesheet comparisons."
        actions={<><Button tone="neutral" onClick={() => setMonday(addDays(monday, -7))} title="Previous week"><ChevronLeft size={14} /></Button><Button tone="neutral" onClick={() => setMonday(mondayOf(new Date()))}>This week</Button><Button tone="neutral" onClick={() => setMonday(addDays(monday, 7))} title="Next week"><ChevronRight size={14} /></Button>{manage && <Button tone="dark" onClick={() => commit((s, a) => copyWeekRoster(s, a, monday))}><Copy size={14} /> Copy to next week</Button>}</>} />
      <Card>
        <Table minWidth={980} headings={["Employee", ...days.map((day) => day.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })), "Hours"]}>
          {staff.map((member) => {
            const shifts = state.shifts.filter((shift) => shift.staffId === member.id)
            const hours = days.reduce((sum, day) => sum + shifts.filter((shift) => shift.date === dayKey(day)).reduce((acc, shift) => acc + shiftHours(shift), 0), 0)
            return (
              <tr key={member.id}>
                <Td><strong>{member.name}</strong><span className="block text-[11px] text-[#8f8981]">{member.role}</span></Td>
                {days.map((day) => {
                  const key = dayKey(day)
                  const shift = shifts.find((item) => item.date === key)
                  const leave = onLeave(member.id, key)
                  return (
                    <Td key={key} className={key === dayKey() ? "bg-[#fff8ee]" : ""}>
                      {leave ? <Pill tone="info">{leave.type}</Pill> : shift ? (
                        <button disabled={!manage} onClick={() => setEditing(shift)} className="w-full rounded-lg bg-[#f6ead9] px-2 py-1.5 text-left text-[11px] font-bold text-[#7a4b1c] disabled:cursor-default"><span className="block">{shift.start}–{shift.end}</span><span className="font-normal">{shift.station}</span></button>
                      ) : manage ? (
                        <button onClick={() => setEditing({ id: uid("sh"), staffId: member.id, date: key, start: "08:00", end: "16:00", station: member.role === "Chef" ? "Kitchen" : member.role === "Rider" ? "Delivery" : "Front desk" })} className="w-full rounded-lg border border-dashed border-[#e2d9cf] py-1.5 text-[11px] text-[#b3a89e] hover:border-[#ee9633] hover:text-[#c76a10]">+ Add</button>
                      ) : <span className="text-[11px] text-[#c3bbb3]">Off</span>}
                    </Td>
                  )
                })}
                <Td className="font-bold">{hours.toFixed(1)}h</Td>
              </tr>
            )
          })}
        </Table>
      </Card>
      {editing && <ShiftModal shift={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}

function ShiftModal({ shift, onClose }: { shift: Shift; onClose: () => void }) {
  const { state, commit } = useBakery()
  const [draft, setDraft] = useState(shift)
  const exists = state.shifts.some((item) => item.id === shift.id)
  return (
    <Modal title={`${exists ? "Edit" : "Add"} shift · ${state.staff.find((member) => member.id === shift.staffId)?.name}`} onClose={onClose}>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Date"><input type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} className={inputClass} /></Field>
        <Field label="Station"><select value={draft.station} onChange={(event) => setDraft({ ...draft, station: event.target.value })} className={inputClass}>{["Kitchen", "Front desk", "Delivery", "Floor", "Office", "Decorating"].map((item) => <option key={item}>{item}</option>)}</select></Field>
        <Field label="Start"><input type="time" value={draft.start} onChange={(event) => setDraft({ ...draft, start: event.target.value })} className={inputClass} /></Field>
        <Field label="End"><input type="time" value={draft.end} onChange={(event) => setDraft({ ...draft, end: event.target.value })} className={inputClass} /></Field>
      </div>
      <div className="mt-6 flex justify-between gap-2">
        {exists ? <Button tone="danger" onClick={() => { commit((s, a) => removeShift(s, a, shift.id)); onClose() }}>Remove shift</Button> : <span />}
        <div className="flex gap-2"><Button tone="ghost" onClick={onClose}>Cancel</Button><Button disabled={draft.end <= draft.start} onClick={() => { commit((s, a) => saveShift(s, a, draft)); onClose() }}>Save shift</Button></div>
      </div>
    </Modal>
  )
}

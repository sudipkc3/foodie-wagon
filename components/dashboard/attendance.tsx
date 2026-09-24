"use client"

import { useState } from "react"
import { CalendarDays, ChevronLeft, ChevronRight, Coffee, Copy, Download, LogIn, LogOut, MonitorSmartphone, Pencil, Plus, Timer } from "lucide-react"
import { useBakery, useNow } from "@/lib/bakery/store"
import { clock, copyWeekRoster, correctAttendance, decideLeave, lateMinutes, openRecord, removeShift, requestLeave, saveShift, shiftFor, type ClockAction } from "@/lib/bakery/operations"
import { addDays, atTime, breakMs, dayKey, downloadCsv, formatDay, formatDuration, formatTime, money, onBreak, uid, workedMs } from "@/lib/bakery/format"
import type { AttendanceRecord, LeaveType, Shift, Staff } from "@/lib/bakery/types"
import { notCheckedIn } from "./overview"
import { Avatar, Button, Card, Empty, Field, Metric, Modal, PageHeading, Pill, Table, Td, Tabs, inputClass } from "./ui"

const mondayOf = (date: Date) => { const monday = addDays(date, -((date.getDay() + 6) % 7)); monday.setHours(0, 0, 0, 0); return monday }
const weekDays = (monday: Date) => Array.from({ length: 7 }, (_, index) => addDays(monday, index))
const shiftHours = (shift: Shift) => (atTime(shift.date, shift.end).getTime() - atTime(shift.date, shift.start).getTime()) / 3600000

// ---- Clock widget (also used in the header) -----------------------------------------------

export function ClockCard({ compact }: { compact?: boolean }) {
  const { state, staff, commit } = useBakery()
  const now = useNow(1000)
  if (!staff) return null
  const record = openRecord(state, staff.id)
  const shift = shiftFor(state, staff.id)
  const breakActive = onBreak(record)
  const act = (action: ClockAction) => commit((s) => clock(s, staff, action))
  const status = !record ? "Off the clock" : breakActive ? "On break" : "Working"
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold md:inline-flex ${!record ? "bg-[#f6f3ee] text-[#7d766e]" : breakActive ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${!record ? "bg-stone-400" : breakActive ? "bg-amber-500" : "animate-pulse bg-emerald-500"}`} />{record ? `${status} · ${formatDuration(workedMs(record, now))}` : status}
        </span>
        {!record ? <Button onClick={() => act("checkIn")}><LogIn size={14} /> Check in</Button> : <Button tone="neutral" onClick={() => act("checkOut")}><LogOut size={14} /> Check out</Button>}
      </div>
    )
  }
  const late = record ? lateMinutes(state, record) : 0
  return (
    <div className="rounded-2xl bg-[#302c28] p-6 text-white">
      <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#e4a385]">My attendance · {new Date(now).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" })}</p>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-white/60">{status}</p>
          <p className="font-mono text-5xl font-bold tabular-nums">{record ? formatClock(workedMs(record, now)) : "--:--:--"}</p>
          <p className="mt-2 text-xs text-white/60">
            {shift ? `Scheduled ${shift.start}–${shift.end} · ${shift.station}` : "No shift scheduled today"}
            {record && ` · in at ${formatTime(record.checkIn)}`}{record && record.breaks.length > 0 && ` · breaks ${formatDuration(breakMs(record, now))}`}
          </p>
          {late > 0 && <p className="mt-2 inline-block rounded-full bg-amber-400/20 px-2 py-0.5 text-[11px] font-bold text-amber-200">Checked in {late} min late</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {!record && <button onClick={() => act("checkIn")} className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-600"><LogIn size={17} /> Check in</button>}
          {record && !breakActive && <button onClick={() => act("breakStart")} className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-bold hover:bg-white/20"><Coffee size={17} /> Start break</button>}
          {record && breakActive && <button onClick={() => act("breakEnd")} className="flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-[#302c28]"><Timer size={17} /> End break</button>}
          {record && <button onClick={() => act("checkOut")} className="flex items-center gap-2 rounded-xl bg-[#e4a385] px-5 py-3 text-sm font-bold text-[#302c28]"><LogOut size={17} /> Check out</button>}
        </div>
      </div>
    </div>
  )
}

const formatClock = (ms: number) => { const s = Math.floor(ms / 1000); return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, "0")).join(":") }

// ---- Attendance page ---------------------------------------------------------------------------

const TABS = ["My attendance", "Team today", "Timesheets", "Leave"] as const
type Tab = (typeof TABS)[number]

export function AttendancePage() {
  const { can } = useBakery()
  const tabs = TABS.filter((tab) => tab === "My attendance" || tab === "Leave" || can("attendance.team"))
  const [tab, setTab] = useState<Tab>(can("attendance.team") ? "Team today" : "My attendance")
  return (
    <div className="space-y-6">
      <PageHeading eyebrow="Attendance" title="Check in, check out" description="Shift-aware time tracking with breaks, lateness, timesheets and leave. Staff can also use the shared PIN kiosk at the entrance."
        actions={<a href="/kiosk" target="_blank" className="inline-flex items-center gap-2 rounded-lg border border-[#e4dcd5] bg-white px-3 py-2 text-xs font-bold"><MonitorSmartphone size={14} /> Open kiosk</a>} />
      <Tabs tabs={tabs} active={tab} onChange={setTab} />
      {tab === "My attendance" && <MyAttendance />}
      {tab === "Team today" && <TeamToday />}
      {tab === "Timesheets" && <Timesheets />}
      {tab === "Leave" && <Leave />}
    </div>
  )
}

function MyAttendance() {
  const { state, staff } = useBakery()
  const now = useNow(30000)
  if (!staff) return null
  const monday = mondayOf(new Date())
  const records = state.attendance.filter((record) => record.staffId === staff.id)
  const week = weekDays(monday).map((day) => {
    const dayRecords = records.filter((record) => record.date === dayKey(day))
    const shift = shiftFor(state, staff.id, dayKey(day))
    return { day, worked: dayRecords.reduce((sum, record) => sum + workedMs(record, now), 0), scheduled: shift ? shiftHours(shift) : 0, shift }
  })
  const total = week.reduce((sum, item) => sum + item.worked, 0)
  const scheduled = week.reduce((sum, item) => sum + item.scheduled, 0)
  const maxHours = Math.max(9, ...week.map((item) => item.worked / 3600000))
  return (
    <div className="space-y-6">
      <ClockCard />
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="This week" value={formatDuration(total)} icon={Timer} hint={`${scheduled.toFixed(1)}h scheduled`} />
        <Metric label="Late check-ins (30 days)" value={records.filter((record) => new Date(record.checkIn).getTime() > Date.now() - 30 * 86400000 && lateMinutes(state, record) > 0).length} icon={CalendarDays} />
        <Metric label="Next shift" value={nextShiftLabel(state.shifts.filter((shift) => shift.staffId === staff.id))} icon={CalendarDays} />
      </div>
      <Card title="My week" subtitle="Worked hours per day against the scheduled shift">
        <div className="flex h-44 items-end gap-3">
          {week.map((item) => (
            <div key={dayKey(item.day)} className="flex flex-1 flex-col items-center gap-1" title={`${formatDuration(item.worked)} worked${item.shift ? ` · shift ${item.shift.start}–${item.shift.end}` : ""}`}>
              <span className="text-[10px] font-bold text-[#6f675f]">{item.worked ? (item.worked / 3600000).toFixed(1) : ""}</span>
              <div className="relative flex h-32 w-full max-w-12 items-end rounded-t bg-[#f6f0ea]">
                {item.scheduled > 0 && <div className="absolute inset-x-0 border-t-2 border-dashed border-[#c9b8a8]" style={{ bottom: `${(item.scheduled / maxHours) * 100}%` }} />}
                <div className="w-full rounded-t bg-[#e8a05a]" style={{ height: `${(item.worked / 3600000 / maxHours) * 100}%` }} />
              </div>
              <span className={`text-[11px] ${dayKey(item.day) === dayKey() ? "font-bold text-[#c76a10]" : "text-[#9b8f87]"}`}>{item.day.toLocaleDateString("en-GB", { weekday: "short" })}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-[#9b8f87]">Dashed line = scheduled hours.</p>
      </Card>
      <Card title="Recent records">
        <RecordTable records={records.slice(0, 14)} />
      </Card>
    </div>
  )
}

const nextShiftLabel = (shifts: Shift[]) => {
  const upcoming = shifts.filter((shift) => atTime(shift.date, shift.start).getTime() > Date.now()).sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`))[0]
  return upcoming ? `${formatDay(atTime(upcoming.date, upcoming.start).toISOString())} ${upcoming.start}` : "—"
}

function RecordTable({ records, showStaff, onEdit }: { records: AttendanceRecord[]; showStaff?: boolean; onEdit?: (record: AttendanceRecord) => void }) {
  const { state } = useBakery()
  const now = useNow(30000)
  if (!records.length) return <Empty text="No attendance records." />
  return (
    <Table minWidth={640} headings={[...(showStaff ? ["Employee"] : []), "Date", "In", "Out", "Breaks", "Worked", "Flags", ...(onEdit ? [""] : [])]}>
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
            <Td><div className="flex flex-wrap gap-1">{late > 0 && <Pill tone="warn">Late {late}m</Pill>}{hours > state.settings.overtimeAfterHours && <Pill tone="info">Overtime</Pill>}{record.method === "Kiosk" && <Pill>Kiosk</Pill>}{record.edited && <Pill tone="info">Edited · {record.edited.by}</Pill>}</div></Td>
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
      <Card title="Team board" action={can("attendance.manage") && <Button tone="neutral" onClick={() => setEditing({ id: uid("att"), staffId: active[0]?.id, date: today, checkIn: new Date().toISOString(), breaks: [], method: "Manager" })}><Plus size={14} /> Add record</Button>}>
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
  const showPay = can("attendance.manage") || can("reports.view")
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
  const { state, staff, commit, can } = useBakery()
  const [type, setType] = useState<LeaveType>("Vacation")
  const [from, setFrom] = useState(dayKey(addDays(new Date(), 7)))
  const [to, setTo] = useState(dayKey(addDays(new Date(), 7)))
  const [reason, setReason] = useState("")
  const requests = can("attendance.manage") ? state.leave : state.leave.filter((item) => item.staffId === staff?.id)
  return (
    <div className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
      <Card title="Request leave" subtitle="Your manager is notified on their dashboard">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Type" className="sm:col-span-2"><select value={type} onChange={(event) => setType(event.target.value as LeaveType)} className={inputClass}>{["Vacation", "Sick", "Personal", "Unpaid"].map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Field label="From"><input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className={inputClass} /></Field>
          <Field label="To"><input type="date" value={to} min={from} onChange={(event) => setTo(event.target.value)} className={inputClass} /></Field>
          <Field label="Reason" className="sm:col-span-2"><input value={reason} onChange={(event) => setReason(event.target.value)} className={inputClass} /></Field>
        </div>
        <Button className="mt-4 w-full" disabled={to < from} onClick={() => { commit((s, a) => requestLeave(s, a, { type, from, to, reason })); setReason("") }}>Submit request</Button>
      </Card>
      <Card title={can("attendance.manage") ? "All leave requests" : "My requests"}>
        {requests.length === 0 ? <Empty text="No leave requests." /> : (
          <Table minWidth={560} headings={["Employee", "Type", "Dates", "Reason", "Status"]}>
            {requests.map((item) => (
              <tr key={item.id}>
                <Td className="font-semibold">{state.staff.find((member) => member.id === item.staffId)?.name}</Td>
                <Td>{item.type}</Td>
                <Td className="text-xs">{item.from === item.to ? item.from : `${item.from} → ${item.to}`}</Td>
                <Td className="text-xs">{item.reason || "—"}</Td>
                <Td>{item.status === "Pending" && can("attendance.manage") ? <div className="flex gap-1"><Button onClick={() => commit((s, a) => decideLeave(s, a, item.id, "Approved"))}>Approve</Button><Button tone="danger" onClick={() => commit((s, a) => decideLeave(s, a, item.id, "Rejected"))}>Reject</Button></div> : <Pill tone={item.status === "Approved" ? "good" : item.status === "Rejected" ? "urgent" : "warn"}>{item.status}{item.decidedBy && ` · ${item.decidedBy}`}</Pill>}</Td>
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

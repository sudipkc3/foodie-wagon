import { atTime, dayKey, formatTime, initials, uid } from "./format"
import { can, logActivity } from "./workflow"
import type {
  Actor, AttendanceRecord, BakeryState, LeaveRequest, Product, Role, Shift, Staff,
  WhatsAppTemplate, PermissionKey, Settings, CustomerProfile,
} from "./types"

// ---- Attendance -----------------------------------------------------------------

export const openRecord = (state: BakeryState, staffId: string) => state.attendance.find((record) => record.staffId === staffId && !record.checkOut)

export const shiftFor = (state: BakeryState, staffId: string, date = dayKey()) => state.shifts.find((shift) => shift.staffId === staffId && shift.date === date)

export const lateMinutes = (state: BakeryState, record: AttendanceRecord) => {
  const shift = shiftFor(state, record.staffId, record.date)
  if (!shift) return 0
  const diff = Math.round((new Date(record.checkIn).getTime() - atTime(shift.date, shift.start).getTime()) / 60000)
  return diff > state.settings.lateGraceMinutes ? diff : 0
}

export type ClockAction = "checkIn" | "breakStart" | "breakEnd" | "checkOut"

// Performed by reception at the front desk on behalf of the selected worker.
export function clock(state: BakeryState, actor: Actor, staffId: string, action: ClockAction): BakeryState {
  const staff = state.staff.find((member) => member.id === staffId)
  if (!staff || staff.status === "Inactive" || !can(state, actor, "attendance.checkin")) return state
  const now = new Date().toISOString()
  const current = openRecord(state, staff.id)
  let attendance = state.attendance
  let label = ""
  if (action === "checkIn") {
    if (current) return state
    attendance = [{ id: uid("att"), staffId: staff.id, date: dayKey(), checkIn: now, breaks: [], method: "Front desk", recordedBy: actor.name }, ...attendance]
    label = `checked in at ${formatTime(now)}`
  } else {
    if (!current) return state
    const update = (fn: (record: AttendanceRecord) => AttendanceRecord) => state.attendance.map((record) => (record.id === current.id ? fn(record) : record))
    if (action === "breakStart" && !current.breaks.some((item) => !item.end)) { attendance = update((record) => ({ ...record, breaks: [...record.breaks, { start: now }] })); label = "started a break" }
    else if (action === "breakEnd") { attendance = update((record) => ({ ...record, breaks: record.breaks.map((item) => (item.end ? item : { ...item, end: now })) })); label = "ended a break" }
    else if (action === "checkOut") { attendance = update((record) => ({ ...record, checkOut: now, breaks: record.breaks.map((item) => (item.end ? item : { ...item, end: now })) })); label = `checked out at ${formatTime(now)}` }
    else return state
  }
  return logActivity({ ...state, attendance }, actor, `recorded: ${staff.name} ${label}`, "Attendance")
}

export function correctAttendance(state: BakeryState, actor: Actor, record: AttendanceRecord, reason: string) {
  if (!can(state, actor, "attendance.manage")) return state
  const exists = state.attendance.some((item) => item.id === record.id)
  const edited = { ...record, recordedBy: record.recordedBy || actor.name, edited: { by: actor.name, at: new Date().toISOString(), reason } }
  const staff = state.staff.find((item) => item.id === record.staffId)
  const next = { ...state, attendance: exists ? state.attendance.map((item) => (item.id === record.id ? edited : item)) : [edited, ...state.attendance] }
  return logActivity(next, actor, `${exists ? "corrected" : "added"} attendance for ${staff?.name} (${reason})`, "Attendance")
}

export function saveShift(state: BakeryState, actor: Actor, shift: Shift) {
  if (!can(state, actor, "attendance.manage")) return state
  const exists = state.shifts.some((item) => item.id === shift.id)
  const next = { ...state, shifts: exists ? state.shifts.map((item) => (item.id === shift.id ? shift : item)) : [...state.shifts, shift] }
  return logActivity(next, actor, `${exists ? "updated" : "scheduled"} a ${shift.start}–${shift.end} shift for ${state.staff.find((s) => s.id === shift.staffId)?.name} on ${shift.date}`, "Attendance")
}

export function removeShift(state: BakeryState, actor: Actor, shiftId: string) {
  if (!can(state, actor, "attendance.manage")) return state
  return logActivity({ ...state, shifts: state.shifts.filter((item) => item.id !== shiftId) }, actor, "removed a shift", "Attendance")
}

export function copyWeekRoster(state: BakeryState, actor: Actor, fromMonday: Date) {
  if (!can(state, actor, "attendance.manage")) return state
  const keys = Array.from({ length: 7 }, (_, index) => dayKey(new Date(fromMonday.getFullYear(), fromMonday.getMonth(), fromMonday.getDate() + index)))
  const copies = state.shifts.filter((shift) => keys.includes(shift.date)).map((shift) => {
    const date = new Date(`${shift.date}T00:00:00`)
    date.setDate(date.getDate() + 7)
    return { ...shift, id: uid("sh"), date: dayKey(date) }
  })
  const targetKeys = new Set(copies.map((shift) => `${shift.staffId}-${shift.date}`))
  return logActivity({ ...state, shifts: [...state.shifts.filter((shift) => !targetKeys.has(`${shift.staffId}-${shift.date}`)), ...copies] }, actor, `copied ${copies.length} shifts to next week`, "Attendance")
}

// Managers record leave on an employee's behalf; it is approved immediately.
export function recordLeave(state: BakeryState, actor: Actor, input: Omit<LeaveRequest, "id" | "status" | "createdAt" | "decidedBy">) {
  if (!can(state, actor, "attendance.manage")) return state
  const request: LeaveRequest = { ...input, id: uid("lv"), status: "Approved", decidedBy: actor.name, createdAt: new Date().toISOString() }
  const name = state.staff.find((member) => member.id === input.staffId)?.name
  return logActivity({ ...state, leave: [request, ...state.leave] }, actor, `recorded ${input.type.toLowerCase()} leave for ${name} ${input.from} → ${input.to}`, "Attendance")
}

export function decideLeave(state: BakeryState, actor: Actor, id: string, status: "Approved" | "Rejected") {
  if (!can(state, actor, "attendance.manage")) return state
  const request = state.leave.find((item) => item.id === id)
  const next = { ...state, leave: state.leave.map((item) => (item.id === id ? { ...item, status, decidedBy: actor.name } : item)) }
  return logActivity(next, actor, `${status.toLowerCase()} leave for ${state.staff.find((s) => s.id === request?.staffId)?.name}`, "Attendance")
}

// ---- Staff & permissions --------------------------------------------------------------

export function saveStaff(state: BakeryState, actor: Actor, staff: Staff) {
  if (!can(state, actor, "staff.manage")) return state
  const exists = state.staff.some((item) => item.id === staff.id)
  const normalized = { ...staff, email: staff.email.trim().toLowerCase(), initials: initials(staff.name) }
  const next = { ...state, staff: exists ? state.staff.map((item) => (item.id === staff.id ? normalized : item)) : [...state.staff, normalized] }
  return logActivity(next, actor, `${exists ? "updated" : "added"} employee ${staff.name} (${staff.role})`, "Staff")
}

export function togglePermission(state: BakeryState, actor: Actor, role: Role, key: PermissionKey) {
  if (!can(state, actor, "roles.manage") || role === "Admin") return state
  const current = state.permissions[role]
  const permissions = { ...state.permissions, [role]: current.includes(key) ? current.filter((item) => item !== key) : [...current, key] }
  return logActivity({ ...state, permissions }, actor, `${current.includes(key) ? "revoked" : "granted"} ${key} for ${role}`, "Staff")
}

// ---- Catalogue ------------------------------------------------------------------------

export function saveProduct(state: BakeryState, actor: Actor, product: Product) {
  if (!can(state, actor, "products.manage")) return state
  const exists = state.products.some((item) => item.id === product.id)
  const next = { ...state, products: exists ? state.products.map((item) => (item.id === product.id ? product : item)) : [...state.products, product] }
  return logActivity(next, actor, `${exists ? "updated" : "added"} product ${product.name}`, "Products")
}





// ---- Communication, customers & settings -------------------------------------------------

export function saveTemplate(state: BakeryState, actor: Actor, template: WhatsAppTemplate) {
  if (!can(state, actor, "whatsapp.manage")) return state
  return logActivity({ ...state, templates: state.templates.map((item) => (item.id === template.id ? template : item)) }, actor, `updated WhatsApp template "${template.name}"`, "WhatsApp")
}

export function saveCustomerProfile(state: BakeryState, actor: Actor, profile: CustomerProfile) {
  if (!can(state, actor, "customers.edit")) return state
  const exists = state.customers.some((item) => item.phone === profile.phone)
  const next = { ...state, customers: exists ? state.customers.map((item) => (item.phone === profile.phone ? profile : item)) : [...state.customers, profile] }
  return logActivity(next, actor, `updated customer notes for ${profile.phone}`, "Customers")
}

export function saveSettings(state: BakeryState, actor: Actor, settings: Settings) {
  if (!can(state, actor, "settings.manage")) return state
  return logActivity({ ...state, settings }, actor, "updated bakery settings", "Settings")
}

// Any signed-in employee may update their own name, phone and password.
export function updateOwnProfile(state: BakeryState, actor: Actor, patch: Pick<Staff, "name" | "phone" | "password">) {
  if (!patch.name.trim() || patch.password.length < 6) return state
  const staff = state.staff.map((item) => (item.id === actor.id ? { ...item, ...patch, name: patch.name.trim(), initials: initials(patch.name) } : item))
  return logActivity({ ...state, staff }, actor, "updated their profile", "Staff")
}

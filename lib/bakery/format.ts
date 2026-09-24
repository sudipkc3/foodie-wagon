import type { AttendanceRecord, Order, PaymentStatus } from "./types"

export const money = (value: number) => `€${(Number.isFinite(value) ? value : 0).toFixed(2)}`

export const uid = (prefix = "id") => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`

export const dayKey = (value: Date | string = new Date()) => {
  const date = typeof value === "string" ? new Date(value) : value
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

export const addDays = (value: Date | string, days: number) => {
  const date = new Date(value)
  date.setDate(date.getDate() + days)
  return date
}

export const atTime = (day: Date | string, hhmm: string) => {
  const date = new Date(typeof day === "string" && day.length === 10 ? `${day}T00:00:00` : day)
  const [hours, minutes] = hhmm.split(":").map(Number)
  date.setHours(hours || 0, minutes || 0, 0, 0)
  return date
}

export const formatTime = (iso?: string) => (iso ? new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "—")

export const formatDay = (iso: string) => {
  const key = dayKey(iso)
  if (key === dayKey()) return "Today"
  if (key === dayKey(addDays(new Date(), 1))) return "Tomorrow"
  if (key === dayKey(addDays(new Date(), -1))) return "Yesterday"
  return new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
}

export const formatDateTime = (iso?: string) => (iso ? `${formatDay(iso)} · ${formatTime(iso)}` : "—")

export const formatDuration = (ms: number) => {
  const totalMinutes = Math.max(0, Math.round(ms / 60000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours ? `${hours}h ${String(minutes).padStart(2, "0")}m` : `${minutes}m`
}

export const relativeTime = (iso: string, now = Date.now()) => {
  const diff = now - new Date(iso).getTime()
  if (diff < 60_000) return "just now"
  if (diff < 3_600_000) return `${Math.round(diff / 60_000)} min ago`
  if (diff < 86_400_000) return `${Math.round(diff / 3_600_000)} h ago`
  return formatDay(iso)
}

export const initials = (name: string) => name.split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase()

// ---- Order math -------------------------------------------------------------

export const orderSubtotal = (order: Order) => order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
export const orderTotal = (order: Order) => Math.max(0, orderSubtotal(order) + order.deliveryFee - order.discount)
export const orderPaid = (order: Order) => order.transactions.reduce((sum, tx) => sum + (tx.kind === "Payment" ? tx.amount : -tx.amount), 0)
export const orderBalance = (order: Order) => Math.max(0, orderTotal(order) - orderPaid(order))
export const paymentStatus = (order: Order): PaymentStatus => {
  const paid = orderPaid(order)
  if (order.transactions.some((tx) => tx.kind === "Refund") && paid <= 0) return "Refunded"
  if (paid <= 0) return "Unpaid"
  return paid + 0.001 >= orderTotal(order) ? "Paid" : "Partial"
}
export const orderWeightKg = (order: Order) => order.items.reduce((sum, item) => sum + item.weightKg * item.quantity, 0)
export const orderTitle = (order: Order) => (order.items.length === 1 ? order.items[0].name : `${order.items[0]?.name ?? "Custom cake"} +${order.items.length - 1}`)
export const orderImage = (order: Order) => order.referenceImage || order.items[0]?.image || ""
export const isOpen = (order: Order) => !["Completed", "Cancelled"].includes(order.status)
export const minutesUntil = (iso: string, now = Date.now()) => Math.round((new Date(iso).getTime() - now) / 60000)

export const parseWeight = (size: string) => {
  const match = size.match(/([\d.,]+)\s*kg/i)
  return match ? Number(match[1].replace(",", ".")) : 1
}

// ---- Attendance math ----------------------------------------------------------

export const breakMs = (record: AttendanceRecord, now = Date.now()) =>
  record.breaks.reduce((sum, item) => sum + ((item.end ? new Date(item.end).getTime() : now) - new Date(item.start).getTime()), 0)

export const workedMs = (record: AttendanceRecord, now = Date.now()) => {
  const end = record.checkOut ? new Date(record.checkOut).getTime() : now
  return Math.max(0, end - new Date(record.checkIn).getTime() - breakMs(record, now))
}

export const onBreak = (record?: AttendanceRecord) => Boolean(record && !record.checkOut && record.breaks.some((item) => !item.end))

// ---- Files --------------------------------------------------------------------

export const downloadCsv = (filename: string, rows: (string | number)[][]) => {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n")
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

// Downscale an uploaded reference photo so it fits comfortably in browser storage.
export const readImageAsDataUrl = (file: File, maxSize = 720): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => {
      const image = new Image()
      image.onerror = () => reject(new Error("Unsupported image"))
      image.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height))
        const canvas = document.createElement("canvas")
        canvas.width = Math.round(image.width * scale)
        canvas.height = Math.round(image.height * scale)
        canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL("image/jpeg", 0.72))
      }
      image.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })

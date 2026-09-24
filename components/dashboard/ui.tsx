"use client"

import { useEffect, useState, type ComponentType, type ReactNode } from "react"
import { AlertTriangle, X } from "lucide-react"
import type { OrderStatus, PaymentStatus } from "@/lib/bakery/types"

type Icon = ComponentType<{ size?: number; className?: string }>

export const inputClass = "mt-2 w-full rounded-lg border border-[#e4dfd7] bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-[#ed9635]"

export function PageHeading({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#d18445]">{eyebrow}</p>
        <h2 className="mt-2 font-serif text-3xl font-bold">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-sm text-[#938e86]">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Card({ title, subtitle, action, children, className = "" }: { title?: ReactNode; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-[#e9e4dc] bg-white p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="font-serif text-xl font-bold">{title}</h3>}
            {subtitle && <p className="mt-1 text-xs text-[#938e86]">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function Metric({ label, value, icon: Icon, hint, tone = "default", onClick }: { label: string; value: string | number; icon: Icon; hint?: string; tone?: "default" | "warn" | "good" | "bad"; onClick?: () => void }) {
  const hintColor = tone === "warn" ? "text-amber-600" : tone === "bad" ? "text-red-600" : tone === "good" ? "text-emerald-600" : "text-[#9a8e86]"
  const Wrapper = onClick ? "button" : "div"
  return (
    <Wrapper onClick={onClick} className={`rounded-2xl border border-[#e9e4dc] bg-white p-5 text-left ${onClick ? "transition hover:border-[#eebc86]" : ""}`}>
      <div className="flex items-start justify-between gap-2"><p className="text-sm text-[#89847c]">{label}</p><Icon size={17} className="text-[#e39131]" /></div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      {hint && <p className={`mt-1 text-xs ${hintColor}`}>{hint}</p>}
    </Wrapper>
  )
}

const statusStyles: Record<string, string> = {
  New: "bg-[#fff1e0] text-[#c46f22]",
  Accepted: "bg-stone-100 text-stone-700",
  Preparing: "bg-amber-50 text-amber-700",
  Ready: "bg-sky-50 text-sky-700",
  "Picked Up": "bg-indigo-50 text-indigo-700",
  "Out for Delivery": "bg-violet-50 text-violet-700",
  Delivered: "bg-emerald-50 text-emerald-700",
  "Delivery Failed": "bg-red-50 text-red-700",
  Completed: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-red-50 text-red-600",
}

export function StatusBadge({ status }: { status: OrderStatus | string }) {
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyles[status] ?? "bg-[#f6f3ee] text-[#777169]"}`}>{status}</span>
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const style = status === "Paid" ? "bg-emerald-50 text-emerald-700" : status === "Partial" ? "bg-amber-50 text-amber-700" : status === "Refunded" ? "bg-stone-100 text-stone-600" : "bg-red-50 text-red-600"
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold ${style}`}>{status}</span>
}

export function Pill({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "urgent" | "good" | "warn" | "info" }) {
  const style = tone === "urgent" ? "bg-red-600 text-white" : tone === "good" ? "bg-emerald-50 text-emerald-700" : tone === "warn" ? "bg-amber-50 text-amber-700" : tone === "info" ? "bg-sky-50 text-sky-700" : "bg-[#f6f3ee] text-[#6f675f]"
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold ${style}`}>{children}</span>
}

export function Info({ label, value, className = "" }: { label: string; value: ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-[#eeeae3] p-3 ${className}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#aaa59d]">{label}</p>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  )
}

export function Select({ value, onChange, options, className = "", label }: { value: string; onChange: (value: string) => void; options: (string | { value: string; label: string })[]; className?: string; label?: string }) {
  return (
    <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className={`rounded-lg border border-[#e5e1da] bg-white px-2 py-2 text-xs ${className}`}>
      {options.map((option) => (typeof option === "string" ? <option key={option}>{option}</option> : <option key={option.value} value={option.value}>{option.label}</option>))}
    </select>
  )
}

export function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return <label className={`block text-xs font-bold text-[#4f4841] ${className}`}>{label}{children}</label>
}

export function Button({ children, onClick, tone = "primary", disabled, loading, className = "", type = "button", title }: { children: ReactNode; onClick?: () => void; tone?: "primary" | "neutral" | "dark" | "danger" | "ghost"; disabled?: boolean; loading?: ReactNode; className?: string; type?: "button" | "submit"; title?: string }) {
  const style = tone === "primary" ? "bg-[#ee9633] text-white hover:bg-[#dd8424]" : tone === "dark" ? "bg-[#302c28] text-white hover:bg-[#1f1c19]" : tone === "danger" ? "border border-red-200 bg-white text-red-600 hover:bg-red-50" : tone === "ghost" ? "text-[#c76a10] hover:bg-[#fff3e2]" : "border border-[#e4dcd5] bg-white text-[#3d3731] hover:bg-[#faf8f4]"
  return (
    <button type={type} title={title} onClick={onClick} disabled={disabled || Boolean(loading)} aria-busy={Boolean(loading)} className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-45 ${style} ${className}`}>
      {loading ? <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />{loading}</> : children}
    </button>
  )
}

export function Tabs<T extends string>({ tabs, active, onChange, counts }: { tabs: readonly T[]; active: T; onChange: (tab: T) => void; counts?: Partial<Record<T, number>> }) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-xl bg-[#f1ede7] p-1">
      {tabs.map((tab) => (
        <button key={tab} onClick={() => onChange(tab)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold transition ${active === tab ? "bg-white text-[#c76a10] shadow-sm" : "text-[#7d766e] hover:text-[#3d3731]"}`}>
          {tab}{counts?.[tab] !== undefined && <span className="ml-1.5 rounded-full bg-[#f6e3cd] px-1.5 py-0.5 text-[10px] text-[#a8601b]">{counts[tab]}</span>}
        </button>
      ))}
    </div>
  )
}

export function Empty({ text }: { text: string }) {
  return <p className="py-8 text-center text-sm text-[#938e86]">{text}</p>
}

export function Modal({ title, onClose, children, wide, narrow }: { title: ReactNode; onClose: () => void; children: ReactNode; wide?: boolean; narrow?: boolean }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])
  return (
    <div className="motion-fade fixed inset-0 z-50 grid place-items-center bg-[#22221f]/50 p-3 sm:p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" className={`motion-pop max-h-[94vh] w-full ${wide ? "max-w-5xl" : narrow ? "max-w-md" : "max-w-2xl"} overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7`}>
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-serif text-2xl font-bold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-[#99948c] hover:bg-[#f6f3ee]" aria-label="Close"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Table({ headings, children, minWidth = 720 }: { headings: string[]; children: ReactNode; minWidth?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm" style={{ minWidth }}>
        <thead className="bg-[#fcfbf9] text-[10px] uppercase tracking-[.15em] text-[#aaa59c]">
          <tr>{headings.map((heading, index) => <th key={`${heading}-${index}`} className="px-4 py-3 font-semibold">{heading}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`border-t border-[#f0ede8] px-4 py-3 align-top ${className}`}>{children}</td>
}

export function Avatar({ name, initials, size = 36 }: { name: string; initials?: string; size?: number }) {
  return <div title={name} style={{ width: size, height: size }} className="grid shrink-0 place-items-center rounded-full bg-[#f6d6ad] text-xs font-bold text-[#9b5e22]">{initials ?? name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div>
}

export function Denied({ what }: { what: string }) {
  return <Card><Empty text={`Your role does not have access to ${what}. Ask an admin to update your permissions.`} /></Card>
}

// Confirmation for destructive or irreversible actions. Optional input for a reason.
export function ConfirmModal({ title, message, confirmLabel, tone = "primary", inputLabel, onConfirm, onClose }: { title: string; message: ReactNode; confirmLabel: string; tone?: "primary" | "danger"; inputLabel?: string; onConfirm: (input: string) => void; onClose: () => void }) {
  const [input, setInput] = useState("")
  return (
    <Modal narrow title={title} onClose={onClose}>
      <div className="mt-2 text-sm text-[#6f675f]">{message}</div>
      {inputLabel && <Field label={inputLabel} className="mt-4"><input autoFocus value={input} onChange={(event) => setInput(event.target.value)} className={inputClass} /></Field>}
      <div className="mt-6 flex justify-end gap-2">
        <Button tone="ghost" onClick={onClose}>Cancel</Button>
        <Button tone={tone} disabled={Boolean(inputLabel) && !input.trim()} onClick={() => { onConfirm(input.trim()); onClose() }}>{confirmLabel}</Button>
      </div>
    </Modal>
  )
}

export function ErrorState({ title = "Something went wrong", message, onRetry }: { title?: string; message?: string; onRetry?: () => void }) {
  return (
    <div className="grid place-items-center gap-2 py-10 text-center">
      <AlertTriangle className="text-red-500" size={24} />
      <p className="font-semibold">{title}</p>
      {message && <p className="max-w-sm text-xs text-[#8f8981]">{message}</p>}
      {onRetry && <Button tone="neutral" onClick={onRetry} className="mt-2">Try again</Button>}
    </div>
  )
}

// ---- Skeletons: shaped like the real content so the layout never jumps ----

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className}`} />
}

export function TableSkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3" aria-hidden>
      <Skeleton className="h-8 w-full" />
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }, (_, col) => <Skeleton key={col} className={`h-5 ${col === 0 ? "w-3/4" : "w-full"}`} />)}
        </div>
      ))}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading">
      <div className="space-y-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-8 w-72" /><Skeleton className="h-4 w-96 max-w-full" /></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="rounded-2xl border border-[#e9e4dc] bg-white p-5"><Skeleton className="h-4 w-24" /><Skeleton className="mt-4 h-7 w-16" /></div>)}</div>
      <div className="rounded-2xl border border-[#e9e4dc] bg-white p-5"><TableSkeleton /></div>
    </div>
  )
}

"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react"
import { toast } from "sonner"
import { createSeedState, cakeImages } from "./seed"
import { DEFAULT_PERMISSIONS } from "./permissions"
import { parseWeight } from "./format"
import type { Actor, BakeryState, Order, PermissionKey, Staff } from "./types"

export const STATE_KEY = "bloom-batter-state-v2"
export const SESSION_KEY = "foodie-wagon-session"
const LEGACY_ORDERS_KEY = "foodie-wagon-orders"

// ---- Persistence (usable outside React, e.g. by the storefront and login page) -------

export function loadState(): BakeryState {
  if (typeof window === "undefined") return createSeedState()
  try {
    const saved = JSON.parse(window.localStorage.getItem(STATE_KEY) || "null") as BakeryState | null
    if (saved && saved.version === 2) return migrateLegacyOrders({ ...createSeedDefaults(saved), ...saved, permissions: { ...DEFAULT_PERMISSIONS, ...saved.permissions } })
  } catch {
    /* fall through to a fresh seed */
  }
  const seeded = migrateLegacyOrders(createSeedState())
  saveState(seeded)
  return seeded
}

export function saveState(state: BakeryState) {
  try {
    window.localStorage.setItem(STATE_KEY, JSON.stringify(state))
    return true
  } catch (error) {
    console.warn("Could not persist bakery state (storage full?)", error)
    return false
  }
}

export function resetState() {
  const fresh = createSeedState()
  saveState(fresh)
  window.localStorage.removeItem(LEGACY_ORDERS_KEY)
  return fresh
}

// Fill in collections added after a user's state was first saved.
function createSeedDefaults(saved: Partial<BakeryState>): Partial<BakeryState> {
  return saved.leave ? {} : { leave: createSeedState().leave }
}

// Orders created by the previous prototype were stored flat under "foodie-wagon-orders".
type LegacyOrder = { id?: string; customer?: string; phone?: string; email?: string; cake?: string; image?: string; flavor?: string; size?: string; message?: string; design?: string; source?: string; type?: string; address?: string; notes?: string; amount?: number | string; paid?: number; status?: string; urgent?: boolean; chef?: string; rider?: string; createdBy?: string }
function migrateLegacyOrders(state: BakeryState): BakeryState {
  let legacy: LegacyOrder[] = []
  try { legacy = JSON.parse(window.localStorage.getItem(LEGACY_ORDERS_KEY) || "[]") } catch { legacy = [] }
  if (!Array.isArray(legacy) || !legacy.length) return state
  window.localStorage.removeItem(LEGACY_ORDERS_KEY)
  const known = new Set(state.orders.map((order) => order.id))
  const now = new Date().toISOString()
  const imported: Order[] = legacy.filter((item) => item.id && !known.has(item.id) && item.source === "Website").map((item) => {
    const amount = typeof item.amount === "number" ? item.amount : Number(String(item.amount || "0").replace(/[^0-9.]/g, "")) || 0
    return {
      id: item.id!, source: "Website", type: item.type === "Delivery" ? "Delivery" : "Pickup", status: "New", urgent: Boolean(item.urgent), createdAt: now, dueAt: now,
      customer: { name: item.customer || "Unknown customer", phone: item.phone || "", email: item.email || "" },
      items: [{ name: item.cake || "Custom cake", image: item.image || cakeImages.truffle, flavor: item.flavor || "Classic", size: item.size || "1 kg", weightKg: parseWeight(item.size || "1 kg"), quantity: 1, unitPrice: amount, message: item.message || "", design: item.design || "" }],
      address: item.address || "Bakery pickup", deliveryFee: 0, discount: 0, paymentMethod: "Cash",
      transactions: item.paid ? [{ id: `tx_${item.id}`, amount: item.paid, method: "Cash", kind: "Payment", at: now, by: "Website" }] : [],
      chef: "", rider: "", accountability: { createdBy: "Website" }, notes: item.notes ? [{ id: `n_${item.id}`, kind: "Customer", text: item.notes, by: item.customer || "Customer", at: now }] : [],
      timeline: [{ at: now, label: "Order created (Website)", by: "Website", role: "Website", key: "createdBy" }], whatsapp: [],
    }
  })
  const next = { ...state, orders: [...imported, ...state.orders] }
  saveState(next)
  return next
}

// ---- Session ------------------------------------------------------------------------------

export type Session = { staffId: string }

export function signIn(email: string, password: string): Staff | null {
  const state = loadState()
  const match = state.staff.find((member) => member.email === email.trim().toLowerCase() && member.password === password && member.status !== "Inactive")
  if (match) window.localStorage.setItem(SESSION_KEY, JSON.stringify({ staffId: match.id } satisfies Session))
  return match ?? null
}

export function signOut() {
  window.localStorage.removeItem(SESSION_KEY)
}

function readSession(): Session | null {
  try {
    const raw = JSON.parse(window.localStorage.getItem(SESSION_KEY) || "null")
    if (raw?.staffId) return raw
    // Sessions from the earlier prototype stored the whole demo account.
    if (raw?.email) {
      const staff = loadState().staff.find((member) => member.email === raw.email)
      if (staff) return { staffId: staff.id }
    }
  } catch {
    /* ignore */
  }
  return null
}

// ---- React store ----------------------------------------------------------------------------

// `message` gives the user a toast on success; a no-op result (permission or state guard) shows an error instead.
type Commit = (fn: (state: BakeryState, actor: Actor) => BakeryState, message?: string) => void
type Store = {
  state: BakeryState
  actor: Actor | null
  staff: Staff | null
  commit: Commit
  can: (key: PermissionKey) => boolean
  replace: (state: BakeryState) => void
}

const BakeryContext = createContext<Store | null>(null)

const SYSTEM_ACTOR: Actor = { id: "system", name: "System", role: "Reception" }

export function BakeryProvider({ children, fallback, requireSession = true }: { children: ReactNode; fallback: ReactNode; requireSession?: boolean }) {
  const [state, setState] = useState<BakeryState | null>(null)
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const stateRef = useRef<BakeryState | null>(null)

  useEffect(() => {
    const initial = loadState()
    stateRef.current = initial
    setState(initial)
    setSession(readSession())
    // Keep tabs in sync: a website order placed in another tab appears instantly.
    const onStorage = (event: StorageEvent) => {
      if (event.key === STATE_KEY && event.newValue) {
        try { const next = JSON.parse(event.newValue) as BakeryState; stateRef.current = next; setState(next) } catch { /* ignore */ }
      }
      if (event.key === SESSION_KEY) setSession(readSession())
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  // Simulate the WhatsApp provider acknowledging delivery of sent messages.
  useEffect(() => {
    const timer = window.setInterval(() => {
      const current = stateRef.current
      if (!current) return
      const cutoff = Date.now() - 4000
      let changed = false
      const orders = current.orders.map((order) => {
        if (!order.whatsapp.some((message) => message.status === "Sent" && new Date(message.at).getTime() < cutoff)) return order
        changed = true
        return { ...order, whatsapp: order.whatsapp.map((message) => (message.status === "Sent" && new Date(message.at).getTime() < cutoff ? { ...message, status: "Delivered" as const } : message)) }
      })
      if (changed) { const next = { ...current, orders }; stateRef.current = next; setState(next); saveState(next) }
    }, 3000)
    return () => window.clearInterval(timer)
  }, [])

  const staff = useMemo(() => (state && session ? state.staff.find((member) => member.id === session.staffId && member.status !== "Inactive") ?? null : null), [state, session])
  const actor = useMemo<Actor | null>(() => (staff ? { id: staff.id, name: staff.name, role: staff.role } : null), [staff])

  const commit = useCallback<Commit>((fn, message) => {
    const current = stateRef.current
    if (!current) return
    const next = fn(current, actor ?? SYSTEM_ACTOR)
    if (next === current) {
      if (message) toast.error("That action isn't available right now")
      return
    }
    stateRef.current = next
    setState(next)
    if (!saveState(next)) toast.error("Browser storage is full — changes may not survive a reload")
    else if (message) toast.success(message)
  }, [actor])

  const replace = useCallback((next: BakeryState) => { stateRef.current = next; setState(next); saveState(next) }, [])
  // Stable while the permission matrix and signed-in user are unchanged, so consumers can depend on it.
  const permissions = state?.permissions
  const can = useCallback((key: PermissionKey) => Boolean(actor && permissions?.[actor.role]?.includes(key)), [permissions, actor])
  const value = useMemo(() => (state ? { state, actor, staff, commit, replace, can } : null), [state, actor, staff, commit, replace, can])

  if (!value || session === undefined) return fallback
  if (requireSession && !staff) return <RedirectToLogin fallback={fallback} />

  return <BakeryContext.Provider value={value}>{children}</BakeryContext.Provider>
}

function RedirectToLogin({ fallback }: { fallback: ReactNode }) {
  useEffect(() => { window.location.replace("/staff-login") }, [])
  return fallback
}

export function useBakery() {
  const store = useContext(BakeryContext)
  if (!store) throw new Error("useBakery must be used inside <BakeryProvider>")
  return store
}

// One shared timer per interval, however many components show a live time.
const tickers = new Map<number, { listeners: Set<() => void>; timer?: number; now: number }>()
const getTicker = (intervalMs: number) => {
  let ticker = tickers.get(intervalMs)
  if (!ticker) { ticker = { listeners: new Set(), now: Date.now() }; tickers.set(intervalMs, ticker) }
  return ticker
}
function subscribeTicker(intervalMs: number, listener: () => void) {
  const entry = getTicker(intervalMs)
  entry.now = Date.now()
  entry.listeners.add(listener)
  if (entry.timer === undefined) entry.timer = window.setInterval(() => { entry.now = Date.now(); entry.listeners.forEach((notify) => notify()) }, intervalMs)
  return () => {
    entry.listeners.delete(listener)
    if (!entry.listeners.size) { window.clearInterval(entry.timer); entry.timer = undefined }
  }
}

export function useNow(intervalMs = 30000) {
  return useSyncExternalStore(
    useCallback((listener: () => void) => subscribeTicker(intervalMs, listener), [intervalMs]),
    () => getTicker(intervalMs).now,
    () => 0,
  )
}

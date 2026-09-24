"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { toast } from "sonner"
import {
  BarChart3, Bell, CalendarDays, ChefHat, ChevronsLeft, ClipboardList, CreditCard, FileText, LayoutDashboard, ListChecks, LogOut, Menu,
  PackageCheck, Send, Settings2, ShieldCheck, ShoppingBag, Thermometer, Timer, Truck, UserCheck, UserRound, Users, Boxes, ConciergeBell,
} from "lucide-react"
import { signOut, useBakery } from "@/lib/bakery/store"
import { updateOwnProfile } from "@/lib/bakery/operations"
import type { Actor, PermissionKey } from "@/lib/bakery/types"
import type { NewOrderInput } from "@/lib/bakery/workflow"
import { NavContext, type PageId } from "./nav-context"
import { useAlerts } from "./overview"
import { Avatar, Button, Field, Modal, PageSkeleton, Skeleton, inputClass } from "./ui"

// Pages are split into their own chunks; the skeleton shows while a chunk loads the first time.
const lazy = <K extends string>(load: () => Promise<Record<K, ComponentType>>, name: K) => dynamic(() => load().then((mod) => mod[name]), { loading: () => <PageSkeleton /> })
const PAGES: Record<PageId, ComponentType> = {
  Overview: lazy(() => import("./overview"), "OverviewPage"),
  "Front desk": lazy(() => import("./overview"), "FrontDeskPage"),
  Orders: lazy(() => import("./orders"), "OrdersPage"),
  Kitchen: lazy(() => import("./kitchen"), "KitchenPage"),
  Production: lazy(() => import("./kitchen"), "ProductionPage"),
  Delivery: lazy(() => import("./delivery"), "DeliveryPage"),
  Customers: lazy(() => import("./customers"), "CustomersPage"),
  Payments: lazy(() => import("./customers"), "PaymentsPage"),
  "Staff check-in": lazy(() => import("./attendance"), "CheckInDeskPage"),
  Attendance: lazy(() => import("./attendance"), "AttendancePage"),
  Roster: lazy(() => import("./attendance"), "RosterPage"),
  Staff: lazy(() => import("./team"), "StaffPage"),
  Permissions: lazy(() => import("./team"), "PermissionsPage"),
  "Activity logs": lazy(() => import("./team"), "ActivityLogsPage"),
  Products: lazy(() => import("./catalog"), "ProductsPage"),
  Inventory: lazy(() => import("./catalog"), "InventoryPage"),
  "Food safety": lazy(() => import("./food-safety"), "FoodSafetyPage"),
  WhatsApp: lazy(() => import("./whatsapp"), "WhatsAppPage"),
  Reports: lazy(() => import("./reports"), "ReportsPage"),
  Settings: lazy(() => import("./settings"), "SettingsPage"),
  "Feature coverage": lazy(() => import("./settings"), "FeatureCoveragePage"),
}
const OrderDetail = dynamic(() => import("./order-detail").then((mod) => mod.OrderDetail))
const OrderForm = dynamic(() => import("./order-form").then((mod) => mod.OrderForm))

type Check = (key: PermissionKey) => boolean
type NavItem = { id: PageId; icon: ComponentType<{ size?: number }>; visible: (can: Check, actor: Actor) => boolean }

// One navigation structure for every role; visibility comes from the permission matrix.
const NAVIGATION: { title: string; items: NavItem[] }[] = [
  { title: "Workspace", items: [
    { id: "Overview", icon: LayoutDashboard, visible: (can) => can("reports.view") },
    { id: "Front desk", icon: ConciergeBell, visible: (can) => can("orders.create") },
    { id: "Orders", icon: ClipboardList, visible: (can) => can("orders.view") },
    { id: "Kitchen", icon: ChefHat, visible: (can) => can("kitchen.view") },
    { id: "Production", icon: PackageCheck, visible: (can) => can("kitchen.view") },
    { id: "Delivery", icon: Truck, visible: (can) => can("delivery.viewAll") || can("delivery.update") },
    { id: "Customers", icon: Users, visible: (can) => can("customers.view") },
    { id: "Payments", icon: CreditCard, visible: (can) => can("payments.view") },
  ] },
  { title: "Team", items: [
    { id: "Staff check-in", icon: UserCheck, visible: (can) => can("attendance.checkin") },
    { id: "Attendance", icon: Timer, visible: (can) => can("attendance.team") },
    { id: "Roster", icon: CalendarDays, visible: (can) => can("attendance.team") },
    { id: "Staff", icon: UserRound, visible: (can) => can("staff.manage") },
    { id: "Permissions", icon: ShieldCheck, visible: (can) => can("roles.manage") || can("staff.manage") },
  ] },
  { title: "Operations", items: [
    { id: "Products", icon: ShoppingBag, visible: (can) => can("products.manage") || can("inventory.view") },
    { id: "Inventory", icon: Boxes, visible: (can) => can("inventory.view") },
    { id: "Food safety", icon: Thermometer, visible: (can) => can("foodsafety.log") },
  ] },
  { title: "Insights", items: [
    { id: "WhatsApp", icon: Send, visible: (can) => can("whatsapp.send") || can("whatsapp.manage") },
    { id: "Reports", icon: BarChart3, visible: (can) => can("reports.view") },
    { id: "Settings", icon: Settings2, visible: (can) => can("settings.manage") || can("staff.manage") },
    { id: "Activity logs", icon: FileText, visible: (_, actor) => actor.role === "Admin" },
    { id: "Feature coverage", icon: ListChecks, visible: (_, actor) => actor.role === "Admin" },
  ] },
]

const LANDING: Partial<Record<Actor["role"], PageId>> = { Chef: "Kitchen", Rider: "Delivery", Reception: "Front desk" }
const pageFromHash = () => decodeURIComponent(window.location.hash.slice(1)) as PageId

export function DashboardShell() {
  const { state, actor, can } = useBakery()
  const groups = useMemo(
    () => NAVIGATION.map((group) => ({ ...group, items: group.items.filter((item) => actor && item.visible(can, actor)) })).filter((group) => group.items.length),
    [can, actor],
  )
  const allowed = useMemo(() => new Set(groups.flatMap((group) => group.items.map((item) => item.id))), [groups])
  const fallback = (actor && LANDING[actor.role] && allowed.has(LANDING[actor.role]!) ? LANDING[actor.role] : groups[0]?.items[0]?.id) ?? "Orders"
  const [page, setPage] = useState<PageId>(() => (allowed.has(pageFromHash()) ? pageFromHash() : fallback))
  const [orderId, setOrderId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Partial<NewOrderInput> | null>(null)
  const [mobileNav, setMobileNav] = useState(false)
  const [collapsed, setCollapsed] = useState(() => { try { return window.localStorage.getItem("bb-sidebar") === "collapsed" } catch { return false } })
  const active = allowed.has(page) ? page : fallback

  const navigate = useCallback((next: PageId) => {
    setPage(next)
    setMobileNav(false)
    window.history.replaceState(null, "", `#${encodeURIComponent(next)}`)
    window.scrollTo({ top: 0 })
  }, [])
  const nav = useMemo(() => ({ page: active, navigate, openOrder: setOrderId, newOrder: (prefill?: Partial<NewOrderInput>) => setDraft(prefill ?? {}) }), [active, navigate])
  const toggleCollapsed = () => setCollapsed((value) => { try { window.localStorage.setItem("bb-sidebar", value ? "open" : "collapsed") } catch { /* ignore */ } return !value })

  useWebsiteOrderToasts(setOrderId)
  const Page = PAGES[active]

  const sidebar = (compact: boolean) => (
    <>
      <div className={`flex items-center ${compact ? "justify-center" : "justify-between"} gap-2 px-2`}>
        <Link href="/" className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f29b38] font-bold text-white">b.</span>{!compact && <span><span className="block font-serif text-lg font-bold leading-none">{state.settings.bakeryName}</span><span className="mt-1 block text-[10px] font-semibold uppercase tracking-[.18em] text-[#a3a098]">Staff portal</span></span>}</Link>
      </div>
      <nav className="mt-8 flex-1 space-y-5 overflow-y-auto pr-1">
        {groups.map((group) => (
          <div key={group.title}>
            {!compact && <p className="px-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#a9a49d]">{group.title}</p>}
            <div className="mt-2 space-y-0.5">
              {group.items.map(({ id, icon: Icon }) => (
                <button key={id} title={compact ? id : undefined} onClick={() => navigate(id)} aria-current={active === id ? "page" : undefined} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${compact ? "justify-center" : ""} ${active === id ? "bg-[#fff2df] text-[#c76a10]" : "text-[#75716a] hover:bg-[#faf8f4] hover:text-[#3d3731]"}`}>
                  <Icon size={17} />{!compact && id}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </>
  )

  return (
    <NavContext.Provider value={nav}>
      <main className="min-h-screen bg-[#f7f5f1] text-[#22221f]">
        <aside className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-[#e8e4dc] bg-white px-3 py-6 transition-[width] duration-200 lg:flex ${collapsed ? "w-[76px]" : "w-[250px]"}`}>
          {sidebar(collapsed)}
          <button onClick={toggleCollapsed} className="mt-3 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold text-[#9a948b] hover:bg-[#faf8f4]" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}><ChevronsLeft size={16} className={`transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`} />{!collapsed && "Collapse"}</button>
        </aside>
        {mobileNav && (
          <div className="motion-fade fixed inset-0 z-40 bg-[#22221f]/40 lg:hidden" onClick={() => setMobileNav(false)}>
            <aside className="motion-slide-in flex h-full w-[270px] flex-col bg-white px-3 py-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>{sidebar(false)}</aside>
          </div>
        )}
        <section className={`transition-[padding] duration-200 ${collapsed ? "lg:pl-[76px]" : "lg:pl-[250px]"}`}>
          <Header page={active} onMenu={() => setMobileNav(true)} navigate={navigate} />
          <div key={active} className="motion-page mx-auto max-w-[1500px] p-4 sm:p-8"><Page /></div>
        </section>
        {orderId && <OrderDetail orderId={orderId} onClose={() => setOrderId(null)} />}
        {draft && <OrderForm prefill={draft} onClose={() => setDraft(null)} onCreated={(id) => { setDraft(null); toast.success(`Order ${id} created`); setOrderId(id) }} />}
      </main>
    </NavContext.Provider>
  )
}

// Announce website orders that arrive from the storefront (another tab) while the dashboard is open.
function useWebsiteOrderToasts(open: (id: string) => void) {
  const { state, can } = useBakery()
  const seen = useRef<Set<string> | null>(null)
  useEffect(() => {
    const ids = state.orders.filter((order) => order.source === "Website" && order.status === "New").map((order) => order.id)
    if (seen.current && can("orders.view")) {
      for (const id of ids) if (!seen.current.has(id)) toast(`New website order ${id}`, { description: "Waiting for acceptance", action: { label: "Open", onClick: () => open(id) } })
    }
    seen.current = new Set(ids)
  }, [state.orders, can, open])
}

function Header({ page, onMenu, navigate }: { page: PageId; onMenu: () => void; navigate: (page: PageId) => void }) {
  const { state, staff } = useBakery()
  const alerts = useAlerts()
  const [menu, setMenu] = useState<"alerts" | "profile" | null>(null)
  const [editingProfile, setEditingProfile] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!menu) return
    const close = (event: MouseEvent) => { if (!ref.current?.contains(event.target as Node)) setMenu(null) }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [menu])
  if (!staff) return null
  const logout = () => { signOut(); window.location.replace("/staff-login") }
  return (
    <header className="sticky top-0 z-20 flex h-[70px] items-center justify-between gap-3 border-b border-[#e8e4dc] bg-white/90 px-4 backdrop-blur sm:px-8">
      <div className="flex min-w-0 items-center gap-2">
        <button onClick={onMenu} className="rounded-lg p-2 text-[#75716a] hover:bg-[#faf8f4] lg:hidden" aria-label="Open navigation"><Menu size={20} /></button>
        <p className="truncate text-sm text-[#99958d]"><span className="hidden sm:inline">{state.settings.bakeryName} <span className="mx-2">/</span></span><span className="font-semibold text-[#252521]">{page}</span></p>
      </div>
      <div ref={ref} className="flex items-center gap-2">
        <div className="relative">
          <button onClick={() => setMenu(menu === "alerts" ? null : "alerts")} className="relative rounded-full p-2.5 text-[#76726b] hover:bg-[#faf8f4]" aria-label={`Notifications (${alerts.length})`} aria-expanded={menu === "alerts"}>
            <Bell size={19} />{alerts.length > 0 && <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#ef8d32] px-1 text-[9px] font-bold text-white">{alerts.length}</span>}
          </button>
          {menu === "alerts" && (
            <div className="motion-drop absolute right-0 top-12 z-40 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-[#e9e4dc] bg-white p-3 shadow-xl">
              <p className="px-1 text-sm font-bold">Needs attention</p>
              <div className="mt-2 space-y-1.5">{alerts.length ? alerts.map((alert) => <button key={alert.text} onClick={() => { navigate(alert.page); setMenu(null) }} className={`block w-full rounded-lg p-2.5 text-left text-xs ${alert.tone === "bad" ? "bg-red-50 text-red-800" : "bg-[#fff8ee] text-[#6f5a43]"}`}>{alert.text}</button>) : <p className="py-4 text-center text-xs text-[#99938a]">You&apos;re all caught up.</p>}</div>
            </div>
          )}
        </div>
        <div className="relative">
          <button onClick={() => setMenu(menu === "profile" ? null : "profile")} className="flex items-center gap-2 rounded-full p-1 hover:bg-[#faf8f4]" aria-label="Account menu" aria-expanded={menu === "profile"}>
            <Avatar name={staff.name} initials={staff.initials} />
            <span className="hidden text-left xl:block"><span className="block text-sm font-bold">{staff.name}</span><span className="block text-xs text-[#9a8d84]">{staff.role}</span></span>
          </button>
          {menu === "profile" && (
            <div className="motion-drop absolute right-0 top-12 z-40 w-56 rounded-xl border border-[#e9e4dc] bg-white p-2 shadow-xl">
              <p className="px-2 py-1.5 text-xs text-[#8f8981]">{staff.email}</p>
              <button onClick={() => { setEditingProfile(true); setMenu(null) }} className="block w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-[#faf8f4]">Profile settings</button>
              <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-bold text-[#9b6653] hover:bg-[#faf8f4]"><LogOut size={14} /> Sign out</button>
            </div>
          )}
        </div>
      </div>
      {editingProfile && <ProfileModal onClose={() => setEditingProfile(false)} />}
    </header>
  )
}

function ProfileModal({ onClose }: { onClose: () => void }) {
  const { staff, commit } = useBakery()
  const [name, setName] = useState(staff?.name ?? "")
  const [phone, setPhone] = useState(staff?.phone ?? "")
  const [password, setPassword] = useState(staff?.password ?? "")
  if (!staff) return null
  return (
    <Modal narrow title="Profile settings" onClose={onClose}>
      <p className="mt-1 text-xs text-[#8f8981]">{staff.role} · {staff.email}</p>
      <div className="mt-5 space-y-3">
        <Field label="Full name"><input value={name} onChange={(event) => setName(event.target.value)} className={inputClass} /></Field>
        <Field label="Phone"><input value={phone} onChange={(event) => setPhone(event.target.value)} className={inputClass} /></Field>
        <Field label="Password (min 6)"><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} /></Field>
      </div>
      <div className="mt-6 flex justify-end gap-2"><Button tone="ghost" onClick={onClose}>Cancel</Button><Button disabled={!name.trim() || password.length < 6} onClick={() => { commit((s, a) => updateOwnProfile(s, a, { name, phone, password }), "Profile saved"); onClose() }}>Save</Button></div>
    </Modal>
  )
}

// Shaped like the shell so the first paint already looks like the dashboard.
export function DashboardSkeleton() {
  return (
    <main className="min-h-screen bg-[#f7f5f1]" aria-busy="true" aria-label="Loading dashboard">
      <aside className="fixed inset-y-0 left-0 hidden w-[250px] flex-col gap-3 border-r border-[#e8e4dc] bg-white px-5 py-6 lg:flex">
        <div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-xl" /><Skeleton className="h-5 w-32" /></div>
        <div className="mt-8 space-y-3">{Array.from({ length: 9 }, (_, index) => <Skeleton key={index} className="h-8 w-full" />)}</div>
      </aside>
      <section className="lg:pl-[250px]">
        <div className="flex h-[70px] items-center justify-between border-b border-[#e8e4dc] bg-white px-4 sm:px-8"><Skeleton className="h-4 w-40" /><div className="flex gap-2"><Skeleton className="h-8 w-24" /><Skeleton className="h-9 w-9 rounded-full" /></div></div>
        <div className="mx-auto max-w-[1500px] p-4 sm:p-8"><PageSkeleton /></div>
      </section>
    </main>
  )
}


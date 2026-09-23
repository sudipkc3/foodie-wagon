import { BakeryStorefront } from "@/components/bakery-storefront"
import {
  Activity, ArrowRight, BarChart3, Bell, Check, ChevronDown, ClipboardList,
  Clock3, CreditCard, FileText, Grid2X2, KeyRound, LayoutDashboard, LogOut,
  Menu, MoreHorizontal, PackageCheck, Plus, Search, Settings2, ShieldCheck,
  ShoppingBag, Truck, UserRound, Users, X
} from "lucide-react"

const staff = [
  { name: "Olivia Martin", phone: "+1 555 0148", role: "Manager", status: "Active", initials: "OM", color: "bg-amber-100 text-amber-800" },
  { name: "Ethan Brooks", phone: "+1 555 0192", role: "Chef", status: "Active", initials: "EB", color: "bg-orange-100 text-orange-800" },
  { name: "Mia Rodriguez", phone: "+1 555 0167", role: "Reception", status: "Active", initials: "MR", color: "bg-sky-100 text-sky-800" },
  { name: "Noah Williams", phone: "+1 555 0104", role: "Rider", status: "On leave", initials: "NW", color: "bg-violet-100 text-violet-800" },
  { name: "Sophia Chen", phone: "+1 555 0133", role: "Accountant", status: "Active", initials: "SC", color: "bg-emerald-100 text-emerald-800" },
]
const roles = ["Admin", "Manager", "Reception", "Chef", "Rider", "Accountant"]
const demoAccounts = [
  { email: "admin@foodiewagon.com", password: "admin123", name: "Ava Wilson", role: "Admin", initials: "AW" },
  { email: "manager@foodiewagon.com", password: "manager123", name: "Olivia Martin", role: "Manager", initials: "OM" },
  { email: "reception@foodiewagon.com", password: "reception123", name: "Mia Rodriguez", role: "Reception", initials: "MR" },
  { email: "chef@foodiewagon.com", password: "chef123", name: "Ethan Brooks", role: "Chef", initials: "EB" },
  { email: "rider@foodiewagon.com", password: "rider123", name: "Noah Williams", role: "Rider", initials: "NW" },
  { email: "accountant@foodiewagon.com", password: "accountant123", name: "Sophia Chen", role: "Accountant", initials: "SC" },
]
const permissionGroups = [
  { title: "Order Permissions", icon: ShoppingBag, items: ["View orders", "Create orders", "Edit orders", "Assign orders", "Cancel orders"] },
  { title: "Kitchen Permissions", icon: PackageCheck, items: ["View orders", "Accept orders", "Prepare orders", "Complete orders"] },
  { title: "Delivery Permissions", icon: Truck, items: ["View assigned deliveries", "Update delivery status"] },
  { title: "Payment Permissions", icon: CreditCard, items: ["View payments", "Collect payment", "Issue refunds"] },
  { title: "Customer Permissions", icon: UserRound, items: ["View customer data", "Edit customer data"] },
  { title: "Reports Permissions", icon: BarChart3, items: ["View sales reports", "View staff reports", "View order reports"] },
]

export default function Home() {
  return <BakeryStorefront />
}

/*
export function LegacyHome() {
  const [screen, setScreen] = useState<"landing" | "login" | "dashboard">("landing")
  const [currentUser, setCurrentUser] = useState(demoAccounts[1])
  const [active, setActive] = useState("Overview")
  const [selectedRole, setSelectedRole] = useState("Manager")
  const [search, setSearch] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileSettingsOpen, setProfileSettingsOpen] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(["New website order #ORD-1026 received", "Ram Sharma's urgent cake is preparing", "Priya Kapoor is ready for pickup"])
  const filteredStaff = staff.filter((person) => person.name.toLowerCase().includes(search.toLowerCase()) || person.role.toLowerCase().includes(search.toLowerCase()))

  if (screen === "landing") return <Landing onLogin={() => setScreen("login")} />
  if (screen === "login") return <Login onLogin={(account) => { setCurrentUser(account); setActive(account.role === "Chef" ? "Kitchen" : account.role === "Rider" ? "Delivery" : account.role === "Reception" ? "Orders" : "Overview"); setScreen("dashboard") }} />

  return (
    <main className="min-h-screen bg-[#f7f5f1] text-[#22221f]">
      <aside className="fixed inset-y-0 left-0 hidden w-[250px] flex-col border-r border-[#e8e4dc] bg-white px-5 py-6 lg:flex">
        <div className="flex items-center gap-3 px-2"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f29b38] text-white"><span className="text-lg font-bold">fw</span></div><div><p className="font-serif text-lg font-bold leading-none">Foodie wagon</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-[.18em] text-[#a3a098]">Staff portal</p></div></div>
        <div className="mt-12"><p className="px-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#a9a49d]">Workspace</p><nav className="mt-3 space-y-1">{(currentUser.role === "Chef" ? [["Kitchen", PackageCheck], ["Orders", ClipboardList], ["Activity logs", Activity]] : currentUser.role === "Rider" ? [["Delivery", Truck], ["Activity logs", Activity]] : currentUser.role === "Reception" ? [["Orders", ClipboardList], ["Customers", UserRound], ["Activity logs", Activity]] : currentUser.role === "Accountant" ? [["Overview", LayoutDashboard], ["Reports", BarChart3], ["Payments", CreditCard], ["Activity logs", Activity]] : [["Overview", LayoutDashboard], ["Staff management", Users], ["Permissions", ShieldCheck], ["Orders", ClipboardList], ["Reports", BarChart3], ["Activity logs", Activity]]).map(([label, Icon]) => <button key={label as string} onClick={() => setActive(label as string)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${active === label ? "bg-[#fff2df] text-[#c76a10]" : "text-[#75716a] hover:bg-[#faf8f4]"}`}><Icon size={17} />{label as string}</button>)}</nav></div>
        <div className="mt-auto rounded-2xl bg-[#282820] p-4 text-white"><p className="text-sm font-semibold">Need a hand?</p><p className="mt-1 text-xs leading-5 text-white/60">Check the staff guide or contact support.</p><button className="mt-3 flex items-center gap-2 text-xs font-bold text-[#ffc46e]">Open help <ArrowRight size={13} /></button></div>
      </aside>
      <section className="lg:pl-[250px]"><header className="flex h-[78px] items-center justify-between border-b border-[#e8e4dc] bg-white px-5 sm:px-8"><button className="lg:hidden"><Menu /></button><div className="hidden text-sm text-[#99958d] sm:block">Foodie wagon <span className="mx-2">/</span> <span className="text-[#252521]">{active}</span></div><div className="flex items-center gap-5"><div className="relative"><button onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative text-[#76726b]" aria-label="Notifications"><Bell size={19}/><span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#ef8d32]"/></button>{notificationsOpen && <div className="absolute right-0 top-9 z-30 w-80 rounded-xl border border-[#e9e4dc] bg-white p-4 shadow-xl"><div className="flex items-center justify-between"><strong className="text-sm">Notifications</strong><span className="text-[10px] text-[#e39131]">{unreadNotifications.length} new</span></div><div className="mt-3 space-y-3">{unreadNotifications.length ? unreadNotifications.map((item) => <div key={item} className="flex items-start justify-between gap-2 rounded-lg bg-[#fff8ee] p-3 text-xs text-[#6f6a62]"><span><span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#ee9633]"/>{item}</span><button aria-label={`Dismiss ${item}`} onClick={() => setUnreadNotifications((items) => items.filter((notification) => notification !== item))} className="shrink-0 text-[#aaa59d] hover:text-[#6f6a62]"><X size={13}/></button></div>) : <p className="py-3 text-center text-xs text-[#99938a]">You&apos;re all caught up.</p>}</div><button onClick={() => setUnreadNotifications([])} className="mt-3 text-xs font-bold text-[#db8427]">Mark all as read</button></div>}</div><div className="h-8 w-px bg-[#ebe7e0]"/><div className="relative"><button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#f6d6ad] text-xs font-bold text-[#9b5e22]">{currentUser.initials}</div><span className="hidden text-right sm:block"><strong className="block text-sm font-semibold">{currentUser.name}</strong><small className="block text-[10px] text-[#a19b92]">{currentUser.role}</small></span><ChevronDown size={15} className="text-[#98938b]"/></button>{profileOpen && <div className="absolute right-0 top-12 z-30 w-48 rounded-xl border border-[#e9e4dc] bg-white p-2 shadow-xl"><div className="border-b border-[#f0ede8] px-3 py-2"><p className="text-sm font-semibold">{currentUser.name}</p><p className="text-xs text-[#99938a]">{currentUser.role}</p></div><button onClick={() => { setProfileOpen(false); setProfileSettingsOpen(true) }} className="w-full rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-[#6e6961] hover:bg-[#faf7f2]">Profile settings</button><button onClick={() => setScreen("landing")} className="w-full rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50">Log out</button></div>}</div></div></header><div className="mx-auto max-w-[1320px] px-5 py-8 sm:px-8"><div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-[#e08828]">Good morning, Olivia</p><h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">{active}</h1><p className="mt-2 text-sm text-[#858078]">Manage your team and keep every shift moving smoothly.</p></div>{active === "Staff management" && <button onClick={() => setShowAdd(true)} className="flex items-center justify-center gap-2 rounded-xl bg-[#ee9633] px-5 py-3 text-sm font-bold text-white shadow-sm shadow-orange-200 transition hover:bg-[#dc8123]"><Plus size={17}/> Add staff member</button>}</div>
        {active === "Staff management" ? <><div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["Total staff", "24", Users], ["Active today", "18", Check], ["On leave", "3", Clock3], ["Roles covered", "6", ShieldCheck]].map(([label, value, Icon]) => <div key={label as string} className="rounded-2xl border border-[#e9e4dc] bg-white p-5"><div className="flex items-start justify-between"><p className="text-sm text-[#89847c]">{label as string}</p><div className="grid h-8 w-8 place-items-center rounded-lg bg-[#fff4e4] text-[#e78d2d]"><Icon size={15}/></div></div><p className="mt-4 text-2xl font-bold">{value as string}</p><p className="mt-1 text-xs text-emerald-600">+8% <span className="text-[#aaa59d]">from last month</span></p></div>)}</div><div className="rounded-2xl border border-[#e9e4dc] bg-white"><div className="flex flex-col justify-between gap-4 border-b border-[#eeeae3] p-5 sm:flex-row sm:items-center"><div><h2 className="font-serif text-xl font-bold">Team members</h2><p className="mt-1 text-xs text-[#938e86]">Manage bakery employees, roles and status.</p></div><div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa59d]"/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search team" className="w-full rounded-lg border border-[#e5e1da] bg-[#fcfbf9] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#e89a3c] sm:w-56"/></div></div><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-[#fcfbf9] text-[10px] uppercase tracking-[.15em] text-[#aaa59c]"><tr><th className="px-5 py-3 font-semibold">Employee</th><th className="px-5 py-3 font-semibold">Phone</th><th className="px-5 py-3 font-semibold">Role</th><th className="px-5 py-3 font-semibold">Status</th><th className="px-5 py-3"></th></tr></thead><tbody>{filteredStaff.map((person) => <tr key={person.name} className="border-t border-[#f0ede8]"><td className="px-5 py-4"><div className="flex items-center gap-3"><div className={`grid h-9 w-9 place-items-center rounded-full text-xs font-bold ${person.color}`}>{person.initials}</div><span className="font-semibold">{person.name}</span></div></td><td className="px-5 py-4 text-[#89847c]">{person.phone}</td><td className="px-5 py-4"><span className="rounded-md bg-[#f5f2ed] px-2.5 py-1 text-xs font-semibold">{person.role}</span></td><td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${person.status === "Active" ? "text-emerald-600" : "text-[#aaa59d]"}`}><span className={`h-1.5 w-1.5 rounded-full ${person.status === "Active" ? "bg-emerald-500" : "bg-[#b8b3ab]"}`}/>{person.status}</span></td><td className="px-5 py-4 text-right"><button className="rounded-md p-2 text-[#a19c94] hover:bg-[#f7f4ef]"><MoreHorizontal size={17}/></button></td></tr>)}</tbody></table></div></div></> : active === "Permissions" ? <PermissionsView selectedRole={selectedRole} setSelectedRole={setSelectedRole} /> : <OperationalPage active={active} role={currentUser.role} />}
      </div></section>{showAdd && <AddStaff onClose={() => setShowAdd(false)} />}{profileSettingsOpen && <ProfileSettings account={currentUser} onClose={() => setProfileSettingsOpen(false)} />}</main>
  )
} 

function Landing({ onLogin }: { onLogin: () => void }) { return <main className="min-h-screen bg-[#fbf8f3] text-[#282820]"><header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#282820] text-white"><span className="font-bold">fw</span></div><span className="font-serif text-xl font-bold">Foodie wagon</span></div><div className="flex items-center gap-3"><button onClick={onLogin} className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-[#6b675f] hover:bg-white sm:block">For staff</button><button onClick={onLogin} className="rounded-lg bg-[#282820] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#45453a]">Staff login <ArrowRight className="ml-1 inline" size={14}/></button></div></header><section className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-16 lg:grid-cols-[1.05fr_.95fr] lg:px-10 lg:pb-28 lg:pt-24"><div><p className="text-xs font-bold uppercase tracking-[.25em] text-[#df8528]">Where flavor hits the road</p><h1 className="mt-5 max-w-2xl font-serif text-5xl font-bold leading-[.96] tracking-tight sm:text-7xl">Made with care.<br/><span className="text-[#e7892d]">Managed with clarity.</span></h1><p className="mt-7 max-w-lg text-base leading-7 text-[#777168]">Foodie wagon brings people together over good food — and gives the team behind every order the tools to do their best work.</p><div className="mt-9 flex flex-wrap gap-3"><button onClick={onLogin} className="rounded-xl bg-[#ee9633] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-[#d98124]">Access staff portal <ArrowRight className="ml-2 inline" size={16}/></button><a href="#features" className="rounded-xl border border-[#ddd7ce] bg-white px-6 py-3.5 text-sm font-bold text-[#615d55]">Explore the portal</a></div><div className="mt-12 flex gap-10 border-t border-[#e8e1d7] pt-6"><div><p className="font-serif text-2xl font-bold">24</p><p className="mt-1 text-xs text-[#99938a]">Team members</p></div><div><p className="font-serif text-2xl font-bold">6</p><p className="mt-1 text-xs text-[#99938a]">Roles covered</p></div><div><p className="font-serif text-2xl font-bold">100%</p><p className="mt-1 text-xs text-[#99938a]">Team focus</p></div></div></div><div className="relative rounded-[2rem] bg-[#f2a03d] p-6 sm:p-10"><div className="absolute right-8 top-8 text-5xl text-white/30">✦</div><div className="rounded-2xl bg-[#282820] p-6 text-white shadow-2xl sm:p-8"><div className="flex items-center justify-between"><p className="text-sm font-semibold">Today at Foodie wagon</p><span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] font-bold text-emerald-300">LIVE SHIFT</span></div><div className="mt-8 grid grid-cols-2 gap-3"><div className="rounded-xl bg-white/[.08] p-4"><p className="text-3xl font-bold">18</p><p className="mt-1 text-xs text-white/50">Staff active</p></div><div className="rounded-xl bg-white/[.08] p-4"><p className="text-3xl font-bold">42</p><p className="mt-1 text-xs text-white/50">Orders today</p></div></div><div className="mt-4 rounded-xl bg-white/[.08] p-4"><div className="flex items-center justify-between text-xs"><span className="text-white/50">Shift progress</span><span className="text-[#ffc46e]">72%</span></div><div className="mt-3 h-2 rounded-full bg-white/10"><div className="h-2 w-[72%] rounded-full bg-[#f29b38]"/></div></div><div className="mt-8 flex items-center gap-3"><div className="flex -space-x-2"><span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#282820] bg-[#f6d6ad] text-[10px] font-bold text-[#9b5e22]">OM</span><span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#282820] bg-[#ffd4bb] text-[10px] font-bold text-[#9b5e22]">EB</span><span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#282820] bg-[#c5e6e6] text-[10px] font-bold text-[#25666a]">MR</span></div><p className="text-xs text-white/50">Your team is ready for service</p></div></div></div></section><section id="features" className="border-t border-[#e8e1d7] bg-white px-6 py-16 lg:px-10"><div className="mx-auto max-w-7xl"><div className="max-w-xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#df8528]">One place for the whole team</p><h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">Everything you need for a smoother shift.</h2></div><div className="mt-10 grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-[#fff5e7] p-6"><Users className="text-[#df8528]"/><h3 className="mt-8 font-serif text-xl font-bold">Staff management</h3><p className="mt-2 text-sm leading-6 text-[#777168]">Keep employee profiles, phone numbers, roles and statuses organized.</p></div><div className="rounded-2xl bg-[#f5f3ee] p-6"><ShieldCheck className="text-[#df8528]"/><h3 className="mt-8 font-serif text-xl font-bold">Clear permissions</h3><p className="mt-2 text-sm leading-6 text-[#777168]">Give every role the right access across orders, kitchen, delivery and payments.</p></div><div className="rounded-2xl bg-[#eef6f4] p-6"><Activity className="text-[#df8528]"/><h3 className="mt-8 font-serif text-xl font-bold">Stay in the loop</h3><p className="mt-2 text-sm leading-6 text-[#777168]">Follow activity, reports and daily operations without the guesswork.</p></div></div></div></section><footer className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-6 py-8 text-xs text-[#969087] sm:flex-row lg:px-10"><span>© 2026 Foodie wagon</span><span>Staff portal · Frontend demo</span></footer></main> }

function Login({ onLogin }: { onLogin: (account: typeof demoAccounts[number]) => void }) { const [email, setEmail] = useState("manager@foodiewagon.com"); const [password, setPassword] = useState("manager123"); const [error, setError] = useState(""); const [showAccounts, setShowAccounts] = useState(false); const submit = (event: React.FormEvent) => { event.preventDefault(); const account = demoAccounts.find((item) => item.email === email.trim().toLowerCase() && item.password === password); if (!account) { setError("Invalid demo credentials. Choose an account below or try again."); return } onLogin(account) }; return <main className="grid min-h-screen bg-[#282820] lg:grid-cols-[1fr_1.05fr]"><section className="relative hidden overflow-hidden bg-[#f29b38] p-12 text-[#282820] lg:flex lg:flex-col lg:justify-between"><div><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[#282820] text-white"><span className="font-bold">fw</span></div><span className="font-serif text-xl font-bold">Foodie wagon</span></div><div className="mt-24 max-w-md"><p className="text-xs font-bold uppercase tracking-[.25em]">The team behind the taste</p><h1 className="mt-5 font-serif text-6xl font-bold leading-[.95]">Good food starts with a great team.</h1><p className="mt-7 max-w-sm text-base leading-7 text-[#5b3b1c]">One calm, clear place to manage your staff, orders and daily operations.</p></div></div><div className="flex items-end justify-between"><p className="text-xs font-semibold uppercase tracking-[.16em]">Ingolstadt · Since 2020</p><div className="text-7xl opacity-20">✦</div></div></section><section className="flex items-center justify-center px-6 py-12"><div className="w-full max-w-[390px] text-white"><div className="mb-12 lg:hidden"><p className="font-serif text-xl font-bold">Foodie wagon</p></div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#f3a047]">Staff portal</p><h2 className="mt-4 font-serif text-4xl font-bold">Welcome back.</h2><p className="mt-3 text-sm leading-6 text-white/50">Sign in to manage your bakery operations.</p><form onSubmit={submit} className="mt-9 space-y-5"><label className="block text-sm font-medium">Work email<input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError("") }} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[.06] px-4 py-3.5 text-sm text-white outline-none transition focus:border-[#f3a047]"/></label><label className="block text-sm font-medium">Password<div className="relative"><input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError("") }} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[.06] px-4 py-3.5 text-sm text-white outline-none transition focus:border-[#f3a047]"/><KeyRound size={16} className="absolute right-4 top-6 text-white/30"/></div></label>{error && <p className="rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-xs text-red-200">{error}</p>}<div className="flex items-center justify-between text-xs"><label className="flex items-center gap-2 text-white/50"><input type="checkbox" defaultChecked className="accent-[#f29b38]"/> Keep me signed in</label><button type="button" className="font-semibold text-[#f3a047]">Forgot password?</button></div><button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#f29b38] py-3.5 text-sm font-bold text-[#282820] transition hover:bg-[#ffad4d]">Sign in <ArrowRight size={16}/></button></form><button type="button" onClick={() => setShowAccounts(!showAccounts)} className="mt-6 w-full text-center text-xs font-semibold text-[#f3a047]">{showAccounts ? "Hide demo accounts" : "View demo accounts"}</button>{showAccounts && <div className="mt-3 space-y-2 rounded-xl border border-white/10 bg-white/[.04] p-3">{demoAccounts.map((account) => <button type="button" key={account.role} onClick={() => { setEmail(account.email); setPassword(account.password); setError("") }} className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-xs hover:bg-white/[.08]"><span><strong className="block text-white">{account.role}</strong><span className="text-white/40">{account.email}</span></span><span className="text-[#f3a047]">Use</span></button>)}</div>}<p className="mt-5 text-center text-xs text-white/30">Demo mode · Frontend only · No data is saved</p></div></section></main> }

function PermissionsView({ selectedRole, setSelectedRole }: { selectedRole: string, setSelectedRole: (role: string) => void }) { return <div className="grid gap-6 xl:grid-cols-[270px_1fr]"><div className="rounded-2xl border border-[#e9e4dc] bg-white p-4"><div className="mb-3 flex items-center justify-between"><h2 className="font-serif text-xl font-bold">Roles</h2><button className="rounded-lg p-2 text-[#e39131] hover:bg-[#fff4e4]"><Plus size={16}/></button></div><p className="mb-4 text-xs text-[#938e86]">Define job responsibilities.</p>{roles.map(role => <button key={role} onClick={() => setSelectedRole(role)} className={`mb-1 flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-semibold ${selectedRole === role ? "bg-[#fff2df] text-[#c76a10]" : "text-[#69645c] hover:bg-[#faf8f4]"}`}>{role}{selectedRole === role && <Check size={16}/>}</button>)}</div><div className="rounded-2xl border border-[#e9e4dc] bg-white p-5 sm:p-6"><div className="flex flex-col justify-between gap-3 border-b border-[#eeeae3] pb-5 sm:flex-row sm:items-center"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-[#e39131]">Role permissions</p><h2 className="mt-1 font-serif text-2xl font-bold">{selectedRole}</h2></div><button className="rounded-lg border border-[#e4dfd7] px-4 py-2 text-xs font-bold text-[#6f6b64]">Reset defaults</button></div><div className="grid gap-4 pt-5 md:grid-cols-2">{permissionGroups.map(({ title, icon: Icon, items }) => <div key={title} className="rounded-xl border border-[#eeeae3] p-4"><div className="flex items-center gap-2"><div className="grid h-8 w-8 place-items-center rounded-lg bg-[#fff4e4] text-[#e39131]"><Icon size={15}/></div><h3 className="text-sm font-bold">{title}</h3></div><div className="mt-4 space-y-3">{items.map((item, index) => <label key={item} className="flex items-center justify-between text-xs text-[#777269]"><span>{item}</span><input type="checkbox" defaultChecked={index < (selectedRole === "Admin" ? 5 : 3)} className="h-4 w-4 accent-[#ee9633]"/></label>)}</div></div>)}</div></div></div> }

function ProfileSettings({ account, onClose }: { account: typeof demoAccounts[number]; onClose: () => void }) { const [name, setName] = useState(account.name); const [phone, setPhone] = useState("+1 555 0148"); const [saved, setSaved] = useState(false); return <div className="fixed inset-0 z-50 grid place-items-center bg-[#22221f]/50 p-5"><div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#e39131]">Account</p><h2 className="mt-1 font-serif text-2xl font-bold">Profile settings</h2><p className="mt-1 text-xs text-[#938e86]">Update your personal information and preferences.</p></div><button aria-label="Close profile settings" onClick={onClose} className="rounded-lg p-2 text-[#99948c] hover:bg-[#f6f3ee]"><X size={18}/></button></div><div className="mt-6 flex items-center gap-3 rounded-xl bg-[#fff5e7] p-4"><div className="grid h-12 w-12 place-items-center rounded-full bg-[#f6d6ad] text-sm font-bold text-[#9b5e22]">{account.initials}</div><div><p className="font-semibold">{account.role}</p><p className="text-xs text-[#938e86]">{account.email}</p></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Full name<input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-lg border border-[#e4dfd7] px-3 py-2.5 text-sm outline-none focus:border-[#ed9635]"/></label><label className="text-sm font-medium">Phone number<input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-2 w-full rounded-lg border border-[#e4dfd7] px-3 py-2.5 text-sm outline-none focus:border-[#ed9635]"/></label></div><label className="mt-4 flex items-center gap-3 rounded-lg border border-[#eeeae3] p-3 text-xs text-[#6f6a62]"><input type="checkbox" defaultChecked className="h-4 w-4 accent-[#ee9633]"/> Send me shift and order notifications</label>{saved && <p className="mt-3 text-xs font-semibold text-emerald-600">Profile changes saved for this demo session.</p>}<div className="mt-6 flex justify-end gap-3"><button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-[#7a756d]">Close</button><button onClick={() => setSaved(true)} className="rounded-lg bg-[#ee9633] px-4 py-2 text-sm font-bold text-white">Save changes</button></div></div></div> }

function AddStaff({ onClose }: { onClose: () => void }) { return <div className="fixed inset-0 z-50 grid place-items-center bg-[#22221f]/50 p-5"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><div><h2 className="font-serif text-2xl font-bold">Add staff member</h2><p className="mt-1 text-xs text-[#938e86]">Create a team profile for your bakery.</p></div><button onClick={onClose} className="rounded-lg p-2 text-[#99948c] hover:bg-[#f6f3ee]"><X size={18}/></button></div><div className="mt-6 space-y-4">{["Full name", "Phone number", "Work email"].map(label => <label key={label} className="block text-sm font-medium">{label}<input className="mt-2 w-full rounded-lg border border-[#e4dfd7] px-3 py-2.5 text-sm outline-none focus:border-[#ed9635]" placeholder={label}/></label>)}<label className="block text-sm font-medium">Role<select className="mt-2 w-full rounded-lg border border-[#e4dfd7] bg-white px-3 py-2.5 text-sm"><option>Manager</option>{roles.slice(2).map(role => <option key={role}>{role}</option>)}</select></label></div><div className="mt-6 flex justify-end gap-3"><button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-[#7a756d]">Cancel</button><button onClick={onClose} className="rounded-lg bg-[#ee9633] px-4 py-2 text-sm font-bold text-white">Add member</button></div></div></div> }

export function LegacyHome() {
  return null
}
*/
/* legacy content removed */
/*
    "@graph": [
      {
        "@type": "Restaurant",
        "@id": "https://foodiewagon.de/#restaurant",
        "name": "The Foodie Wagon",
        "description": "Premium Halal Burger Food Truck in Ingolstadt - Hausgemachte Beef Patties, Fried Chicken, Currywurst und authentisches Street Food",
        "url": "https://foodiewagon.de",
        "telephone": "+49-XXX-XXXXXXX",
        "servesCuisine": ["Burger", "Halal", "Street Food", "Fast Food", "American", "German"],
        "priceRange": "€€",
        "image": "https://foodiewagon.de/graphics/tasty burger.svg",
        "logo": "https://foodiewagon.de/graphics/fooiewagen logo.svg",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Ingolstadt",
          "addressRegion": "Bayern",
          "addressCountry": "DE"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "48.7665",
          "longitude": "11.4257"
        },
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            "opens": "11:00",
            "closes": "22:00"
          }
        ],
        "paymentAccepted": "Cash, Credit Card",
        "currenciesAccepted": "EUR"
      },
      {
        "@type": "FoodEstablishment",
        "@id": "https://foodiewagon.de/#foodestablishment",
        "name": "The Foodie Wagon",
        "hasMenu": {
          "@type": "Menu",
          "hasMenuSection": [
            {
              "@type": "MenuSection",
              "name": "Beef Burgers",
              "description": "Hausgemachte 140g Beef Patties, 100% Halal",
              "hasMenuItem": [
                {
                  "@type": "MenuItem",
                  "name": "Cheesy Buffalo",
                  "description": "Brioche Bun, Beef Patty 140g, Käse, Burger Sauce, Gurke, Zwiebel, Tomaten, Salat",
                  "offers": {
                    "@type": "Offer",
                    "price": "10.50",
                    "priceCurrency": "EUR"
                  },
                  "suitableForDiet": "https://schema.org/HalalDiet"
                },
                {
                  "@type": "MenuItem",
                  "name": "Angry Bull",
                  "description": "Brioche Bun, Beef Patty 140g, Käse, Chili Cheese Sauce, Jalapeno",
                  "offers": {
                    "@type": "Offer",
                    "price": "12.00",
                    "priceCurrency": "EUR"
                  },
                  "suitableForDiet": "https://schema.org/HalalDiet"
                }
              ]
            },
            {
              "@type": "MenuSection",
              "name": "Chicken Burgers",
              "description": "Knusprige Chicken Strips, 100% Halal",
              "hasMenuItem": [
                {
                  "@type": "MenuItem",
                  "name": "Crunchy Chicken",
                  "description": "Brioche Bun, Chicken Strips, Käse, Burger Sauce, Salat",
                  "offers": {
                    "@type": "Offer",
                    "price": "8.50",
                    "priceCurrency": "EUR"
                  },
                  "suitableForDiet": "https://schema.org/HalalDiet"
                }
              ]
            },
            {
              "@type": "MenuSection",
              "name": "Fried Chicken",
              "description": "Knuspriges Fried Chicken - Wings & Strips",
              "hasMenuItem": [
                {
                  "@type": "MenuItem",
                  "name": "Chicken Wings",
                  "description": "Knusprige Chicken Wings - 6, 10 oder 20 Stück",
                  "offers": {
                    "@type": "Offer",
                    "price": "7.50",
                    "priceCurrency": "EUR"
                  },
                  "suitableForDiet": "https://schema.org/HalalDiet"
                }
              ]
            }
          ]
        }
      },
      {
        "@type": "LocalBusiness",
        "@id": "https://foodiewagon.de/#localbusiness",
        "name": "The Foodie Wagon",
        "description": "Mobile Food Truck für Halal Burger und Street Food in Ingolstadt",
        "slogan": "Where Flavor Hits The Road",
        "hasCredential": {
          "@type": "EducationalOccupationalCredential",
          "credentialCategory": "Halal Certification",
          "name": "100% Halal Certified"
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://foodiewagon.de/#website",
        "url": "https://foodiewagon.de",
        "name": "The Foodie Wagon",
        "description": "Premium Halal Burgers & Street Food in Ingolstadt",
        "publisher": {
          "@id": "https://foodiewagon.de/#restaurant"
        },
        "inLanguage": "de-DE"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="min-h-screen bg-background">
        <Header />
        <Hero />
        <MenuSection />
        <LocationSection />
        <ContactSection />
        <Footer />
        <StickyCTA />
      </main>
    </>
  )
}
*/

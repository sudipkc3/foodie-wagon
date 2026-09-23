"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BarChart3, ClipboardList, FileText, LayoutDashboard, LogOut, PackageCheck, Send, ShieldCheck, ShoppingBag, Truck, Users } from "lucide-react"
import { OperationsDashboard } from "@/components/operations-dashboard"

export type StaffAccount = {
  email: string
  password: string
  name: string
  role: string
  initials: string
}

export function StaffDashboard({ account, onLogout }: { account: StaffAccount; onLogout: () => void }) {
  const [active, setActive] = useState(account.role === "Chef" ? "Kitchen" : account.role === "Rider" ? "Delivery" : account.role === "Reception" ? "Orders" : "Overview")
  const navigation = account.role === "Chef" ? [["Kitchen", PackageCheck], ["Orders", ClipboardList], ["Activity logs", FileText]] : account.role === "Rider" ? [["Delivery", Truck], ["Activity logs", FileText]] : account.role === "Accountant" ? [["Overview", LayoutDashboard], ["Reports", BarChart3], ["Payments", ClipboardList], ["Activity logs", FileText]] : [["Overview", LayoutDashboard], ["Orders", ClipboardList], ["Customers", Users], ["Kitchen", PackageCheck], ["Delivery", Truck], ["Reports", BarChart3], ["Staff management", Users], ["Permissions", ShieldCheck], ["WhatsApp", Send], ["Products", ShoppingBag], ["Activity logs", FileText]]

  return <main className="min-h-screen bg-[#f7f5f1] text-[#22221f]"><aside className="fixed inset-y-0 left-0 hidden w-[250px] flex-col border-r border-[#e8e4dc] bg-white px-5 py-6 lg:flex"><Link href="/" className="flex items-center gap-3 px-2"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f29b38] text-white">b.</span><span><span className="block font-serif text-lg font-bold leading-none">Bloom & Batter</span><span className="mt-1 block text-[10px] font-semibold uppercase tracking-[.18em] text-[#a3a098]">Staff portal</span></span></Link><div className="mt-12"><p className="px-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#a9a49d]">Workspace</p><nav className="mt-3 max-h-[calc(100vh-250px)] space-y-1 overflow-y-auto">{navigation.map(([label, Icon]) => <button key={label as string} onClick={() => setActive(label as string)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${active === label ? "bg-[#fff2df] text-[#c76a10]" : "text-[#75716a] hover:bg-[#faf8f4]"}`}><Icon size={17}/>{label as string}</button>)}</nav></div><button onClick={onLogout} className="mt-auto flex items-center gap-2 px-3 text-sm font-bold text-[#84766d]"><LogOut size={16}/> Sign out</button></aside><section className="lg:pl-[250px]"><header className="flex h-[78px] items-center justify-between border-b border-[#e8e4dc] bg-white px-5 sm:px-8"><div><p className="hidden text-sm text-[#99958d] sm:block">Bloom & Batter <span className="mx-2">/</span> <span className="text-[#252521]">{active}</span></p><p className="mt-1 text-xs text-[#9a8d84] sm:hidden">{account.role} workspace</p></div><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#f6d6ad] text-xs font-bold text-[#9b5e22]">{account.initials}</div><div className="hidden sm:block"><p className="text-sm font-bold">{account.name}</p><p className="text-xs text-[#9a8d84]">{account.role}</p></div><button onClick={onLogout} className="rounded-full p-2 text-[#84766d] hover:bg-[#f8eee7] lg:hidden" aria-label="Sign out"><LogOut size={17}/></button></div></header><div className="p-5 sm:p-8"><OperationsDashboard active={active} role={account.role} /></div></section></main>
}

export function useStaffSession() {
  const [account, setAccount] = useState<StaffAccount | null>(null)
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("foodie-wagon-session")
      if (saved) setAccount(JSON.parse(saved))
    } catch {
      window.localStorage.removeItem("foodie-wagon-session")
    }
  }, [])
  return account
}

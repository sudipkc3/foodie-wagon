"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStaffSession } from "@/components/staff-dashboard"
import { StaffDashboardShell } from "@/components/staff-dashboard-shell"

export default function DashboardPage() {
  const router = useRouter()
  const account = useStaffSession()

  useEffect(() => {
    if (account === null && typeof window !== "undefined" && !window.localStorage.getItem("foodie-wagon-session")) router.replace("/staff-login")
  }, [account, router])

  if (!account) return <main className="grid min-h-screen place-items-center bg-[#f7f5f1] text-sm text-[#84766d]">Opening your workspace...</main>

  return <StaffDashboardShell account={account} onLogout={() => { window.localStorage.removeItem("foodie-wagon-session"); router.replace("/staff-login") }} />
}

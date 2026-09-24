"use client"

import { createContext, useContext } from "react"
import type { NewOrderInput } from "@/lib/bakery/workflow"

export type PageId =
  | "Overview" | "Front desk" | "Orders" | "Kitchen" | "Production" | "Delivery" | "Customers" | "Payments"
  | "Attendance" | "Roster" | "Staff" | "Permissions" | "Products" | "Inventory" | "Food safety"
  | "WhatsApp" | "Reports" | "Settings" | "Activity logs" | "Feature coverage"

export type DashboardNav = {
  page: PageId
  navigate: (page: PageId) => void
  openOrder: (id: string) => void
  newOrder: (prefill?: Partial<NewOrderInput>) => void
}

export const NavContext = createContext<DashboardNav | null>(null)

export function useDashboardNav() {
  const nav = useContext(NavContext)
  if (!nav) throw new Error("useDashboardNav must be used inside the dashboard shell")
  return nav
}

"use client"

import { BakeryProvider } from "@/lib/bakery/store"
import { DashboardShell, DashboardSkeleton } from "@/components/dashboard/shell"

export default function DashboardPage() {
  return <BakeryProvider fallback={<DashboardSkeleton />}><DashboardShell /></BakeryProvider>
}

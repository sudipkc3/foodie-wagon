"use client"

import { ErrorState } from "@/components/dashboard/ui"

// Route-level error boundary: keeps the failure contained and offers a retry.
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return <main className="grid min-h-screen place-items-center bg-[#f7f5f1] px-5"><ErrorState message="This page failed to load. Your data is safe in this browser." onRetry={reset} /></main>
}

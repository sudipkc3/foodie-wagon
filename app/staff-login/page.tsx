"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Clock3 } from "lucide-react"
import { signIn } from "@/lib/bakery/store"
import { seedStaff } from "@/lib/bakery/seed"

// Quick-fill buttons for the seeded demo team (one per role).
const demoAccounts = seedStaff().filter((member, index, all) => all.findIndex((other) => other.role === member.role) === index)

export default function StaffLogin() {
  const router = useRouter()
  const [email, setEmail] = useState("manager@foodiewagon.com")
  const [password, setPassword] = useState("manager123")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!signIn(email, password)) {
      setError("Those credentials did not match an active employee. Choose a demo account below or try again.")
      return
    }
    setError("")
    setPending(true)
    router.push("/dashboard")
  }

  return <main className="grid min-h-screen place-items-center bg-[#fbf8f3] px-5 py-12 text-[#302c28]">
    <div className="w-full max-w-md">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#756960]"><ArrowLeft size={16}/> Back to Bloom & Batter</Link>
      <div className="mt-10 rounded-3xl bg-white p-7 shadow-xl shadow-[#d5bdae]/20 sm:p-9">
        <div className="grid h-11 w-11 place-items-center rounded-full bg-[#d58a68] font-bold text-white">b.</div>
        <p className="mt-8 text-[10px] font-bold uppercase tracking-[.2em] text-[#c67a5d]">Team workspace</p>
        <h1 className="mt-2 font-serif text-4xl font-bold">Welcome back.</h1>
        <p className="mt-3 text-sm leading-6 text-[#81756d]">Sign in to manage orders, kitchen prep, delivery, and customer updates.</p>
        <form className="mt-8 space-y-4" onSubmit={submit}>
          <label className="block text-xs font-bold">Work email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="team@bloomandbatter.de" className="mt-2 w-full rounded-xl border border-[#ded3ca] p-3 text-sm font-normal outline-none focus:border-[#c67a5d]"/></label>
          <label className="block text-xs font-bold">Password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Your password" className="mt-2 w-full rounded-xl border border-[#ded3ca] p-3 text-sm font-normal outline-none focus:border-[#c67a5d]"/></label>
          {error && <p role="alert" className="rounded-xl bg-[#fff0eb] p-3 text-xs font-semibold text-[#af604b]">{error}</p>}
          <button type="submit" disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#302c28] py-3.5 text-sm font-bold text-white transition hover:bg-[#ba6d4f] active:scale-[.99] disabled:opacity-70">{pending ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"/> Signing in…</> : <>Sign in <ArrowRight size={14}/></>}</button>
        </form>
        <Link href="/kiosk" className="mt-4 flex items-center justify-center gap-2 rounded-full border border-[#ded3ca] py-3 text-xs font-bold text-[#5f554e] hover:bg-[#fff8f3]"><Clock3 size={14}/> Attendance kiosk (check in with PIN)</Link>
        <div className="mt-7 border-t border-[#eee4dc] pt-6"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#a18f84]">Demo accounts</p><div className="mt-3 grid gap-2">{demoAccounts.map((item) => <button key={item.email} onClick={() => { setEmail(item.email); setPassword(item.password); setError("") }} className="flex items-center justify-between rounded-xl bg-[#fff8f3] px-3 py-2.5 text-left text-xs hover:bg-[#f8eee7]"><span><strong className="block">{item.role} · {item.name}</strong><span className="text-[#9a8d84]">{item.email} · PIN {item.pin}</span></span><span className="text-[#c67a5d]">Use <ArrowRight className="ml-1 inline" size={12}/></span></button>)}</div></div>
      </div>
    </div>
  </main>
}

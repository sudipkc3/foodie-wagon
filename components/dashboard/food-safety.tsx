"use client"

import { useState } from "react"
import { Check, ClipboardCheck, Download, Thermometer } from "lucide-react"
import { useBakery } from "@/lib/bakery/store"
import { logTemperature, toggleChecklistTask } from "@/lib/bakery/operations"
import { dayKey, downloadCsv, formatDateTime, formatTime } from "@/lib/bakery/format"
import type { Equipment } from "@/lib/bakery/types"
import { Button, Card, Empty, Metric, PageHeading, Pill, Table, Td } from "./ui"

export function FoodSafetyPage() {
  const { state, can } = useBakery()
  const today = dayKey()
  const todayLogs = state.temperatureLogs.filter((log) => dayKey(log.at) === today)
  const inRange = (log: { equipmentId: string; value: number }) => { const eq = state.equipment.find((item) => item.id === log.equipmentId); return !eq || (log.value >= eq.min && log.value <= eq.max) }
  const runs = state.checklistTemplates.map((template) => ({ template, run: state.checklistRuns.find((item) => item.templateId === template.id && item.date === today) }))
  const doneTasks = runs.reduce((sum, { run }) => sum + Object.keys(run?.done ?? {}).length, 0)
  const totalTasks = runs.reduce((sum, { template }) => sum + template.tasks.length, 0)
  const exportLogs = () => downloadCsv(`haccp-temperatures-${today}.csv`, [["Date", "Time", "Equipment", "°C", "Allowed", "In range", "Corrective action", "Recorded by"], ...state.temperatureLogs.map((log) => { const eq = state.equipment.find((item) => item.id === log.equipmentId); return [dayKey(log.at), formatTime(log.at), eq?.name ?? "", log.value, eq ? `${eq.min}–${eq.max}` : "", inRange(log) ? "yes" : "NO", log.action ?? "", log.by] })])
  return (
    <div className="space-y-6">
      <PageHeading eyebrow="Food safety · HACCP" title="Temperatures & daily checks" description="Record fridge, freezer and display temperatures and complete opening/closing checklists — the records food inspectors ask for."
        actions={<Button tone="neutral" onClick={exportLogs}><Download size={14} /> Export log</Button>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Units checked today" value={`${new Set(todayLogs.map((log) => log.equipmentId)).size}/${state.equipment.length}`} icon={Thermometer} tone={new Set(todayLogs.map((log) => log.equipmentId)).size === state.equipment.length ? "good" : "warn"} hint="Check at least twice a day" />
        <Metric label="Out of range today" value={todayLogs.filter((log) => !inRange(log)).length} icon={Thermometer} tone={todayLogs.some((log) => !inRange(log)) ? "bad" : "good"} hint={todayLogs.some((log) => !inRange(log)) ? "Corrective action required" : "All readings safe"} />
        <Metric label="Checklist tasks" value={`${doneTasks}/${totalTasks}`} icon={ClipboardCheck} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{state.equipment.map((equipment) => <EquipmentCard key={equipment.id} equipment={equipment} disabled={!can("foodsafety.log")} />)}</div>
      <div className="grid gap-6 xl:grid-cols-3">{runs.map(({ template, run }) => <ChecklistCard key={template.id} templateId={template.id} name={template.name} tasks={template.tasks} done={run?.done ?? {}} disabled={!can("foodsafety.log")} />)}</div>
      <Card title="Temperature log" subtitle="Most recent readings">
        {state.temperatureLogs.length === 0 ? <Empty text="No readings yet." /> : (
          <Table minWidth={640} headings={["When", "Equipment", "Reading", "Corrective action", "By"]}>
            {state.temperatureLogs.slice(0, 60).map((log) => <tr key={log.id}><Td className="text-xs">{formatDateTime(log.at)}</Td><Td>{state.equipment.find((item) => item.id === log.equipmentId)?.name}</Td><Td>{inRange(log) ? <Pill tone="good">{log.value}°C</Pill> : <Pill tone="urgent">{log.value}°C</Pill>}</Td><Td className="text-xs">{log.action ?? "—"}</Td><Td className="text-xs">{log.by}</Td></tr>)}
          </Table>
        )}
      </Card>
    </div>
  )
}

function EquipmentCard({ equipment, disabled }: { equipment: Equipment; disabled: boolean }) {
  const { state, commit } = useBakery()
  const [value, setValue] = useState("")
  const [action, setAction] = useState("")
  const last = state.temperatureLogs.find((log) => log.equipmentId === equipment.id)
  const reading = Number(value)
  const outOfRange = value !== "" && (reading < equipment.min || reading > equipment.max)
  const lastBad = last && (last.value < equipment.min || last.value > equipment.max)
  return (
    <Card>
      <div className="flex items-start justify-between"><div><h3 className="font-bold">{equipment.name}</h3><p className="text-xs text-[#8f8981]">Safe range {equipment.min}°C to {equipment.max}°C</p></div><Thermometer size={18} className={lastBad ? "text-red-500" : "text-[#e39131]"} /></div>
      <p className={`mt-3 text-3xl font-bold ${lastBad ? "text-red-600" : ""}`}>{last ? `${last.value}°C` : "—"}</p>
      <p className="text-[11px] text-[#9b8f87]">{last ? `${formatDateTime(last.at)} · ${last.by}` : "No reading yet"}</p>
      {!disabled && (
        <div className="mt-3 space-y-2">
          <div className="flex gap-2"><input type="number" step="0.1" value={value} onChange={(event) => setValue(event.target.value)} placeholder="°C" className="w-full rounded-lg border border-[#e4dfd7] px-3 py-2 text-sm" /><Button disabled={value === "" || (outOfRange && !action.trim())} onClick={() => { commit((s, a) => logTemperature(s, a, equipment.id, reading, action.trim() || undefined), outOfRange ? "Out-of-range reading logged with action" : "Temperature recorded"); setValue(""); setAction("") }}>Log</Button></div>
          {outOfRange && <input autoFocus value={action} onChange={(event) => setAction(event.target.value)} placeholder="Out of range — corrective action taken (required)" className="w-full rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs" />}
        </div>
      )}
    </Card>
  )
}

function ChecklistCard({ templateId, name, tasks, done, disabled }: { templateId: string; name: string; tasks: string[]; done: Record<string, { by: string; at: string }>; disabled: boolean }) {
  const { commit } = useBakery()
  const complete = tasks.every((task) => done[task])
  return (
    <Card title={name} subtitle={`${Object.keys(done).length}/${tasks.length} done today`} action={complete && <Pill tone="good">Complete</Pill>}>
      <ul className="space-y-1.5">
        {tasks.map((task) => (
          <li key={task}>
            <button disabled={disabled} onClick={() => commit((s, a) => toggleChecklistTask(s, a, templateId, task))} className="flex w-full items-start gap-3 rounded-lg p-2 text-left text-sm transition hover:bg-[#faf8f4] disabled:cursor-default">
              <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border transition ${done[task] ? "border-emerald-500 bg-emerald-500 text-white" : "border-[#d9cfc5]"}`}>{done[task] && <Check size={13} />}</span>
              <span><span className={done[task] ? "text-[#8f8981] line-through" : ""}>{task}</span>{done[task] && <span className="block text-[11px] text-[#9b8f87]">{done[task].by} · {formatTime(done[task].at)}</span>}</span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  )
}

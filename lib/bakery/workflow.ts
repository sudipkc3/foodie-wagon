import { formatDateTime, formatTime, money, orderBalance, orderTitle, orderTotal, uid } from "./format"
import type {
  AccountabilityKey, ActivityEvent, Actor, BakeryState, NoteKind, Order, OrderItem, OrderSource, OrderStatus,
  PaymentMethod, PermissionKey, WhatsAppEvent, WhatsAppMessage,
} from "./types"

// ---- Generic helpers ------------------------------------------------------------

export const can = (state: BakeryState, actor: Actor | null | undefined, key: PermissionKey) =>
  Boolean(actor && state.permissions[actor.role]?.includes(key))

export const logActivity = (state: BakeryState, actor: Actor | { name: string; role: string }, action: string, area: ActivityEvent["area"], ref?: string): BakeryState => ({
  ...state,
  activity: [{ id: uid("act"), at: new Date().toISOString(), by: actor.name, role: actor.role, action, area, ref }, ...state.activity].slice(0, 600),
})

const patchOrder = (state: BakeryState, id: string, fn: (order: Order) => Order): BakeryState => ({
  ...state,
  orders: state.orders.map((order) => (order.id === id ? fn(order) : order)),
})

const stamp = (order: Order, actor: Actor | { name: string; role: string }, label: string, key?: AccountabilityKey): Order => ({
  ...order,
  timeline: [...order.timeline, { at: new Date().toISOString(), label, by: actor.name, role: actor.role as Order["timeline"][number]["role"], key }],
  accountability: key ? { ...order.accountability, [key]: actor.name } : order.accountability,
})

// ---- WhatsApp -------------------------------------------------------------------

export const renderTemplate = (body: string, order: Order, state: BakeryState) =>
  body
    .replace(/\{customer\}/g, order.customer.name.split(" ")[0] || order.customer.name)
    .replace(/\{order\}/g, order.id)
    .replace(/\{cake\}/g, orderTitle(order))
    .replace(/\{due\}/g, formatDateTime(order.dueAt))
    .replace(/\{time\}/g, formatTime(order.dueAt))
    .replace(/\{address\}/g, order.address)
    .replace(/\{total\}/g, money(orderTotal(order)))
    .replace(/\{balance\}/g, money(orderBalance(order)))
    .replace(/\{rider\}/g, order.rider || "our rider")
    .replace(/\{bakery\}/g, state.settings.bakeryName)
    .replace(/\{bakeryAddress\}/g, state.settings.address)

const queueWhatsApp = (state: BakeryState, order: Order, event: WhatsAppEvent, by: string, force = false): Order => {
  const template = state.templates.find((item) => item.id === event)
  if (!template || (!template.auto && !force) || !order.customer.phone) return order
  const message: WhatsAppMessage = {
    id: uid("wa"), templateId: event, text: renderTemplate(template.body, order, state), at: new Date().toISOString(),
    status: state.settings.whatsappConnected ? "Sent" : "Queued", by,
  }
  return { ...order, whatsapp: [...order.whatsapp, message] }
}

export const sendWhatsApp = (state: BakeryState, actor: Actor, orderId: string, event: WhatsAppEvent) => {
  const next = patchOrder(state, orderId, (order) => queueWhatsApp(state, order, event, actor.name, true))
  return logActivity(next, actor, `sent WhatsApp "${state.templates.find((t) => t.id === event)?.name}"`, "WhatsApp", orderId)
}

export const resendWhatsApp = (state: BakeryState, actor: Actor, orderId: string, messageId: string) => {
  const next = patchOrder(state, orderId, (order) => {
    const original = order.whatsapp.find((message) => message.id === messageId)
    if (!original) return order
    return { ...order, whatsapp: [...order.whatsapp, { ...original, id: uid("wa"), at: new Date().toISOString(), status: state.settings.whatsappConnected ? "Sent" : "Queued", by: actor.name }] }
  })
  return logActivity(next, actor, "resent a WhatsApp message", "WhatsApp", orderId)
}

// ---- Status machine -------------------------------------------------------------

export type OrderAction =
  | "accept" | "claim" | "start" | "ready" | "handover"
  | "riderPickup" | "outForDelivery" | "delivered" | "failed" | "redispatch"
  | "complete" | "cancel"

export const ACTION_META: Record<OrderAction, { label: string; done: string; tone: "primary" | "neutral" | "danger"; input?: "reason" | "proof" }> = {
  accept: { label: "Accept order", done: "accepted", tone: "primary" },
  claim: { label: "Chef: accept order", done: "accepted by chef", tone: "primary" },
  start: { label: "Start preparation", done: "preparation started", tone: "primary" },
  ready: { label: "Mark ready", done: "marked ready", tone: "primary" },
  handover: { label: "Hand over to customer", done: "handed over", tone: "primary" },
  riderPickup: { label: "Picked up from bakery", done: "picked up", tone: "primary" },
  outForDelivery: { label: "Start delivery", done: "out for delivery", tone: "primary" },
  delivered: { label: "Mark delivered", done: "delivered", tone: "primary", input: "proof" },
  failed: { label: "Delivery failed", done: "marked as failed delivery", tone: "danger", input: "reason" },
  redispatch: { label: "Re-dispatch", done: "re-dispatched", tone: "neutral" },
  complete: { label: "Complete order", done: "completed", tone: "primary" },
  cancel: { label: "Cancel order", done: "cancelled", tone: "danger", input: "reason" },
}

export function availableActions(state: BakeryState, order: Order, actor: Actor | null): OrderAction[] {
  if (!actor) return []
  const has = (key: PermissionKey) => can(state, actor, key)
  const isChef = actor.role === "Chef"
  const isRider = actor.role === "Rider"
  const myKitchenOrder = !isChef || order.chef === actor.name
  const myDelivery = !isRider || order.rider === actor.name
  const actions: OrderAction[] = []
  const { status } = order

  if (status === "New" && has("orders.edit")) actions.push("accept")
  if (status === "Accepted" && has("kitchen.prepare") && isChef && (!order.chef || order.chef === actor.name) && !order.accountability.chefAcceptedBy) actions.push("claim")
  if (status === "Accepted" && has("kitchen.prepare") && order.chef && myKitchenOrder) actions.push("start")
  if (status === "Preparing" && has("kitchen.prepare") && myKitchenOrder) actions.push("ready")
  if (status === "Ready" && order.type === "Pickup" && has("orders.complete")) actions.push("handover")
  if (status === "Ready" && order.type === "Delivery" && order.rider && has("delivery.update") && myDelivery) actions.push("riderPickup")
  if (status === "Picked Up" && has("delivery.update") && myDelivery) actions.push("outForDelivery")
  if (status === "Out for Delivery" && has("delivery.update") && myDelivery) actions.push("delivered", "failed")
  if (status === "Delivery Failed" && has("orders.assign")) actions.push("redispatch")
  if (status === "Delivered" && has("orders.complete")) actions.push("complete")
  if (!["Completed", "Cancelled", "Delivered"].includes(status) && has("orders.cancel")) actions.push("cancel")
  return actions
}


export function transitionOrder(state: BakeryState, actor: Actor, orderId: string, action: OrderAction, input = ""): BakeryState {
  const order = state.orders.find((item) => item.id === orderId)
  if (!order || !availableActions(state, order, actor).includes(action)) return state
  const set = (status: OrderStatus, label: string, key?: AccountabilityKey, wa?: WhatsAppEvent, extra: Partial<Order> = {}) => {
    let next = stamp({ ...order, ...extra, status }, actor, label, key)
    if (wa) next = queueWhatsApp(state, next, wa, "Automation")
    return next
  }
  let next: Order
  const nextState = state
  switch (action) {
    case "accept": next = set("Accepted", "Order accepted", "acceptedBy", "accepted"); break
    case "claim": next = stamp({ ...order, chef: actor.name }, actor, "Chef accepted the order", "chefAcceptedBy"); break
    case "start": {
      const base = order.accountability.chefAcceptedBy ? order : stamp(order, { name: order.chef, role: "Chef" }, "Chef accepted the order", "chefAcceptedBy")
      next = stamp({ ...base, status: "Preparing" }, actor, "Preparation started", "prepStartedBy")
      next = queueWhatsApp(state, next, "preparing", "Automation")
      break
    }
    case "ready": next = set("Ready", order.type === "Pickup" ? "Ready for pickup" : "Ready for delivery", "completedByChef", order.type === "Pickup" ? "pickupReady" : "ready"); break
    case "handover": next = set("Completed", "Collected by customer", "handedOverBy", "collected", { accountability: { ...order.accountability, completedBy: actor.name } }); break
    case "riderPickup": next = set("Picked Up", "Rider picked up the cake", "riderPickedUpBy"); break
    case "outForDelivery": next = set("Out for Delivery", "Out for delivery", undefined, "outForDelivery"); break
    case "delivered": next = set("Delivered", input ? `Delivered · ${input}` : "Delivered", "deliveredBy", "delivered", { deliveryProof: input || undefined }); break
    case "failed": next = set("Delivery Failed", `Delivery failed · ${input || "No reason given"}`, undefined, undefined, { failedReason: input }); break
    case "redispatch": next = set("Ready", "Re-dispatched for delivery"); break
    case "complete": next = set("Completed", "Order completed", "completedBy"); break
    case "cancel": next = set("Cancelled", `Cancelled · ${input || "No reason given"}`, "cancelledBy", "cancelled", { cancelReason: input }); break
  }
  const updated = { ...nextState, orders: nextState.orders.map((item) => (item.id === orderId ? next : item)) }
  const area = ["claim", "start", "ready"].includes(action) ? "Kitchen" : ["riderPickup", "outForDelivery", "delivered", "failed"].includes(action) ? "Delivery" : "Orders"
  return logActivity(updated, actor, `${ACTION_META[action].label.toLowerCase().replace("chef: ", "")}${input ? ` (${input})` : ""}`, area, orderId)
}

// ---- Other order mutations ------------------------------------------------------------

export function assignStaff(state: BakeryState, actor: Actor, orderId: string, field: "chef" | "rider", name: string) {
  const order = state.orders.find((item) => item.id === orderId)
  if (!order || order[field] === name || !can(state, actor, "orders.assign")) return state
  const next = patchOrder(state, orderId, (current) => {
    const cleared = field === "chef" ? { ...current, chef: name, accountability: { ...current.accountability, chefAcceptedBy: undefined } } : { ...current, rider: name }
    return stamp(cleared, actor, name ? `${field === "chef" ? "Chef" : "Rider"} assigned: ${name}` : `${field === "chef" ? "Chef" : "Rider"} unassigned`, field === "chef" ? "chefAssignedBy" : "riderAssignedBy")
  })
  return logActivity(next, actor, `assigned ${field} ${name || "none"}`, field === "chef" ? "Kitchen" : "Delivery", orderId)
}

export function recordTransaction(state: BakeryState, actor: Actor, orderId: string, amount: number, method: PaymentMethod, kind: "Payment" | "Refund", note?: string) {
  if (!(amount > 0) || !can(state, actor, kind === "Refund" ? "payments.refund" : "payments.collect")) return state
  const next = patchOrder(state, orderId, (order) =>
    stamp({ ...order, transactions: [...order.transactions, { id: uid("tx"), amount, method, kind, at: new Date().toISOString(), by: actor.name, note }] }, actor, `${kind} ${money(amount)} · ${method}`),
  )
  return logActivity(next, actor, `${kind === "Refund" ? "refunded" : "collected"} ${money(amount)} (${method})`, "Payments", orderId)
}

export function addOrderNote(state: BakeryState, actor: Actor, orderId: string, kind: NoteKind, text: string) {
  if (!text.trim()) return state
  const next = patchOrder(state, orderId, (order) => ({ ...order, notes: [...order.notes, { id: uid("note"), kind, text: text.trim(), by: actor.name, at: new Date().toISOString() }] }))
  return logActivity(next, actor, `added a ${kind.toLowerCase()} note`, kind === "Kitchen" ? "Kitchen" : kind === "Delivery" ? "Delivery" : "Orders", orderId)
}

export function toggleUrgent(state: BakeryState, actor: Actor, orderId: string) {
  if (!can(state, actor, "orders.edit")) return state
  const next = patchOrder(state, orderId, (order) => stamp({ ...order, urgent: !order.urgent }, actor, order.urgent ? "Urgent flag removed" : "Marked urgent"))
  return logActivity(next, actor, "changed urgency", "Orders", orderId)
}

export type NewOrderInput = {
  source: OrderSource
  type: Order["type"]
  urgent: boolean
  dueAt: string
  customer: Order["customer"]
  items: OrderItem[]
  referenceImage?: string
  address: string
  deliveryFee: number
  discount?: number
  paymentMethod: PaymentMethod
  deposit?: number
  customerNote?: string
  internalNote?: string
  chef?: string
}

export function createOrder(state: BakeryState, actor: Actor | null, input: NewOrderInput): { state: BakeryState; order: Order } {
  const now = new Date().toISOString()
  const creator = actor ?? { name: "Website", role: "Website" }
  const id = `#ORD-${state.nextOrderNumber}`
  let order: Order = {
    id, source: input.source, type: input.type, status: "New", urgent: input.urgent || input.source === "Emergency", createdAt: now, dueAt: input.dueAt,
    customer: input.customer, items: input.items, referenceImage: input.referenceImage,
    address: input.type === "Delivery" ? input.address : "Bakery pickup", deliveryFee: input.type === "Delivery" ? input.deliveryFee : 0, discount: input.discount ?? 0,
    paymentMethod: input.paymentMethod, transactions: [], chef: "", rider: "", accountability: { createdBy: creator.name },
    notes: [
      ...(input.customerNote ? [{ id: uid("note"), kind: "Customer" as const, text: input.customerNote, by: input.customer.name, at: now }] : []),
      ...(input.internalNote ? [{ id: uid("note"), kind: "Reception" as const, text: input.internalNote, by: creator.name, at: now }] : []),
    ],
    timeline: [{ at: now, label: `Order created (${input.source})`, by: creator.name, role: creator.role as Order["timeline"][number]["role"], key: "createdBy" }],
    whatsapp: [],
  }
  if (input.deposit && input.deposit > 0 && actor) {
    order = stamp({ ...order, transactions: [{ id: uid("tx"), amount: input.deposit, method: input.paymentMethod, kind: "Payment", at: now, by: actor.name, note: "Deposit at order" }] }, actor, `Payment ${money(input.deposit)} · ${input.paymentMethod}`)
  }
  order = queueWhatsApp(state, order, "confirmed", "Automation")
  if (actor && state.settings.autoAcceptStaffOrders) {
    order = stamp({ ...order, status: "Accepted" }, actor, "Order accepted", "acceptedBy")
    order = queueWhatsApp(state, order, "accepted", "Automation")
  }
  if (actor && input.chef) order = stamp({ ...order, chef: input.chef }, actor, `Chef assigned: ${input.chef}`, "chefAssignedBy")
  let next: BakeryState = { ...state, orders: [order, ...state.orders], nextOrderNumber: state.nextOrderNumber + 1 }
  next = logActivity(next, creator, `created ${input.urgent || input.source === "Emergency" ? "an URGENT " : ""}${input.source.toLowerCase()} order`, "Orders", id)
  return { state: next, order }
}

import type { PermissionKey, Role } from "./types"

export const PERMISSION_GROUPS: { title: string; items: { key: PermissionKey; label: string }[] }[] = [
  { title: "Orders", items: [
    { key: "orders.view", label: "View orders" },
    { key: "orders.create", label: "Create orders" },
    { key: "orders.edit", label: "Edit orders & accept" },
    { key: "orders.assign", label: "Assign chef / rider" },
    { key: "orders.cancel", label: "Cancel orders" },
    { key: "orders.complete", label: "Hand over & complete" },
  ] },
  { title: "Kitchen", items: [
    { key: "kitchen.view", label: "View kitchen queue" },
    { key: "kitchen.prepare", label: "Accept, prepare & mark ready" },
  ] },
  { title: "Delivery", items: [
    { key: "delivery.viewAll", label: "View all deliveries" },
    { key: "delivery.update", label: "Update delivery status" },
  ] },
  { title: "Payments", items: [
    { key: "payments.view", label: "View payments" },
    { key: "payments.collect", label: "Collect payment" },
    { key: "payments.refund", label: "Issue refunds" },
  ] },
  { title: "Customers", items: [
    { key: "customers.view", label: "View customer data" },
    { key: "customers.edit", label: "Edit customer notes" },
  ] },
  { title: "Reports", items: [{ key: "reports.view", label: "View sales, staff & order reports" }] },
  { title: "Staff & attendance", items: [
    { key: "staff.manage", label: "Manage employees" },
    { key: "roles.manage", label: "Edit roles & permissions" },
    { key: "attendance.team", label: "View team attendance & timesheets" },
    { key: "attendance.manage", label: "Edit roster, correct records, approve leave" },
  ] },
  { title: "Catalogue & stock", items: [
    { key: "products.manage", label: "Manage cakes & products" },
    { key: "inventory.view", label: "View inventory" },
    { key: "inventory.manage", label: "Adjust stock & log waste" },
    { key: "foodsafety.log", label: "Record temperatures & checklists" },
  ] },
  { title: "Communication & settings", items: [
    { key: "whatsapp.send", label: "Send / resend WhatsApp" },
    { key: "whatsapp.manage", label: "Edit WhatsApp templates" },
    { key: "settings.manage", label: "Change bakery settings" },
  ] },
]

export const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap((group) => group.items.map((item) => item.key))

export const DEFAULT_PERMISSIONS: Record<Role, PermissionKey[]> = {
  Admin: ALL_PERMISSIONS,
  Manager: ALL_PERMISSIONS.filter((key) => !["roles.manage", "settings.manage"].includes(key)),
  Reception: [
    "orders.view", "orders.create", "orders.edit", "orders.assign", "orders.cancel", "orders.complete",
    "kitchen.view", "delivery.viewAll", "payments.view", "payments.collect",
    "customers.view", "customers.edit", "inventory.view", "foodsafety.log", "whatsapp.send",
  ],
  Chef: ["orders.view", "kitchen.view", "kitchen.prepare", "inventory.view", "inventory.manage", "foodsafety.log"],
  Rider: ["delivery.update", "payments.collect"],
  Accountant: ["orders.view", "payments.view", "payments.collect", "payments.refund", "customers.view", "reports.view", "attendance.team", "inventory.view"],
}

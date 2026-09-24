// Domain model for the Bloom & Batter operations system.
// One Order entity serves every intake channel (website, walk-in, reception, emergency, phone).

export type Role = "Admin" | "Manager" | "Reception" | "Chef" | "Rider" | "Accountant"
export const ROLES: Role[] = ["Admin", "Manager", "Reception", "Chef", "Rider", "Accountant"]

export type OrderSource = "Website" | "Walk-in" | "Reception" | "Emergency" | "Phone"
export const ORDER_SOURCES: OrderSource[] = ["Website", "Walk-in", "Reception", "Emergency", "Phone"]

export type FulfillmentType = "Pickup" | "Delivery"

export type OrderStatus =
  | "New"
  | "Accepted"
  | "Preparing"
  | "Ready"
  | "Picked Up"
  | "Out for Delivery"
  | "Delivered"
  | "Delivery Failed"
  | "Completed"
  | "Cancelled"
export const ORDER_STATUSES: OrderStatus[] = ["New", "Accepted", "Preparing", "Ready", "Picked Up", "Out for Delivery", "Delivered", "Delivery Failed", "Completed", "Cancelled"]

export type PaymentMethod = "Cash" | "Card" | "Online" | "Bank transfer"
export type PaymentStatus = "Unpaid" | "Partial" | "Paid" | "Refunded"

export type OrderItem = {
  productId?: string
  name: string
  image: string
  flavor: string
  size: string
  weightKg: number
  quantity: number
  unitPrice: number
  message: string
  design: string
}

export type NoteKind = "Customer" | "Kitchen" | "Reception" | "Delivery"
export type OrderNote = { id: string; kind: NoteKind; text: string; by: string; at: string }

export type TimelineEvent = { at: string; label: string; by: string; role: Role | "Website" | "System"; key?: AccountabilityKey }

export type Transaction = { id: string; amount: number; method: PaymentMethod; kind: "Payment" | "Refund"; at: string; by: string; note?: string }

export type WhatsAppStatus = "Queued" | "Sent" | "Delivered" | "Read" | "Failed"
export type WhatsAppMessage = { id: string; templateId: WhatsAppEvent; text: string; at: string; status: WhatsAppStatus; by: string }

// The accountability trail from features.md §11. Each key stores the staff name that performed it.
export type AccountabilityKey =
  | "createdBy"
  | "acceptedBy"
  | "chefAssignedBy"
  | "chefAcceptedBy"
  | "prepStartedBy"
  | "completedByChef"
  | "riderAssignedBy"
  | "riderPickedUpBy"
  | "deliveredBy"
  | "handedOverBy"
  | "completedBy"
  | "cancelledBy"

export type Order = {
  id: string
  source: OrderSource
  type: FulfillmentType
  status: OrderStatus
  urgent: boolean
  createdAt: string
  dueAt: string
  customer: { name: string; phone: string; email: string }
  items: OrderItem[]
  referenceImage?: string
  address: string
  deliveryFee: number
  discount: number
  paymentMethod: PaymentMethod
  transactions: Transaction[]
  chef: string
  rider: string
  accountability: Partial<Record<AccountabilityKey, string>>
  notes: OrderNote[]
  timeline: TimelineEvent[]
  whatsapp: WhatsAppMessage[]
  cancelReason?: string
  failedReason?: string
  deliveryProof?: string
  stockDeducted?: boolean
}

export type StaffStatus = "Active" | "On leave" | "Inactive"
export type Staff = {
  id: string
  name: string
  email: string
  password: string
  phone: string
  role: Role
  status: StaffStatus
  hourlyRate: number
  initials: string
  joinedAt: string
}

// ---- Attendance -------------------------------------------------------------

export type BreakPeriod = { start: string; end?: string }
export type AttendanceRecord = {
  id: string
  staffId: string
  date: string // yyyy-mm-dd of check-in
  checkIn: string
  checkOut?: string
  breaks: BreakPeriod[]
  method: "Front desk" | "Manager correction"
  recordedBy: string // who performed the check-in at the front desk
  note?: string
  edited?: { by: string; at: string; reason: string }
}

export type Shift = { id: string; staffId: string; date: string; start: string; end: string; station: string }

export type LeaveType = "Vacation" | "Sick" | "Personal" | "Unpaid"
export type LeaveRequest = { id: string; staffId: string; type: LeaveType; from: string; to: string; reason: string; status: "Pending" | "Approved" | "Rejected"; decidedBy?: string; createdAt: string }

// ---- Catalogue, inventory and food safety ------------------------------------

export const ALLERGENS = ["Gluten", "Crustaceans", "Eggs", "Fish", "Peanuts", "Soy", "Milk", "Tree nuts", "Celery", "Mustard", "Sesame", "Sulphites", "Lupin", "Molluscs"] as const
export type Allergen = (typeof ALLERGENS)[number]

export type RecipeLine = { ingredientId: string; perKg: number }
export type Product = {
  id: string
  name: string
  description: string
  category: string
  image: string
  pricePerKg: number
  sizes: string[]
  flavors: string[]
  allergens: Allergen[]
  available: boolean
  prepMinutes: number
  recipe: RecipeLine[]
}

export type Ingredient = { id: string; name: string; unit: "kg" | "L" | "pcs"; stock: number; reorderLevel: number; costPerUnit: number; supplier: string }
export type StockMovement = { id: string; ingredientId: string; change: number; reason: "Received" | "Used in order" | "Adjustment" | "Waste"; ref?: string; at: string; by: string }

export type WasteReason = "Expired" | "Damaged" | "Production error" | "Unsold" | "Customer return"
export type WasteEntry = { id: string; item: string; quantity: number; unit: string; cost: number; reason: WasteReason; at: string; by: string; note?: string }

export type Equipment = { id: string; name: string; min: number; max: number }
export type TemperatureLog = { id: string; equipmentId: string; value: number; at: string; by: string; action?: string }
export type ChecklistTemplate = { id: string; name: string; tasks: string[] }
export type ChecklistRun = { id: string; templateId: string; date: string; done: Record<string, { by: string; at: string }> }

// ---- Communication, activity and settings ------------------------------------

export type WhatsAppEvent = "confirmed" | "accepted" | "preparing" | "ready" | "pickupReady" | "outForDelivery" | "delivered" | "collected" | "cancelled"
export type WhatsAppTemplate = { id: WhatsAppEvent; name: string; body: string; auto: boolean }

export type ActivityEvent = { id: string; at: string; by: string; role: string; action: string; area: "Orders" | "Kitchen" | "Delivery" | "Payments" | "Staff" | "Attendance" | "Inventory" | "Food safety" | "Settings" | "Customers" | "WhatsApp"; ref?: string }

export type Settings = {
  bakeryName: string
  address: string
  phone: string
  openingTime: string
  closingTime: string
  dailyCakeCapacity: number
  minLeadHours: number
  urgentWindowMinutes: number
  deliveryFee: number
  autoAcceptStaffOrders: boolean
  lateGraceMinutes: number
  overtimeAfterHours: number
  whatsappConnected: boolean
  whatsappNumber: string
}

export type CustomerProfile = { phone: string; notes: string; favoriteFlavor?: string; birthday?: string }

export type PermissionKey =
  | "orders.view" | "orders.create" | "orders.edit" | "orders.assign" | "orders.cancel" | "orders.complete"
  | "kitchen.view" | "kitchen.prepare"
  | "delivery.viewAll" | "delivery.update"
  | "payments.view" | "payments.collect" | "payments.refund"
  | "customers.view" | "customers.edit"
  | "reports.view"
  | "staff.manage" | "roles.manage"
  | "attendance.checkin" | "attendance.team" | "attendance.manage"
  | "products.manage" | "inventory.view" | "inventory.manage"
  | "foodsafety.log"
  | "whatsapp.send" | "whatsapp.manage"
  | "settings.manage"

export type BakeryState = {
  version: 2
  orders: Order[]
  staff: Staff[]
  permissions: Record<Role, PermissionKey[]>
  attendance: AttendanceRecord[]
  shifts: Shift[]
  leave: LeaveRequest[]
  products: Product[]
  ingredients: Ingredient[]
  stockMovements: StockMovement[]
  waste: WasteEntry[]
  equipment: Equipment[]
  temperatureLogs: TemperatureLog[]
  checklistTemplates: ChecklistTemplate[]
  checklistRuns: ChecklistRun[]
  templates: WhatsAppTemplate[]
  customers: CustomerProfile[]
  activity: ActivityEvent[]
  settings: Settings
  nextOrderNumber: number
}

export type Actor = { id: string; name: string; role: Role }

import { DEFAULT_PERMISSIONS } from "./permissions"
import { addDays, atTime, dayKey, initials, parseWeight } from "./format"
import type {
  AttendanceRecord, BakeryState, ChecklistTemplate, Equipment, Ingredient, Order, OrderSource, OrderStatus, Product,
  Settings, Shift, Staff, TimelineEvent, WhatsAppTemplate,
} from "./types"

export const cakeImages = {
  truffle: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85",
  berry: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=85",
  velvet: "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=900&q=85",
  caramel: "https://images.unsplash.com/photo-1602351447937-745cb720612f?auto=format&fit=crop&w=900&q=85",
  forest: "https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=900&q=85",
  kids: "https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?auto=format&fit=crop&w=900&q=85",
  custom: "https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&w=900&q=85",
}

const staffSeed: [string, string, Staff["role"], string, string, number][] = [
  ["st_ava", "Ava Wilson", "Admin", "admin@foodiewagon.com", "admin123", 24],
  ["st_olivia", "Olivia Martin", "Manager", "manager@foodiewagon.com", "manager123", 21],
  ["st_mia", "Mia Rodriguez", "Reception", "reception@foodiewagon.com", "reception123", 15],
  ["st_anisha", "Anisha Gurung", "Reception", "anisha@foodiewagon.com", "anisha123", 15],
  ["st_ethan", "Ethan Brooks", "Chef", "chef@foodiewagon.com", "chef123", 19],
  ["st_bikash", "Bikash Thapa", "Chef", "bikash@foodiewagon.com", "bikash123", 18],
  ["st_noah", "Noah Williams", "Rider", "rider@foodiewagon.com", "rider123", 14],
  ["st_ramesh", "Ramesh Karki", "Rider", "ramesh@foodiewagon.com", "ramesh123", 14],
  ["st_sophia", "Sophia Chen", "Accountant", "accountant@foodiewagon.com", "accountant123", 20],
]

export const seedStaff = (): Staff[] =>
  staffSeed.map(([id, name, role, email, password, hourlyRate], index) => ({
    id, name, role, email, password, hourlyRate, phone: `+49 151 2345 ${String(6100 + index * 7)}`,
    status: "Active", initials: initials(name), joinedAt: dayKey(addDays(new Date(), -400 + index * 30)),
  }))

const ingredients: Ingredient[] = [
  { id: "ing_flour", name: "Wheat flour (Type 405)", unit: "kg", stock: 42, reorderLevel: 20, costPerUnit: 0.9, supplier: "Mühle Schmidt" },
  { id: "ing_sugar", name: "Caster sugar", unit: "kg", stock: 18, reorderLevel: 12, costPerUnit: 1.2, supplier: "Metro Ingolstadt" },
  { id: "ing_butter", name: "Butter", unit: "kg", stock: 9, reorderLevel: 8, costPerUnit: 8.5, supplier: "Molkerei Bauer" },
  { id: "ing_eggs", name: "Free-range eggs", unit: "pcs", stock: 160, reorderLevel: 90, costPerUnit: 0.32, supplier: "Hof Gruber" },
  { id: "ing_cream", name: "Whipping cream 33%", unit: "L", stock: 6, reorderLevel: 10, costPerUnit: 4.1, supplier: "Molkerei Bauer" },
  { id: "ing_choc", name: "Dark chocolate couverture", unit: "kg", stock: 5.5, reorderLevel: 4, costPerUnit: 14, supplier: "Callebaut via Metro" },
  { id: "ing_cocoa", name: "Cocoa powder", unit: "kg", stock: 3, reorderLevel: 1.5, costPerUnit: 9.5, supplier: "Metro Ingolstadt" },
  { id: "ing_strawberry", name: "Fresh strawberries", unit: "kg", stock: 2.5, reorderLevel: 4, costPerUnit: 6, supplier: "Obsthof Weber" },
  { id: "ing_creamcheese", name: "Cream cheese", unit: "kg", stock: 4, reorderLevel: 3, costPerUnit: 7.2, supplier: "Molkerei Bauer" },
  { id: "ing_caramel", name: "Caramel & praline", unit: "kg", stock: 2, reorderLevel: 1.5, costPerUnit: 12, supplier: "Metro Ingolstadt" },
  { id: "ing_cherries", name: "Sour cherries", unit: "kg", stock: 3.5, reorderLevel: 2, costPerUnit: 5.5, supplier: "Obsthof Weber" },
  { id: "ing_boxes", name: "Cake boxes", unit: "pcs", stock: 48, reorderLevel: 30, costPerUnit: 0.8, supplier: "Pack & Go" },
]

const base = (flour: number, extra: [string, number][]) => [
  { ingredientId: "ing_flour", perKg: flour }, { ingredientId: "ing_sugar", perKg: 0.18 }, { ingredientId: "ing_butter", perKg: 0.12 },
  { ingredientId: "ing_eggs", perKg: 4 }, { ingredientId: "ing_boxes", perKg: 1 }, ...extra.map(([ingredientId, perKg]) => ({ ingredientId, perKg })),
]

export const seedProducts = (): Product[] => [
  { id: "p_truffle", name: "Chocolate Truffle", description: "Silky ganache, chocolate sponge & curls", category: "Chocolate", image: cakeImages.truffle, pricePerKg: 34, sizes: ["0.5 kg", "1 kg", "2 kg"], flavors: ["Classic", "Eggless", "Less sweet"], allergens: ["Gluten", "Eggs", "Milk", "Soy"], available: true, prepMinutes: 150, recipe: base(0.2, [["ing_choc", 0.18], ["ing_cream", 0.2], ["ing_cocoa", 0.03]]) },
  { id: "p_berry", name: "Strawberry Cloud", description: "Vanilla chiffon, fresh berries & cream", category: "Fruit", image: cakeImages.berry, pricePerKg: 38, sizes: ["0.5 kg", "1 kg", "2 kg"], flavors: ["Classic", "Eggless", "Less sweet"], allergens: ["Gluten", "Eggs", "Milk"], available: true, prepMinutes: 120, recipe: base(0.22, [["ing_strawberry", 0.25], ["ing_cream", 0.3]]) },
  { id: "p_velvet", name: "Red Velvet", description: "Cocoa sponge with cream cheese frosting", category: "Birthday", image: cakeImages.velvet, pricePerKg: 36, sizes: ["0.5 kg", "1 kg", "2 kg"], flavors: ["Classic", "Eggless"], allergens: ["Gluten", "Eggs", "Milk"], available: true, prepMinutes: 140, recipe: base(0.24, [["ing_creamcheese", 0.2], ["ing_cocoa", 0.02]]) },
  { id: "p_caramel", name: "Caramel Crunch", description: "Buttery caramel, praline & vanilla cream", category: "Premium", image: cakeImages.caramel, pricePerKg: 42, sizes: ["0.5 kg", "1 kg", "2 kg"], flavors: ["Classic", "Less sweet"], allergens: ["Gluten", "Eggs", "Milk", "Tree nuts"], available: true, prepMinutes: 160, recipe: base(0.22, [["ing_caramel", 0.15], ["ing_cream", 0.2]]) },
  { id: "p_forest", name: "Black Forest", description: "Cherry compote, dark chocolate & cream", category: "Anniversary", image: cakeImages.forest, pricePerKg: 35, sizes: ["0.5 kg", "1 kg", "2 kg"], flavors: ["Classic", "Eggless"], allergens: ["Gluten", "Eggs", "Milk", "Sulphites"], available: true, prepMinutes: 150, recipe: base(0.2, [["ing_cherries", 0.2], ["ing_cream", 0.3], ["ing_choc", 0.08]]) },
  { id: "p_kids", name: "Little Celebration", description: "Funfetti sponge made for tiny milestones", category: "Kids", image: cakeImages.kids, pricePerKg: 32, sizes: ["0.5 kg", "1 kg"], flavors: ["Classic", "Eggless"], allergens: ["Gluten", "Eggs", "Milk"], available: true, prepMinutes: 110, recipe: base(0.25, [["ing_cream", 0.15]]) },
  { id: "p_custom", name: "Custom Celebration", description: "Designed with you from a reference photo", category: "Premium", image: cakeImages.custom, pricePerKg: 52, sizes: ["1 kg", "2 kg", "3 kg"], flavors: ["Vanilla berry", "Chocolate", "Red velvet"], allergens: ["Gluten", "Eggs", "Milk"], available: true, prepMinutes: 240, recipe: base(0.22, [["ing_cream", 0.3], ["ing_strawberry", 0.1]]) },
]

const templates: WhatsAppTemplate[] = [
  { id: "confirmed", name: "Order confirmed", auto: true, body: "Hi {customer}! 🎂 We received your order {order} ({cake}) for {due}. Total {total}. Thank you for choosing {bakery}!" },
  { id: "accepted", name: "Order accepted", auto: true, body: "Good news {customer} — {bakery} has accepted order {order}. Our kitchen will have it ready for {due}." },
  { id: "preparing", name: "Preparing", auto: false, body: "Your {cake} is now being prepared by our chefs 👩‍🍳 (order {order})." },
  { id: "ready", name: "Cake ready", auto: true, body: "Your cake for order {order} is ready and will be dispatched soon. 🎉" },
  { id: "pickupReady", name: "Ready for pickup", auto: true, body: "Hi {customer}, order {order} is ready for pickup at {bakeryAddress}. Balance due: {balance}. See you soon!" },
  { id: "outForDelivery", name: "Out for delivery", auto: true, body: "{rider} is on the way with order {order} to {address}. 🚗" },
  { id: "delivered", name: "Delivered", auto: true, body: "Order {order} has been delivered. Enjoy the celebration, {customer}! 💛" },
  { id: "collected", name: "Collected", auto: true, body: "Thanks for collecting order {order}, {customer}. We'd love to bake for you again!" },
  { id: "cancelled", name: "Order cancelled", auto: true, body: "Hi {customer}, order {order} has been cancelled. Please call {bakery} if this is unexpected." },
]

const equipment: Equipment[] = [
  { id: "eq_fridge1", name: "Walk-in cooler", min: 0, max: 5 },
  { id: "eq_display", name: "Display chiller", min: 0, max: 7 },
  { id: "eq_freezer", name: "Freezer", min: -25, max: -18 },
  { id: "eq_cream", name: "Cream fridge", min: 1, max: 4 },
]

const checklists: ChecklistTemplate[] = [
  { id: "cl_open", name: "Opening checks", tasks: ["Hand-wash station stocked", "Fridges & freezer temperatures recorded", "Display cabinet cleaned", "Allergen signs displayed", "Pest-control check (no signs)"] },
  { id: "cl_close", name: "Closing checks", tasks: ["Unsold items logged as waste or labelled", "Work surfaces sanitised", "Floors mopped", "Ovens switched off", "Cold-room door closed & temperature recorded"] },
  { id: "cl_clean", name: "Weekly deep clean", tasks: ["Mixer & attachments dismantled and cleaned", "Oven interiors descaled", "Fridge seals checked", "Extraction filters cleaned"] },
]

export const defaultSettings: Settings = {
  bakeryName: "Bloom & Batter", address: "Westpark, 85057 Ingolstadt", phone: "+49 841 123 456", openingTime: "08:00", closingTime: "20:00",
  dailyCakeCapacity: 24, minLeadHours: 24, urgentWindowMinutes: 120, deliveryFee: 4.5, autoAcceptStaffOrders: true,
  lateGraceMinutes: 5, overtimeAfterHours: 8, whatsappConnected: true, whatsappNumber: "+49 841 123 456",
}

// Small deterministic PRNG so the seeded history looks the same on every reset.
const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646

const customers: [string, string, string][] = [
  ["Ram Sharma", "+49 176 4412 0148", "ram@example.com"], ["Priya Kapoor", "+49 176 4412 0192", "priya@example.com"],
  ["Daniel Lee", "+49 176 4412 0167", "daniel@example.com"], ["Anika Patel", "+49 176 4412 0104", "anika@example.com"],
  ["Lena Hoffmann", "+49 176 4412 0133", "lena@example.com"], ["Jonas Weber", "+49 176 4412 0155", ""],
  ["Sita Adhikari", "+49 176 4412 0171", "sita@example.com"], ["Marco Rossi", "+49 176 4412 0119", "marco@example.com"],
  ["Hannah Schulz", "+49 176 4412 0126", ""], ["Tobias Klein", "+49 176 4412 0188", "tobias@example.com"],
]
const messages = ["Happy Birthday", "Congratulations!", "Happy Anniversary", "Welcome home", "Happy 5th Birthday Mia", "Well done, Jonas", ""]
const addresses = ["14 Lindenstrasse, Ingolstadt", "8 Bahnhofstrasse, Ingolstadt", "22 Friedrichshofener Str., Ingolstadt", "3 Am Westpark, Ingolstadt"]

function makeOrder(opts: {
  n: number; customer: number; product: Product; size: string; source: OrderSource; type: Order["type"]; status: OrderStatus; dueAt: Date; createdAt: Date
  urgent?: boolean; message?: string; paidRatio: number; chef?: string; rider?: string; reception?: string; note?: string
}): Order {
  const [name, phone, email] = customers[opts.customer % customers.length]
  const weightKg = parseWeight(opts.size)
  const created = opts.createdAt.toISOString()
  const creator = opts.source === "Website" ? "Website" : opts.reception || "Mia Rodriguez"
  const t = (minutes: number) => new Date(opts.createdAt.getTime() + minutes * 60000).toISOString()
  const timeline: TimelineEvent[] = [{ at: created, label: `Order created (${opts.source})`, by: creator, role: opts.source === "Website" ? "Website" : "Reception", key: "createdBy" }]
  const accountability: Order["accountability"] = { createdBy: creator }
  const flow: OrderStatus[] = ["Accepted", "Preparing", "Ready", ...(opts.type === "Delivery" ? (["Picked Up", "Out for Delivery", "Delivered"] as OrderStatus[]) : []), "Completed"]
  const reached = opts.status === "Cancelled" ? 0 : flow.indexOf(opts.status) + 1
  const acceptor = opts.reception || "Olivia Martin"
  const steps: [string, string, Order["timeline"][number]["role"], keyof Order["accountability"]][] = [
    ["Order accepted", acceptor, "Reception", "acceptedBy"],
    ["Preparation started", opts.chef || "Ethan Brooks", "Chef", "prepStartedBy"],
    [opts.type === "Pickup" ? "Ready for pickup" : "Ready for delivery", opts.chef || "Ethan Brooks", "Chef", "completedByChef"],
    ...(opts.type === "Delivery"
      ? ([["Rider picked up the cake", opts.rider || "Noah Williams", "Rider", "riderPickedUpBy"], ["Out for delivery", opts.rider || "Noah Williams", "Rider", "riderPickedUpBy"], ["Delivered", opts.rider || "Noah Williams", "Rider", "deliveredBy"]] as [string, string, Order["timeline"][number]["role"], keyof Order["accountability"]][])
      : []),
    [opts.type === "Pickup" ? "Collected by customer" : "Order completed", acceptor, "Reception", opts.type === "Pickup" ? "handedOverBy" : "completedBy"],
  ]
  steps.slice(0, reached).forEach(([label, by, role, key], index) => {
    timeline.push({ at: t(6 + index * 45), label, by, role, key })
    accountability[key] = by
    if (index === 1) accountability.chefAcceptedBy = by
  })
  if (opts.type === "Pickup" && opts.status === "Completed") accountability.completedBy = acceptor
  if (opts.status === "Cancelled") { timeline.push({ at: t(30), label: "Cancelled · Customer changed plans", by: acceptor, role: "Reception", key: "cancelledBy" }); accountability.cancelledBy = acceptor }
  const total = opts.product.pricePerKg * weightKg + (opts.type === "Delivery" ? 4.5 : 0)
  const paid = +(total * opts.paidRatio).toFixed(2)
  const order: Order = {
    id: `#ORD-${opts.n}`, source: opts.source, type: opts.type, status: opts.status, urgent: Boolean(opts.urgent), createdAt: created, dueAt: opts.dueAt.toISOString(),
    customer: { name, phone, email },
    items: [{ productId: opts.product.id, name: opts.product.name, image: opts.product.image, flavor: opts.product.flavors[0], size: opts.size, weightKg, quantity: 1, unitPrice: opts.product.pricePerKg * weightKg, message: opts.message ?? "", design: opts.product.id === "p_custom" ? "Reference image attached" : "House finish" }],
    referenceImage: opts.product.id === "p_custom" ? cakeImages.custom : undefined,
    address: opts.type === "Delivery" ? addresses[opts.n % addresses.length] : "Bakery pickup", deliveryFee: opts.type === "Delivery" ? 4.5 : 0, discount: 0,
    paymentMethod: opts.source === "Website" ? "Online" : "Cash",
    transactions: paid > 0 ? [{ id: `tx_${opts.n}`, amount: paid, method: opts.source === "Website" ? "Online" : "Cash", kind: "Payment", at: created, by: creator }] : [],
    chef: reached >= 1 || opts.chef ? opts.chef || "Ethan Brooks" : "", rider: opts.type === "Delivery" && (reached >= 3 || opts.rider) ? opts.rider || "Noah Williams" : "",
    accountability, notes: opts.note ? [{ id: `note_${opts.n}`, kind: "Customer", text: opts.note, by: name, at: created }] : [], timeline,
    whatsapp: [{ id: `wa_${opts.n}_1`, templateId: "confirmed", text: `Hi ${name.split(" ")[0]}! We received your order #ORD-${opts.n}.`, at: t(1), status: "Read", by: "Automation" }],
    stockDeducted: reached >= 2,
  }
  return order
}

function seedOrders(products: Product[]): Order[] {
  const random = rng(42)
  const orders: Order[] = []
  const now = new Date()
  const sources: OrderSource[] = ["Website", "Website", "Website", "Reception", "Walk-in", "Phone", "Emergency"]
  const chefs = ["Ethan Brooks", "Bikash Thapa"]
  const riders = ["Noah Williams", "Ramesh Karki"]
  const reception = ["Mia Rodriguez", "Anisha Gurung"]
  let n = 1001
  // 21 days of completed history for reports.
  for (let day = 21; day >= 1; day--) {
    const count = 3 + Math.floor(random() * 4)
    for (let i = 0; i < count; i++) {
      const product = products[Math.floor(random() * (products.length - 1))]
      const type = random() > 0.6 ? "Delivery" : "Pickup"
      const due = atTime(addDays(now, -day), `${10 + Math.floor(random() * 8)}:${random() > 0.5 ? "30" : "00"}`)
      const source = sources[Math.floor(random() * sources.length)]
      orders.push(makeOrder({
        n: n++, customer: Math.floor(random() * customers.length), product, size: product.sizes[Math.floor(random() * product.sizes.length)], source, type,
        status: random() > 0.94 ? "Cancelled" : "Completed", dueAt: due, createdAt: addDays(due, -1 - Math.floor(random() * 2)), urgent: source === "Emergency",
        message: messages[Math.floor(random() * messages.length)], paidRatio: 1, chef: chefs[Math.floor(random() * 2)], rider: riders[Math.floor(random() * 2)], reception: reception[Math.floor(random() * 2)],
      }))
    }
  }
  const p = (id: string) => products.find((product) => product.id === id)!
  const inMinutes = (minutes: number) => new Date(now.getTime() + minutes * 60000)
  const today: Parameters<typeof makeOrder>[0][] = [
    { n: n++, customer: 0, product: p("p_truffle"), size: "1 kg", source: "Emergency", type: "Pickup", status: "Preparing", dueAt: inMinutes(75), createdAt: inMinutes(-50), urgent: true, message: "Happy Birthday Sita ❤️", paidRatio: 0, chef: "Bikash Thapa", reception: "Anisha Gurung", note: "Customer waiting nearby. Prioritize this order." },
    { n: n++, customer: 1, product: p("p_berry"), size: "2 kg", source: "Website", type: "Delivery", status: "Ready", dueAt: inMinutes(150), createdAt: inMinutes(-420), message: "Congratulations!", paidRatio: 1, chef: "Bikash Thapa", rider: "Noah Williams", note: "Please call on arrival." },
    { n: n++, customer: 2, product: p("p_velvet"), size: "1 kg", source: "Website", type: "Pickup", status: "New", dueAt: inMinutes(300), createdAt: inMinutes(-25), message: "Happy Anniversary", paidRatio: 0, note: "Eggless please, extra cream on the side." },
    { n: n++, customer: 3, product: p("p_custom"), size: "2 kg", source: "Reception", type: "Delivery", status: "Out for Delivery", dueAt: inMinutes(40), createdAt: addDays(now, -2), message: "Welcome home", paidRatio: 0.4, chef: "Ethan Brooks", rider: "Ramesh Karki", note: "Blue and white palette. Reference image approved." },
    { n: n++, customer: 4, product: p("p_caramel"), size: "1 kg", source: "Phone", type: "Pickup", status: "Accepted", dueAt: inMinutes(240), createdAt: inMinutes(-180), message: "Alles Gute, Lena!", paidRatio: 0.5 },
    { n: n++, customer: 5, product: p("p_kids"), size: "1 kg", source: "Walk-in", type: "Pickup", status: "Ready", dueAt: inMinutes(20), createdAt: inMinutes(-240), message: "Happy 5th Birthday Mia", paidRatio: 0, chef: "Ethan Brooks" },
    { n: n++, customer: 6, product: p("p_forest"), size: "2 kg", source: "Website", type: "Delivery", status: "Accepted", dueAt: atTime(addDays(now, 1), "14:00"), createdAt: inMinutes(-90), message: "Happy 60th, Baba", paidRatio: 1, chef: "Ethan Brooks" },
    { n: n++, customer: 7, product: p("p_truffle"), size: "2 kg", source: "Website", type: "Pickup", status: "New", dueAt: atTime(addDays(now, 1), "11:00"), createdAt: inMinutes(-10), message: "Buon compleanno", paidRatio: 1 },
    { n: n++, customer: 8, product: p("p_custom"), size: "3 kg", source: "Reception", type: "Delivery", status: "Accepted", dueAt: atTime(addDays(now, 2), "16:00"), createdAt: inMinutes(-300), message: "Just married", paidRatio: 0.5, note: "Three tiers look, white roses." },
  ]
  for (const order of today) orders.push(makeOrder(order))
  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

function seedRosterAndAttendance(staff: Staff[]) {
  const shifts: Shift[] = []
  const attendance: AttendanceRecord[] = []
  const random = rng(7)
  const pattern: Record<string, [string, string, string]> = {
    st_olivia: ["08:00", "16:30", "Floor"], st_mia: ["08:00", "16:00", "Front desk"], st_anisha: ["12:00", "20:00", "Front desk"],
    st_ethan: ["06:00", "14:30", "Kitchen"], st_bikash: ["10:00", "18:30", "Kitchen"], st_noah: ["11:00", "19:00", "Delivery"],
    st_ramesh: ["12:00", "20:00", "Delivery"], st_sophia: ["09:00", "15:00", "Office"],
  }
  const now = new Date()
  const monday = addDays(now, -((now.getDay() + 6) % 7))
  for (let offset = -14; offset < 14; offset++) {
    const date = addDays(monday, offset)
    const key = dayKey(date)
    staff.forEach((member, index) => {
      const slot = pattern[member.id]
      if (!slot || (date.getDay() + index) % 7 === 0) return // one rotating day off per person
      shifts.push({ id: `sh_${member.id}_${key}`, staffId: member.id, date: key, start: slot[0], end: slot[1], station: slot[2] })
      const start = atTime(date, slot[0])
      const end = atTime(date, slot[1])
      if (end.getTime() > now.getTime() && start.getTime() > now.getTime()) return
      if (key === dayKey(now) && ["st_noah"].includes(member.id)) return // scheduled but not yet checked in → shows as late/missing
      const late = random() > 0.85 ? 6 + Math.floor(random() * 15) : -Math.floor(random() * 8)
      const checkIn = new Date(start.getTime() + late * 60000)
      const finished = end.getTime() < now.getTime()
      const breakStart = new Date(start.getTime() + 4 * 3600000)
      attendance.push({
        id: `att_${member.id}_${key}`, staffId: member.id, date: key, checkIn: checkIn.toISOString(), method: "Front desk", recordedBy: member.id === "st_anisha" || start.getHours() >= 12 ? "Anisha Gurung" : "Mia Rodriguez",
        checkOut: finished ? new Date(end.getTime() + Math.floor(random() * 25) * 60000).toISOString() : undefined,
        breaks: breakStart.getTime() < now.getTime() ? [{ start: breakStart.toISOString(), end: new Date(Math.min(now.getTime(), breakStart.getTime() + 30 * 60000)).toISOString() }] : [],
      })
    })
  }
  return { shifts, attendance }
}

export function createSeedState(): BakeryState {
  const staff = seedStaff()
  const products = seedProducts()
  const orders = seedOrders(products)
  const { shifts, attendance } = seedRosterAndAttendance(staff)
  const now = new Date()
  const hour = (h: number) => atTime(now, `${h}:00`).toISOString()
  return {
    version: 2, orders, staff, permissions: structuredClone(DEFAULT_PERMISSIONS), attendance, shifts,
    leave: [
      { id: "lv_1", staffId: "st_noah", type: "Vacation", from: dayKey(addDays(now, 10)), to: dayKey(addDays(now, 14)), reason: "Family visit", status: "Pending", createdAt: addDays(now, -1).toISOString() },
      { id: "lv_2", staffId: "st_bikash", type: "Sick", from: dayKey(addDays(now, -9)), to: dayKey(addDays(now, -9)), reason: "Fever", status: "Approved", decidedBy: "Olivia Martin", createdAt: addDays(now, -9).toISOString() },
    ],
    products, ingredients: structuredClone(ingredients), stockMovements: [],
    waste: [
      { id: "w1", item: "Strawberry Cloud slices", quantity: 6, unit: "pcs", cost: 14, reason: "Unsold", at: addDays(now, -1).toISOString(), by: "Mia Rodriguez" },
      { id: "w2", item: "Whipping cream 33%", quantity: 1, unit: "L", cost: 4.1, reason: "Expired", at: addDays(now, -3).toISOString(), by: "Ethan Brooks" },
      { id: "w3", item: "Chocolate Truffle 1 kg", quantity: 1, unit: "pcs", cost: 16, reason: "Damaged", at: addDays(now, -6).toISOString(), by: "Noah Williams", note: "Dropped during loading" },
    ],
    equipment: structuredClone(equipment),
    temperatureLogs: now.getHours() >= 8 ? [
      { id: "t1", equipmentId: "eq_fridge1", value: 3.2, at: hour(8), by: "Ethan Brooks" },
      { id: "t2", equipmentId: "eq_display", value: 5.1, at: hour(8), by: "Mia Rodriguez" },
      { id: "t3", equipmentId: "eq_freezer", value: -20, at: hour(8), by: "Ethan Brooks" },
    ] : [],
    checklistTemplates: structuredClone(checklists), checklistRuns: [],
    templates: structuredClone(templates),
    customers: [
      { phone: customers[0][1], notes: "Regular for family birthdays. Prefers less sweet frosting.", favoriteFlavor: "Classic chocolate" },
      { phone: customers[6][1], notes: "Egg allergy in the family — always double-check eggless.", birthday: dayKey(addDays(now, 12)).slice(5) },
    ],
    activity: [], settings: { ...defaultSettings }, nextOrderNumber: 1001 + orders.length,
  }
}

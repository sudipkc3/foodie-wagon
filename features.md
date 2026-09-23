
The three scenarios can all feed into **one common order workflow**, regardless of whether the order comes from emergency walk-in, website, or onsite staff.

### 1. Core Order Workflow

| Feature Name             | Description                                                              | What Should Be Shown                                                                                     |
| ------------------------ | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| **Order Creation**       | Create an order from website, reception/front desk, or emergency walk-in | Order ID, customer name, phone, order source, date/time, items, cake details, quantity, price, notes     |
| **Order Source**         | Identifies where the order came from                                     | `Website`, `Walk-in`, `Reception`, `Emergency`, `Phone`                                                  |
| **Customer Information** | Stores customer details for the order                                    | Name, phone, email, address, previous orders                                                             |
| **Cake Details**         | Stores cake-specific requirements                                        | Cake photo/reference, flavor, size, weight, design, message on cake, customization, special instructions |
| **Order Type**           | Determines how customer receives the order                               | `Pickup` / `Delivery`                                                                                    |
| **Pickup Details**       | Information for customers collecting the cake                            | Pickup date, pickup time, pickup location, customer notes                                                |
| **Delivery Details**     | Information for delivery orders                                          | Delivery address, delivery date/time, delivery notes, delivery fee, assigned rider                       |
| **Order Status**         | Tracks the order through the complete lifecycle                          | `New → Accepted → Preparing → Ready → Completed → Pickup/Out for Delivery → Delivered`                   |
| **Order Timeline**       | Shows everything that happened to the order                              | Created time, accepted by, kitchen started, ready time, delivery assigned, delivered time                |
| **Order Assignment**     | Assigns responsible staff                                                | Receptionist, chef, delivery rider                                                                       |
| **Order Notes**          | Internal communication                                                   | Customer notes, kitchen notes, reception notes, delivery notes                                           |
| **Order Search**         | Quickly find existing orders                                             | Search by order ID, phone, customer name                                                                 |
| **Order Filter**         | Filter orders by operational state                                       | Status, date, pickup/delivery, source, assigned chef, staff member                                       |

---

# 2. Admin Dashboard

| Feature Name           | Description                                    | What Should Be Shown                                                    |
| ---------------------- | ---------------------------------------------- | ----------------------------------------------------------------------- |
| **Dashboard Overview** | Overall bakery operation                       | Today's orders, pending orders, preparing, ready, deliveries, completed |
| **Today's Orders**     | All orders for the current day                 | Order ID, customer, type, time, status, assigned staff                  |
| **Urgent Orders**      | Highlights emergency/urgent cakes              | Countdown/time remaining, customer, cake details, assigned chef         |
| **Pending Orders**     | Orders waiting for acceptance                  | Order ID, source, customer, required time, action                       |
| **Kitchen Orders**     | Orders currently being prepared                | Cake photo, requirements, deadline, chef                                |
| **Ready Orders**       | Cakes finished and waiting for pickup/delivery | Customer, order ID, ready time, pickup/delivery                         |
| **Delivery Orders**    | Orders requiring delivery                      | Customer, address, delivery time, rider, status                         |
| **Completed Orders**   | Finished orders                                | Customer, amount, completion time, staff involved                       |
| **Revenue Summary**    | Basic sales overview                           | Today's sales, orders, average order value, pickup vs delivery          |
| **Order Activity**     | Staff activity tracking                        | Who accepted, updated, prepared, assigned, delivered                    |

---

# 3. Order Detail Page

This should probably be one of the **most important screens**.

| Feature Name             | Description                            | What Should Be Shown                                                       |
| ------------------------ | -------------------------------------- | -------------------------------------------------------------------------- |
| **Order Header**         | Main order identification              | Order #, status, order source, created date/time                           |
| **Customer Card**        | Customer information                   | Name, phone, email                                                         |
| **Cake Preview**         | Shows customer-provided/reference cake | Large cake image                                                           |
| **Cake Information**     | Detailed cake requirements             | Flavor, size, weight, design, message, quantity                            |
| **Special Instructions** | Additional requirements                | Customer instructions and internal notes                                   |
| **Fulfillment**          | Pickup/delivery information            | Pickup/delivery, date, time, address                                       |
| **Payment**              | Payment information                    | Total, paid amount, remaining amount, payment method, payment status       |
| **Staff Assignment**     | People responsible for the order       | Receptionist, chef, rider                                                  |
| **WhatsApp History**     | Messages sent to customer              | Message type, sent time, delivery status                                   |
| **Order Timeline**       | Complete audit trail                   | Created → accepted → preparing → ready → delivery/pickup → completed       |
| **Actions**              | Available actions according to role    | Accept, assign chef, start preparation, mark ready, assign rider, complete |

---

# 4. Scenario 1 — Emergency / Walk-in Cake

For an emergency customer, the process should be **very fast**.

### Workflow

**Customer arrives → Reception creates order → Chef accepts → Cake prepared → Customer receives cake → Completed**

| Feature Name           | Description                                 | What Should Be Shown                                |
| ---------------------- | ------------------------------------------- | --------------------------------------------------- |
| **Quick Order**        | Fast order creation for emergency customers | Customer name, phone, cake selection, customization |
| **Cake Selection**     | Select available cake                       | Cake name, image, flavor, size, price               |
| **Customization**      | Customer's special requirements             | Cake message, design/customization, notes           |
| **Customer Details**   | Minimal required information                | Name + phone                                        |
| **Urgency**            | Marks order as emergency                    | `URGENT` badge + required completion time           |
| **Kitchen Assignment** | Sends order to kitchen                      | Assigned chef + order requirements                  |
| **Kitchen Status**     | Tracks preparation                          | Accepted → Preparing → Ready                        |
| **Customer Handover**  | Confirms customer received cake             | Received by customer, completion time               |
| **Quick Completion**   | Closes emergency order                      | Completed by receptionist/staff                     |

### Example

```text
#ORD-1025
URGENT

Customer: Ram Sharma
Phone: 98XXXXXXXX

Cake:
Chocolate Truffle
1 kg

Message:
"Happy Birthday Sita ❤️"

Status:
🟠 Preparing

Chef:
Bikash

[Mark Ready] [Complete Order]
```

---

# 5. Scenario 2 — Website Order

This is the more automated workflow.

### Workflow

**Website → Order Created → Owner/Reception WhatsApp notification → Dashboard → Chef → Preparing → Ready → Customer WhatsApp → Pickup/Delivery → Completed**

| Feature Name                  | Description                              | What Should Be Shown                           |
| ----------------------------- | ---------------------------------------- | ---------------------------------------------- |
| **Online Order**              | Customer creates order through website   | Order details + customer information           |
| **Customer Information Form** | Collect customer details                 | Name, phone, email                             |
| **Fulfillment Selection**     | Customer selects method                  | Pickup / Delivery                              |
| **Pickup Information**        | Collect pickup details                   | Date, time                                     |
| **Delivery Information**      | Collect delivery details                 | Address, date, time, delivery instructions     |
| **Cake Upload**               | Customer can upload/reference cake image | Image preview                                  |
| **Customization**             | Customer describes requirements          | Cake message, design, flavor, size, notes      |
| **Payment**                   | Payment processing                       | Payment method, amount, status                 |
| **Order Confirmation**        | Confirms order creation                  | Order number + confirmation                    |
| **Admin Notification**        | Notifies bakery staff                    | WhatsApp notification + dashboard notification |
| **Order Acceptance**          | Staff accepts order                      | Accepted by receptionist/admin                 |
| **Kitchen Assignment**        | Sends order to chef                      | Assigned chef                                  |
| **Kitchen Preparation**       | Chef prepares cake                       | Cake image, requirements, deadline             |
| **Ready Notification**        | Customer is notified                     | WhatsApp: cake ready                           |
| **Pickup Notification**       | Customer receives pickup information     | WhatsApp: ready for pickup                     |
| **Delivery Assignment**       | Assigns rider                            | Rider, address, delivery time                  |
| **Out for Delivery**          | Customer gets delivery update            | WhatsApp: order is on the way                  |
| **Delivery Completion**       | Rider confirms delivery                  | WhatsApp: delivered                            |
| **Order Completion**          | Closes order                             | Completed time + completed by                  |

---

# 6. Scenario 3 — Onsite Order With Cake Photo

This is basically the **reception-assisted version of the website order**.

### Workflow

**Customer arrives → Reception creates order → Uploads cake photo → Customer details → Order dashboard → Chef → Preparing → Ready → Pickup/Delivery → Completed**

| Feature Name                 | Description                                     | What Should Be Shown                  |
| ---------------------------- | ----------------------------------------------- | ------------------------------------- |
| **Reception Order Creation** | Reception creates order for customer            | Customer + cake information           |
| **Cake Photo Upload**        | Reception captures/uploads customer's reference | Cake image                            |
| **Customer Details**         | Stores customer information                     | Name, phone, email                    |
| **Cake Requirements**        | Records requirements                            | Flavor, size, design, message, notes  |
| **Pickup/Delivery**          | Determines fulfillment                          | Pickup / Delivery                     |
| **Order Confirmation**       | Shows customer what was ordered                 | Summary + price + date/time           |
| **Chef Assignment**          | Assigns order to kitchen                        | Chef name                             |
| **Kitchen Preparation**      | Tracks cake production                          | Preparing status + requirements       |
| **Ready Status**             | Cake is finished                                | Ready for pickup / ready for delivery |
| **Delivery Assignment**      | Assigns rider if required                       | Rider + address                       |
| **Completion**               | Finalizes order                                 | Delivered/collected + timestamp       |

---

# 7. Kitchen / Chef Dashboard

I would make this a **separate dashboard**, rather than showing the chef the entire admin system.

| Feature Name             | Description                        | What Should Be Shown                         |
| ------------------------ | ---------------------------------- | -------------------------------------------- |
| **Kitchen Dashboard**    | Chef's main workspace              | Pending, preparing, ready orders             |
| **New Orders**           | Orders waiting for chef acceptance | Order ID, cake photo, requirements, deadline |
| **My Orders**            | Orders assigned to current chef    | Assigned orders                              |
| **Urgent Orders**        | Emergency orders                   | Large `URGENT` indicator + deadline          |
| **Cake Photo**           | Visual reference                   | Large customer-uploaded image                |
| **Cake Requirements**    | What chef needs to prepare         | Flavor, size, weight, design, message        |
| **Customer Message**     | Message to put on cake             | Large readable text                          |
| **Special Instructions** | Important requirements             | Customer notes                               |
| **Accept Order**         | Chef accepts responsibility        | Accept button + timestamp                    |
| **Start Preparation**    | Starts kitchen timer               | Start time                                   |
| **Mark Ready**           | Cake is completed                  | Ready time                                   |
| **Kitchen Notes**        | Internal notes                     | Preparation notes/issues                     |
| **Preparation History**  | Tracks chef responsibility         | Accepted by, started by, completed by        |

---

# 8. Reception / Front Desk Dashboard

| Feature Name               | Description                          | What Should Be Shown        |
| -------------------------- | ------------------------------------ | --------------------------- |
| **New Order**              | Create customer order                | Quick order form            |
| **Walk-in Orders**         | Orders created at bakery             | Customer + cake + status    |
| **Website Orders**         | Orders received online               | New website orders          |
| **Emergency Orders**       | Quickly manage urgent cakes          | Urgent orders               |
| **Customer Search**        | Find customer/order                  | Name, phone, order ID       |
| **Order Acceptance**       | Accept incoming orders               | Accept/reject/assign        |
| **Chef Assignment**        | Assign kitchen staff                 | Available chefs             |
| **Pickup Management**      | Manage customers arriving for pickup | Ready orders                |
| **Delivery Management**    | Prepare delivery orders              | Ready orders awaiting rider |
| **Payment Collection**     | Handle outstanding payments          | Paid/unpaid/partial         |
| **Customer Communication** | Send/resend WhatsApp messages        | Message history + resend    |

---

# 9. Delivery Rider Dashboard

The rider should have a **very simple interface**.

| Feature Name            | Description                   | What Should Be Shown                                |
| ----------------------- | ----------------------------- | --------------------------------------------------- |
| **Assigned Deliveries** | Rider's current deliveries    | Order ID, customer, address                         |
| **Delivery Details**    | Information needed to deliver | Customer name, phone, address                       |
| **Customer Contact**    | Contact customer              | Call / WhatsApp                                     |
| **Navigation**          | Open location                 | Map/navigation button                               |
| **Delivery Status**     | Track delivery                | Assigned → Picked Up → Out for Delivery → Delivered |
| **Pickup Confirmation** | Rider confirms receiving cake | Pickup time                                         |
| **Out for Delivery**    | Rider starts delivery         | Delivery started time                               |
| **Delivery Completion** | Confirms successful delivery  | Delivered time, optional proof                      |
| **Failed Delivery**     | Records failed delivery       | Reason, notes                                       |
| **Delivery History**    | Previous deliveries           | Completed deliveries                                |

---

# 10. Staff & Role Management

This is where your **multi-role/RBAC** comes in.

| Feature Name             | Description                    | What Should Be Shown                               |
| ------------------------ | ------------------------------ | -------------------------------------------------- |
| **Staff Management**     | Manage bakery employees        | Name, phone, role, status                          |
| **Roles**                | Define job responsibilities    | Admin, Manager, Reception, Chef, Rider, Accountant |
| **Permissions**          | Control what each role can do  | View/Create/Edit/Delete/Assign/Complete            |
| **Role Assignment**      | Assign staff to roles          | Employee → Role                                    |
| **Order Permissions**    | Control order access           | View, create, edit, assign, cancel                 |
| **Kitchen Permissions**  | Control kitchen access         | View orders, accept, prepare, complete             |
| **Delivery Permissions** | Control delivery access        | View assigned deliveries, update status            |
| **Payment Permissions**  | Restrict financial information | View payment, collect payment, refund              |
| **Customer Permissions** | Control customer information   | View/edit customer data                            |
| **Reports Permissions**  | Control reporting              | View sales/staff/order reports                     |
| **Activity Logs**        | Track employee actions         | Employee, action, order, timestamp                 |

---

# 11. Staff Assignment & Accountability

This is particularly important based on what you described.

Every order should maintain something like:

| Responsibility             | Example              |
| -------------------------- | -------------------- |
| **Order Created By**       | Receptionist: Anisha |
| **Order Accepted By**      | Receptionist: Anisha |
| **Chef Assigned By**       | Manager: Suman       |
| **Chef Accepted By**       | Chef: Bikash         |
| **Preparation Started By** | Chef: Bikash         |
| **Cake Completed By**      | Chef: Bikash         |
| **Delivery Assigned By**   | Receptionist: Anisha |
| **Delivery Accepted By**   | Rider: Ramesh        |
| **Picked Up By Rider**     | Rider: Ramesh        |
| **Delivered By**           | Rider: Ramesh        |
| **Order Completed By**     | Receptionist: Anisha |

This gives you a complete **audit trail**.

---

# 12. WhatsApp Automation

Based on your earlier workflow of approximately **5 customer messages per order**, I would make WhatsApp a dedicated feature.

| Feature Name             | Description                            | What Should Be Shown          |
| ------------------------ | -------------------------------------- | ----------------------------- |
| **WhatsApp Integration** | Connect bakery's WhatsApp Business API | Connection status             |
| **Order Confirmation**   | Sent after order creation              | Order number + summary        |
| **Order Accepted**       | Sent when bakery accepts               | Order accepted message        |
| **Preparing**            | Optional preparation update            | Cake is being prepared        |
| **Order Ready**          | Sent when kitchen completes cake       | Ready notification            |
| **Pickup Notification**  | Sent for pickup orders                 | Pickup location/time          |
| **Out for Delivery**     | Sent when rider starts                 | Rider/delivery status         |
| **Delivered**            | Sent after delivery                    | Delivery completed            |
| **Message Templates**    | Manage predefined messages             | Template name + content       |
| **Message History**      | Track communications                   | Sent/failed/delivered/read    |
| **Resend Message**       | Manually resend                        | Resend button                 |
| **WhatsApp Logs**        | Technical message tracking             | Message ID, status, timestamp |

You can configure the messages approximately as:

```text
1. Order Confirmed
       ↓
2. Order Accepted
       ↓
3. Cake Ready
       ↓
4A. Ready for Pickup
       OR
4B. Out for Delivery
       ↓
5. Delivered / Collected
```

You don't necessarily need to send all five for every scenario; the exact messages can depend on the order type.

---

# 13. Customer Management

| Feature Name         | Description                     | What Should Be Shown             |
| -------------------- | ------------------------------- | -------------------------------- |
| **Customer List**    | All customers                   | Name, phone, total orders        |
| **Customer Profile** | Customer history                | Contact info + order history     |
| **Order History**    | Previous purchases              | Order IDs, cakes, dates, amounts |
| **Cake Preferences** | Useful recurring information    | Favorite flavor/design           |
| **Customer Notes**   | Internal notes                  | Preferences/special requirements |
| **WhatsApp History** | Previous communication          | Message history                  |
| **Repeat Order**     | Quickly recreate previous order | Previous cake + edit option      |

---

# 14. Reports & Analytics

| Feature Name            | Description            | What Should Be Shown        |
| ----------------------- | ---------------------- | --------------------------- |
| **Sales Report**        | Sales performance      | Daily/weekly/monthly sales  |
| **Order Report**        | Order volume           | Number of orders            |
| **Pickup vs Delivery**  | Fulfillment breakdown  | Pickup/delivery numbers     |
| **Order Source Report** | Where orders originate | Website/walk-in/reception   |
| **Cake Report**         | Popular cakes          | Cake type, quantity sold    |
| **Chef Report**         | Kitchen workload       | Orders handled by chef      |
| **Reception Report**    | Reception activity     | Orders created/accepted     |
| **Rider Report**        | Delivery performance   | Deliveries completed        |
| **Cancelled Orders**    | Track cancellations    | Reason, amount, staff       |
| **WhatsApp Report**     | Communication tracking | Sent/delivered/failed       |
| **Revenue Report**      | Financial overview     | Gross sales, payment status |

---

# 15. Recommended Main Navigation

For the actual frontend, I would keep the admin system roughly like this:

```text
BAKERY ADMIN
│
├── Dashboard
│
├── Orders
│   ├── All Orders
│   ├── New
│   ├── Preparing
│   ├── Ready
│   ├── Pickup
│   ├── Delivery
│   ├── Completed
│   └── Cancelled
│
├── Kitchen
│   ├── Kitchen Dashboard
│   ├── Pending
│   ├── Preparing
│   └── Ready
│
├── Delivery
│   ├── Pending Delivery
│   ├── Assigned
│   ├── Out for Delivery
│   └── Delivered
│
├── Customers
│
├── Cakes / Products
│
├── Staff
│   ├── Employees
│   ├── Roles
│   └── Permissions
│
├── WhatsApp
│   ├── Messages
│   ├── Templates
│   └── Logs
│
├── Reports
│
└── Settings
    ├── Bakery Information
    ├── Order Settings
    ├── WhatsApp
    ├── Notifications
    └── Roles & Permissions
```

### Most important concept

I would **not build three separate order systems** for your three scenarios.

Build **one Order entity** with:

```text
Order
│
├── Source
│   ├── Website
│   ├── Walk-in
│   ├── Reception
│   └── Emergency
│
├── Customer
│
├── Cake
│
├── Fulfillment
│   ├── Pickup
│   └── Delivery
│
├── Payment
│
├── Staff
│   ├── Created By
│   ├── Accepted By
│   ├── Chef
│   └── Delivery Rider
│
├── Status
│
├── WhatsApp
│
└── Activity / Audit Log
```

That way, **Scenario 1, 2 and 3 are simply different ways of creating the same order**, which will make the backend, dashboard, reporting, permissions, and WhatsApp automation much easier to maintain.

# Pumeco Fleet System — User Guide

> Fleet & Fuel Management for Pumeco Road Construction

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [User Roles & Permissions](#2-user-roles--permissions)
3. [Signing In](#3-signing-in)
4. [Dashboard](#4-dashboard)
5. [Branches](#5-branches)
6. [Vehicles](#6-vehicles)
7. [Staff](#7-staff)
8. [Fuel Tanks](#8-fuel-tanks)
9. [Fuel Receipts](#9-fuel-receipts)
10. [Fuel Dispensings](#10-fuel-dispensings)
11. [Servicing](#11-servicing)
12. [Reports](#12-reports)
13. [Activity Log](#13-activity-log)
14. [Complete Walkthrough: Fuel Delivery to Dispensing](#14-complete-walkthrough-fuel-delivery-to-dispensing)
15. [Complete Walkthrough: Vehicle Onboarding to Servicing](#15-complete-walkthrough-vehicle-onboarding-to-servicing)
16. [Quick Reference](#16-quick-reference)

---

## 1. System Overview

Pumeco Fleet is a web-based management platform that helps Pumeco Road Construction track its vehicles, fuel inventory, and servicing operations across multiple branches from a single interface.

**Core capabilities:**

| Area | What it manages |
|------|----------------|
| Fleet | Vehicles, registration, status, mileage, insurance |
| Fuel | Tanks, incoming deliveries (receipts), outgoing dispensings |
| Maintenance | Service records, costs, mechanic details |
| People | Staff, drivers, designations, license tracking |
| Organisation | Branches/locations across the operation |
| Reporting | Fuel summaries, service cost analysis, vehicle status exports |

---

## 2. User Roles & Permissions

Every user account has a **role** that controls what they can see and do. The role is displayed under the user's name in the sidebar.

```
┌─────────────────┬──────────┬─────────────┬───────────────┬────────────────┬────────┐
│ Feature         │ Admin    │ Fleet       │ Fuel          │ Branch         │ Viewer │
│                 │          │ Officer     │ Officer       │ Manager        │        │
├─────────────────┼──────────┼─────────────┼───────────────┼────────────────┼────────┤
│ Dashboard       │ All data │ All data    │ All data      │ Branch only    │ Read   │
│ Vehicles        │ Full     │ Full        │ View only     │ Branch only    │ Read   │
│ Servicing       │ Full     │ Full        │ View only     │ Branch only    │ Read   │
│ Fuel Tanks      │ Full     │ View only   │ Full          │ Branch only    │ Read   │
│ Fuel Receipts   │ Full     │ View only   │ Full          │ Branch only    │ Read   │
│ Fuel Dispensings│ Full     │ View only   │ Full          │ Branch only    │ Read   │
│ Branches        │ Full     │ View only   │ View only     │ Manage own     │ Read   │
│ Staff           │ Full     │ Full        │ View only     │ Branch only    │ Read   │
│ Reports         │ Full     │ Full        │ Full          │ Branch only    │ Read   │
│ Activity Log    │ Yes      │ No          │ No            │ No             │ No     │
└─────────────────┴──────────┴─────────────┴───────────────┴────────────────┴────────┘
```

> **Note:** Branch Manager and Viewer roles are scoped to their assigned branch — they cannot see data from other branches. Admin sees everything across all branches.

---

## 3. Signing In

**URL:** `http://localhost:3000/login` (or your hosted domain)

```
┌──────────────────────────────────┐
│                                  │
│         [Pumeco Fleet]           │
│   Fleet & Fuel Management System │
│                                  │
│  Email ________________________  │
│  Password ____________________   │
│                                  │
│       [ Sign In ]                │
│                                  │
└──────────────────────────────────┘
```

1. Enter the **email** and **password** provided by your administrator.
2. Click **Sign In**.
3. On success you are taken directly to the **Dashboard**.
4. If you see "Invalid email or password", double-check your credentials or contact the system administrator.

> The system uses email + password authentication. There is no self-registration — accounts are created by an Administrator.

---

## 4. Dashboard

The Dashboard is the home page (`/`). It gives a live snapshot of the entire operation.

```
┌─────────────────────────────────────────────────────────────────┐
│  Dashboard                          Friday, 29 May 2026         │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────┤
│  Total   │  Active  │ In Serv. │Breakdown │ Pending  │ Services │
│ Vehicles │ Vehicles │ Vehicles │ Vehicles │ Services │This Month│
│    24    │    18    │    4     │    2     │    3     │   11     │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ Fuel     │ Fuel     │ Fuel     │  Low     │  Active  │ Branches │
│ Today(L) │Month (L) │ Stock(L) │  Tanks   │  Staff   │          │
│  500     │  8,200   │ 45,000   │    1     │   37     │    5     │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘

  ⚠ Alerts (2)
  ─────────────────────────────────────────────────────────────
  ! Tank T-003 is low: 1,200L / 20,000L         [warning]
  ! Insurance for ABC-123-XY expires in 5 days  [critical]

  [Fuel Dispensed – Last 30 Days chart]  [Vehicle Status chart]
```

**What each stat means:**

- **Total / Active / In Service / Breakdown Vehicles** — current fleet count by status
- **Pending Services** — service records awaiting action
- **Services This Month** — completed services in the current calendar month
- **Fuel Today / This Month** — total litres dispensed (not received)
- **Fuel Stock** — sum of current levels across all active tanks
- **Low Tanks** — tanks at or below their minimum level threshold

**Alerts section** automatically flags:
- Fuel tanks at or below minimum level (critical if below 50% of minimum)
- Vehicles approaching their service mileage (within 500 km)
- Vehicle insurance expiring within 30 days

**Charts:**
- *Fuel Dispensed – Last 30 Days* — area chart showing daily fuel consumption trend
- *Vehicle Status* — donut chart showing fleet breakdown by status

---

## 5. Branches

**Path:** `/branches`  
**Who can manage:** Admin, Branch Manager (own branch only)

Branches represent physical locations or operational sites. Every vehicle, tank, staff member, and fuel record belongs to a branch.

### Fields

| Field | Description |
|-------|-------------|
| Code | Short unique identifier (e.g. `PHC`, `ABJ`) |
| Name | Full branch name |
| Location | Site address or description |
| State | Nigerian state |
| Manager Name | Name of branch manager |
| Phone / Email | Contact details |
| Status | Active or Inactive |

### How to add a branch

1. Go to **Branches** in the sidebar.
2. Click **+ Add Branch**.
3. Fill in the Code, Name, and Location (required), then optional contact fields.
4. Click **Save Branch**.

> **Important:** Set up branches **first** before adding vehicles, tanks, or staff, as all records require a branch assignment.

---

## 6. Vehicles

**Path:** `/vehicles`  
**Who can manage:** Admin, Fleet Officer

Vehicles represent every truck, car, and piece of motorised equipment in the fleet.

### Fields

| Field | Required | Description |
|-------|----------|-------------|
| Registration Number | Yes | Official plate number |
| Fleet Number | No | Internal tracking number |
| Make / Model / Year | Yes | Vehicle identity |
| Type | Yes | Truck, Car, Van, Equipment, Motorcycle, Other |
| Status | Yes | Active, In Service, Breakdown, Decommissioned |
| Branch | Yes | Which branch this vehicle belongs to |
| Current Mileage | Yes | Odometer reading in km |
| Fuel Capacity (L) | No | Tank size |
| Avg Fuel Consumption | No | L/100km baseline |
| Assigned Driver | No | Staff member assigned |
| Last Service Date/Mileage | No | Updates automatically when a service is completed |
| Next Service Mileage | No | Triggers alert on Dashboard when approaching |
| Insurance Expiry | No | Triggers alert 30 days before expiry |
| Road Worthiness Expiry | No | Same alert logic |

### Filtering the list

Use the filter bar at the top of the list page to narrow results by:
- Search (registration number, make, model, fleet number)
- Status
- Branch (Admin only)

### Viewing a vehicle

Click **View** on any row to open the vehicle detail page, which shows all fields, a list of service records, and recent fuel dispensings for that vehicle.

### Editing a vehicle

From the detail page or list, click **Edit** to update any field. Status changes (e.g. Active → Breakdown) are reflected immediately on the Dashboard.

---

## 7. Staff

**Path:** `/staff`  
**Who can manage:** Admin, Fleet Officer, Branch Manager

Staff are the people who operate vehicles and work at branches. Drivers must be in the Staff module before they can be linked to fuel dispensings.

### Fields

| Field | Required | Description |
|-------|----------|-------------|
| Full Name | Yes | |
| Staff Number | Yes | Unique ID |
| Designation | Yes | Driver, Mechanic, Operator, Supervisor, Other |
| Branch | Yes | |
| Phone | No | |
| License Number / Expiry / Class | No | Expired licenses show in red on the list |
| Hire Date | No | |
| Emergency Contact / Phone | No | |
| Active | Yes | Toggle to deactivate without deleting |

> **Driver licenses:** If a driver's license has expired, the expiry date appears in **red** on the Staff list page as a quick visual indicator. This does not block operations — it is informational only.

---

## 8. Fuel Tanks

**Path:** `/fuel-tanks`  
**Who can manage:** Admin, Fuel Officer

Fuel tanks are the physical storage tanks at each branch. All fuel receipts and dispensings are tied to a specific tank, so tanks must be set up before recording fuel activity.

### Fields

| Field | Required | Description |
|-------|----------|-------------|
| Tank Number | Yes | Short code (e.g. `T-001`) |
| Name | Yes | Descriptive name (e.g. "Main Diesel Tank – Port Harcourt") |
| Fuel Type | Yes | Diesel, Petrol, or Kerosene |
| Capacity (L) | Yes | Maximum volume the tank holds |
| Current Level (L) | Yes | Starting level when the tank is first created |
| Minimum Level (L) | Yes | Level below which the tank is considered "Low" |
| Branch | Yes | |

### Fill percentage bar

The list page shows a colour-coded bar for each tank:

```
  Green  ████████████████░░░░  80%   ← healthy
  Yellow ████████░░░░░░░░░░░░  40%   ← getting low
  Red    ███░░░░░░░░░░░░░░░░░  15%   ← low / critical
```

A **Low** badge also appears next to the tank name. Both the Dashboard and the Alerts section will flag this tank.

> **Level is auto-managed:** you do not need to manually update the current level. When a Fuel Receipt is saved the received quantity is **added** to the tank. When a Fuel Dispensing is saved the dispensed quantity is **subtracted** from the tank.

---

## 9. Fuel Receipts

**Path:** `/fuel-receipts`  
**Who can manage:** Admin, Fuel Officer

A Fuel Receipt records fuel arriving at a branch — i.e. a supplier delivery into a tank.

### Fields

| Field | Required | Description |
|-------|----------|-------------|
| Fuel Tank | Yes | Which tank receives the fuel |
| Branch | Yes | |
| Receipt Date | Yes | Date of delivery |
| Quantity Received (L) | Yes | Actual litres delivered |
| Quantity Ordered (L) | No | What was requested (for variance tracking) |
| Price per Litre (₦) | No | Auto-calculates Total Cost if provided |
| Total Cost (₦) | No | Can be entered directly |
| Supplier Name | No | |
| Waybill Number | No | Delivery document reference |
| Invoice Number | No | |
| Notes | No | Any remarks |

### What happens on save

```
  [Fuel Receipt Saved]
          │
          ▼
  Tank current_level += quantity_received
          │
          ▼
  Reference number auto-generated (e.g. FR-20260529-0001)
          │
          ▼
  Activity log entry created
```

The tank level is updated **instantly** — refresh the Fuel Tanks page to confirm the new level.

---

## 10. Fuel Dispensings

**Path:** `/fuel-dispensings`  
**Who can manage:** Admin, Fuel Officer

A Fuel Dispensing records fuel leaving a tank — fuelling a vehicle, running a generator, transferring to another site, etc.

### Fields

| Field | Required | Description |
|-------|----------|-------------|
| Fuel Tank | Yes | Which tank the fuel comes from |
| Branch | Yes | |
| Dispensing Date | Yes | |
| Purpose | Yes | Vehicle Fueling, Generator, Branch Transfer, Equipment, Other |
| Quantity Dispensed (L) | Yes | |
| Vehicle | No | Required if Purpose = Vehicle Fueling |
| Driver | No | Staff member who received the fuel |
| Vehicle Mileage at Dispensing | No | Current odometer reading |
| Notes | No | |

### What happens on save

```
  [Fuel Dispensing Saved]
          │
          ▼
  Tank current_level -= quantity_dispensed
          │
          ▼
  Reference number auto-generated (e.g. FD-20260529-0001)
          │
          ▼
  If vehicle linked → record logged against vehicle history
          │
          ▼
  Activity log entry created
```

### Filtering dispensings

Filter by Purpose, date range, and Branch to answer questions like:
- "How much diesel did the generators use last month?"
- "Which vehicles consumed the most fuel in Q1?"

---

## 11. Servicing

**Path:** `/servicing`  
**Who can manage:** Admin, Fleet Officer

Service Records track every maintenance event for every vehicle — routine oil changes, tyre replacements, major repairs, etc.

### Fields

| Field | Required | Description |
|-------|----------|-------------|
| Vehicle | Yes | |
| Branch | Yes | |
| Service Type | Yes | Oil Change, Tyre Change, Engine Repair, Brake Service, Electrical, Transmission, Body Work, Routine Service, Other |
| Service Date | Yes | |
| Status | Yes | Pending, In Progress, Completed, Cancelled |
| Mileage at Service | No | Odometer at time of service |
| Mechanic Name | No | |
| Workshop / Garage | No | |
| Labour Cost (₦) | No | |
| Parts Cost (₦) | No | Total Cost = Labour + Parts (auto-calculated) |
| Description | Yes | What work was done |
| Parts Replaced | No | |
| Next Service Mileage | No | Updates the vehicle's next_service_mileage field |
| Next Service Date | No | |

### Status lifecycle

```
  [Pending] ──► [In Progress] ──► [Completed]
       │                               │
       └──────────────────────────►[Cancelled]
```

When a record is marked **Completed**, the vehicle's `last_service_date` and `last_service_mileage` fields are updated automatically.

---

## 12. Reports

**Path:** `/reports`  
**Who can access:** All roles (data scoped to branch for non-admin)

Three built-in reports are available, all with **CSV export**.

### 12.1 Fuel Summary Report (`/reports/fuel-summary`)

Answers: *How much fuel came in and went out?*

```
  Summary cards:
  ┌───────────────────┬───────────────────┬───────────────────┐
  │  Total Received   │  Total Dispensed  │  Total Cost (₦)   │
  │   150,000 L       │   140,000 L       │  ₦52,500,000      │
  └───────────────────┴───────────────────┴───────────────────┘

  Dispensing by Purpose table:
  Vehicle Fueling   | 95,000 L | 67.9%
  Generator         | 30,000 L | 21.4%
  Equipment         | 15,000 L | 10.7%

  Vehicle Fuel Consumption table:
  ABC-123-XY        | 18,000 L | 18.9%
  DEF-456-XY        | 14,500 L | 15.3%
  ...
```

Filter by date range. Export as CSV for Excel analysis.

### 12.2 Service Summary Report (`/reports/service-summary`)

Answers: *How much are we spending on maintenance?*

Shows total records, total cost, average cost per record, breakdown by status, and breakdown by service type with costs.

Filter by date range. Export as CSV.

### 12.3 Vehicle Status Report (`/reports/vehicle-status`)

Answers: *What is the current state of every vehicle in the fleet?*

Full vehicle list with status, mileage, last service date, and expiry dates for insurance and road worthiness. Colour coding:
- **Red** = expired
- **Yellow** = expiring within 30 days
- Normal = valid

Export as CSV for fleet audits or regulatory submissions.

---

## 13. Activity Log

**Path:** `/activity-log`  
**Who can access:** Administrator only

Every create, update, delete, and approve action taken by any user is recorded here automatically. This is a read-only audit trail.

```
  ┌───────────────┬──────────┬────────┬─────────────┬─────────────────────────────┐
  │ Time          │ User     │ Action │ Type        │ Description                 │
  ├───────────────┼──────────┼────────┼─────────────┼─────────────────────────────┤
  │ 29/05 11:34am │ Ali Musa │ create │ FuelReceipt │ Created FR-20260529-0003    │
  │ 29/05 11:20am │ John D.  │ update │ Vehicle     │ Updated ABC-123-XY status   │
  │ 29/05 10:55am │ System   │ create │ FuelTank    │ Tank T-005 created          │
  └───────────────┴──────────┴────────┴─────────────┴─────────────────────────────┘
```

Filter by action type (create / update / delete / approve) or record type. Paginated at 30 entries per page.

---

## 14. Complete Walkthrough: Fuel Delivery to Dispensing

This walkthrough traces the full lifecycle of fuel — from a supplier delivering diesel to the tank, through to a vehicle being fuelled. Follow these steps in order.

```
  SETUP (one-time)                  DAILY OPERATIONS
  ─────────────────                 ─────────────────────────────────────
  [1] Create Branch                 [4] Record Fuel Receipt
         │                                  │
  [2] Create Fuel Tank                      │  Tank level increases
         │                                  ▼
  [3] Add Vehicle            [5] Dispatch Vehicle → Record Dispensing
         │                                  │
         │                                  │  Tank level decreases
         │                                  ▼
         └──────────────────── [6] View Reports / Dashboard
```

---

### Step 1 — Set up the Branch

> Skip if the branch already exists.

1. Sidebar → **Branches** → **+ Add Branch**
2. Enter: Code = `PHC`, Name = `Port Harcourt Site`, Location = `Trans-Amadi Industrial Layout`
3. Click **Save Branch**.

---

### Step 2 — Create a Fuel Tank

> Skip if the tank already exists.

1. Sidebar → **Fuel Tanks** → **+ Add Tank**
2. Fill in:
   ```
   Tank Number    :  T-001
   Name           :  Main Diesel Tank – Port Harcourt
   Fuel Type      :  Diesel
   Capacity (L)   :  20,000
   Current Level  :  5,000     ← starting level
   Minimum Level  :  2,000     ← below this, alerts trigger
   Branch         :  Port Harcourt Site
   ```
3. Click **Save Tank**.

**Result:** Tank T-001 appears on the Fuel Tanks list showing a 25% fill level (5,000 / 20,000 L).

---

### Step 3 — Add the Vehicle

> Skip if the vehicle already exists.

1. Sidebar → **Vehicles** → **+ Add Vehicle**
2. Fill in:
   ```
   Registration Number  :  PHC-001-XY
   Fleet Number         :  F-024
   Make / Model / Year  :  Sinotruk / HOWO / 2022
   Type                 :  Truck
   Status               :  Active
   Branch               :  Port Harcourt Site
   Current Mileage      :  48,500
   Next Service Mileage :  50,000    ← triggers alert at 49,500 km
   Insurance Expiry     :  2026-12-31
   ```
3. Click **Save Vehicle**.

---

### Step 4 — Record the Fuel Delivery (Fuel Receipt)

A tanker arrives and delivers **10,000 litres** of diesel at **₦650/litre**.

1. Sidebar → **Fuel Receipts** → **+ New Receipt**
2. Fill in:
   ```
   Fuel Tank              :  Main Diesel Tank – Port Harcourt [T-001]
   Branch                 :  Port Harcourt Site
   Receipt Date           :  2026-05-29
   Quantity Received (L)  :  10,000
   Price per Litre (₦)    :  650         ← Total Cost auto-calculates: ₦6,500,000
   Supplier Name          :  Forte Oil Ltd
   Waybill Number         :  WB-20260529-001
   Invoice Number         :  INV-FO-8821
   ```
3. Click **Record Receipt**.

**What happened automatically:**
```
  Tank T-001 level:  5,000 L  →  15,000 L   (75% full, was 25%)
  Reference number:  FR-20260529-0001
  Activity log:      Ali Musa created FR-20260529-0001
  Dashboard:         Fuel Stock increases, Low Tank alert disappears (15,000 > 2,000 minimum)
```

---

### Step 5 — Dispense Fuel to the Vehicle

Driver John Dike comes to fuel truck PHC-001-XY before heading to the construction site.

1. Sidebar → **Dispensings** → **+ New Dispensing**
2. Fill in:
   ```
   Fuel Tank              :  Main Diesel Tank – Port Harcourt [T-001]
   Branch                 :  Port Harcourt Site
   Dispensing Date        :  2026-05-29
   Purpose                :  Vehicle Fueling
   Quantity Dispensed (L) :  300
   Vehicle                :  PHC-001-XY
   Driver                 :  John Dike
   Vehicle Mileage        :  48,650        ← odometer reading right now
   Notes                  :  Site run to Trans-Amadi
   ```
3. Click **Record Dispensing**.

**What happened automatically:**
```
  Tank T-001 level:  15,000 L  →  14,700 L
  Reference number:  FD-20260529-0001
  Dashboard:         "Fuel Today" stat increases by 300 L
  Vehicle history:   Dispensing logged against PHC-001-XY
```

---

### Step 6 — Check the Dashboard & Reports

**Dashboard** — navigate to `/` to confirm:
- Fuel Today shows the 300 L dispensed
- Fuel Stock reflects the updated tank level
- No low-tank alert (14,700 L well above 2,000 minimum)

**Fuel Summary Report** — navigate to `/reports/fuel-summary`:
1. Set From Date = `2026-05-29`, To Date = `2026-05-29`, click **Apply**
2. You will see:
   ```
   Total Received  :  10,000 L
   Total Dispensed :  300 L
   Total Cost      :  ₦6,500,000

   Dispensing by Purpose:
   Vehicle Fueling  |  300 L  |  100%

   Vehicle Consumption:
   PHC-001-XY       |  300 L  |  100%
   ```
3. Click **Export CSV** to download the data for records.

---

## 15. Complete Walkthrough: Vehicle Onboarding to Servicing

This walkthrough shows how to bring a new vehicle into the system and log its first service.

```
  [1] Add Vehicle (status: Active)
          │
  [2] Assign Driver (from Staff module)
          │
  [3] Vehicle goes in for service → status: In Service
          │
  [4] Create Service Record (status: Pending → In Progress)
          │
  [5] Work completed → Service Record marked Completed
          │
          ▼
  Vehicle last_service_date and last_service_mileage auto-updated
          │
          ▼
  [6] Update vehicle status back to Active
```

### Step 1 — Add the Vehicle

*(Follow Step 3 from Walkthrough 14 above.)*

### Step 2 — Assign a Driver

1. Sidebar → **Staff** → **+ Add Staff** (if driver not yet in system)
   ```
   Full Name       :  Samuel Okafor
   Staff Number    :  STF-0045
   Designation     :  Driver
   Branch          :  Port Harcourt Site
   Phone           :  08012345678
   License Number  :  LAG-DRV-00456
   License Expiry  :  2027-08-15
   License Class   :  C
   ```
2. Click **Save Staff**.
3. Now edit the vehicle (Vehicles → View → Edit) and set **Assigned Driver** = Samuel Okafor.

### Step 3 — Change Vehicle Status to In Service

1. Vehicles → View `PHC-001-XY` → **Edit**
2. Change Status from `Active` to `In Service`
3. Click **Save Vehicle**.

The Dashboard immediately shows +1 on "In Service Vehicles".

### Step 4 — Create a Service Record

1. Sidebar → **Servicing** → **+ New Record**
2. Fill in:
   ```
   Vehicle          :  PHC-001-XY
   Branch           :  Port Harcourt Site
   Service Type     :  Oil Change
   Service Date     :  2026-05-29
   Status           :  In Progress
   Mileage          :  48,650
   Mechanic Name    :  Hassan Musa
   Workshop         :  Pumeco Workshop – PHC
   Labour Cost (₦)  :  15,000
   Parts Cost (₦)   :  22,500      ← 5L engine oil + filter
   Description      :  Full engine oil change and oil filter replacement at 48,650 km
   Parts Replaced   :  Engine oil (5L Mobil 15W-40), oil filter
   Next Service     :  53,650 km   ← current + 5,000 km
   ```
3. Click **Save Record**.

### Step 5 — Mark the Service Completed

1. Servicing → View the record just created → **Edit**
2. Change Status from `In Progress` to `Completed`
3. Click **Save Record**.

**Auto-updates:**
```
  Vehicle PHC-001-XY:
    last_service_date    →  2026-05-29
    last_service_mileage →  48,650
    next_service_mileage →  53,650
```

### Step 6 — Return Vehicle to Active

1. Vehicles → View `PHC-001-XY` → **Edit**
2. Status → `Active`
3. Click **Save Vehicle**.

Vehicle is back in service. The Dashboard alert for "approaching service mileage" will now re-arm at 53,150 km (53,650 − 500).

---

## 16. Quick Reference

### Navigation summary

| Sidebar Item | URL | Purpose |
|---|---|---|
| Dashboard | `/` | Live overview + alerts |
| Vehicles | `/vehicles` | Fleet list |
| Servicing | `/servicing` | Maintenance records |
| Fuel Tanks | `/fuel-tanks` | Tank inventory |
| Fuel Receipts | `/fuel-receipts` | Incoming deliveries |
| Dispensings | `/fuel-dispensings` | Fuel issued from tanks |
| Branches | `/branches` | Site management |
| Staff | `/staff` | Personnel records |
| Reports | `/reports` | Fuel, service, vehicle reports |
| Activity Log | `/activity-log` | Audit trail (Admin only) |

### Common action paths

| Task | How |
|---|---|
| Record a fuel delivery | Fuel Receipts → + New Receipt |
| Record fuel issued to a truck | Dispensings → + New Dispensing |
| Mark a vehicle as broken down | Vehicles → View → Edit → Status = Breakdown |
| Log a completed service | Servicing → + New Record → mark Completed |
| See which vehicles need insurance renewal | Reports → Vehicle Status Report |
| Export this month's fuel data | Reports → Fuel Summary → set dates → Export CSV |
| See who created a record | Activity Log (Admin) |
| Deactivate a staff member | Staff → View → Edit → toggle Active off |

### Status colour coding

| Status | Colour | Meaning |
|---|---|---|
| Active | Green | Normal operation |
| In Service | Yellow | Currently being serviced |
| Breakdown | Red | Out of service — needs repair |
| Decommissioned | Grey | Retired from fleet |
| Pending | Yellow | Waiting to be actioned |
| In Progress | Blue | Currently being worked on |
| Completed | Green | Done |
| Cancelled | Red | Void / abandoned |

### Alerts reference

| Alert | Trigger | Where shown |
|---|---|---|
| Low Tank | Tank level ≤ minimum level | Dashboard alerts |
| Critical Tank | Tank level ≤ 50% of minimum | Dashboard alerts (red border) |
| Service Due | Vehicle mileage ≥ next service − 500 km | Dashboard alerts |
| Insurance Expiring | Insurance expiry within 30 days | Dashboard alerts |
| Expired Insurance | Insurance expiry date has passed | Vehicle Status Report (red) |

---

*Pumeco Road Construction — Internal Operations Platform*  
*For system access or account issues, contact your system administrator.*

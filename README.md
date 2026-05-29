# Pumeco Fleet System

A full-stack fleet and fuel management platform built for **Pumeco Road Construction**. It tracks vehicles, fuel inventory, servicing, staff, and operational costs across multiple branches — all from one web interface.

> Built with Next.js 16 · MongoDB Atlas · NextAuth v5 · Tailwind CSS v4 · TypeScript

---

## Features

- **Multi-branch support** — data is scoped per branch; admins see everything across all sites
- **Fleet management** — vehicles with status tracking, mileage, insurance & road-worthiness expiry alerts
- **Fuel inventory** — tanks with live fill levels that auto-update on every receipt and dispensing
- **Fuel receipts** — record supplier deliveries with cost, waybill, and invoice tracking
- **Fuel dispensings** — issue fuel to vehicles, generators, or equipment with driver and mileage capture
- **Servicing** — full maintenance lifecycle (pending → in progress → completed) with cost breakdown
- **Staff management** — drivers and operators with license tracking and expiry alerts
- **Role-based access** — five roles with granular permissions
- **Live dashboard** — KPI cards, alert panel, 30-day fuel chart, vehicle status donut chart
- **Reports & CSV export** — fuel summary, service cost analysis, vehicle status report
- **Audit trail** — every create/update/delete action logged in the Activity Log (admin only)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| Language | TypeScript |
| Database | MongoDB via [Mongoose](https://mongoosejs.com) |
| Auth | [NextAuth v5](https://authjs.dev) — credentials (email + password) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Charts | [Recharts](https://recharts.org) |
| Forms | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| Icons | [Lucide React](https://lucide.dev) |
| Hosting | Vercel (recommended) or any Node.js host |

---

## Getting Started

### Prerequisites

- **Node.js** 18.17 or later
- **npm** 9+
- A **MongoDB Atlas** cluster (free tier works) — [create one here](https://www.mongodb.com/cloud/atlas)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/pumeco-fleet.git
cd pumeco-fleet
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
# MongoDB Atlas connection string
# Replace <username>, <password>, and <cluster> with your Atlas credentials
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/pumeco-fleet?retryWrites=true&w=majority

# NextAuth secret — generate a strong random string
# Run:  openssl rand -base64 32
AUTH_SECRET=your_secret_here
```

> **MONGODB_URI:** In Atlas → your cluster → Connect → Drivers → copy the connection string.

> **AUTH_SECRET:** Run `openssl rand -base64 32` in your terminal to generate a secure value.

### 4. Seed the database

Start the dev server, then visit this URL once in your browser:

```bash
npm run dev
```

```
http://localhost:3000/api/seed
```

This creates **4 branches** and **13 demo user accounts** (default password: `password123`).

| Email | Role | Branch |
|---|---|---|
| admin@pumeco.com | Administrator | Head Office |
| fleet.hq@pumeco.com | Fleet Officer | Head Office |
| fuel.hq@pumeco.com | Fuel Officer | Head Office |
| manager.hq@pumeco.com | Branch Manager | Head Office |
| fleet.lagos@pumeco.com | Fleet Officer | Lagos |
| fuel.lagos@pumeco.com | Fuel Officer | Lagos |
| manager.lagos@pumeco.com | Branch Manager | Lagos |
| fleet.ph@pumeco.com | Fleet Officer | Port Harcourt |
| fuel.ph@pumeco.com | Fuel Officer | Port Harcourt |
| manager.ph@pumeco.com | Branch Manager | Port Harcourt |
| fleet.kano@pumeco.com | Fleet Officer | Kano |
| fuel.kano@pumeco.com | Fuel Officer | Kano |
| manager.kano@pumeco.com | Branch Manager | Kano |

> Change default passwords after first login for any account used in production.

### 5. Open the app

```
http://localhost:3000
```

Sign in with `admin@pumeco.com` / `password123`.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | Full MongoDB Atlas connection string |
| `AUTH_SECRET` | Yes | Random secret for signing JWT sessions |

---

## Project Structure

```
pumeco-fleet/
├── app/
│   ├── (app)/                  # Authenticated routes (sidebar layout)
│   │   ├── page.tsx            # Dashboard
│   │   ├── layout.tsx          # Auth guard + AppShell
│   │   ├── DashboardCharts.tsx
│   │   ├── vehicles/
│   │   ├── servicing/
│   │   ├── fuel-tanks/
│   │   ├── fuel-receipts/
│   │   ├── fuel-dispensings/
│   │   ├── branches/
│   │   ├── staff/
│   │   ├── reports/            # Hub + fuel-summary, service-summary, vehicle-status
│   │   └── activity-log/
│   ├── api/                    # REST API routes
│   │   ├── auth/
│   │   ├── vehicles/
│   │   ├── servicing/
│   │   ├── fuel-tanks/
│   │   ├── fuel-receipts/
│   │   ├── fuel-dispensings/
│   │   ├── branches/
│   │   ├── staff/
│   │   ├── users/
│   │   ├── reports/            # CSV export endpoints
│   │   └── seed/
│   ├── login/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx        # Mobile sidebar state (client)
│   │   └── Sidebar.tsx         # Nav sidebar — desktop always-on, mobile drawer
│   └── ui/
│       ├── Badge.tsx
│       └── PageHeader.tsx
├── lib/
│   ├── db.ts                   # Mongoose connection (cached)
│   └── utils.ts
├── models/                     # Mongoose schemas
│   ├── User.ts
│   ├── Branch.ts
│   ├── Vehicle.ts
│   ├── Staff.ts
│   ├── FuelTank.ts
│   ├── FuelReceipt.ts
│   ├── FuelDispensing.ts
│   ├── ServiceRecord.ts
│   └── ActivityLog.ts
├── types/index.ts
├── auth.ts                     # NextAuth config
├── proxy.ts                    # Middleware (auth redirects)
├── next.config.ts
└── GUIDE.md                    # Full user guide with step-by-step walkthroughs
```

---

## User Roles

| Role | Scope | Can create / edit |
|---|---|---|
| `admin` | All branches | Everything |
| `fleet_officer` | All branches | Vehicles, Servicing, Staff |
| `fuel_officer` | All branches | Fuel Tanks, Receipts, Dispensings |
| `branch_manager` | Own branch | Branch info, Staff (own branch) |
| `viewer` | Own branch | Read-only |

---

## API Reference

All routes require an active session. Data mutations are restricted by role.

| Method | Endpoint | Description |
|---|---|---|
| GET / POST | `/api/vehicles` | List / create vehicles |
| GET / PATCH / DELETE | `/api/vehicles/[id]` | Get, update, or soft-delete |
| GET / POST | `/api/servicing` | List / create service records |
| PATCH | `/api/servicing/[id]/approve` | Approve a service record |
| GET / POST | `/api/fuel-tanks` | List / create tanks |
| GET / POST | `/api/fuel-receipts` | List / record delivery (auto-updates tank level) |
| GET / POST | `/api/fuel-dispensings` | List / record dispensing (auto-updates tank level) |
| GET / POST | `/api/branches` | List / create branches |
| GET / POST | `/api/staff` | List / create staff |
| GET / POST | `/api/users` | List / create user accounts |
| GET | `/api/reports/fuel-summary` | Fuel report (`?export=csv` for CSV download) |
| GET | `/api/reports/service-summary` | Service cost report (`?export=csv`) |
| GET | `/api/reports/vehicle-status` | Vehicle status list (`?export=csv`) |
| GET | `/api/seed` | Seed demo branches and users (run once) |

---

## Deployment

### Vercel (recommended)

1. Push the repo to GitHub.
2. Import it in [Vercel](https://vercel.com) → New Project.
3. Add `MONGODB_URI` and `AUTH_SECRET` under **Environment Variables**.
4. Deploy — Vercel handles the build automatically.

### Self-hosted

```bash
npm run build
npm start
```

Set `MONGODB_URI` and `AUTH_SECRET` in your host's environment before starting.

### MongoDB Atlas — network access

In production, go to Atlas → **Network Access** and either:
- Add your server's static IP, **or**
- Add `0.0.0.0/0` to allow connections from any IP (fine when combined with strong auth credentials)

---

## Documentation

See [GUIDE.md](./GUIDE.md) for a full user manual including:
- Role permissions table
- Description of every page and its fields
- Two complete end-to-end walkthroughs (fuel delivery cycle, vehicle servicing cycle)
- Quick reference for common tasks and alert triggers

---

## License

Proprietary software developed for **Pumeco Road Construction**. All rights reserved.

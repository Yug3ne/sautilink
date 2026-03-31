# Sauti-Link

A Kenyan civic governance platform that democratizes public participation by connecting citizens directly with their elected MCA representatives.

Citizens can read AI-simplified bills in English and Kiswahili, vote on county budget items, and submit feedback to their ward MCAs. Government officials get a real-time analytics dashboard scoped to their jurisdiction.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite 7 |
| Styling | Tailwind CSS v4, shadcn/ui |
| Backend | Convex Cloud (real-time database, serverless functions) |
| Routing | React Router v7 |
| Charts | Recharts |
| External APIs | TanStack Query |
| Package Manager | Bun |

## Prerequisites

- [Bun](https://bun.sh) (v1.0+)
- [Node.js](https://nodejs.org) (v18+)
- A [Convex](https://convex.dev) account (free tier)

## Getting Started

### 1. Clone and install dependencies

```bash
git clone https://github.com/Yug3ne/sautilink.git
cd sautilink
bun install
```

### 2. Set up Convex

Log in to Convex and configure the project:

```bash
bunx convex login
bunx convex dev
```

On first run, select **"create a new project"** and give it a name. This will:
- Provision a cloud dev deployment
- Generate a `.env.local` file with your deployment URL
- Generate TypeScript types in `convex/_generated/`
- Watch for changes to files in `convex/` and hot-reload functions

### 3. Seed the database

Open a separate terminal and run the seed script to populate demo data:

```bash
bunx convex run seed:default
```

This creates demo MCAs, citizens, bills, budget items, votes, feedback, and analytics data.

**Demo login credentials:**

| Email | Password | Role |
|-------|----------|------|
| peter@sauti.ke | password123 | MCA (Kiambu) |
| faith@sauti.ke | password123 | MCA (Kisumu) |
| ali@sauti.ke | password123 | MCA (Mombasa) |
| admin@sauti.ke | admin123 | Super Admin |

### 4. Start the frontend

In another terminal:

```bash
bun run dev
```

The app will be available at `http://localhost:5173`.

## Deploying to Production

### Backend (Convex)

Convex automatically provisions a production deployment alongside your dev deployment. Deploy your functions to prod:

```bash
npx convex deploy
```

Then seed the production database:

```bash
npx convex run seed:default --prod
```

Your production URL will look like `https://<your-deployment>.convex.cloud`.

### Frontend (Vercel)

1. Push your code to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Set the following in Vercel project settings:
   - **Framework Preset**: Vite
   - **Build Command**: `bun run build`
   - **Install Command**: `bun install`
   - **Output Directory**: `dist`
4. Add the environment variable:
   - `VITE_CONVEX_URL` = your Convex production URL
5. Deploy

## Project Structure

```
sauti/
├── convex/                   # Convex backend
│   ├── schema.ts             # Database schema (11 tables)
│   ├── auth.ts               # Session-based MCA authentication
│   ├── bills.ts              # Bill CRUD, PDF upload, scoped queries
│   ├── votes.ts              # Atomic vote casting with duplicate prevention
│   ├── feedback.ts           # Citizen feedback submission & MCA responses
│   ├── dashboard.ts          # Aggregated analytics queries
│   ├── citizens.ts           # Citizen registration & IPRS lookup
│   ├── mcas.ts               # MCA queries (by ward, county, etc.)
│   ├── actions.ts            # IPRS verification simulation
│   ├── budgetItems.ts        # Budget item queries
│   ├── seed.ts               # Database seed script
│   └── lib/
│       └── passwords.ts      # Web Crypto API password hashing
├── src/
│   ├── App.tsx               # Route definitions
│   ├── main.tsx              # Providers (Convex, QueryClient, Theme)
│   ├── hooks/
│   │   └── useAuth.ts        # AuthProvider & useAuth hook
│   ├── components/
│   │   ├── layout/
│   │   │   ├── PublicLayout.tsx    # Navbar + Footer wrapper
│   │   │   ├── DashboardLayout.tsx # Admin sidebar layout
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   └── ui/               # shadcn/ui components
│   └── pages/
│       ├── Home.tsx           # Landing page
│       ├── Bills.tsx          # Public bills with EN/SW toggle
│       ├── VotePage.tsx       # IPRS verify → vote on budget items
│       ├── FeedbackPage.tsx   # Citizen feedback submission
│       ├── USSDSimulator.tsx  # USSD phone simulator demo
│       ├── Login.tsx          # MCA login
│       ├── Dashboard.tsx      # Admin overview with charts
│       └── dashboard/
│           ├── BillsManagement.tsx
│           ├── VoteResults.tsx
│           ├── FeedbackManagement.tsx
│           ├── CitizensPage.tsx
│           └── ManageMCAs.tsx  # Super admin only
└── package.json
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start Vite dev server |
| `bun run build` | Type-check and build for production |
| `bun run preview` | Preview production build |
| `bun run lint` | Run ESLint |
| `bun run format` | Format code with Prettier |
| `bun run typecheck` | Run TypeScript type checking |
| `bunx convex dev` | Start Convex backend in dev mode (cloud) |
| `bunx convex run seed:default` | Seed the database with demo data |
| `npx convex deploy` | Deploy Convex functions to production |

## Key Features

- **Identity Verification**: Simulated IPRS integration for National ID verification
- **Bill Simplification**: Bills with key points, simplified summaries, and detailed breakdowns in English and Kiswahili
- **PDF Upload**: MCAs can upload full bill documents as PDFs
- **Budget Voting**: Citizens vote for/against budget items after ID verification
- **Citizen Feedback**: Citizens submit questions, complaints, or suggestions directly to their ward MCA
- **Real-time Dashboard**: County-scoped analytics with engagement charts, sentiment data, and activity feeds
- **Multi-tenant Auth**: MCAs see only their county/ward data; super admins see everything
- **Bilingual Support**: Full English/Kiswahili toggle across all public pages
- **USSD Simulator**: Demo of the USSD voting experience for feature phones

## Environment

The `.env.local` file is auto-generated by `bunx convex dev` and contains:

```
CONVEX_DEPLOYMENT=dev:<your-deployment-name>
VITE_CONVEX_URL=https://<your-deployment>.convex.cloud
```

Do not commit this file (it is gitignored via `*.local`).

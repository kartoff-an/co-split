# Co-Split

> **Collaborative Group Expense Ledger**  
> Simplify group budgeting, split bills with custom rules, and settle debts in minimal transactions.

Co-Split eliminates the manual math of splitting shared costs for roommates, trips, team events, and group projects. Built with **React 19, TypeScript, Vite, Tailwind CSS v4, and Supabase (PostgreSQL)**.

---

## Tech Stack

* **Frontend:** React 19, TypeScript, Vite, React Router v7
* **Styling:** Tailwind CSS v4
* **Backend & Database:** Supabase (PostgreSQL, Supabase Auth)
* **Testing:** Vitest

---

## Project Structure

The project follows a **flat feature-based architecture** to keep code co-located without deep subfolder nesting:

```text
src/
├── features/
│   ├── auth/         # Google OAuth & User profile management
│   ├── workspaces/   # Workspace CRUD, invites & member permissions
│   ├── expenses/     # Expense listing, equal/unequal splitting & calculations
│   ├── dashboard/    # User overview dashboard
│   └── landing/      # Public landing page & demo previews
├── components/       # Shared UI components (Avatar, Spinner, Footer, CoSplitIcon)
├── hooks/            # Shared utility hooks (useDocumentMetadata)
├── lib/              # Core utilities & configuration (supabase.ts, currency.ts)
├── types/            # App & Database TypeScript definitions
└── App.tsx           # SPA router configuration
```

---

## Database Architecture

Database definitions are managed under the `supabase/` folder using a **2-Tier Architecture**:

1. **`supabase/migrations/` (Table Schema History):**
   * Contains immutable SQL DDL files for creating tables, foreign keys, and column alterations.
2. **`supabase/schema/` (Declarative Code Snapshots):**
   * Single source of truth for database procedures, triggers, and security policies:
     * `functions/`: Stored procedures.
     * `triggers/`: Rate limiting and cascade cleanup triggers.
     * `policies/`: Row-Level Security (RLS) policies.

---

## Key Concepts

### 1. In-Database Settlement Engine
Instead of creating complex webs of transfers (A owes B, B owes C), the database executes a **Greedy Settlement Engine**. It calculates net member balances and generates the absolute minimum number of settlement transactions required to resolve all group debts.

### 2. Row-Level Security (RLS)
Security is enforced directly at the storage boundary. Every Postgres table relies on RLS policies checking `auth.uid()`.

---

## Local Quick Start

### 1. Prerequisites
* Node.js (v18+)
* Supabase Account / Environment

### 2. Installation
```bash
git clone https://github.com/kartoff-an/co-split.git
cd co-split
npm install
```

### 3. Environment Setup
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Development Commands
* **Start Dev Server:** `npm run dev`
* **Run Unit Tests:** `npm run test`
* **Type-Check & Build:** `npm run build`
* **Lint Code:** `npm run lint`

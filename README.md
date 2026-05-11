# Open Source Review Engine — Command Center

> A bulletproof, zero-trust E-commerce Review CRM built with Next.js 16, Supabase, and Tailwind CSS 4.

This project is a high-performance, secure review management system designed for modern e-commerce applications. It features a robust security layer, automated moderation gates, and a premium admin dashboard.

## ✨ Key Features

### 🛡️ Security & Logic (Hacker-Mindset)
- **Zero-Trust Firewall**: Strict middleware-level origin validation. Only whitelisted domains can hit the API.
- **Dual Rate Limiting**: Prevents spam by limiting submissions to 3 reviews per hour per IP **and** per email address.
- **XSS Prevention**: Strict Zod schema validation with automatic HTML tag stripping from reviewer names and comments.
- **Secure Image Uploads**: Renames files to UUIDs on upload to prevent directory traversal and metadata leakage. Signed URLs for secure viewing.
- **Supabase RLS**: Every database transaction is governed by Row Level Security—unauthorized users see nothing.

### 📊 Admin Dashboard (Command Center)
- **Premium Aesthetics**: A stunning dark-mode UI using the `Royal Orchid` and `Amethyst` palette with glassmorphism effects.
- **TanStack Table**: Advanced review manager with bulk actions (Approve, Reject, Delete), status filtering, and pagination.
- **Review Gatekeeper**: Toggle auto-approve settings directly from the dashboard.
- **Real-time Metrics**: Overview of pending, approved, and rejected reviews.

### 📖 API Documentation
- **Scalar UI**: Interactive API documentation served at `/api-docs`, dynamically generated from Zod schemas.

## 🚀 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router)
- **Database & Auth**: [Supabase](https://supabase.com)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com)
- **Tables**: [TanStack Table v8](https://tanstack.com/table)
- **Validation**: [Zod](https://zod.dev)
- **API Docs**: [Scalar](https://scalar.com)

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js 20.9+
- A Supabase project

### 2. Environment Setup
Copy the example environment file and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ALLOWED_ORIGINS` (comma-separated domains)

### 3. Database Migration
Run the initial schema in your Supabase SQL Editor:
The schema can be found in `supabase/migrations/001_initial_schema.sql`.

### 4. Installation
```bash
npm install
```

### 5. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the landing page.

## 🔒 Production Hardening

- Ensure `ALLOWED_ORIGINS` in `.env.local` is set to your production frontend domain.
- The `SUPABASE_SERVICE_ROLE_KEY` should **never** be exposed to the client. It is used only in server-side security utilities.
- Configure your Supabase Storage bucket `review-images` as "Restricted" for maximum privacy.

## 📄 License

This project is open-source and available under the MIT License.

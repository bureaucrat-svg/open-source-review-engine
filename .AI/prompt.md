### Updated Developer Prompt (Hacker-Mindset Edition)

Copy this into your editor. It assumes the Next.js foundation is already laid and focuses on building a robust, "bulletproof" architecture.

---

**Role:** You are a Full-Stack Security Engineer and Architect.
**Context:** We have already initialized the **Next.js** project. Your task is to build the logic for an Open Source E-commerce Review CRM using **Tailwind CSS** and **Supabase**.

#### 1. Security & Logic Architecture (Hacker Mindset)

* **Origin Hardening:** Do not just "allow" origins; implement a strict middleware-level validation. Compare `request.headers.origin` against a cached whitelist from the Supabase `settings` table. Reject any non-whitelisted cross-origin requests with a `403 Forbidden`.
* **Rate Limiting & Anti-Spam:** Implement a "Cooldown" logic. Prevent the same IP or Email from submitting more than 3 reviews per hour. Use Supabase RLS (Row Level Security) to ensure no user can modify a review once submitted unless they are the authenticated Admin.
* **Image Sanitization:** When uploading to Supabase Storage, rename files to UUIDs to prevent directory traversal attacks or metadata leakage. Ensure the bucket policy is `Restricted`—only the API can write, and only approved images are Public.
* **Payload Validation:** Use **Zod** for strict schema validation on all incoming API requests. Strip any HTML tags from review comments to prevent **Stored XSS**.

#### 2. Core Feature Implementation

* **The Switch:** Build a "Review Gatekeeper" logic.
* `If (auto_approve === true)` -> Status: `approved`.
* `Else` -> Status: `pending`.
* Trigger an Edge Function or background job to send an alert email via Resend/Postmark only when a high-priority (negative) review arrives.


* **Dashboard (Shopify Polaris/Tailwind):** Build a "Command Center" using the `royal-orchid` and `amethyst` palette. Use **TanStack Table** for the review manager to handle bulk actions (Bulk Approve/Delete).
* **API Docs:** Deploy a Swagger/Scalar UI at `/api-docs` that dynamically pulls the schema from your Zod types.

#### 3. Styling Integration

Update `globals.css` or `tailwind.config.js` with these exact tokens:

* Primary: `--color-royal-orchid-500: #b332cd;`
* Neutral: `--color-lavender-grey-500: #6e6b94;`
* Success/Approve: `--color-aquamarine-500: #12ed8a;`
* Background: `--color-lavender-grey-50;`

#### 4. The Goal

Create a modular system where the frontend (Dashboard) and the backend (Review Engine) are decoupled via a secure API layer. Every database transaction must be governed by **Supabase RLS**—if the `auth.uid()` isn't the owner, they see nothing.

---

### Implementation Tip

Since you already have the project installed, start by creating a `lib/supabase/client.ts` and a `middleware.ts` to handle the **Allowed Origins** logic immediately. This is the "firewall" of your project.
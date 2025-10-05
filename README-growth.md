# Orinowo Growth Engine Backend (No UI)

This adds backend modules and API endpoints to support the growth and revenue strategy without UI changes.

## What’s included

- lib/plans.ts: Subscription tiers and credit packs
- lib/credits.ts: Credits earn/redeem rules
- lib/events.ts: Event tracking helper (server-side)
- app/api/credits: GET balance, POST earn/redeem credits
- app/api/referrals: POST accept referral code
- app/api/challenges: GET list, POST create challenge
- app/api/admin/referrals: POST mint referral code { userId }
- app/api/admin/seed-challenges: POST seed weekly themes (Afrobeat x EDM, etc.)
- app/api/admin/award-winner: POST award winner credits { userId, amount? }
- app/api/admin/spotlight/add: POST add spotlight item { title, type, image_url, month?, active? }
- app/api/cron/weekly-seed: GET weekly seed of challenges (for Vercel Cron)
- supabase/migrations/20251004_growth_engine.sql: Database schema

## Apply the database migration

Use the Supabase SQL editor or CLI to run `supabase/migrations/20251004_growth_engine.sql` against your project.

## Environment variables

Ensure these are set:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (server-side only)

## API usage examples

Fetch credits balance (server or client with header for user ID):

GET /api/credits
Headers: x-user-id: <uuid>

Earn credits:

POST /api/credits
Headers: x-user-id: <uuid>
Body: { "type": "earn", "action": "upload_asset" }

Redeem credits:

POST /api/credits
Headers: x-user-id: <uuid>
Body: { "type": "redeem", "tool": "mastering_single" }

Accept referral:

POST /api/referrals
Body: { "code": "ABC123", "invitedUserId": "<uuid>" }

List challenges:

GET /api/challenges

Create challenge (server/admin only):

POST /api/challenges
Body: { "title": "Afrobeat x EDM", "theme": "Fusion", "prizeCredits": 500 }

Mint referral code (admin):

POST /api/admin/referrals
Body: { "userId": "<uuid>" }

Seed standard challenges (admin):

POST /api/admin/seed-challenges

## Notes

- Add proper auth/headers gating in production.
- RLS policies are permissive here for service role usage—tighten per your auth model.
- Wire these APIs into existing flows (uploads, jam rooms, invites) to power credits, referrals, and challenges.

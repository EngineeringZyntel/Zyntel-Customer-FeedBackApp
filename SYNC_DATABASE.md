# Database Sync Instructions

Your database is **out of sync** with the Prisma schema. The schema defines columns that don't exist in the DB yet:
- `ip_address`, `user_agent` (in `responses` table)
- `max_responses_per_ip`, `cooldown_minutes`, `domain_verified`, and others (in `forms` table)

## Quick fix (run on your machine)

```bash
cd nextjs-app
npx prisma db push
```

This will add all missing columns to your Neon PostgreSQL database.

## If `db push` fails

If you see a TLS/certificate error, check your `DATABASE_URL` in `.env`:
- Make sure you're using the **pooled connection string** from Neon (hostname should contain `-pooler`).
- Example: `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/db?sslmode=require`

## Alternative: Use migrations

If you prefer migrations:

```bash
cd nextjs-app
npx prisma migrate dev --name sync_db_with_schema
```

## After syncing

1. Restart the dev server (`npm run dev`)
2. Try submitting a form again
3. The 500 errors about missing columns should be gone

---

**Note:** The responses API was temporarily simplified to work with your current DB. After syncing, advanced features like per-IP limits and cooldown will work automatically.

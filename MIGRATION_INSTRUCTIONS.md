# Database Migration Instructions

## Before Running Migration

Make sure your `.env` file has the correct DATABASE_URL:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
```

## Step 1: Create and Apply Migration

Run the following command to create and apply the database migration:

```bash
cd nextjs-app
npx prisma migrate dev --name add_enhanced_settings_and_security
```

This will:
1. Create a new migration file
2. Update your database schema
3. Regenerate the Prisma Client

## Step 2: Verify Migration

Check that the migration was successful:

```bash
npx prisma studio
```

This opens Prisma Studio where you can verify the new fields exist in:
- `user_settings` table
- `forms` table  
- `responses` table

## Step 3: Generate Prisma Client

If you need to regenerate the client separately:

```bash
npx prisma generate
```

## Changes Made

### UserSettings Table
**New Fields:**
- `theme` (VARCHAR)
- `timezone` (VARCHAR)
- `default_form_template` (VARCHAR, nullable)
- `notify_on_response` (BOOLEAN, default true)
- `notify_daily` (BOOLEAN, default false)
- `notify_weekly` (BOOLEAN, default true)
- `default_primary_color` (VARCHAR, default '#0066FF')
- `default_font_family` (VARCHAR, nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Forms Table
**New Fields:**
- `domain_verified` (BOOLEAN, default false)
- `domain_dns_record` (VARCHAR, nullable)
- `require_password` (BOOLEAN, default false)
- `password` (VARCHAR, nullable)
- `allow_anonymous` (BOOLEAN, default true)
- `max_responses_per_ip` (INTEGER, nullable)
- `cooldown_minutes` (INTEGER, nullable)
- `webhook_url` (VARCHAR, nullable)
- `slack_webhook` (VARCHAR, nullable)

**Modified Fields:**
- `custom_domain` - Now UNIQUE index

**New Indexes:**
- Index on `form_code`
- Index on `custom_domain`

### Responses Table
**New Fields:**
- `ip_address` (VARCHAR, nullable)
- `user_agent` (TEXT, nullable)

**New Indexes:**
- Composite index on `(form_id, ip_address)`
- Modified index on `(form_id, submitted_at)`

## Rollback (if needed)

If something goes wrong, you can rollback:

```bash
npx prisma migrate resolve --rolled-back MIGRATION_NAME
```

## Troubleshooting

### Issue: "Migration failed"
**Solution:** Check your DATABASE_URL is correct and database is accessible

### Issue: "Column already exists"
**Solution:** Your database might be out of sync. You can:
1. Reset database (dev only): `npx prisma migrate reset`
2. Or manually resolve conflicts

### Issue: "Prisma client not generated"
**Solution:** Run `npx prisma generate`

## Production Deployment

For production, use:

```bash
npx prisma migrate deploy
```

This applies pending migrations without prompting.

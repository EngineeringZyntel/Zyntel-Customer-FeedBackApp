# Migration Guide: Flask to Next.js

This guide explains how to migrate from the Flask/Vanilla JS stack to the new Next.js version.

## Overview

The Next.js version provides:
- ✅ Better performance (SSR, code splitting)
- ✅ Type safety with TypeScript
- ✅ Modern React components
- ✅ Built-in API routes (no separate backend)
- ✅ Professional admin panel with analytics
- ✅ Better SEO and user experience

## Migration Steps

### 1. Database Migration

The database schema is **compatible** - you can use the same Neon database!

**Option A: Use Existing Database**
- Your existing tables will work
- Just run: `npm run db:generate` to generate Prisma Client

**Option B: Fresh Start**
- Run: `npm run db:push` to create tables from Prisma schema
- Note: This will create tables if they don't exist (won't delete existing data)

### 2. Environment Variables

Update your `.env` file:

```env
# Required
DATABASE_URL=your-neon-postgresql-url
JWT_SECRET=generate-a-random-secret-key
NEXT_PUBLIC_BASE_URL=https://your-app.onrender.com

# Optional
NEXT_PUBLIC_API_URL=/api
```

### 3. Deploy to Render

1. **Update `render.yaml`** (already done)
2. **Set Environment Variables** in Render dashboard:
   - `DATABASE_URL`: Your Neon PostgreSQL URL
   - `JWT_SECRET`: A secure random string (use `openssl rand -base64 32`)
   - `NEXT_PUBLIC_BASE_URL`: Your Render app URL (e.g., `https://formflow-nextjs.onrender.com`)

3. **Connect GitHub** and deploy

### 4. User Migration

**Passwords**: The new version uses `bcrypt` instead of SHA-256. Existing users will need to:
- Reset their passwords, OR
- You can migrate passwords (see below)

**Password Migration Script** (optional):

```python
# Run this once to migrate passwords
import hashlib
import bcrypt
import psycopg2

# Connect to database
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

# Get all users
cur.execute('SELECT id, password_hash FROM users')
users = cur.fetchall()

for user_id, old_hash in users:
    # Note: You can't reverse SHA-256, so users need to reset passwords
    # OR create a migration that prompts users to reset
    pass

conn.close()
```

**Recommended**: Have users reset passwords on first login.

## API Compatibility

The Next.js API routes match the Flask endpoints:

| Flask Endpoint | Next.js Endpoint | Status |
|---------------|------------------|--------|
| `POST /api/auth/register` | `POST /api/auth/register` | ✅ Compatible |
| `POST /api/auth/login` | `POST /api/auth/login` | ✅ Compatible |
| `POST /api/forms` | `POST /api/forms` | ✅ Compatible |
| `GET /api/forms/user/:userId` | `GET /api/forms?userId=X` | ✅ Compatible |
| `GET /api/forms/:code` | `GET /api/forms/:code` | ✅ Compatible |
| `DELETE /api/forms/:id` | `DELETE /api/forms/:id` | ✅ Compatible |
| `POST /api/responses` | `POST /api/responses` | ✅ Compatible |
| `GET /api/responses/form/:id` | `GET /api/responses/:id` | ✅ Compatible |
| `GET /api/stats/:id` | `GET /api/analytics/:id` | ⚠️ Enhanced (more features) |
| `POST /api/qrcode` | `POST /api/qrcode` | ✅ Compatible |

## New Features

### Admin Panel
- Access at `/admin`
- Comprehensive analytics dashboard
- Charts and visualizations
- Field-level insights

### Enhanced Analytics
- Response trends (last 30 days)
- Field-level analytics (ratings, multiple choice distributions)
- Visual charts using Recharts
- Trend calculations

### Better UI/UX
- Professional design with Tailwind CSS
- Responsive layout
- Loading states
- Error handling
- Type-safe forms

## Rollback Plan

If you need to rollback:

1. **Keep Flask backend running** (comment out in `render.yaml`)
2. **Switch frontend** back to static site
3. **Database remains unchanged** - both versions can use the same DB

## Testing Checklist

- [ ] User registration
- [ ] User login
- [ ] Create form
- [ ] View forms in dashboard
- [ ] Submit public form
- [ ] View responses
- [ ] Admin panel analytics
- [ ] QR code generation
- [ ] Delete form

## Support

If you encounter issues:
1. Check Render logs
2. Verify environment variables
3. Ensure database is accessible
4. Check Prisma schema matches database

## Next Steps

After migration:
1. Monitor performance
2. Gather user feedback
3. Remove old Flask backend (optional)
4. Update documentation

---

**Note**: The Next.js version is production-ready and can coexist with the Flask version during migration.


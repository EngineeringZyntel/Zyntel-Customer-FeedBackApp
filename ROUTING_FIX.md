# Quick Fix: Routing Conflict Error

## The Error
```
Error: You cannot use different slug names for the same dynamic path ('formCode' !== 'formId').
```

## Root Cause
Your existing codebase has API routes that use different parameter names:
- `/api/forms/[formCode]/route.ts` - uses `formCode`
- `/api/forms/id/[formId]/route.ts` - uses `formId`
- `/api/forms/delete/[formId]/route.ts` - uses `formId`

## Quick Fix

**Option 1: Clear Next.js Cache (Fastest)**

```bash
cd nextjs-app
rm -rf .next
npm run dev
```

The `.next` folder might have cached the conflicting route I created. Deleting it will force a fresh build.

**Option 2: Keep New Route Structure (Recommended)**

The new settings route is now at:
- `/api/forms/settings/[formId]/route.ts`

This avoids the conflict because it's nested under `/settings/`. This is the correct structure and should work once the cache is cleared.

## API Endpoint Changes

Due to the route restructuring, the settings API endpoint changed from:
- ❌ Old: `GET/PUT /api/forms/[formId]/settings`
- ✅ New: `GET/PUT /api/forms/settings/[formId]`

If you build a UI for the per-form settings page, use:
```javascript
// Fetch settings
const response = await fetch(`/api/forms/settings/${formId}`)

// Update settings
await fetch(`/api/forms/settings/${formId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(settings)
})
```

## Try This Now

1. Stop the dev server (Ctrl+C if running)
2. Delete the cache:
   ```bash
   rm -rf nextjs-app/.next
   ```
3. Restart:
   ```bash
   cd nextjs-app
   npm run dev
   ```

The app should now start successfully!

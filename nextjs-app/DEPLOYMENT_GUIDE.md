# Zyntel Feedback - Deployment Guide for Render

This guide will walk you through deploying Zyntel Feedback to Render.

## Prerequisites

✅ GitHub account with your repository
✅ Render account (free tier works)
✅ Neon PostgreSQL database (you already have this)

## Step 1: Prepare Your Repository

1. **Commit all changes to Git:**

```bash
cd /Users/wycliffmatovu/Zyntel-Customer-FeedBackApp
git add .
git commit -m "Add Next.js version of Zyntel Feedback"
git push origin developer
```

## Step 2: Set Up Environment Variables

You'll need these values ready:

### Required Environment Variables

1. **DATABASE_URL** (you already have this from Neon)
   - Example: `postgresql://user:password@ep-xxx.neon.tech/dbname`
   - Get it from: Neon dashboard → Your project → Connection string

2. **JWT_SECRET** (generate a new one)
   - Run this command to generate:
   ```bash
   openssl rand -base64 32
   ```
   - Example output: `abc123xyz789...` (keep this secret!)

3. **NEXT_PUBLIC_BASE_URL** (your Render app URL)
   - For now, use: `https://zyntel-feedback.onrender.com`
   - Update after deployment with actual URL

4. **NODE_ENV**
   - Value: `production`

5. **NEXT_PUBLIC_API_URL**
   - Value: `/api`

## Step 3: Deploy to Render

### Option A: Using Render Blueprint (Recommended)

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Sign in

2. **Create New Blueprint**
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Select: `EngineeringZyntel/Zyntel-Customer-FeedBackApp`
   - Branch: `developer`

3. **Render will detect `render.yaml`**
   - It will show: "zyntel-feedback" web service
   - Click "Apply"

4. **Set Environment Variables**
   - In the Render dashboard, go to your service
   - Click "Environment" tab
   - Add each variable:
     ```
     DATABASE_URL = your-neon-url
     JWT_SECRET = your-generated-secret
     NODE_ENV = production
     NEXT_PUBLIC_BASE_URL = https://zyntel-feedback.onrender.com
     NEXT_PUBLIC_API_URL = /api
     ```

5. **Wait for Deployment**
   - Render will:
     - Install dependencies (`npm install`)
     - Generate Prisma client (`npm run db:generate`)
     - Build Next.js (`npm run build`)
     - Start the app (`npm start`)
   - This takes 5-10 minutes

### Option B: Manual Service Creation

If Blueprint doesn't work:

1. **Create Web Service**
   - Dashboard → "New" → "Web Service"
   - Connect GitHub repo

2. **Configure Service**
   - Name: `zyntel-feedback`
   - Root Directory: `nextjs-app`
   - Environment: `Node`
   - Build Command: `npm install && npm run db:generate && npm run build`
   - Start Command: `npm start`

3. **Add Environment Variables** (same as above)

## Step 4: Verify Deployment

1. **Check Build Logs**
   - Watch for errors in Render logs
   - Look for: "✓ Ready" message

2. **Test Your App**
   - Visit: `https://your-app.onrender.com`
   - Try these:
     - ✅ Landing page loads
     - ✅ Register a new account
     - ✅ Login
     - ✅ Create a form
     - ✅ Visit public form (`/form/XXXXX`)
     - ✅ Submit a response
     - ✅ View responses in dashboard
     - ✅ Check admin panel (`/admin`)

3. **Update Base URL** (if needed)
   - Go to Render dashboard → Environment
   - Update `NEXT_PUBLIC_BASE_URL` with actual URL
   - Click "Save Changes"
   - Render will auto-redeploy

## Step 5: Database Setup

The app will automatically:
- Connect to your Neon database
- Create tables if they don't exist (via Prisma)

**Note**: If you have existing data from the Flask app, it will be preserved!

## Troubleshooting

### Build Fails

**Error**: `Cannot find module 'next'`
- **Fix**: Make sure `rootDir: nextjs-app` is set in service settings

**Error**: `DATABASE_URL is not defined`
- **Fix**: Add environment variables in Render dashboard

**Error**: `Prisma schema not found`
- **Fix**: Build command should include `npm run db:generate`

### Runtime Errors

**Error**: `Unauthorized` on API calls
- **Fix**: Clear browser localStorage and re-login
- Check JWT_SECRET is set in Render

**Error**: Database connection fails
- **Fix**: Verify DATABASE_URL is correct
- Check Neon database is active

### Performance Issues

**Slow response times**
- Render free tier spins down after inactivity
- Upgrade to paid tier for always-on service

## Post-Deployment

### 1. Update Git Remote URLs (if needed)
```bash
git remote set-url origin https://github.com/EngineeringZyntel/Zyntel-Customer-FeedBackApp.git
```

### 2. Set Up Custom Domain (Optional)
- Render dashboard → Settings → Custom Domain
- Add your domain (e.g., `feedback.zyntel.com`)
- Update DNS records as instructed

### 3. Enable Auto-Deploy
- Render dashboard → Settings
- Enable "Auto-Deploy" for `developer` branch
- Every push will auto-deploy

### 4. Monitor Your App
- Render dashboard → Metrics
- Check CPU, Memory, Response times
- Set up alerts if needed

## Environment Variables Reference

Create a `.env.production` file locally (don't commit!) for reference:

```env
# Database
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/dbname

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-secret-key-here

# App URLs
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://zyntel-feedback.onrender.com
NEXT_PUBLIC_API_URL=/api
```

## Quick Deploy Checklist

- [ ] Repository pushed to GitHub
- [ ] Environment variables ready
- [ ] Render account created
- [ ] Blueprint/Service created
- [ ] Environment variables added to Render
- [ ] Build completed successfully
- [ ] App is accessible
- [ ] Registration works
- [ ] Forms can be created
- [ ] Public forms work
- [ ] Admin panel accessible

## Support Resources

- **Render Docs**: https://render.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs

## Costs

**Free Tier**:
- ✅ 750 hours/month
- ✅ Spins down after 15min inactivity
- ✅ Good for testing

**Starter Tier** ($7/month):
- ✅ Always on
- ✅ Faster builds
- ✅ Better performance

## Next Steps After Deployment

1. Test all features thoroughly
2. Share the URL with your team
3. Monitor for any issues
4. Consider upgrading for production use
5. Set up custom domain (optional)

---

**Need Help?**

If you encounter issues during deployment, check:
1. Render build logs
2. Browser console for errors
3. Network tab for failed API calls
4. Environment variables are set correctly

Your app should be live at: `https://zyntel-feedback.onrender.com` (or your custom URL)

🎉 **Congratulations on deploying Zyntel Feedback!**


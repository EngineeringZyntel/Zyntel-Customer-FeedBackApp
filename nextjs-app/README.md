# FormFlow - Next.js Version

A modern, professional feedback form builder built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern Stack**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Type-Safe**: Full TypeScript support with Prisma ORM
- **Professional UI**: Beautiful, responsive design with Tailwind CSS
- **Admin Panel**: Comprehensive analytics dashboard with charts and insights
- **Real-time Analytics**: Track responses, trends, and field-level analytics
- **Multiple Field Types**: Text, email, number, date, textarea, dropdown, multiple choice, checkbox, rating
- **QR Code Generation**: Generate QR codes for easy form sharing
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- npm or yarn

## 🛠️ Setup

### 1. Install Dependencies

```bash
cd nextjs-app
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL`: Your PostgreSQL connection string (from Neon)
- `JWT_SECRET`: A secret key for JWT tokens (generate a random string)
- `NEXT_PUBLIC_BASE_URL`: Your app's base URL (e.g., `http://localhost:3000`)

### 3. Set Up Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
nextjs-app/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── forms/        # Form CRUD endpoints
│   │   ├── responses/    # Response endpoints
│   │   └── analytics/    # Analytics endpoints
│   ├── admin/            # Admin panel page
│   ├── dashboard/        # Dashboard pages
│   ├── form/             # Public form pages
│   └── page.tsx          # Landing page
├── components/           # React components
│   └── ui/              # Reusable UI components
├── lib/                  # Utilities and helpers
│   ├── api.ts           # API client
│   ├── auth.ts          # Authentication utilities
│   ├── db.ts            # Database connection
│   └── utils.ts         # Helper functions
├── prisma/              # Prisma schema
│   └── schema.prisma    # Database schema
└── public/              # Static assets
```

## 🔐 Authentication

The app uses JWT tokens stored in localStorage. After login/register, the token is automatically included in API requests.

## 📊 Admin Panel

Access the admin panel at `/admin` to view:
- Overall statistics (total forms, responses, trends)
- Form-level analytics
- Response trends (last 30 days)
- Field-level insights (ratings, multiple choice distributions)
- Visual charts using Recharts

## 🚢 Deployment

### Deploy to Render

1. **Update `render.yaml`** in the root directory to include the Next.js service:

```yaml
services:
  - type: web
    name: formflow-nextjs
    rootDir: nextjs-app
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: NEXT_PUBLIC_BASE_URL
        value: https://your-app.onrender.com
```

2. **Set Environment Variables** in Render dashboard:
   - `DATABASE_URL`: Your Neon PostgreSQL URL
   - `JWT_SECRET`: A secure random string
   - `NEXT_PUBLIC_BASE_URL`: Your Render app URL

3. **Push to GitHub** - Render will auto-deploy

### Build for Production

```bash
npm run build
npm start
```

## 🔄 Migration from Flask

This Next.js version replaces the Flask backend with:
- ✅ Next.js API Routes (same endpoints)
- ✅ Prisma ORM (replaces raw SQL)
- ✅ TypeScript (type safety)
- ✅ Modern React components
- ✅ Better performance and SEO

The database schema remains compatible - you can use the same Neon database!

## 📝 API Endpoints

All endpoints are under `/api`:

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/forms` - Create form
- `GET /api/forms?userId=X` - Get user's forms
- `GET /api/forms/[code]` - Get form by code (public)
- `DELETE /api/forms/[id]` - Delete form
- `POST /api/responses` - Submit response
- `GET /api/responses/[formId]` - Get form responses
- `GET /api/analytics/[formId]` - Get form analytics
- `POST /api/qrcode` - Generate QR code

## 🎨 Customization

- **Colors**: Edit `tailwind.config.ts` to customize the color scheme
- **Components**: Modify components in `components/ui/`
- **Styling**: All styles use Tailwind CSS utility classes

## 📚 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (via Prisma)
- **Charts**: Recharts
- **Authentication**: JWT + bcrypt
- **QR Codes**: qrcode library

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License

---

Built with ❤️ using Next.js


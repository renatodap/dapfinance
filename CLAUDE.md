# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DAPFinance** is a personal finance management application built with Next.js that helps users track expenses, categorize transactions, and manage their financial data. The app supports multi-account management, subscription tracking, financial goals, and automated transaction categorization using AI.

Key features:
- Multi-currency account tracking (USD, BRL)
- CSV import from banks (BOA, Fidelity)
- AI-powered transaction categorization using OpenRouter/Gemini
- Receipt image extraction and OCR
- Subscription and goal tracking
- Monthly financial snapshots
- Wise webhook integration for real-time transaction syncing
- Password-protected single-user access

## Tech Stack

- **Framework**: Next.js 15.3 with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **UI Components**: Radix UI + Tailwind CSS + Framer Motion
- **AI Integration**: OpenRouter API (Gemini 2.0 Flash)
- **File Storage**: Cloudflare R2 (S3-compatible)
- **Charts**: Recharts
- **Validation**: Zod
- **CSS**: Tailwind CSS v4 with PostCSS

## Database Schema

Core models (Prisma):
- **Account**: Bank accounts with balance tracking
- **Transaction**: Individual transactions with AI categorization, items, and photos
- **TransactionItem**: Receipt line items extracted from images
- **TransactionPhoto**: Receipts stored in R2 with extracted data (OCR)
- **Category**: Pre-defined spending categories
- **Subscription**: Recurring payments
- **Goal**: Financial targets
- **MonthlySnapshot**: Month-end financial summaries

Key relationships: Transactions belong to Accounts; TransactionItems and TransactionPhotos cascade delete with Transactions.

## Build & Run

```bash
# Install dependencies
npm install

# Setup database (creates Prisma client)
npm run db:push          # Push schema to database
npm run db:seed          # Populate seed data

# Development
npm run dev              # Start with Turbopack on localhost:3000

# Production
npm run build            # Build optimized bundle
npm start                # Start production server

# Database tools
npm run db:studio        # Open Prisma Studio UI
```

## Configuration

Required environment variables (see `.env.example`):
- `DATABASE_URL`: PostgreSQL connection string
- `OPENROUTER_API_KEY`: AI categorization API key
- `R2_*`: Cloudflare R2 credentials for image storage
- `WISE_PUBLIC_KEY`: Public key for Wise webhook signature validation
- `APP_PASSWORD`: Single password for app access
- `NEXT_PUBLIC_APP_URL`: App URL for API referrer headers

## API Routes Structure

```
/api/
├── accounts/       # Account CRUD
├── ai/
│   └── categorize/ # Categorize transactions via AI
├── auth/           # Password authentication
├── categories/     # Category management
├── dashboard/      # Aggregated metrics
├── export/         # CSV export
├── goals/          # Goal CRUD
├── health/         # Health check
├── import/[bank]/  # CSV import (supports "boa", "fidelity")
├── snapshots/      # Monthly snapshots
├── subscriptions/  # Subscription CRUD
├── transactions/   # Transaction CRUD, bulk categorize
├── webhooks/       # Wise transaction webhooks
└── wise/           # Wise integration
```

## Key Features & Implementation

### AI Categorization
- Uses `lib/openrouter.ts` for Gemini API calls
- `categorizeTransaction()`: Categorizes by description/amount
- `extractReceipt()`: Vision API to extract data from receipt images
- `recategorize()`: Re-categorizes with additional context (notes, extracted data)
- Defaults to "other" category with 0 confidence on failures

### CSV Import
- Route: `POST /api/import/[bank]` with FormData file
- Parsers in `lib/csv-parsers.ts` for BOA and Fidelity formats
- Creates transactions with deduplication (unique `dedupeKey`)
- Queues AI categorization in background

### Receipt Management
- Uploads to Cloudflare R2 via `lib/r2.ts`
- Stores thumbnail path, extracted text, and raw extracted data
- Linked to transactions via `TransactionPhoto` model

### Authentication
- Simple password-based via `APP_PASSWORD` env variable
- Middleware checks `dapfinance-auth` cookie on all routes except `/login` and `/api/*`
- Login sets cookie; no session management

### Wise Webhooks
- Route: `POST /api/webhooks/wise`
- Verifies RSA signature using `WISE_PUBLIC_KEY`
- Syncs incoming transfers to accounts
- Stores raw payload in transaction `rawData`

## Development Notes

- Middleware only checks auth cookie; API routes must validate separately
- Server actions support 4MB body limit (configured in `next.config.ts`)
- Remote images allowed from `*.r2.cloudflarestorage.com`
- Security headers enabled (X-Frame-Options: DENY, X-Content-Type-Options, etc.)
- Transaction deduplication uses `dedupeKey` field to avoid duplicates on re-imports
- Categories are pre-defined in database; add new ones via `db:seed` or manually
- All timestamps use UTC; dates stored as `@db.Date` for month/day grouping

## Important Files

- `/src/middleware.ts`: Auth cookie validation
- `/src/lib/openrouter.ts`: AI API integration
- `/src/lib/r2.ts`: Cloudflare R2 file upload
- `/src/lib/wise.ts`: Wise webhook signature verification
- `/prisma/schema.prisma`: Database schema
- `/prisma/seed.ts`: Seed data initialization

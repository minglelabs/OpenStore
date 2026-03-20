# OpenStore

OpenStore is an open source alternative to the Apple App Store.

This repository currently ships a mobile-first web prototype built with TypeScript, Next.js, Tailwind CSS, shadcn-style UI primitives, tRPC, and a PostgreSQL-ready Prisma schema.

## Product Direction

The recommended direction is:

- Build the product as a responsive React web app first.
- Wrap it with a thin native shell later only for device capabilities that genuinely require native access.
- Avoid a pure WebView-first product architecture for the long term because store-quality flows eventually need stronger control over downloads, system permissions, notifications, background activity, install state, and platform integrations.

This means the current implementation focuses on a strong mobile web storefront with clean seams for a future React Native or native shell.

## Core Tabs

### Today

- Editorial hero story
- Release radar
- Featured apps
- Curated collections
- Store trust and safety overview

### Discover

- Category browser
- Collection browser
- Featured developers
- Hidden gems and editorial picks
- Product principles and platform positioning

### Top Charts

- Top free ranking
- Top grossing ranking
- Trending ranking
- Ranking explanation card

### Search

- Search input and query state
- App results
- Developer results
- Category results
- Trending search shortcuts

### Library

- Installed apps
- Available updates
- Active download queue
- Wishlist
- Recent activity

### Account

- Profile summary
- Notification settings
- Trusted devices
- Billing overview
- Security and parental control settings

## Detail Screens

### App Detail

- Hero header
- Install or update call to action
- Rating, downloads, size, and version metadata
- Screenshots
- Highlights
- What's new
- Feature list
- Review list
- Permissions and privacy summary
- In-app purchase summary
- Links to developer and category pages

### Developer Detail

- Verified developer summary
- Trust indicators
- Portfolio list
- Category focus

### Collection Detail

- Curated collection hero
- Editorial notes
- Included app list

### Category Detail

- Category summary
- Featured apps
- Buying guidance
- Full category browse list

## Features Implemented In This Prototype

- Mobile-first store shell with persistent bottom navigation
- Rich storefront UI for all core tabs
- Dedicated routes for app, developer, collection, and category pages
- Mock product data powering the whole interface
- tRPC router for storefront queries
- Prisma schema prepared for PostgreSQL
- Tailwind styling with reusable shadcn-style components

## Screen Inventory

### Main navigation screens

- `/today`
- `/discover`
- `/charts`
- `/search`
- `/library`
- `/account`

### Secondary screens

- `/apps/[slug]`
- `/developers/[slug]`
- `/collections/[slug]`
- `/categories/[slug]`

## Tech Stack

- TypeScript
- Next.js App Router
- Tailwind CSS
- shadcn-style component patterns
- tRPC
- Prisma
- PostgreSQL-ready schema

## Local Development

1. Install dependencies with `pnpm install`.
2. Copy `.env.example` to `.env`.
3. Set `DATABASE_URL` for PostgreSQL when you are ready to connect a real database.
4. Run `pnpm dev`.

## Next Product Steps

- Replace mock storefront data with Prisma-backed queries.
- Add authentication and user-specific library persistence.
- Add native shell integration only for device-specific capabilities.
- Implement real download, payment, and review submission flows.

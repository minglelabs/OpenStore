# OpenStore

OpenStore is an open source alternative to the Apple App Store.

## License

This project is licensed under the GNU General Public License v3.0 or later (`GPL-3.0-or-later`). See [LICENSE](./LICENSE).

This repository is intended to become a full marketplace product, not only a visual storefront. That means the product scope includes:

- An end-user storefront
- Account, billing, and library management
- Install and update flows
- Reviews, trust, and reporting flows
- A developer console
- An internal operations and moderation console

## Repository Language Policy

Everything in this repository must be written in English:

- Commit messages
- README and docs
- Code comments
- UI copy
- PR titles

## Product Inventory

This section lists the tabs, screens, and features the product should eventually include.

### Global Navigation Tabs

The consumer app should use these primary tabs:

1. Today
2. Discover
3. Charts
4. Search
5. Library
6. Account

## 1. Today Tab

### Goal

Use editorial curation to explain why apps matter, not only which apps are popular.

### Screens

- Today Home
- Story Detail
- New Releases Hub
- Editorial Collection Detail
- App Detail
- Developer Detail

### Features

- Hero story card
- Daily editorial stories
- Featured app modules
- Curated collections
- New release highlights
- Major update highlights
- Trust and safety callouts
- Deep links into app detail pages
- Deep links into developer pages

## 2. Discover Tab

### Goal

Help users browse the catalog by category, use case, theme, and editorial grouping.

### Screens

- Discover Home
- Categories Index
- Category Detail
- Collections Index
- Collection Detail
- Featured Developers
- Developer Detail
- App Detail

### Features

- Category browse
- Use-case browse
- Editorial collections
- Seasonal collections
- Featured developers
- Hidden gems section
- Recently updated apps
- Staff picks
- Filter by category and pricing model

## 3. Charts Tab

### Goal

Show ranking-based discovery without letting ranking become the entire product.

### Screens

- Charts Home
- Top Free
- Top Paid
- Top Grossing
- Trending
- Category Charts
- Ranking Methodology Sheet

### Features

- Switch between chart types
- Category-specific charts
- Time-range filters
- Ranking explanation
- Editorial override labels
- Ranking movement indicators
- Deep links into app detail pages

## 4. Search Tab

### Goal

Help users find apps, developers, and categories quickly, even when the query is vague.

### Screens

- Search Landing
- Search Suggestions
- Search Results
- Search Filters Sheet
- No Results State
- Recent Searches Manager

### Features

- Instant search suggestions
- Trending searches
- Recent searches
- Search results for apps
- Search results for developers
- Search results for categories
- Filter by category
- Filter by pricing model
- Filter by rating
- Sort by relevance, popularity, rating, and recency

## 5. Library Tab

### Goal

Turn store ownership into a clear operational experience after acquisition.

### Screens

- Library Home
- Installed Apps
- Updates
- Download Queue
- Wishlist
- Purchase History
- Hidden Purchases
- Restore Purchases

### Features

- Installed app list
- Update available list
- Background update status
- Download progress tracking
- Pause and resume downloads
- Failed download retry
- Wishlist management
- Purchase restore
- Redownload previously owned apps
- Hide and unhide purchases
- Open installed app

## 6. Account Tab

### Goal

Centralize profile, devices, billing, preferences, and security.

### Screens

- Account Home
- Profile
- Region and Language
- Payment Methods
- Billing History
- Subscription Management
- Notification Settings
- Device Management
- Security Settings
- Family and Parental Controls
- Support and Help
- Report a Problem

### Features

- View and edit profile
- Change region
- Manage payment methods
- View invoices and receipts
- Manage subscriptions
- Notification preferences
- Trusted device list
- Sign out of device
- Purchase authentication settings
- Family sharing controls
- Content restrictions
- Contact support
- Refund request flow

## Shared Consumer Screens

These screens are shared across tabs and should exist regardless of where the user enters from.

### App Detail

#### Sections

- App hero header
- App icon and gallery
- Price or acquisition status
- Install or update CTA
- Rating summary
- Rating distribution
- Review highlights
- Screenshots
- Video preview
- What is new
- Description
- Feature list
- Compatibility
- Version history
- Privacy summary
- Permissions summary
- Developer profile link
- Related apps
- Related collections
- Report app action

#### Features

- Install
- Update
- Open
- Add to wishlist
- Share
- Write review
- Edit review
- Report issue
- View privacy details
- View permissions details

### Developer Detail

#### Sections

- Developer profile header
- Verification status
- Region
- Website and support links
- Published apps
- App categories
- Review response summary

#### Features

- Follow developer
- Browse published apps
- Report developer
- Open support links

### Collection Detail

#### Sections

- Collection hero
- Editorial description
- Curator identity
- Included apps
- Related collections

#### Features

- Save collection
- Share collection
- Open apps in sequence

### Category Detail

#### Sections

- Category overview
- Featured apps
- Category charts
- Buying guide
- Full app list

#### Features

- Filter within category
- Sort within category
- Open category charts

## Acquisition, Install, and Update Flows

These flows are essential for an app store alternative and should not be treated as secondary UI work.

### Screens

- Install Confirmation Sheet
- Compatibility Check Screen
- Device Selection Sheet
- Storage Warning Sheet
- Download Progress Screen
- Update Notes Sheet
- Queue Management Screen
- Error and Retry Screen

### Features

- Compatibility checks
- Version compatibility checks
- Storage checks
- Battery and network checks
- Queue management
- Pause and resume
- Retry failed installs
- Wi-Fi-only downloads
- Auto-update settings
- Delta update support
- Rollback strategy for failed updates

## Ratings, Reviews, and Social Proof

### Screens

- Review List
- Write Review
- Edit Review
- Rating Breakdown
- Developer Response View

### Features

- Star rating
- Written review submission
- Review editing
- Review reporting
- Helpful vote
- Sort reviews by recent, critical, and favorable
- Developer responses

## Notifications and Messaging

### Screens

- Notification Center
- Notification Preferences
- Transactional Message Detail

### Features

- Download completion alerts
- Update alerts
- Price drop alerts
- Editorial recommendation alerts
- Billing alerts
- Security alerts

## Trust, Safety, and Compliance

### Screens

- App Report Form
- Developer Report Form
- Privacy Details
- Permission Details
- Age Rating Details
- Content Warning Screen

### Features

- App reporting
- Developer reporting
- Abuse reporting
- Visible developer identity
- Visible pricing model
- Privacy label display
- Permission explanations
- Age rating display
- Content warnings

## Developer Console

The product also needs a separate developer-facing application.

### Core Screens

- Developer Dashboard
- App List
- Create App
- App Listing Editor
- Release Management
- Binary or Package Upload
- Version Detail
- Pricing and Availability
- In-App Purchase Management
- Subscription Management
- Review Management
- Analytics Dashboard
- Crash and Quality Dashboard
- Team and Permissions
- Payout and Tax Setup
- Compliance and Policy Center

### Core Features

- Create and manage app records
- Upload build artifacts
- Manage versions
- Publish and schedule releases
- Localize app metadata
- Manage screenshots and preview media
- Set pricing
- Configure regional availability
- Configure in-app purchases
- Configure subscriptions
- Read and respond to reviews
- View installs, retention, and revenue analytics
- Manage team roles
- Manage payout setup
- Handle policy and compliance submissions

## Internal Operations and Moderation Console

The store also needs an internal back-office application.

### Core Screens

- App Review Queue
- Developer Verification Queue
- Abuse Reports Queue
- Billing Support Queue
- Refund Queue
- Editorial CMS
- Category Manager
- Collection Manager
- Ranking and Search Tuning
- Incident Dashboard

### Core Features

- Review app submissions
- Verify developer identity
- Moderate reports
- Process refunds
- Manage editorial stories
- Manage collections and categories
- Tune ranking signals
- Tune search relevance
- Track operational incidents

## Cross-Cutting System Features

These are not individual screens, but they are product-critical.

### Identity and Access

- User authentication
- Session management
- Device trust management
- Family account support
- Developer organization support
- Admin role management

### Commerce

- Paid apps
- In-app purchases
- Auto-renewing subscriptions
- Refund flow
- Receipt history
- Regional pricing

### Store Intelligence

- Search indexing
- Ranking pipelines
- Editorial scheduling
- Recommendation modules
- Fraud and abuse detection

### Platform Services

- Background jobs
- Asset processing
- Review moderation pipeline
- Notification delivery
- Analytics ingestion
- Audit logs

## Recommended Scope Order

The recommended order is:

### Phase 1: Consumer MVP

- Today
- Discover
- Charts
- Search
- Library
- Account
- App detail
- Developer detail
- Collection detail
- Category detail

### Phase 2: Real Acquisition and Ownership Flows

- Install flow
- Update flow
- Queue management
- Purchase history
- Restore purchases
- Notification center

### Phase 3: Developer Platform

- Developer dashboard
- App listing management
- Release management
- Pricing management
- Analytics

### Phase 4: Internal Operations

- Review queue
- Moderation tools
- Editorial CMS
- Refund and billing tooling

## Architecture Direction

The recommended architecture is:

- Build the product as a responsive React web app first
- Use TypeScript, Tailwind CSS, shadcn-style components, tRPC, Prisma, and PostgreSQL
- Add a native wrapper later only for device-specific capabilities such as installs, downloads, notifications, and deeper platform integration

### Why not a pure WebView-first product

A pure WebView-first approach is fast for a demo, but weak for a real store because the product will eventually require:

- Device-level install handling
- Download queue control
- Background tasks
- Push notifications
- Storage management
- Purchase and entitlement handling
- Device trust management

The better direction is:

- Web-first for speed and iteration
- Native shell later for platform-critical capabilities

## Current Repository Status

This repository currently contains an initial storefront prototype for the consumer app. It is not yet a complete marketplace product.

## Current API Surface

All currently implemented storefront features are available through the tRPC endpoint at `/api/trpc`.

### Top-level store procedures

- `store.today`
- `store.discover`
- `store.charts`
- `store.search`
- `store.library`
- `store.account`
- `store.appBySlug`
- `store.developerBySlug`
- `store.collectionBySlug`
- `store.categoryBySlug`
- `store.developerCatalog`

### Nested API groups

- `store.catalog`
  - catalog summary, app lists, developer lists, category lists, collection lists
- `store.todayFeed`
  - hero, spotlight apps, collections, release radar, safety notes
- `store.discoverFeed`
  - categories, collections, featured developers, hidden gems, principles
- `store.appDetail`
  - sections, screenshots, highlights, what's new, features, privacy, reviews, related items
- `store.searchTools`
  - suggestions, trending queries, recent queries, recent query recording
- `store.libraryTools`
  - installed apps, updates, queue, wishlist, purchase history, hidden purchases, restore purchases
  - add to wishlist, remove from wishlist, queue install, pause download, resume download, retry download
  - hide purchase, unhide purchase
- `store.accountTools`
  - notifications, devices, billing, subscriptions, controls
  - toggle notification, sign out device
- `store.reviews`
  - submit review, update review
- `store.reports`
  - app reports, developer reports

## Local Development

1. Install dependencies with `pnpm install`.
2. Copy `.env.example` to `.env`.
3. Set `DATABASE_URL`.
4. Run `pnpm dev`.

## Testing and TDD

Use the following scripts to keep development test-first:

- `pnpm test` runs the full test suite once
- `pnpm test:tdd` starts watch mode for red-green-refactor loops
- `pnpm test:coverage` generates coverage output

The current test stack is:

- Vitest
- React Testing Library
- jsdom

The current baseline test coverage focuses on:

- Store domain data and derived view models
- tRPC store router behavior
- Representative storefront component rendering

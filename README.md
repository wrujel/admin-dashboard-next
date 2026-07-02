<div align='center'>

[![demo][demo]][demo-link]
[![status][status]][status-link]
[![deploy][deploy]](/)
[![test][tests]][tests-link]

</div>

<div align='center'>
  <a href='/'>
    <img
      src='/public/images/screenshot.png'
      alt='Screenshot of the app'
      width='100%'
    />
  </a>
</div>

<div align='center'>
  <h1>Nexus — Admin Dashboard with Next.js</h1>
</div>

<div align='center'>

[![Next.js][nextjs]][nextjs-link]
[![React][react]][react-link]
[![TypeScript][typescript]][typescript-link]
[![Tailwind CSS][tailwindcss]][tailwindcss-link]
[![Better Auth][better-auth]][better-auth-link]
[![MongoDB][mongodb]][mongodb-link]
[![Mongoose][mongoose]][mongoose-link]
[![Recharts][recharts]][recharts-link]
[![TanStack Table][tanstack]][tanstack-link]
[![Radix UI][radix]][radix-link]
[![Motion][motion]][motion-link]
[![Bcrypt][bcrypt]][bcrypt-link]

</div>

<div align='center'>
  A dense, real-time admin dashboard ("Nexus") built with Next.js 16, React 19, Tailwind CSS v4, Better Auth and MongoDB. Manage users and products with generic data tables, explore analytics with animated charts, and watch a client-side ecommerce simulator stream transactions and activity every second.

[Demo][demo-link] · [Report issue](/issues) · [Suggest something](/issues)

</div>

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running locally](#running-locally)
  - [Build](#build)
  - [Seeding products](#seeding-products)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Demo](#demo)
- [Troubleshooting](#troubleshooting)
- [Authors](#authors)
- [Contributing](#contributing)
- [License](#license)

## Features

- [x] Secure authentication with Better Auth (email/password, database sessions, rate limiting)
- [x] Auth enforced in the data-access layer, not middleware-only (resilient to CVE-2025-29927)
- [x] Secure-by-config: runs in an open demo mode until `MONGO_URI` + a secret are set
- [x] Dense, animated dashboard: KPI cards, revenue/profit area chart, orders bar chart
- [x] Analytics section with a Revenue view (7D / 30D / quarter / semester / year range filter) and Reports
- [x] Generic, type-safe data tables (TanStack Table) with sorting, filtering, pagination and column controls
- [x] Users & Products CRUD via React 19 server actions, optimistic updates and toasts
- [x] Random product seed script — batched, resilient and guaranteed-unique
- [x] Live client-side data simulator — a transaction and an activity every second, with a start/pause toggle
- [x] Command palette (⌘K), notification popover synced to the activity feed
- [x] Dark / light theming with `next-themes` and OKLCH design tokens
- [x] shadcn-style component primitives (Radix UI + CVA) animated with Motion
- [x] Mock-first data layer with a graceful MongoDB fallback (never blocks a render)
- [x] Password hashing with bcrypt
- [x] Built on the Next.js 16 App Router + React 19 with Turbopack; deployed on Vercel

## Tech Stack

- [Next.js 16](https://nextjs.org/)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Better Auth](https://www.better-auth.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [Recharts](https://recharts.org/)
- [TanStack Table](https://tanstack.com/table/latest)
- [Radix UI](https://www.radix-ui.com/)
- [Motion](https://motion.dev/)
- [next-themes](https://github.com/pacocoursey/next-themes)
- [Sonner](https://sonner.emilkowal.ski/)
- [cmdk](https://cmdk.paco.me/)
- [Bcrypt](https://www.npmjs.com/package/bcrypt)
- [tsx](https://github.com/privatenumber/tsx)
- [Vercel](https://vercel.com/)

## Getting Started

### Prerequisites

- Node.js 20.9+ (required by Next.js 16)
- npm
- A MongoDB Atlas account or local MongoDB instance (optional — the app runs with demo data without one)

### Installation

```bash
git clone https://github.com/wrujel/admin-dashboard-next.git
cd admin-dashboard-next
npm install
```

### Running locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build

```bash
npm run build
```

### Seeding products

Insert random products into your database (batched, resilient, unique names):

```bash
npm run seed:products              # insert 1000 products (batches of 100)
npm run seed:products -- 250       # insert 250
npm run seed:products -- --reset 500  # wipe the collection first, then 500
npm run seed:products -- --dry-run    # preview only, writes nothing
```

## Environment Variables

The app runs in an open demo mode with mock data out of the box. Add the following to your `.env` file to connect a database and enable real authentication.

| Variable             | Description                                                                                 | Required |
| :------------------- | :------------------------------------------------------------------------------------------ | :------: |
| `MONGO_URI`          | MongoDB connection string. Without it, the app serves demo/mock data.                       |    No    |
| `BETTER_AUTH_SECRET` | 32+ char secret for session encryption. Enables real auth (`AUTH_SECRET` is also accepted). |    No    |

## Project Structure

```
/
├── app/
│   ├── actions/            # Server actions (auth, users, products)
│   ├── api/auth/           # Better Auth route handler
│   ├── dashboard/          # Overview, analytics (revenue/reports), users, products, settings, activity
│   ├── lib/                # Data layer, auth (config/dal), fixtures, simulator, types
│   ├── login/              # Login page
│   ├── models/             # Mongoose models (user, product)
│   ├── providers/          # Theme + simulator providers
│   ├── ui/                 # primitives, charts, data-table, shell, overview, widgets, ...
│   └── layout.tsx
├── scripts/
│   └── seed-products.ts    # Random product seeder (run via tsx)
├── public/images/
├── eslint.config.mjs
├── next.config.mjs
├── postcss.config.mjs
├── proxy.js                # Better Auth optimistic route protection (formerly middleware)
└── tsconfig.json
```

## Demo

You can check out the demo:

[![Demo][demo]][demo-link]

## Troubleshooting

<details>
<summary>npm install fails with ERESOLVE (React 19 peer deps)</summary>

Some libraries lag on React 19 peer ranges. Retry with:

```bash
npm install --legacy-peer-deps
```

</details>

<details>
<summary>The dashboard shows "Demo data"</summary>

That's expected when `MONGO_URI` is not set — the app falls back to mock data. Add `MONGO_URI` (and a `BETTER_AUTH_SECRET`) to your `.env` to load real data and enable authentication.

</details>

<details>
<summary>MongoDB connection errors</summary>

Make sure your `MONGO_URI` is correct and the database is reachable. If using MongoDB Atlas, add your IP address under Network Access.

</details>

<details>
<summary>Better Auth warns about a low-entropy secret</summary>

Set a strong `BETTER_AUTH_SECRET` (32+ characters). You can generate one with:

```bash
openssl rand -base64 32
```

</details>

## Authors

- [@wrujel](https://github.com/wrujel) — Creator & maintainer

## Contributing

Contributions are welcome! If you have suggestions or find bugs, please open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the [MIT License](LICENSE).

---

<!-- Badges -->

[nextjs]: https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js
[react]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[typescript]: https://img.shields.io/badge/Typescript-007ACC?style=for-the-badge&logo=typescript&logoColor=white&color=blue
[tailwindcss]: https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[better-auth]: https://img.shields.io/badge/Better%20Auth-1A1A1A?style=for-the-badge&logo=betterauth&logoColor=white
[mongodb]: https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white
[mongoose]: https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white
[recharts]: https://img.shields.io/badge/Recharts-22B5BF?style=for-the-badge&logo=chartdotjs&logoColor=white
[tanstack]: https://img.shields.io/badge/TanStack%20Table-FF4154?style=for-the-badge&logo=reactquery&logoColor=white
[radix]: https://img.shields.io/badge/Radix%20UI-161618?style=for-the-badge&logo=radixui&logoColor=white
[motion]: https://img.shields.io/badge/Motion-000000?style=for-the-badge&logo=framer&logoColor=white
[bcrypt]: https://img.shields.io/badge/Bcrypt-2A2A2A?style=for-the-badge&logo=npm&logoColor=white

<!-- Badges links -->

[nextjs-link]: https://nextjs.org/
[react-link]: https://react.dev/
[typescript-link]: https://www.typescriptlang.org/
[tailwindcss-link]: https://tailwindcss.com/
[better-auth-link]: https://www.better-auth.com/
[mongodb-link]: https://www.mongodb.com/
[mongoose-link]: https://mongoosejs.com/
[recharts-link]: https://recharts.org/
[tanstack-link]: https://tanstack.com/table/latest
[radix-link]: https://www.radix-ui.com/
[motion-link]: https://motion.dev/
[bcrypt-link]: https://www.npmjs.com/package/bcrypt

<!-- Status/Demo badges -->

[demo]: https://img.shields.io/badge/🚀%20Live%20Demo-000000?style=for-the-badge&&logoColor=white&color=0a6bdb
[demo-link]: https://admin-dashboard-next-roan.vercel.app/
[status]: https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fwrujel%2Fmonitor-repos%2Fmain%2Fdata%2Fadmin-dashboard-next.json
[status-link]: https://github.com/wrujel/monitor-repos
[deploy]: https://img.shields.io/github/deployments/wrujel/admin-dashboard-next/production?style=for-the-badge&label=Deploy
[tests]: https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fwrujel%2Fmonitor-tests%2Fmain%2Fdata%2Fadmin-dashboard-next.json
[tests-link]: https://github.com/wrujel/monitor-tests

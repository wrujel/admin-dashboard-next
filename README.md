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
  <h1>Admin Dashboard with Next.js</h1>
</div>

<div align='center'>

  [![Next.js][nextjs]][nextjs-link]
  [![TypeScript][typescript]][typescript-link]
  [![Tailwind CSS][tailwindcss]][tailwindcss-link]
  [![React][react]][react-link]
  [![Next-Auth][next-auth]][next-auth-link]
  [![Mongoose][mongoose]][mongoose-link]
  [![MongoDB][mongodb]][mongodb-link]
  [![Bcrypt][bcrypt]][bcrypt-link]
  [![React Icons][react-icons]][react-icons-link]
  [![Recharts][recharts]][recharts-link]
  [![Use-Debounce][use-debounce]][use-debounce-link]

</div>

<div align='center'>
  Admin Dashboard app built with Next.js 14, TypeScript, Tailwind CSS, NextAuth v5, and MongoDB. Manage users and products with full CRUD operations, interactive charts, search with debounce, and pagination.

  [Demo]({{DEMO_URL}}) · [Report issue](/issues) · [Suggest something](/issues)
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
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Demo](#demo)
- [Troubleshooting](#troubleshooting)
- [Authors](#authors)
- [Contributing](#contributing)
- [License](#license)

## Features

- [x] Authentication with NextAuth v5 (credentials provider)
- [x] User management (create, read, update, delete)
- [x] Product management (create, read, update, delete)
- [x] Dashboard overview with summary cards
- [x] Interactive line charts with Recharts
- [x] Latest transactions display
- [x] Search functionality with debounce
- [x] Pagination for users and products lists
- [x] Sidebar navigation with grouped menu items
- [x] Password hashing with bcrypt
- [x] Middleware-based route protection
- [x] Responsive design with Tailwind CSS
- [x] CSS Modules for component-scoped styling
- [x] Server Actions for form handling
- [x] MongoDB database with Mongoose ODM

## Tech Stack

- [Next.js 14](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React 18](https://react.dev/)
- [NextAuth v5](https://next-auth.js.org/)
- [Mongoose](https://mongoosejs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Bcrypt](https://www.npmjs.com/package/bcrypt)
- [React Icons](https://react-icons.github.io/react-icons/)
- [Recharts](https://recharts.org/en-US/)
- [Use-Debounce](https://www.npmjs.com/package/use-debounce)
- [Vercel](https://vercel.com/)

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A MongoDB Atlas account or local MongoDB instance

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

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file.

| Variable      | Description                               | Required |
| :------------ | :---------------------------------------- | :------: |
| `MONGO_URI`   | MongoDB connection string                 |   Yes    |
| `AUTH_SECRET` | Secret for NextAuth v5 session encryption |   Yes    |

## Project Structure

```
/
├── app/
│   ├── actions/
│   │   ├── auth.actions.ts
│   │   ├── product.actions.ts
│   │   └── user.actions.ts
│   ├── dashboard/
│   │   ├── products/
│   │   │   ├── [id]/
│   │   │   └── add/
│   │   └── users/
│   │       ├── [id]/
│   │       └── add/
│   ├── lib/
│   │   └── utils.ts
│   ├── login/
│   ├── models/
│   │   ├── product.ts
│   │   └── user.ts
│   ├── services/
│   │   ├── products.service.ts
│   │   └── users.service.ts
│   └── ui/
│       └── dashboard/
│           ├── card/
│           ├── chart/
│           ├── navbar/
│           ├── pagination/
│           ├── search/
│           ├── sidebar/
│           └── ...
├── public/
│   └── images/
├── auth.js
├── authconfig.js
├── middleware.js
├── next.config.mjs
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Demo

You can check out the demo:

[![Demo][demo]][demo-link]

## Troubleshooting

<details>
<summary>npm install fails with ERESOLVE</summary>

Try running with the legacy peer deps flag:
```bash
npm install --legacy-peer-deps
```
</details>

<details>
<summary>MongoDB connection errors</summary>

Make sure your `MONGO_URI` environment variable is correctly set and your MongoDB instance is running. If using MongoDB Atlas, ensure your IP address is whitelisted in the Network Access settings.
</details>

<details>
<summary>NextAuth errors</summary>

Ensure you have set the `AUTH_SECRET` environment variable. You can generate one with:
```bash
npx auth secret
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
[typescript]: https://img.shields.io/badge/Typescript-007ACC?style=for-the-badge&logo=typescript&logoColor=white&color=blue
[tailwindcss]: https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[react]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[next-auth]: https://img.shields.io/badge/Next--Auth-black?style=for-the-badge&logo=next.js
[mongoose]: https://img.shields.io/badge/Mongoose-2A2A2A?style=for-the-badge&logo=mongoose&logoColor=white
[mongodb]: https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white
[bcrypt]: https://img.shields.io/badge/Bcrypt-2A2A2A?style=for-the-badge&logo=npm&logoColor=white
[react-icons]: https://img.shields.io/badge/React--Icons-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[recharts]: https://img.shields.io/badge/Recharts-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[use-debounce]: https://img.shields.io/badge/Use--Debounce-2A2A2A?style=for-the-badge&logo=npm&logoColor=white

<!-- Badges links -->
[nextjs-link]: https://nextjs.org/
[typescript-link]: https://www.typescriptlang.org/
[tailwindcss-link]: https://tailwindcss.com/
[react-link]: https://react.dev/
[next-auth-link]: https://next-auth.js.org/
[mongoose-link]: https://mongoosejs.com/
[mongodb-link]: https://www.mongodb.com/
[bcrypt-link]: https://www.npmjs.com/package/bcrypt
[react-icons-link]: https://react-icons.github.io/react-icons/
[recharts-link]: https://recharts.org/en-US/
[use-debounce-link]: https://www.npmjs.com/package/use-debounce

<!-- Status/Demo badges -->
[demo]: https://img.shields.io/badge/🚀%20Live%20Demo-000000?style=for-the-badge&&logoColor=white&color=0a6bdb
[status-link]: https://github.com/wrujel/monitor-repos
[tests-link]: https://github.com/wrujel/monitor-tests

[demo-link]: https://admin-dashboard-next-roan.vercel.app/
[status]: https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fwrujel%2Fmonitor-repos%2Fmain%2Fdata%2Fadmin-dashboard-next.json
[deploy]: https://img.shields.io/github/deployments/wrujel/admin-dashboard-next/production?style=for-the-badge&label=Deploy
[tests]: https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fwrujel%2Fmonitor-tests%2Fmain%2Fdata%2Fadmin-dashboard-next.json

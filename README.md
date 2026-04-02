# Penni Web

Penni Web is the Next.js frontend for Penni. It uses Clerk for web auth and talks to the separate Penni backend API for data and business logic.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **Authentication**: Clerk
- **Backend**: Penni backend API
- **Theming**: next-themes (Dark Mode)
- **Language**: TypeScript
- **Package Manager**: npm
- **Linting**: ESLint with Next.js config
- **Formatting**: Prettier with Tailwind CSS plugin

## Prerequisites

- Node.js 20+
- Penni backend running locally or remotely
- Docker + Docker Compose if you want to run the frontend in a container
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone https://github.com/beefysalad/nexion.git
cd nexion
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

4. Configure your API base URL and Clerk keys in `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000/api"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

## Getting Started

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Docker Quickstart

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Start the frontend container:

```bash
docker compose up --build
```

3. Open [http://localhost:3000](http://localhost:3000).

## Docker Development

For hot reload while editing files locally, use the development Compose file instead:

```bash
docker compose -f docker-compose.dev.yml up --build
```

This mounts your workspace into the container, runs Next.js in development mode, and watches for file changes.

## Project Structure

```
├── app/                 # Next.js app router pages and layouts
├── components/          # Reusable React components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard components
│   └── ui/              # shadcn/ui primitives
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and configurations
│   └── routes.ts        # Route definitions and protection rules
├── public/             # Static assets
├── proxy.ts            # Clerk-powered route protection
└── components.json     # shadcn/ui configuration
```

## Authentication

This project uses **Clerk** for authentication.

- **Providers**: Google OAuth + Clerk email/password
- **Protection**: Clerk middleware in `proxy.ts`
- **Session Management**: `ClerkProvider` in `RootLayout`
- **User Sync**: Clerk users are mirrored into Prisma and merged by email when appropriate

### Route Protection Configuration

Routes are defined in `lib/routes.ts`:

- `publicRoutes`: Accessible without login.
- `authRoutes`: Redirect to dashboard if already logged in.
- `protectedRoutes`: All other routes require authentication.

## Styling

The project uses Tailwind CSS for styling with shadcn/ui components. Components are configured in `components.json`.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Run Prettier to format code
- `npm run format:check` - Check code formatting with Prettier

## Deployment

### Vercel (Recommended)

The easiest way to deploy is using [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme):

1. Connect your GitHub repository
2. Configure environment variables
3. Deploy

### Other Platforms

Ensure your environment variables are properly configured and run:

```bash
npm run build
npm run start
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

## Contributing

Feel free to submit issues and enhancement requests!

## Credits

Created by **John Patrick Ryan Mandal**

## License

This project is licensed under the [MIT License](LICENSE).

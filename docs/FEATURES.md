# Project Features

This document tracks the core features and technologies implemented in **Penni Web**.

## Core Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) - High-performance React framework.
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe development.
- **Authentication**: [Clerk](https://clerk.com/) - Hosted authentication with Google OAuth, email/password, and middleware protection.
- **Backend**: Penni backend API for data, business rules, and persistence.
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS framework with native cascade support.
- **Components**: [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components built with Radix UI.

## Premium Experience

- **Lander**: A modern, high-conversion landing page with interaction-ready elements.
- **Dashboard Hub**: A clean base for authenticated Penni web experiences.
- **What's New Modal**: An automated, persistence-aware overlay to announce template updates.
- **Live Auth Demo**: Interactive section on the landing page to showcase the authentication flow.
- **Glassmorphic Auth Forms**: Redesigned Login and Register forms with a clean grid and card aesthetic.
- **Theming**: Full Light and Dark mode support out of the box using `next-themes`.
- **Aesthetics**: Consistent use of rounded-full buttons, high-contrast palettes, and micro-interactions.

## Developer Experience

- **Documentation**: Comprehensive `/docs` page detailing setup, architecture, and customization.
- **Form Management**: Standardized integration of `React Hook Form` and `Zod` validation.
- **State Management**: [TanStack Query](https://tanstack.com/query/latest) (React Query) for robust server-state handling.
- **Route Protection**: Global middleware-based protection for private and public routes.
- **Code Quality**: Prettier configured and enforced for a clean, consistent codebase.
- **Folder Structure**: Feature-based directory organization for scalability.
- **PR Agent**: Automated PR reviews and feedback using [Qodo Merge (PR Agent)](https://qodo-merge-docs.qodo.ai/) with GitHub Actions.
- **GitHub Automation**: Comprehensive issue management automation including:
  - Interactive issue forms (bug reports, feature requests, questions)
  - Auto-labeling based on keywords
  - Auto-assignment to team members
  - Stale issue management
  - First-time contributor welcome messages
  - Issue validation and duplicate detection
  - Priority labeling for urgent issues

## Database & Models

- **Frontend-only web app**: The web repo no longer owns Prisma models, migrations, or Postgres.

---

_Last Updated: February 13, 2026_

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev       # Start dev server (Turbopack, default)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint (not run automatically by build in Next.js 16+)
```

Prisma:
```bash
npx prisma migrate dev    # Run migrations in development
npx prisma generate       # Regenerate client after schema changes (outputs to src/app/generated/prisma/)
npx prisma studio         # Open Prisma Studio GUI
```

## Architecture

**Next.js 16 App Router** with TypeScript, React 19, Tailwind CSS v4, Prisma 7 (PostgreSQL), and better-auth.

**Key directories:**
- `src/app/` — App Router pages and layouts. Routes are file-system based.
- `src/components/ui/` — shadcn UI components. These use `@base-ui/react` as the headless primitive (not Radix UI).
- `src/lib/` — Shared singletons: `prisma.ts` (Prisma client), `auth.ts` (better-auth config), `utils.ts` (`cn` helper).
- `src/app/generated/prisma/` — Auto-generated Prisma client. Do not edit manually; regenerate with `prisma generate`.
- `prisma/schema.prisma` — Database schema. Auth models (User, Session, Account, Verification) are managed by better-auth.

**Auth:** better-auth handles authentication via `src/lib/auth.ts`. The catch-all API handler lives in `app/api/auth/[...all]/route.ts` and exports `GET`/`POST` via `toNextJsHandler(auth)`. Email/password auth is enabled.

**Styling:** Tailwind CSS v4 is imported directly in CSS (`@import "tailwindcss"`) — there is no `tailwind.config.*` file. Theme tokens are defined in `src/app/globals.css` using `@theme inline` and CSS custom properties. Dark mode uses the `.dark` class variant.

**Components:** shadcn components wrap `@base-ui/react` primitives (not Radix UI). Use `class-variance-authority` for variant logic and `cn()` from `@/lib/utils` for class merging. Icons come from `@phosphor-icons/react`.

**Database:** Prisma 7 with `@prisma/adapter-pg` (native PostgreSQL driver). Requires `DATABASE_URL` env var. Prisma config is in `prisma.config.ts` (uses `dotenv/config`).

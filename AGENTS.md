# Project: Centralized Auth Monorepo

An internal identity and authentication platform. The Auth Service is the single OIDC provider for all company applications; six Next.js apps are registered as OIDC clients and rely on it for login, session, and fine-grained permissions.

## Stack

- Frontend: TypeScript, Next.js 16 (App Router), Tailwind CSS v4, shadcn/ui, `next-auth@beta`
- Backend: C# / .NET 10 Web API, ASP.NET Identity, OpenIddict (OIDC provider)
- Database: **PostgreSQL** — do not use SQLite-only SQL features
- Package manager: npm (frontend)

## Repo structure

Monorepo — frontend and backend live together.

### Auth API (`apps/api/internal-auth-service/`)

```
internal-auth-service/
├── internal-auth-service.csproj
├── Program.cs
├── appsettings.json / appsettings.Development.json
│
├── Models/             # EF Core entities only. No logic.
├── Views/              # Server-rendered HTML (login, change-password, etc.)
│   └── Account/        # Login.html, ChangePassword.html, ForgotPassword.html
├── Data/
│   └── ApplicationDbContext.cs
├── DTOs/               # API contracts — never expose Models directly.
│   └── <Feature>/
├── Mappers/            # Static Entity <-> DTO conversion only.
├── Interfaces/
│   ├── Repositories/   # Data-access contracts.
│   └── Services/       # Business-logic contracts.
├── Repositories/       # Implements repository interfaces. Talks to DbContext only.
├── Services/           # Implements service interfaces. Business logic only.
├── Helpers/            # Small, stateless, static utilities.
├── Controllers/        # HTTP concerns only: bind → call service → return response.
├── Seeders/            # Startup data (OIDC clients, roles, default users).
└── Migrations/
```

### Next.js apps (`apps/web/<app>/`)

Six apps: `portal`, `hrms`, `pos`, `scms`, `oos`, `crms`. **Portal is the reference implementation** — replicate from it when adding a new app.

```
<app>/
├── app/                # Next.js App Router pages and layouts
│   ├── layout.tsx      # Root layout — server guard lives here (THIS_SYSTEM_CODE check)
│   ├── page.tsx        # Dashboard / home
│   └── admin/          # Admin section (Portal only)
├── components/         # Shared React components (one component per file)
│   └── ui/             # shadcn/ui-based primitives and custom widgets
├── lib/                # Server-side helpers, API clients, utilities
├── types/              # TypeScript declaration files (e.g. next-auth.d.ts)
├── public/             # Static assets
├── auth.ts             # NextAuth/OIDC configuration
├── instrumentation.ts  # mkcert CA registration (undici dispatcher)
├── middleware.ts        # Route protection middleware
├── .env.local          # Gitignored — real secrets
└── .env.example        # Committed — variable keys with empty placeholder values
```

## Ports

| Service | Port |
|---|---|
| Auth Service (API) | `https://localhost:5001` |
| Portal | `https://localhost:3000` |
| HRMS | `https://localhost:3001` |
| POS | `https://localhost:3002` |
| SCMS | `https://localhost:3003` |
| OOS | `https://localhost:3004` |
| CRMS | `https://localhost:3005` |

## Commands

Frontend (run from the specific `apps/web/<app>/` directory):
- Install: `npm install`
- Dev server: `npm run dev`
- Test: `npm run test` (Vitest)
- Lint/typecheck: `npm run lint` / `npm run typecheck`
- Build: `npm run build`

Backend (run from `apps/api/internal-auth-service/`):
- Run: `dotnet run`
- Test: `dotnet test` (xUnit)
- Add migration: `dotnet ef migrations add <Name>`
- Apply migration: `dotnet ef database update`


## Code principles

- Clean code, Single Responsibility, Separation of Concerns — every class/module does one thing
- Files stay under 300 lines — split before exceeding this
- One React component per file
- Controllers only bind request → call service → return response. No business logic, no direct DbContext access.
- Services hold business logic only. Repositories talk to DbContext only. Never cross those boundaries.
- Mappers are static Entity <-> DTO conversion only — no logic beyond mapping.
- DTOs are the only thing exposed over the API — never return EF Core entities (Models) directly.
- Helpers are small, stateless, static utilities only.
- Frontend: functional components only, no class components
- Use shadcn/ui components before writing custom UI from scratch
- Styling: Tailwind utility classes only — no inline styles (`style={{ ... }}`), no hardcoded hex colors
- UI must follow the design reference in `.design-ref/` — check it before building or styling any component
- Backend: PascalCase for public members, `_camelCase` for private fields, camelCase for locals/params
- Prefer explicit types over `any`/`var` where it aids clarity

## Frontend
- The frontend must follow the design reference in `.design-ref/` — check it before building or styling any component.  
- Always use shadcn ui before writing custom UI from scratch 
- Do not import unstable ui 
- Use `lib/ui/components` for shared components
- Use sonner for toast notifications  
- Always use lucide icons  
- Use tailwind for styling  
- Use TypeScript  
- Use next.js app router
- Always develop in mobile-screen first then scale to desktop screen 


## Database / EF Core

- Database: **PostgreSQL** — avoid SQLite-specific syntax
- All schema changes go through EF Core migrations — never edit the DB schema directly
- Never edit files under `Migrations/` by hand after they're generated
- Seeder behavior: skips records that already exist by ID — if OIDC client configs or redirect URIs change, **drop and re-migrate** rather than waiting for the seeder to update them

## Constraints

- Never commit secrets, connection strings, or `.env` / `.env.local` files (`.env.example` is the committed template)
- Never commit `.design-ref/` — it is gitignored and local-only
- Don't add new npm or NuGet dependencies without asking first
- Don't touch `Migrations/` history — only add new migrations, never rewrite old ones

## Git / PR

- Commit style: Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `style:`, `test:`)
- Scope = affected service (e.g. `feat(portal): ...`, `fix(auth-service): ...`)
- Commit after every completed, verified task — don't batch unrelated changes into one commit
- Stage only the files changed for the specific task; never `git add .` blindly
- Run lint + build (both frontend and backend) before committing

## Project-Specific Conventions (identical across all 6 Next.js apps)

- **OIDC Configuration** — reference: `apps/web/portal/auth.ts`
  - Custom OIDC provider configuration.
  - Parses the `"systems"` claim from a comma-joined string into a `string[]` in the JWT callback.
  - Parses `"permissions"` JSON claim into a typed object.
- **Server Guard** — reference: `apps/web/portal/app/layout.tsx`
  - No active session → redirect to login.
  - Session missing `THIS_SYSTEM_CODE` in `session.systems` → Access Denied redirect.
- **System Filtering Helper** — reference: `apps/web/portal/lib/getAccessibleSystems.ts`
  - Fetches accessible apps from `GET {AUTH_ISSUER}api/systems`.
  - Filters results by the codes in `session.systems`.
- **mkcert CA** — reference: `apps/web/portal/instrumentation.ts`
  - Registers the mkcert root CA with undici's global dispatcher so Node outbound HTTPS requests to the Auth Service succeed.
- **Logout**: Must redirect through `{AUTH_ISSUER}connect/logout?post_logout_redirect_uri=...` to fully terminate the Auth Service OIDC session. Never call `signOut()` alone.

## Environment & Gotchas

- **Shell**: Use `zsh` syntax. Bash-only syntax (e.g. `${!ARR[@]}`) must be wrapped in `bash << 'EOF' ... EOF`.
- **Zsh History Expansion**: `!` in a pasted heredoc triggers zsh history expansion — avoid literal `!session`.
- **Certificates**: The Auth Service requires the `mkcert`-issued cert. Do **not** use `dotnet dev-certs`.
- **User Retrieval**: `UserManager.GetUserAsync(principal)` does **not** work with OpenIddict's `"sub"` claim (claim-type mismatch). Use `principal.GetClaim(Claims.Subject)` + `UserManager.FindByIdAsync()` instead.
- **Local Dev Only**: `NODE_TLS_REJECT_UNAUTHORIZED=0` must only appear in `.env.local` for local runs. Never commit it set to `0` in Dockerfiles, CI config, or production secrets.
- **Views HTML templating**: Auth Service views use `{{returnUrl}}` and `{{errorHtml}}` as simple string-replace placeholders. The controller injects the error as an HTML `<p>` fragment. Wrap `{{errorHtml}}` in a `class="error-wrapper"` div and override its `<p>` styling via plain CSS when building new view pages.

## Environment Files

- **API Service**: `apps/api/internal-auth-service/.env` (gitignored) + `.env.example` (committed template with inline comments)
- **Web Apps**: `apps/web/<app>/.env.local` (gitignored) + `.env.example` (committed template)
- **Gitignore pattern** (required in every app/service):
  ```
  .env
  .env.*
  !.env.example
  ```
  Do **not** use `.env*` — it will hide `.env.example` files.
- Generate `AUTH_SECRET`: `openssl rand -base64 32`
- If secrets are accidentally committed, rotate them immediately in the provider dashboard. Adding to `.gitignore` afterwards does **not** remove them from history.
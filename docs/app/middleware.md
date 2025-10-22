# Middleware

File: `src/middleware.ts`

Exports:
- `middleware(request: NextRequest)` — injects locale into URL when missing (redirect)
- `config` — `{ matcher: ["/((?!_next|api|favicon.ico).*)"] }`

Uses `@formatjs/intl-localematcher` and `negotiator` to determine best user locale.

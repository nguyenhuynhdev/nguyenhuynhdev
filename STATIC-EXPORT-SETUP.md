# Static Export Setup with generateStaticParams

## Problem
Client components (`'use client'`) cannot export `generateStaticParams()` because it's a server-side function. However, Next.js static export requires `generateStaticParams` for dynamic routes.

## Solution Pattern

For client component pages with dynamic routes, we have two options:

### Option 1: Parent Layout Handles Locale (Current Setup)
The `[locale]/layout.tsx` already exports `generateStaticParams()` for locale params. This covers all child routes automatically.

**Pros:**
- Simple, no duplication
- Works for all routes under `[locale]`

**Cons:**
- Cannot pre-generate specific dynamic segments (like `[id]`) at build time

### Option 2: Server Component Wrapper (For specific dynamic routes)
Create a server component wrapper that exports `generateStaticParams` and wraps the client component.

**Example for `[id]` routes:**
```typescript
// page.tsx (Server Component)
import { i18n } from "@/i18n/i18n-config";
import ClientComponent from "./client-component";

export async function generateStaticParams() {
  // For locale
  const locales = i18n.locales.map((locale) => ({ locale }));
  
  // For dynamic [id] - return empty array for client-side routing
  // Or fetch all IDs if you have access to database at build time
  return locales.map(locale => ({ locale, id: '' }));
}

export default function Page({ params }: { params: Promise<{ locale: string; id: string }> }) {
  return <ClientComponent params={params} />;
}
```

### Option 3: Export dynamicParams (Allow runtime params)
Add this to allow dynamic params at runtime:

```typescript
export const dynamicParams = true; // Allow params not generated at build time
```

## Current Dashboard Setup

**Status:** ✅ Working
- `[locale]/layout.tsx` has `generateStaticParams` for locale
- All dashboard pages are client components (no `generateStaticParams` needed)
- Dynamic routes like `[id]` will be handled client-side

**For `[id]` routes specifically:**
If you need to pre-generate specific blog/project IDs, you would need to:
1. Create a server component wrapper
2. OR use `export const dynamicParams = true` 
3. OR return empty array and handle client-side

## Recommendation

For dashboard routes behind authentication, **Option 1 (current setup)** is best because:
- Routes are dynamically created based on user content
- Authentication is required, so pre-generating all IDs isn't practical
- Parent layout handles locale, child routes handle their own logic client-side

If you need fully static pages, consider making them server components where possible.


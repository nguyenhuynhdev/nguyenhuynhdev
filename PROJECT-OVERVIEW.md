# Project Overview: nguyenhuynhdev

## 🎯 Project Type
**Portfolio/Personal Website** - A multilingual (English/Vietnamese) portfolio website for Nguyen Huynh, a freelance developer.

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 15.5.4 (App Router)
- **React**: 19.2.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (New York style)
- **Theme**: next-themes (Dark/Light mode)
- **Icons**: Lucide React
- **State Management**: TanStack Query (React Query)
- **Deployment**: Cloudflare Pages (Static Export)
- **Database**: Cloudflare D1 (SQLite)
- **API**: Cloudflare Pages Functions
- **Firebase**: Integrated (Firestore, Storage, Auth, Analytics)

### Build Configuration
- **Export Mode**: Static export (`output: 'export'`)
- **Trailing Slash**: Enabled
- **Build Output**: `./out` directory
- **Deployment**: `wrangler pages deploy out`

## 🌐 Internationalization (i18n)

### Supported Locales
- **Default**: Vietnamese (vi)
- **Locales**: English (en), Vietnamese (vi)

### i18n Implementation
- **Locale Detection**: Middleware-based with Negotiator
- **Routing**: `/[locale]/*` structure
- **Translation Files**: JSON files in `src/i18n/messages/`
- **Static Generation**: All locales pre-rendered at build time
- **Dictionary System**: Server-only dictionary loader

### Routes Structure
```
/[locale]              → Home page (Hero, Services, Tools, Footer)
/[locale]/works        → Portfolio/Works page
/[locale]/blog         → Blog page
```

## 📁 Project Structure

```
src/
├── app/
│   ├── [locale]/          # Localized routes
│   │   ├── page.tsx       # Home page
│   │   ├── blog/          # Blog page
│   │   ├── works/         # Works/Portfolio page
│   │   └── components/    # Page-specific components
│   ├── layout.tsx         # Root layout
│   ├── providers.tsx      # Theme & Query providers
│   └── globals.css        # Global styles
├── components/
│   ├── backgrounds/       # Animated background component
│   ├── layouts/          # Navigation bar
│   ├── ui/               # shadcn/ui components
│   └── [theme, logo, etc] # Shared components
├── i18n/
│   ├── messages/         # Translation JSON files
│   ├── i18n-config.ts    # Locale configuration
│   └── get-dictionary.ts # Dictionary loader
├── lib/
│   ├── firebase.ts       # Firebase configuration
│   ├── utils.ts          # Utility functions
│   └── logger.ts         # Logging utility
├── hooks/
│   └── use-breakpoint.ts # Responsive breakpoint hook
├── constants/
│   ├── routes.ts         # Route constants
│   └── links.ts          # External links
└── middleware.ts         # Next.js middleware (locale detection)
```

## 🎨 Design System

### Theme
- **Provider**: next-themes
- **Default**: Dark mode
- **System**: Respects system preference
- **Storage**: localStorage
- **CSS Variables**: Custom color system with oklch colors

### UI Components (shadcn/ui)
- Avatar, Badge, Button, Card, Carousel
- Checkbox, Dialog, Dropdown Menu
- Input, Label, Navigation Menu
- Popover, Select, Separator
- Sheet, Switch, Textarea
- Toast (Sonner), Tooltip, Toggle

### Styling
- **Tailwind**: v4 with PostCSS
- **Animations**: tailwindcss-animate, tw-animate-css
- **Custom Breakpoints**: mobile, tablet, laptop, desktop
- **Font**: Roboto (Google Fonts)

## 🔌 API & Backend

### Cloudflare Pages Functions
Located in `functions/` directory:
- `posts.ts` - Get all posts
- `post.ts` - Get single post by slug
- `projects.ts` - Get all projects

### Database
- **Type**: Cloudflare D1 (SQLite)
- **Binding**: `DB`
- **Database ID**: `442877c2-6dc7-4fbf-bc10-5b6c1d189259`
- **Configuration**: `wrangler.jsonc`

### Firebase Integration
- **Firestore**: Database
- **Storage**: File storage
- **Auth**: Authentication
- **Analytics**: Analytics tracking
- **Configuration**: Environment variables required

## 📱 Features

### Main Features
1. **Multilingual Support**: English & Vietnamese
2. **Responsive Design**: Mobile-first, breakpoint-based
3. **Dark/Light Mode**: Theme switching with system detection
4. **Portfolio Showcase**: Works/Projects display
5. **Blog Section**: Blog posts display
6. **Services Section**: Service offerings display
7. **Tools Section**: Technologies and tools used
8. **Animated Background**: Theme-aware animated background
9. **Search Functionality**: Search input component
10. **Locale Switcher**: Language toggle component

### Page Sections (Home)
- **Hero Section**: Introduction, welcome message, CTA buttons
- **Services Section**: Mobile, Web, Desktop, Database services
- **Tools Section**: IDEs, Version Control, UI/UX, Cloud/DevOps
- **Footer Section**: Quick links, contact info, copyright

## 🛠️ Development

### Scripts
```bash
npm run dev      # Development server (Turbopack)
npm run build    # Production build (Static export)
npm run start    # Start production server
npm run deploy   # Build + Deploy to Cloudflare Pages
```

### Environment Variables Needed
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
```

## 📊 Content Structure

### Translation Keys
- `nav` - Navigation items
- `hero` - Hero section content
- `services` - Services section
- `tools` - Tools/Technologies section
- `works` - Portfolio/Works section
- `blog` - Blog section
- `footer` - Footer section
- `Meta` - SEO metadata

### Content Pages
1. **Home** (`/` or `/vi` or `/en`): Hero + Services + Tools + Footer
2. **Works** (`/works` or `/vi/works` or `/en/works`): Portfolio showcase
3. **Blog** (`/blog` or `/vi/blog` or `/en/blog`): Blog posts listing

## 🔄 Routing & Middleware

### Middleware Behavior
- **Locale Detection**: Automatic based on Accept-Language header
- **Redirects**: Non-localized routes → `/locale/path`
- **Exclusions**: `/api/*`, `/_next/*`, static files (`.ico`, `.png`, etc.)
- **Static Export**: Middleware runs at build time for static generation

### URL Structure
```
/              → Redirects to /vi or /en (based on browser)
/vi            → Vietnamese home
/en            → English home
/vi/works      → Vietnamese works page
/en/works      → English works page
/vi/blog       → Vietnamese blog page
/en/blog       → English blog page
```

## 🎯 Key Components

### Layout Components
- **NavigationBar**: Responsive nav (Desktop/Laptop/Tablet/Mobile variants)
- **Background**: Theme-aware animated background
- **LocaleLayout**: Wrapper for localized pages

### Feature Components
- **HeroSection**: Welcome/intro section
- **ServicesSection**: Service cards
- **ToolsSection**: Technology showcase
- **WorksSection**: Portfolio grid
- **BlogSection**: Blog posts grid
- **FooterSection**: Footer with links

### UI Components
- **ThemeSwitcher**: Dark/Light mode toggle
- **LocaleSwitcher**: Language switcher
- **SearchInput**: Search functionality
- **Logo**: Brand logo component

## 📦 Dependencies

### Core
- Next.js 15.5.4 (App Router)
- React 19.2.0
- TypeScript 5

### UI & Styling
- Tailwind CSS v4
- shadcn/ui components (Radix UI based)
- next-themes
- Lucide React icons

### Data & State
- TanStack Query
- Firebase SDK

### i18n
- @formatjs/intl-localematcher
- Negotiator

### Deployment
- Wrangler (Cloudflare)

## 🚀 Deployment

### Cloudflare Pages
1. Build: `npm run build` → outputs to `out/`
2. Deploy: `npx wrangler pages deploy out`
3. Functions: Cloudflare Pages Functions in `functions/`
4. Database: Cloudflare D1 binding configured

### Static Export Considerations
- All pages pre-rendered at build time
- Client-side routing after initial load
- API calls to Cloudflare Functions (edge runtime)
- No server-side rendering at runtime

## 📝 Notes

- **Dashboard**: Previously had dashboard functionality, but files have been removed
- **Firebase**: Configured but may not be actively used in current version
- **D1 Database**: Configured with existing functions (posts, projects)
- **Theme**: Dark mode default, supports system preference
- **Responsive**: Breakpoint-based responsive design (mobile/tablet/laptop/desktop)


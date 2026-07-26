# Project Overview
- Project name: Kliko / Crypto Snake Web repository.
- Purpose: Maintain a standalone local-services marketplace app named Kliko while preserving the older Crypto Snake browser game and the archived Servigo WordPress kit.
- Main objectives: Build Kliko as a location-first P2P classified-services marketplace; keep the old snake game available for later work; avoid WordPress for Kliko.
- Target users: Service seekers, private service providers, professional service providers, and future admins for Kliko; arcade players for Crypto Snake.
- Current development stage: Frontend prototype with mock data.
- Current project status: Kliko is the active product work. The current version with the approved homepage, service/profession-first home search, compact global search on internal pages, smart listing filter suggestions, request attachments, provider-focused request review context, richer listing results, stronger listing detail, public provider profile controls, richer mock dashboards, GitHub Pages preview, and mobile app-style responsive polish has been advanced to the pre-backend boundary. It is prepared for GitHub Pages as a static subsite under `/kliko/`, preserving the existing Crypto Snake GitHub Pages root. The earlier approved homepage snapshot is saved as `backups/kliko-approved-version-20260726-0235/`; the pre-backend work started from `backups/kliko-before-pre-backend-marketplace-20260726/`; the GitHub Pages prep started from `backups/kliko-before-github-pages-20260726/`; the mobile polish started from `backups/kliko-before-mobile-app-polish-20260726/`; the service-first search work started from `backups/kliko-before-service-first-home-search-20260726/`; the global internal search work started from `backups/kliko-before-global-page-search-20260726/`; the listing filter smart search work started from `backups/kliko-before-listing-filter-smart-search-20260726/`. Separate Desktop folders now exist for individual work: `/Users/ivangomes/Desktop/Kliko` for the Kliko React app and `/Users/ivangomes/Desktop/Crypto-Snake` for the Crypto Snake HTML/JS/CSS game. The old mixed root remains as workspace/archive/history.

# Product Scope
- Core functionality: Browse/search service listings, browse category/subcategory/specialty taxonomy, create mock quote requests, review/confirm requests, view mock dashboards, create mock provider listings, and switch language/theme/location.
- Features already implemented:
  - Kliko Vite/React app with routes, shared layout, homepage, listing cards, request flow, dashboards, provider create-listing flow, multilingual i18n, mock marketplace data, localStorage drafts/submissions, and light/dark/system theme controls.
  - Crypto Snake browser game in root `index.html`, `app.js`, `style.css` with menu, profile, worlds, ranking, options, audio/image settings, modes, and local progress.
  - WordPress/Astra Servigo kit archived under `servigo-wordpress-archive/`.
- Features in progress:
  - Kliko marketplace flow after the approved homepage: service/profession-first home search, cleaner listing result cards, sortable listing results, stronger listing detail pages, visible quote context in the request review step, provider listing creation with a public preview, and frontend-only request attachments.
  - Provider listing model evolution now includes public display mode, username, profile photo metadata, optional age display, optional phone visibility, locality, and service descriptions in the create-listing mock form.
  - Dashboards now expose richer frontend-only operational summaries for client activity, provider daily priorities, and admin category/profession proposal review.
- Planned features:
  - Backend persistence, real notifications, provider inboxes, admin review of proposed categories/professions, authentication, real verification workflows, deployment.
  - Future continuation of Crypto Snake and a separate spaceship game project mentioned by the user but not present in this repository.
- Explicitly excluded or deferred scope:
  - No WordPress, Astra, PHP, XML imports, plugins, backend, database, authentication, or external CMS for Kliko at this stage.

# Architecture
- High-level architecture:
  - Root: static JavaScript/CSS/HTML Crypto Snake game.
  - `servigo-app/`: standalone Vite + React + TypeScript single-page app for Kliko.
  - `servigo-wordpress-archive/`: archived design/prototype material only.
- Main modules and responsibilities:
  - `servigo-app/src/routes/`: React Router route definitions.
  - `servigo-app/src/components/`: shared UI components including layout, homepage, listing cards, request assistant, badges, timelines.
  - `servigo-app/src/pages/`: route-level pages for marketplace browsing, listings, requests, dashboards, rules, provider creation, etc.
  - `servigo-app/src/data/`: mock categories, listings, locations, request drafts, workflow data, pricing/estimate helpers, quote context helpers.
  - `servigo-app/src/i18n/`: centralized translations, language context, fallback hydration.
  - `servigo-app/src/types/`: shared TypeScript domain types.
  - Root `app.js`: canvas game logic and state for Crypto Snake.
- Data flow:
  - Kliko uses frontend mock arrays and localStorage. Listing/category context can create a quote request draft, which flows through `/request/review` and `/request/confirmation`.
  - Location is stored in localStorage and may be set from browser geolocation or manual country selection.
  - Language and theme preferences are stored in localStorage. Manual country selection can also update the interface language through `src/i18n/countryLanguage.ts`, falling back to English when a country language is not supported.
  - Crypto Snake stores progress/settings/rankings in localStorage.
- External services:
  - Browser geolocation only. No network API, backend, database, payment, notification, or auth service is wired.
- Important architectural constraints:
  - Kliko must remain frontend-only until backend work is explicitly started.
  - All visible Kliko UI text should go through `t("key")`; avoid hardcoded visible component text.
  - Preserve the old WordPress kit as archive and do not resume WordPress architecture.
  - Preserve old snake-game files unless the user explicitly asks to work on that game.

# Technology Stack
- Languages: TypeScript, React JSX/TSX, JavaScript, HTML, CSS.
- Frameworks: Vite, React, React Router.
- Libraries: `react`, `react-dom`, `react-router-dom`.
- Database: None.
- Build tools: Vite, TypeScript compiler, pnpm lockfile.
- Testing tools: No test framework configured. Validation currently uses `npm run build` / `pnpm run build`.
- Deployment and infrastructure: No deployment configured. Vite dev server runs locally at `http://127.0.0.1:5173/`.

# Repository Structure
- `index.html`: Root Crypto Snake HTML shell.
- `app.js`: Root Crypto Snake game logic.
- `style.css`: Root Crypto Snake styling.
- `assets/`: Crypto Snake images/audio/menu assets.
- `backups/`: Older Crypto Snake backups.
- `progress.default.json`: Default progress data for the game.
- `apply_v59.sh`: Script present in the root; not inspected deeply yet.
- `servigo-app/`: Main source tree for the Kliko standalone React app.
- `servigo-app/README.md`: Current Kliko project description, routes, model, and local commands.
- `servigo-app/src/`: Kliko source.
- `servigo-app/dist/`: Built output; generated and ignored by `.gitignore`.
- `servigo-app/node_modules/`: Installed dependencies; generated and ignored by `.gitignore`.
- `servigo-wordpress-archive/`: Archived WordPress/Astra Servigo site kit kept for reference only.
- `.pnpm-store/`: Local pnpm store; ignored.
- `.gitignore`: Ignores macOS files, pnpm store, `node_modules/`, and `dist/`.
- `PROJECT_CONTEXT.md`: Persistent AI project memory.
- `CHANGELOG_AI.md`: Append-only AI development changelog.

# Features
## Kliko Marketplace Taxonomy
- Description: Category -> subcategory -> specialty -> service listing model for P2P services.
- Status: In Progress.
- Main related files: `servigo-app/src/data/marketplaceData.ts`, `servigo-app/src/types/servigo.ts`, category pages.
- Dependencies: React Router, mock data.
- Known limitations: Data is mock; extended-language category/listing labels may fall back to English.

## Kliko Homepage Search
- Description: Google-like search-first homepage with a centered "what are you looking for" question, large search bar, service/profession-first instant suggestions from the first typed letters, category shortcuts lower on the page, and short featured/suggested listing cards that link to full details. Searches such as `p`, `pintor`, `limpeza`, or `limpesa` should suggest concrete services/specialties/providers before showing broad parent categories.
- Status: Approved Baseline With Service-First Search And Mobile Polish.
- Main related files: `servigo-app/src/components/LandingPage.tsx`, `servigo-app/src/components/ListingCard.tsx`, `servigo-app/src/styles/global.css`.
- Dependencies: `searchServiceMatches`, `searchListings`, localStorage location.
- Known limitations: Search ranking is simple token/alias matching; no backend index.

## Kliko Global Internal Search
- Description: All internal pages except the homepage include a compact sticky search bar below the header with a magnifying-glass affordance. It reuses service/profession-first matching and routes users to `/listings` with the best category/subcategory/specialty/location filters.
- Status: In Progress.
- Main related files: `servigo-app/src/components/GlobalSearchBar.tsx`, `servigo-app/src/components/Layout.tsx`, `ListingsPage.tsx`, `global.css`.
- Dependencies: React Router, `searchServiceMatches`, stored location.
- Known limitations: The global search is frontend-only and uses mock service data.

## Kliko Mobile Experience
- Description: Mobile screens use an app-like layer with compact sticky header, bottom navigation for search/categories/listings/publish, centered search first screen, horizontally scrollable quick categories, and compact horizontal homepage listing cards.
- Status: In Progress.
- Main related files: `servigo-app/src/components/Layout.tsx`, `servigo-app/src/styles/global.css`, `LandingPage.tsx`, `ListingCard.tsx`.
- Dependencies: Existing React Router navigation and i18n labels.
- Known limitations: Mobile polish has been build-validated but should still be visually reviewed on real phones for taste and thumb ergonomics.

## Kliko Listing Results And Details
- Description: Service listings can be filtered, sorted, ranked by proximity/relevance, opened, and used to start quote requests. The listing filter search now uses the same service/profession-first suggestions as the homepage and narrows the category dropdown to relevant categories while a query is active. The filter panel includes a primary `Kliko` apply/search button and a secondary reset action so the UI does not look like reset is the only available action. On desktop, the filters and results columns scroll independently; on mobile, listing filters/results remain in one normal vertical page flow. Result cards emphasize a compact visual/avatar, provider, location, rating, price, and direct quote action; detail pages use a stronger hero/action card plus a provider profile strip, trust metrics, fit reasons, and next-step guidance before full information.
- Status: In Progress.
- Main related files: `servigo-app/src/pages/ListingsPage.tsx`, `ListingDetailPage.tsx`, `ListingCard.tsx`, `marketplaceData.ts`, `quoteRequestContext.ts`.
- Dependencies: React Router, mock locations/listings.
- Known limitations: No real contact, messaging, booking, or provider availability.

## Kliko Request Assistant And Review Flow
- Description: Guided frontend-only request draft, review, validation, confirmation, structured brief, estimate, suggested providers, frontend-only attachments, and visible quote/listing context when a request starts from marketplace browsing. On `/request/review`, listing-origin requests should highlight the selected provider with avatar/photo first, with the requested service shown as secondary context.
- Status: In Progress.
- Main related files: `RequestAssistant.tsx`, `RequestReviewPage.tsx`, `RequestConfirmationPage.tsx`, `requestDraft.ts`, `requestOptions.ts`.
- Dependencies: localStorage, mock service categories/providers.
- Known limitations: Mock submission only; attachments store metadata locally, not real files; no backend persistence or notification.

## Kliko Provider Create Listing
- Description: Mock provider listing form with professional/private distinction, residence country, service areas, foreign coverage, category search, price model, languages, verification files for professionals, proposed profession flow, public profile controls, and a live preview of the public listing card.
- Status: In Progress.
- Main related files: `ProviderCreateListingPage.tsx`, `euCoverageOptions.ts`, `phoneDialingCodes.ts`, `marketplaceData.ts`.
- Dependencies: mock country/area lists, i18n.
- Known limitations: File uploads remain local input state; no persistence, moderation, or real admin workflow.

## Kliko Multilingual UI
- Description: Supported languages are French, Portuguese, English, Luxembourgish, German, Spanish, and Italian. Header country selection can automatically switch to the matching supported language; unsupported country languages fall back to English.
- Status: In Progress.
- Main related files: `translations.ts`, `LanguageContext.tsx`, `useTranslation.ts`, `localeFallbacks.ts`, `countryLanguage.ts`.
- Dependencies: localStorage.
- Known limitations: Core UI translated; some mock data uses fallback values.

## Kliko Theme Modes
- Description: Day, Night, and System modes are controlled inside the hamburger menu; light is the default for new users.
- Status: In Progress.
- Main related files: `Layout.tsx`, `global.css`, `translations.ts`.
- Dependencies: localStorage, `prefers-color-scheme`.
- Known limitations: Visual QA still depends on manual review.

## Crypto Snake Game
- Description: Browser canvas snake game with neon worlds, modes, audio/image options, ranking, profile, and local progress.
- Status: Paused.
- Main related files: root `index.html`, `app.js`, `style.css`, `assets/`, `progress.default.json`.
- Dependencies: Browser canvas and localStorage.
- Known limitations: Not currently the active work; code is plain JS and not modularized.

## WordPress Archive
- Description: Archived Servigo WordPress/Astra kit with useful design/prototype material.
- Status: Deprecated for active development.
- Main related files: `servigo-wordpress-archive/servigo-site-kit/`.
- Dependencies: None for current app.
- Known limitations: Must not be used as active architecture.

# Technical Decisions
## 2026-07-25 — Kliko is standalone, not WordPress
- Decision: Continue Kliko as Vite + React + TypeScript, no WordPress.
- Reason: User explicitly changed direction away from Astra/PHP/plugins; standalone app is easier to evolve into a real marketplace.
- Alternatives considered: Continue WordPress kit.
- Consequences: WordPress material remains archived only; active app uses mock frontend data until backend work begins.

## 2026-07-25 — Visible brand is Kliko; legacy internal folder may remain `servigo-app`
- Decision: Use central brand config for visible product name instead of risky global renaming.
- Reason: Safer transition from Servigo to Kliko while preserving working code.
- Alternatives considered: Full global rename.
- Consequences: Some internal paths/package name still say Servigo; visible app shows Kliko.

## 2026-07-25 — Marketplace structure is category-first with custom request fallback
- Decision: Kliko should behave like structured classified services: category -> subcategory -> specialty -> listing, with free-text request as fallback.
- Reason: User wants less cleaning-first and less quote-assistant-only; goal is more practical than Joblin-like simple request flow.
- Alternatives considered: Pure request assistant flow.
- Consequences: Homepage and routes prioritize search/browse/listings, while assistant remains secondary.

## 2026-07-25 — Frontend-only mock state
- Decision: Use mock arrays and localStorage for drafts, submissions, preferences, and location.
- Reason: MVP should avoid backend/database/auth until product shape is clearer.
- Alternatives considered: Add backend immediately.
- Consequences: No real persistence across devices, no real notifications, no real uploads, no auth.

## 2026-07-25 — Multilingual without heavy library
- Decision: Use custom `t("key")`, LanguageContext, translations object, and fallback hydration instead of an i18n package.
- Reason: Lightweight and easy to edit manually.
- Alternatives considered: Add i18next or similar.
- Consequences: More manual maintenance; all new visible text must be added to translation files.

## 2026-07-25 — Active clean copy exists outside repository
- Decision: Copy `servigo-app/` to `/Users/ivangomes/Desktop/Kliko` for a clean project folder separate from Crypto Snake.
- Reason: User wants Kliko separated from the snake-game folder.
- Alternatives considered: Continue only inside `Crypto-snake-web/servigo-app`.
- Consequences: Source of truth must be handled carefully until the workspace root changes to `/Users/ivangomes/Desktop/Kliko`.

## 2026-07-26 — Separate Kliko and Crypto Snake folders
- Decision: Maintain `/Users/ivangomes/Desktop/Kliko` for Kliko and `/Users/ivangomes/Desktop/Crypto-Snake` for the game.
- Reason: User wants to work on each project individually without mixing files or context.
- Alternatives considered: Keep using the mixed `Crypto-snake-web` root.
- Consequences: Future work should prefer the dedicated folder for the active project. The old mixed folder should be treated as archive/history unless explicitly needed.

## 2026-07-25 — Persistent project memory files
- Decision: Add `PROJECT_CONTEXT.md` and `CHANGELOG_AI.md` at repository root and update them after meaningful work.
- Reason: User requested durable context because project spans multiple sessions and multiple products.
- Alternatives considered: Rely on conversation history only.
- Consequences: Future meaningful changes must include documentation sync before the task is considered complete.

# Coding Standards
- Naming conventions: React components and pages use PascalCase; helper functions use camelCase; route paths use kebab-case where relevant.
- Code style: TypeScript strict mode in Kliko; functional React components; CSS in `global.css`; no heavy abstractions unless needed.
- Folder conventions: Components in `src/components`, routes in `src/routes`, pages in `src/pages`, mock data/helpers in `src/data`, i18n in `src/i18n`, types in `src/types`.
- Error handling: Frontend helpers generally use safe fallbacks for localStorage parsing and missing data.
- Logging: No structured logging configured.
- Testing expectations: Run `npm run build` from `servigo-app/` or `/Users/ivangomes/Desktop/Kliko` after meaningful app changes.
- Security expectations: Do not store secrets in repository or memory files; file uploads are prototype-only; no real auth/permissions yet.
- Project-specific rules:
  - Do not copy Joblin or other competitors' proprietary text/design/structure.
  - Do not hardcode new visible Kliko UI text directly in components.
  - Keep Kliko frontend-only until explicitly requested.
  - Preserve unrelated user changes and old game code.
  - Update `PROJECT_CONTEXT.md` and `CHANGELOG_AI.md` after meaningful changes.

# Configuration
- Required configuration: None for the current frontend prototypes.
- Environment variables: None currently required.
- Local setup for Kliko:
  - `cd servigo-app`
  - `npm install`
  - `npm run dev`
- Build command: `npm run build`.
- GitHub Pages build command for Kliko: `npm run build:github-pages` from `servigo-app/`, generating root `kliko/`.
- Test command: No test suite configured; use build as validation.
- Run command: `npm run dev`, served at `http://127.0.0.1:5173/`.
- Deployment notes: Existing GitHub Pages root continues to serve Crypto Snake. Kliko is generated into root `kliko/` and is expected at `https://scalifornia.github.io/crypto-snake-web/kliko/` after commit/push. Online Kliko uses hash routing for static-host compatibility; local dev keeps BrowserRouter.

# Dependencies
- `react`: UI framework for Kliko.
- `react-dom`: React DOM rendering.
- `react-router-dom`: Client-side routes for Kliko.
- `vite`: Local dev server and production build.
- `typescript`: Static type checking.
- `@vitejs/plugin-react`: React support for Vite.
- `@types/react`, `@types/react-dom`, `@types/node`: Type definitions.
- Root Crypto Snake has no package manifest and uses plain browser APIs.

# Current Work
- Current objective: Preserve the approved Kliko snapshot and use the separated project folders for future work.
- Work in progress: Marketplace follow-through has reached a practical frontend-only pre-backend boundary and is now prepared for GitHub Pages sharing: category-first home search, sortable listing results, listing details, provider publishing, request context, request attachments, richer mock dashboards, richer taxonomy/profession coverage, and a generated static `kliko/` folder. Future Kliko work should happen in `/Users/ivangomes/Desktop/Kliko`; future Crypto Snake work should happen in `/Users/ivangomes/Desktop/Crypto-Snake`.
- Immediate next steps:
  - Review category-first home search and request attachment flow visually in the browser.
  - Review listing results, listing detail, provider create-listing, request review, and dashboards visually in the browser.
  - Commit and push the generated `kliko/` GitHub Pages build if the user approves publishing.
  - Test the quote path from a listing card to `/request/review`.
  - Decide the first backend slice: requests/listings persistence, provider accounts, or file uploads.
  - Decide when to switch the active Codex workspace to `/Users/ivangomes/Desktop/Kliko`.
- Blockers: None for frontend mock work.
- Open questions:
  - Should `/Users/ivangomes/Desktop/Kliko` become the only active project root?
  - What exact provider profile visibility controls should be implemented first?
- Risks:
  - Two copies (`servigo-app/` and `/Users/ivangomes/Desktop/Kliko`) can drift if not synchronized.
  - No automated tests beyond TypeScript/build.
  - Extended-language translations may be incomplete in mock data.

# Prioritized TODO
- P0 — Use the correct separated folder before making changes: `/Users/ivangomes/Desktop/Kliko` for Kliko and `/Users/ivangomes/Desktop/Crypto-Snake` for Crypto Snake.
- P1 — Preserve the approved homepage baseline unless the user asks for a specific homepage change.
- P1 — Keep home search category-first before showing service/provider details.
- P1 — Treat request attachments as frontend-only metadata until backend work starts.
- P1 — Review provider/listing public profile controls visually and refine copy/spacing if needed.
- P1 — Visually QA marketplace follow-through pages after the latest listing/result/request-context pass.
- P1 — Keep i18n synchronized for every new visible UI string.
- P2 — Convert mock admin review of proposed professions/categories into backend-backed workflow when backend begins.
- P2 — Add real provider inbox/notification concepts once backend begins.
- P2 — Add automated tests or lightweight smoke checks.
- P3 — Clean up legacy internal Servigo naming when safe.
- P3 — Resume Crypto Snake later as a separate workstream.

# Known Issues
## Duplicate active app locations
- Description: Kliko exists in both `servigo-app/` and `/Users/ivangomes/Desktop/Kliko`.
- Impact: Changes can diverge.
- Status: Open.
- Workaround: Edit `servigo-app/` in this workspace, then sync with `ditto` to `/Users/ivangomes/Desktop/Kliko` until workspace changes.
- Relevant files: `servigo-app/`, external `/Users/ivangomes/Desktop/Kliko`.

## No backend persistence
- Description: Requests, listings, uploads, and dashboard data are frontend-only mock/localStorage.
- Impact: Not production-ready.
- Status: Expected limitation.
- Workaround: Keep clear prototype labels and do not promise real delivery.
- Relevant files: `servigo-app/src/data/`.

## No test suite
- Description: There are no unit, integration, or browser tests configured.
- Impact: Visual and workflow regressions rely on manual checks and TypeScript build.
- Status: Open.
- Workaround: Run `npm run build` after meaningful changes.
- Relevant files: `servigo-app/package.json`.

## Incomplete extended-language data translations
- Description: Core UI supports seven languages, but mock category/listing data may fall back to English.
- Impact: Some views may not feel fully localized.
- Status: Open.
- Workaround: `localeFallbacks.ts` hydrates missing localized data keys.
- Relevant files: `servigo-app/src/i18n/localeFallbacks.ts`, `servigo-app/src/data/marketplaceData.ts`.

# Lessons Learned
- Keep Kliko separate from the WordPress kit; archived WordPress assets can inspire but must not define the architecture.
- User prefers simple, practical UI with minimal noise and strong search-first entry.
- Light/day mode should be the default; dark mode should be explicit or system-selected.
- User needs non-technical explanations and step-by-step instructions for any manual Mac/project tasks.
- For major multi-session projects, repository memory files are now part of the definition of done.

# Last Updated
- 2026-07-26 00:01 CEST — Simplified homepage listing cards into compact clickable announcement cards.
- 2026-07-25 23:28 CEST — Added a brighter Kliko visual direction with stronger logo/search styling and more human homepage listing cards.
- 2026-07-25 23:18 CEST — Refined Kliko homepage toward a Google-like centered search entry and moved theme controls into the hamburger menu.
- 2026-07-25 22:57 CEST — Created persistent project context after inspecting root game files, Kliko app files, configuration, routes, data model, i18n, and README.

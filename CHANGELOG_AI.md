# AI Development Changelog

This file is an append-only chronological record of meaningful work performed by AI assistants on this project.

## 2026-07-26 04:47 — Make homepage search service-first

### Objective
Make the homepage search feel practical for normal users: typing `p`, `pintor`, `limpeza`, or similar should suggest concrete services/professions before broad parent categories.

### Backup
- Created a pre-change backup at `backups/kliko-before-service-first-home-search-20260726/`.

### Work Completed
- Added a service/profession search model that scans subcategories, specialties, listings, provider names, service titles, descriptions, and practical aliases.
- Updated the homepage search suggestions to show services/specialties/providers with listing counts and examples.
- Changed homepage search submit behavior so it navigates to listing results prefiltered by category, subcategory, and specialty when a concrete match exists.
- Added Painting/Pintura as a proper subcategory under Home and Repairs, including painting specialties.
- Added a mock painter listing so searches like `pintor` lead to a useful result.
- Added aliases for common natural terms and typos such as `pintor`, `painter`, `peintre`, `limpesa`, and service-specific phrases.
- Updated translated homepage search placeholder and suggestion labels in all supported UI languages.

### Files Changed
- `servigo-app/src/data/marketplaceData.ts`
  - Added painting taxonomy/listing data and `searchServiceMatches`.
- `servigo-app/src/components/LandingPage.tsx`
  - Replaced category-first suggestions with service/profession-first suggestions.
- `servigo-app/src/i18n/translations.ts`
  - Updated homepage search text and added service suggestion labels.
- `servigo-app/README.md`
  - Documented the service/profession-first homepage search direction.
- `PROJECT_CONTEXT.md`
  - Updated current status and homepage search feature notes.
- `CHANGELOG_AI.md`
  - Added this changelog entry.

### Validation
- Ran `pnpm run build` in `servigo-app/`; TypeScript and Vite production build passed.
- Ran `pnpm run build:github-pages` in `servigo-app/`; static GitHub Pages output was generated in `kliko/`.

### Risks or Known Limitations
- Search is still frontend-only and based on simple aliases/tokens. A backend search index will eventually be needed for a full marketplace.

## 2026-07-26 04:32 — Improve Kliko mobile app layout

### Objective
Make Kliko feel better on phones without changing the approved desktop homepage.

### Backup
- Created a pre-change backup at `backups/kliko-before-mobile-app-polish-20260726/`.

### Work Completed
- Added a mobile-only bottom navigation for the main actions: search, categories, listings, and publish.
- Kept the desktop header and homepage structure intact.
- Improved small-screen header spacing, menu behavior, and safe-area padding.
- Tuned the homepage first screen for mobile with a centered search experience, shorter vertical rhythm, and better touch targets.
- Changed quick categories on mobile into a horizontal scroll strip.
- Changed homepage listing cards on mobile into compact horizontal cards with snap scrolling.
- Added mobile-safe spacing so the fixed bottom navigation does not cover page content or footer links.

### Files Changed
- `servigo-app/src/components/Layout.tsx`
  - Added mobile-only route navigation using existing translated navigation labels.
- `servigo-app/src/styles/global.css`
  - Added mobile responsive rules for header, homepage search, category shortcuts, listing cards, bottom navigation, page spacing, and footer padding.
- `servigo-app/README.md`
  - Documented the mobile app-style responsive layer.
- `PROJECT_CONTEXT.md`
  - Updated current status and added a mobile experience feature note.
- `CHANGELOG_AI.md`
  - Added this changelog entry.

### Validation
- Ran `pnpm run build` in `servigo-app/`; TypeScript and Vite production build passed.
- Ran `pnpm run build:github-pages` in `servigo-app/`; static GitHub Pages output was generated in `kliko/`.

### Risks or Known Limitations
- Real-device visual review is still recommended because phone browsers vary in toolbar height, safe-area behavior, and font rendering.

## 2026-07-25 22:57 — Add persistent project memory files

### Objective
Create persistent repository memory so future AI work starts with current project context, recent changes, known decisions, risks, and next steps.

### Work Completed
- Inspected the repository structure.
- Read the root Crypto Snake HTML, JavaScript, CSS, and ignore configuration.
- Read the Kliko app README, dependency manifest, Vite config, TypeScript config, routes, domain types, layout, homepage, listing card, marketplace data, location data, quote context, request draft logic, provider create-listing flow, i18n files, and brand config.
- Created `PROJECT_CONTEXT.md` with the current verified state, architecture, product scope, features, decisions, standards, configuration, dependencies, current work, TODOs, issues, and lessons.
- Created this append-only `CHANGELOG_AI.md`.

### Files Changed
- `PROJECT_CONTEXT.md`
  - Added persistent project overview, architecture, features, decisions, standards, configuration, risks, and next steps.
- `CHANGELOG_AI.md`
  - Added initial AI changelog entry and format for future meaningful work.

### Technical Decisions
- Decision: Treat `PROJECT_CONTEXT.md` and `CHANGELOG_AI.md` as part of the definition of done for future meaningful changes.
- Reason: The project spans multiple sessions and multiple products, and the user requested durable context.
- Consequences: Future meaningful changes should update project context when state changes and append a changelog entry automatically.

### Validation
- Verified relevant repository files by reading them directly.
- No build or automated tests were run because only documentation files were created.

### Risks or Known Limitations
- The repository contains both the old root Crypto Snake game and the Kliko app under `servigo-app/`; a clean copy also exists outside this repo at `/Users/ivangomes/Desktop/Kliko`, so future sync must be handled carefully.
- Repository inspection focused on main files and important app modules, not every generated dependency file or every backup file.

### Remaining Work
- Continue homepage refinement for Kliko.
- Keep these memory files synchronized after meaningful changes.
- Consider switching the active workspace root to `/Users/ivangomes/Desktop/Kliko` to avoid two-copy drift.

### Context Update
- Created all sections of `PROJECT_CONTEXT.md`.

## 2026-07-25 23:18 — Refine Kliko homepage search entry

### Objective
Make the Kliko homepage feel more like a simple search engine entry point: centered, direct, and focused on finding a service quickly.

### Work Completed
- Changed the homepage first screen to show a large translated search question above the central search bar.
- Added instant profession suggestions that appear as soon as the user types, using the existing multilingual profession options.
- Kept category shortcuts, provider CTA, and featured/suggested listings lower on the page so the first screen stays cleaner.
- Moved Day, Night, and System display mode controls from the top header into the hamburger menu.
- Updated the README and project memory to document the new homepage direction.

### Files Changed
- `servigo-app/src/components/LandingPage.tsx`
  - Reworked homepage structure, added profession suggestion matching, and routed suggestion clicks to listing results.
- `servigo-app/src/components/Layout.tsx`
  - Moved theme controls into the hamburger menu.
- `servigo-app/src/styles/global.css`
  - Updated homepage spacing, central search styling, instant suggestion dropdown, and hamburger theme controls.
- `servigo-app/src/i18n/translations.ts`
  - Added `home.question` translations for all supported UI languages.
- `servigo-app/README.md`
  - Documented the search-first homepage and theme control placement.
- `PROJECT_CONTEXT.md`
  - Updated current project state and last-updated notes.
- `CHANGELOG_AI.md`
  - Added this changelog entry.

### Validation
- Ran `pnpm run build` in `servigo-app/`; TypeScript and Vite production build passed.
- Synced the updated app to `/Users/ivangomes/Desktop/Kliko`.
- Ran `pnpm run build` in `/Users/ivangomes/Desktop/Kliko`; TypeScript and Vite production build passed.
- Confirmed the local Vite server at `http://127.0.0.1:5173/` responds.
- Synced the updated app to `/Users/ivangomes/Desktop/Kliko`.
- Ran `pnpm run build` in `/Users/ivangomes/Desktop/Kliko`; TypeScript and Vite production build passed.
- Synced the updated app to `/Users/ivangomes/Desktop/Kliko`.
- Ran `pnpm run build` in `/Users/ivangomes/Desktop/Kliko`; TypeScript and Vite production build passed.
- Synced the updated app to `/Users/ivangomes/Desktop/Kliko`.
- Ran `pnpm run build` in `/Users/ivangomes/Desktop/Kliko`; TypeScript and Vite production build passed.

### Risks or Known Limitations
- Search suggestions still use frontend-only mock data and simple string matching.
- Visual review in the browser is still needed after syncing the clean `/Users/ivangomes/Desktop/Kliko` copy.

### Remaining Work
- Visually review the homepage at `http://127.0.0.1:5173/`.

## 2026-07-25 23:28 — Add first Kliko visual brand polish

### Objective
Improve the Kliko homepage visual identity using a clearer brand palette, stronger logo treatment, more focused search styling, and more human listing cards.

### Backup
- Created a pre-change backup at `backups/kliko-before-visual-polish-20260725-2320/`.
- The backup includes source code, README, package metadata, lockfile, Vite config, and HTML entry file.

### Work Completed
- Refined the light/day palette toward a cleaner, brighter, more trustworthy marketplace look.
- Strengthened the Kliko logo treatment in the header.
- Improved the centered homepage search area with a stronger question, search shadow, focus ring, and suggestion panel.
- Updated homepage listing cards to show a more visual provider/avatar area, service icon, rating, reviews, provider identity, location, languages, price, and action hierarchy.
- Kept the current app architecture, routes, mock data, i18n system, and frontend-only scope unchanged.

### Files Changed
- `servigo-app/src/components/ListingCard.tsx`
  - Added visual card content with service icon, rating/reviews badge, provider identity, and language line.
- `servigo-app/src/styles/global.css`
  - Updated brand palette, header/logo styling, homepage search styling, suggestion panel styling, and showcase listing cards.
- `servigo-app/README.md`
  - Documented the refined homepage direction and listing-card scan priorities.
- `PROJECT_CONTEXT.md`
  - Updated current visual direction and last-updated notes.
- `CHANGELOG_AI.md`
  - Added this changelog entry.

### Validation
- Ran `pnpm run build` in `servigo-app/`; TypeScript and Vite production build passed.

### Risks or Known Limitations
- Listing photos are still mock/future fields; cards use generated visual identity when no photo exists.
- Visual review in the live browser is still needed for final taste decisions.

### Remaining Work
- Review the homepage visually at `http://127.0.0.1:5173/`.

## 2026-07-26 00:01 — Simplify homepage listing cards

### Objective
Make homepage announcements easier to scan by reducing the amount of visible information and moving full details to the listing detail page.

### Backup
- Created a pre-change backup at `backups/kliko-before-home-card-simplify-20260726-0001/`.
- The backup includes source code, README, package metadata, lockfile, Vite config, and HTML entry file.

### Work Completed
- Simplified the `showcase` listing-card variant used on the homepage.
- Made homepage cards fully clickable links to the listing detail page.
- Reduced homepage card content to photo/avatar, compact price, provider name, service title, short description, and location.
- Removed homepage-only rating chips, tags, language line, quote button, and detail button from the compact card view.
- Preserved the fuller default listing cards used on listing/search/category result pages.

### Files Changed
- `servigo-app/src/components/ListingCard.tsx`
  - Split homepage `showcase` rendering from the default listing-card rendering.
- `servigo-app/src/styles/global.css`
  - Reduced showcase card height and simplified card styling.
- `servigo-app/README.md`
  - Documented that homepage listing cards are compact entry cards.
- `PROJECT_CONTEXT.md`
  - Updated homepage card direction and last-updated notes.
- `CHANGELOG_AI.md`
  - Added this changelog entry.

### Validation
- Ran `pnpm run build` in `servigo-app/`; TypeScript and Vite production build passed.

### Risks or Known Limitations
- The compact price formatter is frontend-only and simple; uncommon price labels may stay as the full localized text.
- Visual review in the live browser is still needed for spacing and taste.

### Remaining Work
- Review homepage cards at `http://127.0.0.1:5173/`.

## 2026-07-26 00:08 — Auto-switch language from selected country

### Objective
Let Kliko automatically change the interface language when the user selects a country, while falling back to English for countries whose main language is not supported yet.

### Backup
- Created a pre-change backup at `backups/kliko-before-country-language-auto-20260726-0008/`.

### Work Completed
- Added a centralized country-to-language helper.
- Connected the header country selector to the i18n system.
- Preserved the manual language selector so users can still override the automatic choice.
- Documented the automatic language behavior in the README and project memory.

### Files Changed
- `servigo-app/src/i18n/countryLanguage.ts`
  - Added supported country-language mapping and English fallback.
- `servigo-app/src/components/Layout.tsx`
  - Country selection now stores the selected country and applies the mapped language.
- `servigo-app/README.md`
  - Documented automatic country-based language switching.
- `PROJECT_CONTEXT.md`
  - Updated multilingual and data-flow notes.
- `CHANGELOG_AI.md`
  - Added this changelog entry.

### Validation
- Ran `pnpm run build` in `servigo-app/`; TypeScript and Vite production build passed.
- Synced the updated app to `/Users/ivangomes/Desktop/Kliko`.
- Ran `pnpm run build` in `/Users/ivangomes/Desktop/Kliko`; TypeScript and Vite production build passed.
- Confirmed the local Vite server at `http://127.0.0.1:5173/` responds.

### Risks or Known Limitations
- Multilingual countries use a practical single default for now, for example Belgium to French and Switzerland to German.
- Countries whose languages are not currently translated fall back to English.

## 2026-07-26 00:30 — Improve marketplace flow after approved homepage

### Objective
Keep the approved Google-like homepage intact while improving the next marketplace steps: listing results, listing detail, provider publishing, request review context, and profession/category breadth.

### Backup
- Created a pre-change backup at `backups/kliko-before-marketplace-flow-20260726-0030/`.

### Work Completed
- Preserved the approved homepage baseline.
- Simplified default listing result cards with a clearer visual/avatar area, compact facts, price, tags, and direct quote action.
- Reworked listing detail pages with a stronger service hero and action card for quote/contact decisions.
- Added a request context highlight to `/request/review` when the draft comes from a listing/category/search path.
- Added a live public listing preview inside the provider create-listing mock form.
- Expanded profession search options and added more marketplace categories for broader future coverage.
- Kept all behavior frontend-only and mock-data based.

### Files Changed
- `servigo-app/src/components/ListingCard.tsx`
- `servigo-app/src/pages/ListingsPage.tsx`
- `servigo-app/src/pages/ListingDetailPage.tsx`
- `servigo-app/src/pages/ProviderCreateListingPage.tsx`
- `servigo-app/src/pages/RequestReviewPage.tsx`
- `servigo-app/src/data/professionOptions.ts`
- `servigo-app/src/data/marketplaceData.ts`
- `servigo-app/src/i18n/translations.ts`
- `servigo-app/src/styles/global.css`
- `servigo-app/README.md`
- `PROJECT_CONTEXT.md`
- `CHANGELOG_AI.md`

### Validation
- Ran `pnpm run build` in `servigo-app/`; TypeScript and Vite production build passed.
- Synced the updated app to `/Users/ivangomes/Desktop/Kliko`.
- Ran `pnpm run build` in `/Users/ivangomes/Desktop/Kliko`; TypeScript and Vite production build passed.
- Confirmed the local Vite server at `http://127.0.0.1:5173/` responds.

### Risks or Known Limitations
- Listing photos and file uploads remain prototype/mock fields.
- No backend persistence, real notifications, provider inbox, authentication, or real verification workflow exists yet.
- Visual browser review is still recommended for listing results, listing detail, provider create-listing, and request review pages.

### Remaining Work
- Review the updated marketplace pages visually in the browser.
- Continue enriching provider profile display options and listing data once the current UX direction is approved.

## 2026-07-26 — Category-first homepage search and request attachments

### Objective
Adjust the approved homepage search so it finds categories first, then shows services/providers inside the matched category, and add frontend-only attachments to quote/request submissions.

### Backup
- Created a pre-change backup at `backups/kliko-before-category-search-attachments-20260726/`.

### Work Completed
- Replaced homepage profession-style suggestions with category-first suggestions.
- Added category search relevance that uses category labels, subcategories, specialties, useful aliases, common typo handling such as `limpesa`, listing titles, listing descriptions, and provider names.
- Updated homepage search submission to route to `/listings` with the matched category context.
- Added request attachment metadata to the request draft and mock submitted request.
- Added a review-page attachment area for photos, plans, PDFs, documents, spreadsheets, text files, and simple drawing formats.
- Added attachment summaries to request confirmation and request detail pages.
- Updated translations, README, and persistent project memory.

### Files Changed
- `servigo-app/src/components/LandingPage.tsx`
- `servigo-app/src/data/marketplaceData.ts`
- `servigo-app/src/data/requestDraft.ts`
- `servigo-app/src/pages/RequestReviewPage.tsx`
- `servigo-app/src/pages/RequestConfirmationPage.tsx`
- `servigo-app/src/pages/RequestDetailPage.tsx`
- `servigo-app/src/types/servigo.ts`
- `servigo-app/src/i18n/translations.ts`
- `servigo-app/src/styles/global.css`
- `servigo-app/README.md`
- `PROJECT_CONTEXT.md`
- `CHANGELOG_AI.md`

### Validation
- Ran `pnpm run build` in `servigo-app/`; TypeScript and Vite production build passed.

### Risks or Known Limitations
- Attachments are not uploaded yet. The frontend stores only file metadata such as name, size, and type.
- Category matching is still frontend-only and uses simple text relevance rather than a backend search index.

### Remaining Work
- Review the category-first suggestions and attachment UI in the browser.

## 2026-07-26 — Highlight provider in request review context

### Objective
Make the `/request/review` context block focus on the selected provider instead of the service title when a user starts from a listing.

### Work Completed
- Changed the request context hero to show provider avatar/photo and provider name prominently.
- Kept the requested service visible as secondary context.
- Kept category, compatible provider count, and selected area as compact badges.
- Added translation keys for provider fallback, service label, and compatible provider count.

### Files Changed
- `servigo-app/src/pages/RequestReviewPage.tsx`
- `servigo-app/src/styles/global.css`
- `servigo-app/src/i18n/translations.ts`
- `PROJECT_CONTEXT.md`
- `CHANGELOG_AI.md`

### Validation
- Ran `pnpm run build` in `servigo-app/`; TypeScript and Vite production build passed.
- Synced the updated app to `/Users/ivangomes/Desktop/Kliko`.
- Ran `pnpm run build` in `/Users/ivangomes/Desktop/Kliko`; TypeScript and Vite production build passed.

## 2026-07-26 02:35 — Save approved Kliko version

### Objective
Save the current Kliko state after user approval.

### Snapshot
- Saved approved version at `backups/kliko-approved-version-20260726-0235/`.

### Included
- `src/`
- `README.md`
- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `index.html`
- `tsconfig.json`
- `tsconfig.node.json`
- `vite.config.ts`
- `.gitignore`

### Notes
- `node_modules/` and `dist/` were intentionally not copied to keep the snapshot lightweight.
- This snapshot represents the approved frontend-only state: homepage, category-first search, request attachments, and provider-focused review context.

## 2026-07-26 02:51 — Separate Kliko and Crypto Snake project folders

### Objective
Create separate working folders so Kliko and Crypto Snake can be developed independently without mixing files.

### Work Completed
- Confirmed `/Users/ivangomes/Desktop/Kliko` exists and synced it with the current approved Kliko app.
- Created `/Users/ivangomes/Desktop/Crypto-Snake`.
- Copied only the game files into `/Users/ivangomes/Desktop/Crypto-Snake`:
  - `index.html`
  - `app.js`
  - `style.css`
  - `progress.default.json`
  - `assets/`
- Left the old mixed `/Users/ivangomes/Desktop/Crypto-snake-web` folder untouched as workspace/archive/history.
- Updated project memory to prefer the dedicated folder for future work on each project.

### Validation
- Listed `/Users/ivangomes/Desktop/Kliko` and confirmed it contains the React/Vite app files.
- Listed `/Users/ivangomes/Desktop/Crypto-Snake` and confirmed it contains only the game files and assets.
- Confirmed the local Kliko dev server at `http://127.0.0.1:5173/` still responds.

### Notes
- No files were deleted from the old mixed root.
- Future Kliko work should use `/Users/ivangomes/Desktop/Kliko`.
- Future Crypto Snake work should use `/Users/ivangomes/Desktop/Crypto-Snake`.

## 2026-07-26 03:44 — Advance Kliko to pre-backend marketplace boundary

### Objective
Complete the main frontend-only marketplace improvements before starting backend work.

### Backup
- Created a pre-change backup at `backups/kliko-before-pre-backend-marketplace-20260726/`.

### Work Completed
- Added frontend-only sorting to listing results: recommended, best rated, lowest visible price, nearest, and urgent first.
- Strengthened the listing detail page with a provider-focused public profile strip, trust metrics, covered-area count, fit reasons, and next-step guidance.
- Expanded the provider create-listing mock form with public profile controls: displayed name mode, optional username, optional profile photo metadata, optional public age, and optional public phone visibility.
- Improved the live public listing preview to reflect the provider public profile choices.
- Improved the client dashboard with active request, quote, and attachment summaries.
- Improved the provider dashboard with responsiveness score and daily priority cards.
- Improved the admin dashboard with category/profession proposal review cards and metrics.
- Updated translations for all new visible UI text in French, Portuguese, and English, with other supported languages falling back through the existing i18n system.
- Updated README and project memory.

### Files Changed
- `servigo-app/src/pages/ListingsPage.tsx`
- `servigo-app/src/pages/ListingDetailPage.tsx`
- `servigo-app/src/pages/ProviderCreateListingPage.tsx`
- `servigo-app/src/pages/ClientDashboardPage.tsx`
- `servigo-app/src/pages/ProviderDashboardPage.tsx`
- `servigo-app/src/pages/AdminDashboardPage.tsx`
- `servigo-app/src/components/RequestCard.tsx`
- `servigo-app/src/i18n/translations.ts`
- `servigo-app/src/styles/global.css`
- `servigo-app/README.md`
- `PROJECT_CONTEXT.md`
- `CHANGELOG_AI.md`

### Validation
- Ran `pnpm run build` in `servigo-app/`; TypeScript and Vite production build passed.

### Risks or Known Limitations
- All new behavior is still frontend-only and mock-data based.
- File/photo selections are metadata-only and are not uploaded.
- Dashboards simulate workflow actions locally and do not persist to a backend.

### Remaining Work
- Sync the updated app to `/Users/ivangomes/Desktop/Kliko`.
- Run the production build in the synced `/Users/ivangomes/Desktop/Kliko` copy.
- Visually review key pages in the browser before beginning backend work.

## 2026-07-26 04:11 — Prepare Kliko for GitHub Pages sharing

### Objective
Prepare the current Kliko frontend prototype to be shared through GitHub Pages without replacing the existing Crypto Snake page.

### Backup
- Created a pre-change backup at `backups/kliko-before-github-pages-20260726/servigo-app/`.

### Work Completed
- Added a GitHub Pages build script to `servigo-app/package.json`.
- Configured the GitHub Pages build to output the static Kliko app into root `kliko/`.
- Updated routing so local development keeps normal browser routes, while the GitHub Pages build uses hash routing for static hosting compatibility.
- Generated the static GitHub Pages output in `kliko/`.
- Added `.nojekyll` at the repository root.
- Documented the expected public URL: `https://scalifornia.github.io/crypto-snake-web/kliko/`.
- Updated persistent project memory.

### Files Changed
- `.nojekyll`
- `kliko/`
- `servigo-app/package.json`
- `servigo-app/src/App.tsx`
- `servigo-app/README.md`
- `PROJECT_CONTEXT.md`
- `CHANGELOG_AI.md`

### Validation
- Ran `pnpm run build:github-pages` in `servigo-app/`; TypeScript and Vite production build passed.

### Risks or Known Limitations
- The GitHub Pages URL will only work after committing and pushing these files to GitHub.
- The online static version remains frontend-only and mock-data based.
- The generated `kliko/` folder must be regenerated after future app changes before publishing.

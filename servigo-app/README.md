# Kliko App

Standalone Vite + React + TypeScript application for Kliko, a location-first P2P local services marketplace.

The active standalone project should now live in a clean folder named `Kliko`, outside the old snake-game workspace. The visible product brand is centralized in:

```text
src/config/brand.ts
```

## Run Locally

```bash
npm install
npm run dev
```

The dev server is configured for:

```text
http://127.0.0.1:5173/
```

## Current Scope

- No WordPress, Astra, PHP, shortcodes, XML imports, or CMS.
- Frontend-only mock data.
- French-first UI with Portuguese, English, Luxembourgish, German, Spanish, and Italian available from the header.
- React Router route structure with shared layout, minimal hamburger header, footer, and page surfaces.
- Header keeps location and language visible; Day, Night, and System display modes are inside the hamburger menu.
- Choosing a country in the header automatically switches the UI language when a matching translation exists; unsupported country languages fall back to English.
- Search-first homepage with a Google-like centered search entry, category-first instant suggestions, manual country selection in the header, and frontend-only browser geolocation.
- Homepage direction: minimal first screen focused on category search, with a brighter day-mode visual identity, stronger Kliko logo, instant category matches, category shortcuts, and short featured listing cards lower on the page.
- Homepage baseline is currently approved by the user and should be preserved unless a new homepage-specific change is requested.
- Mobile experience uses an app-like responsive layer: compact sticky header, bottom navigation for core routes, centered first-screen search, horizontally scrollable category shortcuts, and compact homepage listing cards.
- P2P classified-services positioning: category browsing first, custom request assistant second.
- Category, subcategory, specialty, and service listing model.
- Provider create-listing mock form for private individuals and professional companies, including a live public listing preview before submission.
- Provider publishing now includes public profile controls for the listing preview: displayed name, optional username, optional profile photo metadata, optional public age, and optional public phone visibility.
- Location model with country, region, district/department/canton, city/area, postal code, coordinates, and service radius.
- Service listings, filters, quote request paths, urgency, property details, structured brief, basic estimate, and suggested providers.
- Listing results now support frontend-only sorting by recommended order, rating, lowest visible price, nearest area, and urgent availability.
- Quote requests can now be started from listing cards, listing detail pages, category pages, subcategory pages, specialty choices, and homepage/search suggestions with source context carried into the request review flow.
- Mock trust and safety foundation with trust level, incident count, response reliability, cancellation reliability, and verification badge.
- Mock request, quote, job, and status workflow data for marketplace behavior.
- Mock dashboards now show stronger operational summaries for clients, providers, and admins before backend work begins.

## Routes

```text
/                 Landing page
/categories       Category browser
/categories/:categorySlug Category detail with subcategories
/categories/:categorySlug/:subcategorySlug Subcategory and specialty browser
/listings         Service listing results with filters
/listings/:listingId Service listing detail
/request          Guided request assistant
/request/review   Review editable draft, contact details, validation
/request/confirmation Mock submission confirmation
/requests/:id    Request detail with status timeline, providers, and quotes
/services         Compatibility service catalogue backed by the category model
/providers        Mock provider directory
/providers/:id    Mock provider profile
/client           Client dashboard mock
/provider         Provider dashboard mock
/provider/create-listing Provider create-listing mock form
/how-it-works    Simple explanation page
/rules           Community rules
/admin            Admin dashboard mock
```

## Test

```bash
npm run build
```

## GitHub Pages Preview

The root repository already serves the Crypto Snake site through GitHub Pages. Kliko is prepared as a separate static subsite so it does not replace the game.

Build the GitHub Pages version from inside `servigo-app/`:

```bash
npm run build:github-pages
```

This generates the publishable static app in:

```text
../kliko/
```

Expected public preview URL after committing and pushing to GitHub:

```text
https://scalifornia.github.io/crypto-snake-web/kliko/
```

The GitHub Pages build uses hash-based routing online, so internal pages work from a static host without backend rewrite rules. Local development still uses normal browser routes at `http://127.0.0.1:5173/`.

Manual route checks:

```text
http://127.0.0.1:5173/
http://127.0.0.1:5173/categories
http://127.0.0.1:5173/categories/automotive-mechanics
http://127.0.0.1:5173/categories/automotive-mechanics/car-maintenance
http://127.0.0.1:5173/listings
http://127.0.0.1:5173/listings/listing-auto-oil
http://127.0.0.1:5173/request
http://127.0.0.1:5173/request/review
http://127.0.0.1:5173/request/confirmation
http://127.0.0.1:5173/requests/req-1042
http://127.0.0.1:5173/services
http://127.0.0.1:5173/providers
http://127.0.0.1:5173/providers/luxclean-pro
http://127.0.0.1:5173/client
http://127.0.0.1:5173/provider
http://127.0.0.1:5173/provider/create-listing
http://127.0.0.1:5173/how-it-works
http://127.0.0.1:5173/rules
http://127.0.0.1:5173/admin
```

## Marketplace Model

Kliko is structured like a classified-services marketplace:

```text
Category -> Subcategory -> Specialty -> ServiceListing
```

Mock category and listing data is stored in:

```text
src/data/marketplaceData.ts
```

The current model includes broad services such as home repairs, cleaning and facility services, garden and outdoor work, moving and transport, personal help, digital/admin help, events, business services, and Automotive and Mechanics as a major category.

Listings include provider name, provider type, email, phone, base location, covered locations, service radius, remote availability, category, subcategory, specialty, title, description, price model, availability, languages, travel-to-client flag, optional professional registration, VAT number, insurance, optional future photos, and mock trust signals.

Provider listing creation also prepares public profile controls that will later map to real provider accounts: public display name, username, profile photo, phone visibility, age visibility, residence/base address for verification, service areas, foreign coverage, professional documents, and category proposals.

Homepage search is category-first. A query such as `limpeza` or even the common typo `limpesa` should first match the cleaning category, then show example listings/providers inside that category. Homepage listing cards intentionally stay short: photo/avatar area, compact price, provider name, service title, brief description, and location. Listing result cards use a compact image/avatar column, essential facts, price, tags, and quote action. Users open the listing detail page for full provider, trust, language, quote, and service information.

When a seeker creates or implies a quote request, the frontend mock logic can identify eligible listings/providers by matching category, subcategory, specialty, and selected area.

Quote request context is stored with the local draft and submitted mock request. It can include the selected listing, provider, category, subcategory, specialty, area, displayed price model, eligible notification targets, and compatible alternatives. The review page now shows the source context before submission so the user understands which service/listing/provider led to the request. This is still frontend-only logic: backend persistence, real notifications, provider inboxes, and quote delivery remain future work.

## Location Model

Kliko is location-first, not Luxembourg-only. Mock locations are stored in:

```text
src/data/locationData.ts
```

Each location supports:

```text
country, countryCode, region, district/department/canton, city/area, postalCode, latitude, longitude, serviceRadiusKm
```

Current mock locations cover Luxembourg, France, Portugal, and Belgium. Browser geolocation is frontend-only: if permission is granted, the app stores approximate coordinates and the closest mock area in `localStorage`; if denied or unavailable, users can choose country and city/area manually.

Listing results are prioritized by:

```text
same city/area -> same district/canton/department -> same region -> same country -> nearby cross-border -> remote/online
```

Search matches category, subcategory, specialty, listing title, listing description, and provider name, then sorts by relevance and proximity.

## Rules And Trust

Community rules live at `/rules` and apply to both service seekers and providers. The current trust system is mock/foundation only and includes trust level, incident count, response reliability, cancellation reliability, and verification badge. There is no backend enforcement yet.

## Mock Workflow

The current workflow is frontend-only and stored in `src/data/workflowData.ts`.

Request statuses:

```text
draft -> submitted -> under_review -> matched -> quoted -> accepted -> scheduled -> in_progress -> completed
```

Requests can also move to `cancelled` from active intermediate states. The request detail page shows client info, category, area, urgency, property type, structured brief, estimate, status timeline, matched providers, quotes, and job information when present.

## Request Submission Prototype

The guided assistant stores a frontend-only draft in `localStorage`, then sends the user through:

```text
/request -> /request/review -> /request/confirmation
```

The review step allows editing key request fields, contact details, preferred contact method, preferred intervention period, and supporting attachments. It validates required name, email, phone, area, and category fields before creating a mock submitted request. When a draft comes from a listing/category context, the review step highlights the requested service, selected provider/listing where applicable, selected area, and eligible provider count. The latest submitted mock request is also surfaced in the client dashboard and can be opened through `/requests/:id`.

Attachment support is frontend-only for now. Users can select photos, plans, PDFs, documents, spreadsheets, text files, and simple technical drawing formats. The app stores only metadata such as name, size, and type in the local draft/submitted mock request; the real files are not uploaded until a backend is added.

## Languages

Supported UI languages:

```text
fr  French, default
pt  Portuguese
en  English
lb  Luxembourgish
de  German
es  Spanish
it  Italian
```

The selected language is controlled by the visible language list in the header and persisted in `localStorage`, so the choice survives refreshes without requiring an account.

Choosing a country in the header also updates the UI language through:

```text
src/i18n/countryLanguage.ts
```

Examples: Portugal switches to Portuguese, France to French, Germany/Austria to German, Spain to Spanish, Italy to Italian, Luxembourg to Luxembourgish, and countries without a supported translation fall back to English. The user can still override the language manually afterwards.

Translation files:

```text
src/i18n/translations.ts
src/i18n/LanguageContext.tsx
src/i18n/useTranslation.ts
```

Use `t("some.key")` inside components for visible UI text. Do not hardcode new visible labels, headings, buttons, form messages, validation messages, status labels, quote labels, or navigation text directly in components. Marketplace category, subcategory, specialty, and listing labels remain translation-friendly in `src/data/marketplaceData.ts`.

The current extended-language support is frontend-only. Core navigation, homepage, forms, buttons, and workflow labels are translated. Some mock listing/category data still uses fallback values where a manually reviewed translation has not been added yet.

## Product Direction

Kliko should stay inspired by the simplicity of fast service-request sites, but not copy their design, wording, or business flow. The current direction is:

```text
Search quickly -> browse categories -> compare listings -> request quote or contact provider
```

If the right service is not found, the user can still create a custom request through the assistant.

## Next Logical Steps

The main frontend-only marketplace flow is now shaped up to the backend boundary:

```text
search/browse -> compare listings -> open provider/listing -> request quote -> review with files -> mock confirmation -> dashboards
```

Recommended next phase:

1. Visually review `/listings`, `/listings/:listingId`, `/provider/create-listing`, `/client`, `/provider`, and `/admin`.
2. Decide the first backend scope: requests/listings storage, provider accounts, or file uploads.
3. Add backend persistence for listings, requests, attachments, provider proposals, and status updates.
4. Add real notification delivery and provider inbox handling for quote requests.
5. Add authentication and provider verification workflows.
6. Use `/Users/ivangomes/Desktop/Kliko` as the active project folder for future work.

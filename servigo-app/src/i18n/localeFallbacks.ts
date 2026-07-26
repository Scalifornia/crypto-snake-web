import { europeCoverageCountries } from '../data/euCoverageOptions';
import { marketplaceCategories, serviceListings } from '../data/marketplaceData';
import { categories, providers } from '../data/servigoData';
import { jobs, quotes, serviceRequests } from '../data/workflowData';
import type { Locale } from '../types/servigo';

const extendedLocales: Locale[] = ['lb', 'de', 'es', 'it'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function hydrateLocalizedFallbacks(value: unknown, seen = new WeakSet<object>()) {
  if (!isRecord(value)) {
    return;
  }

  if (seen.has(value)) {
    return;
  }

  seen.add(value);

  if (typeof value.fr === 'string' && typeof value.pt === 'string' && typeof value.en === 'string') {
    for (const locale of extendedLocales) {
      if (typeof value[locale] !== 'string') {
        value[locale] = value.en;
      }
    }
  }

  for (const childValue of Object.values(value)) {
    hydrateLocalizedFallbacks(childValue, seen);
  }
}

export function ensureAppLocaleFallbacks() {
  [
    europeCoverageCountries,
    marketplaceCategories,
    serviceListings,
    categories,
    providers,
    serviceRequests,
    quotes,
    jobs
  ].forEach((dataSet) => hydrateLocalizedFallbacks(dataSet));
}

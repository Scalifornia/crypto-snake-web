import {
  filterListings,
  findCategory,
  findListing,
  findSpecialty,
  findSubcategory,
  getListingsFor,
  listingMatchesLocation
} from './marketplaceData';
import { getLocation, getStoredUserLocation } from './locationData';
import { requestCategoryUsesSizeByDefault } from './requestOptions';
import { defaultRequestDraft, getStoredRequestDraft, saveRequestDraft } from './requestDraft';
import type {
  CategoryId,
  LocationArea,
  QuoteRequestContext,
  QuoteRequestSourceType,
  RequestAssistantDraft,
  ServiceListing
} from '../types/servigo';

const fallbackLocationId = 'lu-luxembourg';

const locationCommuneMap: Record<string, string> = {
  'lu-luxembourg': 'Luxembourg',
  'lu-esch-sur-alzette': 'Esch-sur-Alzette',
  'lu-differdange': 'Differdange',
  'lu-dudelange': 'Dudelange'
};

export function mapMarketplaceToRequestCategory(categorySlug?: string, subcategorySlug?: string): CategoryId {
  if (subcategorySlug === 'plumbing') {
    return 'plumbing';
  }

  if (subcategorySlug === 'electricity') {
    return 'electricity';
  }

  if (subcategorySlug === 'handyman') {
    return 'handyman';
  }

  if (subcategorySlug === 'end-of-tenancy') {
    return 'endTenancy';
  }

  if (categorySlug === 'cleaning-facility') {
    return 'cleaning';
  }

  if (categorySlug === 'garden-outdoor') {
    return 'gardening';
  }

  if (categorySlug === 'moving-transport') {
    return 'moving';
  }

  return 'handyman';
}

export function getPreferredLocationId(explicitLocationId?: string, fallback = fallbackLocationId) {
  return explicitLocationId || getStoredUserLocation()?.locationId || fallback;
}

export function communeFromLocation(location?: LocationArea) {
  if (!location) {
    return defaultRequestDraft.commune;
  }

  return locationCommuneMap[location.id] ?? location.city;
}

export function getEligibleListingsForContext(context: QuoteRequestContext) {
  if (!context.categorySlug) {
    return [];
  }

  return filterListings({
    categorySlug: context.categorySlug,
    subcategorySlug: context.subcategorySlug,
    specialtySlug: context.specialtySlug,
    locationId: context.locationId
  });
}

export function getCompatibleAlternatives(context: QuoteRequestContext, excludedListingId?: string) {
  const exactMatches = getEligibleListingsForContext(context).filter((listing) => listing.id !== excludedListingId);

  if (exactMatches.length > 0) {
    return exactMatches.slice(0, 3);
  }

  if (!context.categorySlug) {
    return [];
  }

  return filterListings({
    categorySlug: context.categorySlug,
    subcategorySlug: context.subcategorySlug,
    locationId: context.locationId
  })
    .filter((listing) => listing.id !== excludedListingId)
    .slice(0, 3);
}

function finalizeContext(context: QuoteRequestContext) {
  const eligibleListings = getEligibleListingsForContext(context);
  const alternatives = getCompatibleAlternatives(context, context.listingId);

  return {
    ...context,
    eligibleListingIds: eligibleListings.map((listing) => listing.id),
    alternativeListingIds: alternatives.map((listing) => listing.id)
  };
}

export function buildQuoteContextFromListing(
  listing: ServiceListing,
  options: {
    locationId?: string;
    sourceType?: QuoteRequestSourceType;
    searchQuery?: string;
  } = {}
): QuoteRequestContext {
  const locationId = getPreferredLocationId(options.locationId, listing.baseLocationId);
  const outsideSelectedArea = Boolean(locationId && !listingMatchesLocation(listing, locationId));

  return finalizeContext({
    sourceType: options.sourceType ?? 'listing',
    listingId: listing.id,
    providerId: listing.providerId,
    providerName: listing.providerName,
    categorySlug: listing.categorySlug,
    subcategorySlug: listing.subcategorySlug,
    specialtySlug: listing.specialtySlug,
    locationId,
    serviceTitle: listing.title,
    priceModel: listing.priceModel,
    priceLabel: listing.priceLabel,
    searchQuery: options.searchQuery,
    eligibleListingIds: [],
    alternativeListingIds: [],
    outsideSelectedArea
  });
}

export function buildQuoteContextFromCategory(options: {
  categorySlug: string;
  subcategorySlug?: string;
  specialtySlug?: string;
  locationId?: string;
  sourceType?: QuoteRequestSourceType;
  searchQuery?: string;
}): QuoteRequestContext {
  const category = findCategory(options.categorySlug);
  const subcategory = findSubcategory(options.categorySlug, options.subcategorySlug);
  const specialty = findSpecialty(options.categorySlug, options.subcategorySlug, options.specialtySlug);
  const firstMatchingListing = getListingsFor(options.categorySlug, options.subcategorySlug, options.specialtySlug)[0];
  const serviceTitle = specialty?.labels ?? subcategory?.labels ?? category?.labels;

  return finalizeContext({
    sourceType:
      options.sourceType ??
      (options.specialtySlug ? 'specialty' : options.subcategorySlug ? 'subcategory' : 'category'),
    categorySlug: options.categorySlug,
    subcategorySlug: options.subcategorySlug,
    specialtySlug: options.specialtySlug,
    locationId: getPreferredLocationId(options.locationId, firstMatchingListing?.baseLocationId),
    serviceTitle,
    searchQuery: options.searchQuery,
    eligibleListingIds: [],
    alternativeListingIds: []
  });
}

export function buildRequestDraftFromQuoteContext(context: QuoteRequestContext): RequestAssistantDraft {
  const currentDraft = getStoredRequestDraft();
  const listing = context.listingId ? findListing(context.listingId) : undefined;
  const location = getLocation(context.locationId);
  const requestCategory = mapMarketplaceToRequestCategory(context.categorySlug, context.subcategorySlug);
  const title = context.serviceTitle?.fr ?? listing?.title.fr ?? '';
  const description = listing
    ? `${listing.title.fr} - ${listing.shortDescription.fr}`
    : title || currentDraft.description;

  return {
    ...defaultRequestDraft,
    categoryId: requestCategory,
    commune: communeFromLocation(location),
    urgency: listing?.availability.urgent ? 'soon' : currentDraft.urgency,
    propertyType: currentDraft.propertyType,
    includeSizeDetails: requestCategoryUsesSizeByDefault(requestCategory),
    surface: currentDraft.surface,
    rooms: currentDraft.rooms,
    description,
    address: '',
    accessNotes: '',
    client: currentDraft.client,
    preferredContactMethod: currentDraft.preferredContactMethod,
    preferredInterventionPeriod: currentDraft.preferredInterventionPeriod,
    quoteContext: context
  };
}

export function saveDraftFromQuoteContext(context: QuoteRequestContext) {
  const draft = buildRequestDraftFromQuoteContext(context);
  saveRequestDraft(draft);
  return draft;
}

export function getListingsFromContextIds(ids: string[]) {
  return ids.map((id) => findListing(id)).filter((listing): listing is ServiceListing => Boolean(listing));
}

export function isQuoteContextComplete(context: QuoteRequestContext) {
  return Boolean(context.categorySlug && context.subcategorySlug && context.specialtySlug && context.locationId);
}

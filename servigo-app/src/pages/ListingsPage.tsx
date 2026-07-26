import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ListingCard } from '../components/ListingCard';
import {
  filterListings,
  findCategory,
  findSpecialty,
  findSubcategory,
  getLocationPriority,
  listingLanguages,
  marketplaceCategories,
  providerTypes,
  searchServiceMatches,
  type ServiceSearchMatch
} from '../data/marketplaceData';
import { getCoverageCountries } from '../data/euCoverageOptions';
import { getLocation, getLocationsByCountry } from '../data/locationData';
import { useTranslation } from '../i18n/useTranslation';
import type { Locale, ProviderType, ServiceListing } from '../types/servigo';

type ListingSortMode = 'recommended' | 'rating' | 'price_low' | 'location' | 'urgent';

const customTaxonomyValue = 'custom';
const customLocationValue = 'custom-location';

function normalizeFilterText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function getListingLocationText(listing: ServiceListing) {
  const locations = [listing.baseLocationId, ...listing.coveredLocationIds]
    .map((locationId) => getLocation(locationId))
    .filter(Boolean);

  return normalizeFilterText(
    [
      listing.mainCommune,
      ...listing.serviceArea,
      ...locations.flatMap((location) => [
        location?.city,
        location?.region,
        location?.district,
        location?.country,
        location?.countryCode
      ])
    ]
      .filter(Boolean)
      .join(' ')
  );
}

function getListingNumericPrice(listing: ServiceListing, language: Locale) {
  if (listing.priceModel === 'free' || listing.priceModel === 'charity') {
    return 0;
  }

  const label = listing.priceLabel[language] ?? listing.priceLabel.fr ?? '';
  const match = label.match(/\d+/);
  return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
}

export function ListingsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language, t } = useTranslation();
  const [categorySlug, setCategorySlug] = useState(searchParams.get('category') ?? '');
  const [subcategorySlug, setSubcategorySlug] = useState(searchParams.get('subcategory') ?? '');
  const [specialtySlug, setSpecialtySlug] = useState(searchParams.get('specialty') ?? '');
  const [customCategory, setCustomCategory] = useState(searchParams.get('customCategory') ?? '');
  const [customSubcategory, setCustomSubcategory] = useState(searchParams.get('customSubcategory') ?? '');
  const [customSpecialty, setCustomSpecialty] = useState(searchParams.get('customSpecialty') ?? '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '');
  const [countryCode, setCountryCode] = useState(searchParams.get('country') ?? '');
  const [locationId, setLocationId] = useState(searchParams.get('location') ?? '');
  const [customLocation, setCustomLocation] = useState(searchParams.get('customLocation') ?? '');
  const [providerType, setProviderType] = useState<ProviderType | 'all'>(
    (searchParams.get('providerType') as ProviderType | null) ?? 'all'
  );
  const [urgentOnly, setUrgentOnly] = useState(searchParams.get('urgent') === 'true');
  const [priceShownOnly, setPriceShownOnly] = useState(searchParams.get('priceShown') === 'true');
  const [listingLanguage, setListingLanguage] = useState<Locale | 'all'>(
    (searchParams.get('language') as Locale | null) ?? 'all'
  );
  const [minRating, setMinRating] = useState(Number(searchParams.get('rating') ?? 0));
  const [sortMode, setSortMode] = useState<ListingSortMode>('recommended');

  useEffect(() => {
    setCategorySlug(searchParams.get('category') ?? '');
    setSubcategorySlug(searchParams.get('subcategory') ?? '');
    setSpecialtySlug(searchParams.get('specialty') ?? '');
    setCustomCategory(searchParams.get('customCategory') ?? '');
    setCustomSubcategory(searchParams.get('customSubcategory') ?? '');
    setCustomSpecialty(searchParams.get('customSpecialty') ?? '');
    setSearchQuery(searchParams.get('q') ?? '');
    setCountryCode(searchParams.get('country') ?? '');
    setLocationId(searchParams.get('location') ?? '');
    setCustomLocation(searchParams.get('customLocation') ?? '');
    setProviderType((searchParams.get('providerType') as ProviderType | null) ?? 'all');
    setUrgentOnly(searchParams.get('urgent') === 'true');
    setPriceShownOnly(searchParams.get('priceShown') === 'true');
    setListingLanguage((searchParams.get('language') as Locale | null) ?? 'all');
    setMinRating(Number(searchParams.get('rating') ?? 0));
  }, [searchParams]);

  const selectedCategory = findCategory(categorySlug);
  const selectedSubcategory = findSubcategory(categorySlug, subcategorySlug);
  const selectedSpecialty = findSpecialty(categorySlug, subcategorySlug, specialtySlug);
  const isCustomCategory = categorySlug === customTaxonomyValue;
  const isCustomSubcategory = subcategorySlug === customTaxonomyValue;
  const isCustomSpecialty = specialtySlug === customTaxonomyValue;
  const isCustomLocation = locationId === customLocationValue;
  const activeLocationId = isCustomLocation ? '' : locationId;
  const customTaxonomyQuery = [customCategory, customSubcategory, customSpecialty]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(' ');
  const effectiveSearchQuery = searchQuery.trim() || customTaxonomyQuery;
  const countryOptions = useMemo(() => getCoverageCountries(language), [language]);
  const locationOptions = getLocationsByCountry(countryCode);
  const selectedLocation = isCustomLocation ? undefined : locationOptions.find((location) => location.id === locationId);
  const selectedCountry = countryOptions.find((country) => country.countryCode === countryCode);
  const serviceMatches = useMemo(
    () => (searchQuery.trim() ? searchServiceMatches(searchQuery, activeLocationId) : []),
    [activeLocationId, searchQuery]
  );
  const queryCategorySlugs = useMemo(
    () => Array.from(new Set(serviceMatches.map((match) => match.category.slug))),
    [serviceMatches]
  );
  const categoryOptions = useMemo(() => {
    if (!searchQuery.trim() || queryCategorySlugs.length === 0) {
      return marketplaceCategories;
    }

    return marketplaceCategories.filter((category) => queryCategorySlugs.includes(category.slug));
  }, [queryCategorySlugs, searchQuery]);
  const filteredListings = useMemo(
    () =>
      filterListings({
        categorySlug: isCustomCategory ? '' : categorySlug,
        subcategorySlug: isCustomSubcategory ? '' : subcategorySlug,
        specialtySlug: isCustomSpecialty ? '' : specialtySlug,
        locationId: activeLocationId,
        searchQuery: effectiveSearchQuery,
        providerType,
        urgentOnly,
        priceShownOnly,
        language: listingLanguage,
        minRating
      }).filter((listing) => {
        if (!isCustomLocation || !customLocation.trim()) {
          return true;
        }

        const locationTokens = normalizeFilterText(customLocation)
          .split(/\s+/)
          .filter(Boolean);
        const listingLocationText = getListingLocationText(listing);

        return locationTokens.every((token) => listingLocationText.includes(token));
      }),
    [
      activeLocationId,
      categorySlug,
      customLocation,
      effectiveSearchQuery,
      isCustomCategory,
      isCustomLocation,
      isCustomSpecialty,
      isCustomSubcategory,
      listingLanguage,
      minRating,
      priceShownOnly,
      providerType,
      specialtySlug,
      subcategorySlug,
      urgentOnly
    ]
  );
  const sortedListings = useMemo(() => {
    const listings = [...filteredListings];

    if (sortMode === 'rating') {
      return listings.sort((first, second) => second.rating - first.rating || second.reviews - first.reviews);
    }

    if (sortMode === 'price_low') {
      return listings.sort(
        (first, second) => getListingNumericPrice(first, language) - getListingNumericPrice(second, language)
      );
    }

    if (sortMode === 'location') {
      return listings.sort(
        (first, second) => getLocationPriority(first, activeLocationId) - getLocationPriority(second, activeLocationId)
      );
    }

    if (sortMode === 'urgent') {
      return listings.sort(
        (first, second) => Number(second.availability.urgent) - Number(first.availability.urgent) || second.rating - first.rating
      );
    }

    return filteredListings;
  }, [activeLocationId, filteredListings, language, sortMode]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    const trimmedSearchQuery = searchQuery.trim();
    const trimmedCustomCategory = customCategory.trim();
    const trimmedCustomSubcategory = customSubcategory.trim();
    const trimmedCustomSpecialty = customSpecialty.trim();
    const trimmedCustomLocation = customLocation.trim();
    const fallbackCustomQuery = [trimmedCustomCategory, trimmedCustomSubcategory, trimmedCustomSpecialty]
      .filter(Boolean)
      .join(' ');

    if (trimmedSearchQuery || fallbackCustomQuery) {
      params.set('q', trimmedSearchQuery || fallbackCustomQuery);
    }

    if (categorySlug) {
      params.set('category', categorySlug);
    }

    if (isCustomCategory && trimmedCustomCategory) {
      params.set('customCategory', trimmedCustomCategory);
    }

    if (subcategorySlug) {
      params.set('subcategory', subcategorySlug);
    }

    if (isCustomSubcategory && trimmedCustomSubcategory) {
      params.set('customSubcategory', trimmedCustomSubcategory);
    }

    if (specialtySlug) {
      params.set('specialty', specialtySlug);
    }

    if (isCustomSpecialty && trimmedCustomSpecialty) {
      params.set('customSpecialty', trimmedCustomSpecialty);
    }

    if (countryCode) {
      params.set('country', countryCode);
    }

    if (locationId) {
      params.set('location', locationId);
    }

    if (isCustomLocation && trimmedCustomLocation) {
      params.set('customLocation', trimmedCustomLocation);
    }

    if (providerType !== 'all') {
      params.set('providerType', providerType);
    }

    if (urgentOnly) {
      params.set('urgent', 'true');
    }

    if (priceShownOnly) {
      params.set('priceShown', 'true');
    }

    if (listingLanguage !== 'all') {
      params.set('language', listingLanguage);
    }

    if (minRating > 0) {
      params.set('rating', String(minRating));
    }

    navigate(`/listings${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const resetFilters = () => {
    setCategorySlug('');
    setSubcategorySlug('');
    setSpecialtySlug('');
    setCustomCategory('');
    setCustomSubcategory('');
    setCustomSpecialty('');
    setSearchQuery('');
    setCountryCode('');
    setLocationId('');
    setCustomLocation('');
    setProviderType('all');
    setUrgentOnly(false);
    setPriceShownOnly(false);
    setListingLanguage('all');
    setMinRating(0);
    setSortMode('recommended');
    navigate('/listings');
  };

  const getMatchLabel = (match: ServiceSearchMatch) =>
    match.listing?.title[language] ??
    match.specialty?.labels[language] ??
    match.subcategory?.labels[language] ??
    match.category.labels[language];

  const getMatchContext = (match: ServiceSearchMatch) =>
    [
      match.category.labels[language],
      match.subcategory?.labels[language],
      match.specialty && match.level === 'listing' ? match.specialty.labels[language] : undefined
    ]
      .filter(Boolean)
      .join(' / ');

  const selectServiceMatch = (match: ServiceSearchMatch) => {
    setSearchQuery(getMatchLabel(match));
    setCategorySlug(match.category.slug);
    setSubcategorySlug(match.subcategory?.slug ?? match.listing?.subcategorySlug ?? '');
    setSpecialtySlug(match.specialty?.slug ?? match.listing?.specialtySlug ?? '');
    setCustomCategory('');
    setCustomSubcategory('');
    setCustomSpecialty('');
  };

  return (
    <section className="page-section listings-page">
      <div className="page-heading page-heading-row">
        <div>
          <p className="kicker">{t('listings.kicker')}</p>
          <h1>{t('listings.title')}</h1>
          <p>{t('listings.description')}</p>
        </div>
        <Link className="button button-primary" to="/request">
          {t('home.customRequest')}
        </Link>
      </div>

      <div className="listings-layout">
        <aside className="filter-panel">
          <h2>{t('filters.title')}</h2>

          <div className="filter-search-control">
            <label className="field">
              <span>{t('home.searchLabel')}</span>
              <input
                value={searchQuery}
                placeholder={t('home.searchPlaceholder')}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setCategorySlug('');
                  setSubcategorySlug('');
                  setSpecialtySlug('');
                  setCustomCategory('');
                  setCustomSubcategory('');
                  setCustomSpecialty('');
                }}
              />
            </label>

            {serviceMatches.length > 0 && (
              <div className="filter-search-suggestions" role="listbox" aria-label={t('home.serviceSuggestions')}>
                {serviceMatches.map((match) => (
                  <button key={match.id} type="button" role="option" onClick={() => selectServiceMatch(match)}>
                    <span className="small-label">{getMatchContext(match)}</span>
                    <strong>{getMatchLabel(match)}</strong>
                    <small>{t('home.serviceMatchCount', { count: match.listingCount })}</small>
                  </button>
                ))}
              </div>
            )}
          </div>

          <label className="field">
            <span>{t('filters.category')}</span>
            <select
              value={categorySlug}
              onChange={(event) => {
                const nextCategorySlug = event.target.value;
                setCategorySlug(nextCategorySlug);
                setSubcategorySlug('');
                setSpecialtySlug('');
                if (nextCategorySlug !== customTaxonomyValue) {
                  setCustomCategory('');
                  setCustomSubcategory('');
                  setCustomSpecialty('');
                }
              }}
            >
              <option value="">{t('common.all')}</option>
              {categoryOptions.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.labels[language]}
                </option>
              ))}
              <option value={customTaxonomyValue}>{t('field.otherOption')}</option>
            </select>
          </label>

          {isCustomCategory && (
            <label className="field">
              <span>{t('field.customCategory')}</span>
              <input
                value={customCategory}
                placeholder={t('field.customCategoryPlaceholder')}
                onChange={(event) => setCustomCategory(event.target.value)}
              />
            </label>
          )}

          <label className="field">
            <span>{t('filters.subcategory')}</span>
            <select
              value={subcategorySlug}
              onChange={(event) => {
                const nextSubcategorySlug = event.target.value;
                setSubcategorySlug(nextSubcategorySlug);
                setSpecialtySlug('');
                if (nextSubcategorySlug !== customTaxonomyValue) {
                  setCustomSubcategory('');
                  setCustomSpecialty('');
                }
              }}
            >
              <option value="">{t('common.all')}</option>
              {selectedCategory?.subcategories.map((subcategory) => (
                <option key={subcategory.slug} value={subcategory.slug}>
                  {subcategory.labels[language]}
                </option>
              ))}
              <option value={customTaxonomyValue}>{t('field.otherOption')}</option>
            </select>
          </label>

          {isCustomSubcategory && (
            <label className="field">
              <span>{t('field.customSubcategory')}</span>
              <input
                value={customSubcategory}
                placeholder={t('field.customSubcategoryPlaceholder')}
                onChange={(event) => setCustomSubcategory(event.target.value)}
              />
            </label>
          )}

          <label className="field">
            <span>{t('filters.specialty')}</span>
            <select
              value={specialtySlug}
              onChange={(event) => {
                const nextSpecialtySlug = event.target.value;
                setSpecialtySlug(nextSpecialtySlug);
                if (nextSpecialtySlug !== customTaxonomyValue) {
                  setCustomSpecialty('');
                }
              }}
            >
              <option value="">{t('common.all')}</option>
              {selectedSubcategory?.specialties.map((specialty) => (
                <option key={specialty.slug} value={specialty.slug}>
                  {specialty.labels[language]}
                </option>
              ))}
              <option value={customTaxonomyValue}>{t('field.otherOption')}</option>
            </select>
          </label>

          {isCustomSpecialty && (
            <label className="field">
              <span>{t('field.customSpecialty')}</span>
              <input
                value={customSpecialty}
                placeholder={t('field.customSpecialtyPlaceholder')}
                onChange={(event) => setCustomSpecialty(event.target.value)}
              />
            </label>
          )}

          <label className="field">
            <span>{t('filters.country')}</span>
            <select
              value={countryCode}
              onChange={(event) => {
                setCountryCode(event.target.value);
                setLocationId('');
                setCustomLocation('');
              }}
            >
              <option value="">{t('common.all')}</option>
              {countryOptions.map((country) => (
                <option key={country.countryCode} value={country.countryCode}>
                  {country.labels[language]}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>{t('filters.location')}</span>
            <select
              value={locationId}
              onChange={(event) => {
                const nextLocationId = event.target.value;
                setLocationId(nextLocationId);
                if (nextLocationId !== customLocationValue) {
                  setCustomLocation('');
                }
              }}
            >
              <option value="">{t('common.all')}</option>
              {locationOptions.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.city} · {location.region}
                </option>
              ))}
              <option value={customLocationValue}>{t('field.otherOption')}</option>
            </select>
          </label>

          {isCustomLocation && (
            <label className="field">
              <span>{t('field.customLocation')}</span>
              <input
                value={customLocation}
                placeholder={t('field.customLocationPlaceholder')}
                onChange={(event) => setCustomLocation(event.target.value)}
              />
            </label>
          )}

          <label className="field">
            <span>{t('filters.providerType')}</span>
            <select value={providerType} onChange={(event) => setProviderType(event.target.value as ProviderType | 'all')}>
              <option value="all">{t('common.all')}</option>
              {providerTypes.map((type) => (
                <option key={type} value={type}>
                  {t(`providerType.${type}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>{t('filters.language')}</span>
            <select value={listingLanguage} onChange={(event) => setListingLanguage(event.target.value as Locale | 'all')}>
              <option value="all">{t('common.all')}</option>
              {listingLanguages.map((locale) => (
                <option key={locale} value={locale}>
                  {t(`language.${locale}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>{t('filters.rating')}</span>
            <select value={minRating} onChange={(event) => setMinRating(Number(event.target.value))}>
              <option value={0}>{t('common.all')}</option>
              <option value={4}>4 / 5</option>
              <option value={4.5}>4.5 / 5</option>
              <option value={4.8}>4.8 / 5</option>
            </select>
          </label>

          <label className="check-field">
            <input type="checkbox" checked={urgentOnly} onChange={(event) => setUrgentOnly(event.target.checked)} />
            <span>{t('filters.urgent')}</span>
          </label>

          <label className="check-field">
            <input
              type="checkbox"
              checked={priceShownOnly}
              onChange={(event) => setPriceShownOnly(event.target.checked)}
            />
            <span>{t('filters.priceShown')}</span>
          </label>

          <div className="filter-actions">
            <button className="button button-primary" type="button" onClick={applyFilters}>
              {t('home.searchButton')}
            </button>
            <button className="button button-ghost" type="button" onClick={resetFilters}>
              {t('filters.reset')}
            </button>
          </div>
        </aside>

        <section className="listings-results-panel">
          <div className="results-heading">
            <div>
              <strong>
                {sortedListings.length} {t('listings.results')}
              </strong>
              <p className="muted-copy">{t('listings.resultsHint')}</p>
            </div>
            <div className="results-toolbar">
              <label className="field field--inline">
                <span>{t('filters.sort')}</span>
                <select value={sortMode} onChange={(event) => setSortMode(event.target.value as ListingSortMode)}>
                  <option value="recommended">{t('filters.sort.recommended')}</option>
                  <option value="rating">{t('filters.sort.rating')}</option>
                  <option value="price_low">{t('filters.sort.priceLow')}</option>
                  <option value="location">{t('filters.sort.location')}</option>
                  <option value="urgent">{t('filters.sort.urgent')}</option>
                </select>
              </label>
              <button className="button button-muted" type="button" onClick={resetFilters}>
                {t('filters.reset')}
              </button>
            </div>
          </div>

          <div className="active-filter-strip" aria-label={t('filters.title')}>
            {searchQuery && <span>{searchQuery}</span>}
            {isCustomCategory && <span>{customCategory || t('field.otherOption')}</span>}
            {!isCustomCategory && selectedCategory && <span>{selectedCategory.labels[language]}</span>}
            {isCustomSubcategory && <span>{customSubcategory || t('field.otherOption')}</span>}
            {!isCustomSubcategory && selectedSubcategory && <span>{selectedSubcategory.labels[language]}</span>}
            {isCustomSpecialty && <span>{customSpecialty || t('field.otherOption')}</span>}
            {!isCustomSpecialty && selectedSpecialty && <span>{selectedSpecialty.labels[language]}</span>}
            {selectedCountry && <span>{selectedCountry.labels[language]}</span>}
            {isCustomLocation && <span>{customLocation || t('field.otherOption')}</span>}
            {selectedLocation && <span>{selectedLocation.city}</span>}
            {providerType !== 'all' && <span>{t(`providerType.${providerType}`)}</span>}
            {urgentOnly && <span>{t('filters.urgent')}</span>}
            {priceShownOnly && <span>{t('filters.priceShown')}</span>}
            {listingLanguage !== 'all' && <span>{t(`language.${listingLanguage}`)}</span>}
            {minRating > 0 && <span>{minRating} / 5</span>}
            {sortMode !== 'recommended' && (
              <span>{t(sortMode === 'price_low' ? 'filters.sort.priceLow' : `filters.sort.${sortMode}`)}</span>
            )}
            {!searchQuery &&
              !selectedCategory &&
              !isCustomCategory &&
              !selectedSubcategory &&
              !isCustomSubcategory &&
              !selectedSpecialty &&
              !isCustomSpecialty &&
              !selectedCountry &&
              !isCustomLocation &&
              !selectedLocation &&
              providerType === 'all' &&
              !urgentOnly &&
              !priceShownOnly &&
              listingLanguage === 'all' &&
              minRating === 0 &&
              sortMode === 'recommended' && <span>{t('listings.noActiveFilters')}</span>}
          </div>

          {sortedListings.length > 0 ? (
            <div className="listing-grid">
              {sortedListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  requestLocationId={activeLocationId}
                  searchQuery={effectiveSearchQuery}
                />
              ))}
            </div>
          ) : (
            <div className="empty-page">
              <p className="kicker">{t('listings.empty.title')}</p>
              <h1>{t('listings.empty.text')}</h1>
              <Link className="button button-primary" to="/request">
                {t('home.customRequest')}
              </Link>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

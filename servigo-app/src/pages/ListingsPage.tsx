import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ListingCard } from '../components/ListingCard';
import {
  filterListings,
  findCategory,
  findSpecialty,
  findSubcategory,
  getLocationPriority,
  listingLanguages,
  marketplaceCategories,
  providerTypes
} from '../data/marketplaceData';
import { getCoverageCountries } from '../data/euCoverageOptions';
import { getLocationsByCountry } from '../data/locationData';
import { useTranslation } from '../i18n/useTranslation';
import type { Locale, ProviderType, ServiceListing } from '../types/servigo';

type ListingSortMode = 'recommended' | 'rating' | 'price_low' | 'location' | 'urgent';

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
  const { language, t } = useTranslation();
  const [categorySlug, setCategorySlug] = useState(searchParams.get('category') ?? '');
  const [subcategorySlug, setSubcategorySlug] = useState(searchParams.get('subcategory') ?? '');
  const [specialtySlug, setSpecialtySlug] = useState(searchParams.get('specialty') ?? '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '');
  const [countryCode, setCountryCode] = useState(searchParams.get('country') ?? '');
  const [locationId, setLocationId] = useState(searchParams.get('location') ?? '');
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
    setSearchQuery(searchParams.get('q') ?? '');
    setCountryCode(searchParams.get('country') ?? '');
    setLocationId(searchParams.get('location') ?? '');
    setProviderType((searchParams.get('providerType') as ProviderType | null) ?? 'all');
    setUrgentOnly(searchParams.get('urgent') === 'true');
    setPriceShownOnly(searchParams.get('priceShown') === 'true');
    setListingLanguage((searchParams.get('language') as Locale | null) ?? 'all');
    setMinRating(Number(searchParams.get('rating') ?? 0));
  }, [searchParams]);

  const selectedCategory = findCategory(categorySlug);
  const selectedSubcategory = findSubcategory(categorySlug, subcategorySlug);
  const selectedSpecialty = findSpecialty(categorySlug, subcategorySlug, specialtySlug);
  const countryOptions = useMemo(() => getCoverageCountries(language), [language]);
  const locationOptions = getLocationsByCountry(countryCode);
  const selectedLocation = locationOptions.find((location) => location.id === locationId);
  const selectedCountry = countryOptions.find((country) => country.countryCode === countryCode);
  const filteredListings = useMemo(
    () =>
      filterListings({
        categorySlug,
        subcategorySlug,
        specialtySlug,
        locationId,
        searchQuery,
        providerType,
        urgentOnly,
        priceShownOnly,
        language: listingLanguage,
        minRating
      }),
    [
      categorySlug,
      listingLanguage,
      locationId,
      minRating,
      priceShownOnly,
      providerType,
      searchQuery,
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
        (first, second) => getLocationPriority(first, locationId) - getLocationPriority(second, locationId)
      );
    }

    if (sortMode === 'urgent') {
      return listings.sort(
        (first, second) => Number(second.availability.urgent) - Number(first.availability.urgent) || second.rating - first.rating
      );
    }

    return filteredListings;
  }, [filteredListings, language, locationId, sortMode]);

  const resetFilters = () => {
    setCategorySlug('');
    setSubcategorySlug('');
    setSpecialtySlug('');
    setSearchQuery('');
    setCountryCode('');
    setLocationId('');
    setProviderType('all');
    setUrgentOnly(false);
    setPriceShownOnly(false);
    setListingLanguage('all');
    setMinRating(0);
    setSortMode('recommended');
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

          <label className="field">
            <span>{t('home.searchLabel')}</span>
            <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
          </label>

          <label className="field">
            <span>{t('filters.category')}</span>
            <select
              value={categorySlug}
              onChange={(event) => {
                setCategorySlug(event.target.value);
                setSubcategorySlug('');
                setSpecialtySlug('');
              }}
            >
              <option value="">{t('common.all')}</option>
              {marketplaceCategories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.labels[language]}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>{t('filters.subcategory')}</span>
            <select
              value={subcategorySlug}
              onChange={(event) => {
                setSubcategorySlug(event.target.value);
                setSpecialtySlug('');
              }}
            >
              <option value="">{t('common.all')}</option>
              {selectedCategory?.subcategories.map((subcategory) => (
                <option key={subcategory.slug} value={subcategory.slug}>
                  {subcategory.labels[language]}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>{t('filters.specialty')}</span>
            <select value={specialtySlug} onChange={(event) => setSpecialtySlug(event.target.value)}>
              <option value="">{t('common.all')}</option>
              {selectedSubcategory?.specialties.map((specialty) => (
                <option key={specialty.slug} value={specialty.slug}>
                  {specialty.labels[language]}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>{t('filters.country')}</span>
            <select
              value={countryCode}
              onChange={(event) => {
                setCountryCode(event.target.value);
                setLocationId('');
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
            <select value={locationId} onChange={(event) => setLocationId(event.target.value)}>
              <option value="">{t('common.all')}</option>
              {locationOptions.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.city} · {location.region}
                </option>
              ))}
            </select>
          </label>

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

          <button className="button button-ghost" type="button" onClick={resetFilters}>
            {t('filters.reset')}
          </button>
        </aside>

        <section>
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
            {selectedCategory && <span>{selectedCategory.labels[language]}</span>}
            {selectedSubcategory && <span>{selectedSubcategory.labels[language]}</span>}
            {selectedSpecialty && <span>{selectedSpecialty.labels[language]}</span>}
            {selectedCountry && <span>{selectedCountry.labels[language]}</span>}
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
              !selectedSubcategory &&
              !selectedSpecialty &&
              !selectedCountry &&
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
                <ListingCard key={listing.id} listing={listing} requestLocationId={locationId} searchQuery={searchQuery} />
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

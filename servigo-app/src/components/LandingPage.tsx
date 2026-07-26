import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ListingCard } from './ListingCard';
import { ServiceIcon } from './ServiceIcon';
import {
  marketplaceCategories,
  searchCategoryMatches,
  searchListings
} from '../data/marketplaceData';
import {
  getLocation,
  getStoredUserLocation,
  locationChangeEventName
} from '../data/locationData';
import { useTranslation } from '../i18n/useTranslation';

const quickCategorySlugs = [
  'home-repairs',
  'automotive-mechanics',
  'cleaning-facility',
  'garden-outdoor',
  'education-tutoring',
  'sport-coaching',
  'music-audio',
  'beauty-wellness',
  'pet-services',
  'moving-transport',
  'digital-admin',
  'events',
  'business-services'
];

export function LandingPage() {
  const { language, t } = useTranslation();
  const navigate = useNavigate();
  const storedLocation = getStoredUserLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationId, setLocationId] = useState(storedLocation?.locationId ?? '');
  const [countryCode, setCountryCode] = useState(storedLocation?.countryCode ?? getLocation(storedLocation?.locationId)?.countryCode ?? '');
  const [noMatch, setNoMatch] = useState(false);

  const selectedLocation = getLocation(locationId);
  const categoryMatches = useMemo(
    () => (searchQuery.trim() ? searchCategoryMatches(searchQuery, locationId) : []),
    [locationId, searchQuery]
  );
  const suggestedResults = categoryMatches[0]?.listings ?? [];
  const featuredResults = useMemo(() => searchListings('', locationId).slice(0, 4), [locationId]);
  const displayedListings = suggestedResults.length > 0 ? suggestedResults : featuredResults;

  useEffect(() => {
    const syncLocation = () => {
      const nextStoredLocation = getStoredUserLocation();
      setLocationId(nextStoredLocation?.locationId ?? '');
      setCountryCode(nextStoredLocation?.countryCode ?? getLocation(nextStoredLocation?.locationId)?.countryCode ?? '');
    };

    window.addEventListener(locationChangeEventName, syncLocation);
    return () => window.removeEventListener(locationChangeEventName, syncLocation);
  }, []);

  const buildSearchPath = (query: string, categorySlug?: string) => {
    const trimmedQuery = query.trim();
    const params = new URLSearchParams();

    if (trimmedQuery) {
      params.set('q', trimmedQuery);
    }

    if (categorySlug) {
      params.set('category', categorySlug);
    }

    if (countryCode || selectedLocation?.countryCode) {
      params.set('country', countryCode || selectedLocation?.countryCode || '');
    }

    if (locationId) {
      params.set('location', locationId);
    }

    return `/listings${params.toString() ? `?${params.toString()}` : ''}`;
  };

  const runCategorySearch = (query: string, categorySlug: string) => {
    setNoMatch(false);
    navigate(buildSearchPath(query, categorySlug));
  };

  const runSearch = (query: string) => {
    const trimmedQuery = query.trim();
    const matches = trimmedQuery ? searchCategoryMatches(trimmedQuery, locationId) : [];

    if (trimmedQuery && matches.length === 0) {
      setSearchQuery(trimmedQuery);
      setNoMatch(true);
      return;
    }

    setNoMatch(false);
    navigate(buildSearchPath(trimmedQuery, matches[0]?.category.slug));
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    runSearch(searchQuery);
  };

  return (
    <section className="search-home">
      <div className="search-home__inner">
        <div className="search-home__stage">
          <p className="home-search-question">{t('home.question')}</p>

          <div className="home-search-shell">
            <form className="home-search" onSubmit={submitSearch}>
              <label className="field home-search__input">
                <span className="sr-only">{t('home.searchLabel')}</span>
                <input
                  value={searchQuery}
                  placeholder={t('home.searchPlaceholder')}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setNoMatch(false);
                  }}
                />
              </label>

              <button className="button button-primary home-search__submit" type="submit">
                {t('home.searchButton')}
              </button>
            </form>

            {categoryMatches.length > 0 && (
              <div className="home-search-suggestions home-category-suggestions" role="listbox" aria-label={t('home.categorySuggestions')}>
                {categoryMatches.map(({ category, listingCount, listings }) => (
                  <button
                    key={category.slug}
                    type="button"
                    role="option"
                    onClick={() => runCategorySearch(searchQuery, category.slug)}
                  >
                    <span className="small-label">{t('field.category')}</span>
                    <strong>{category.labels[language]}</strong>
                    <small>
                      {t('home.categoryMatchCount', {
                        count: listingCount
                      })}
                    </small>
                    {listings.length > 0 && (
                      <span className="home-category-suggestions__examples">
                        {listings
                          .map((listing) => `${listing.title[language]} · ${listing.providerName}`)
                          .join(' • ')}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {noMatch && (
          <div className="empty-page search-empty">
            <p className="kicker">{t('listings.empty.title')}</p>
            <h2>{t('listings.empty.text')}</h2>
            <div className="panel-actions">
              <Link className="button button-primary" to="/categories">
                {t('home.primary')}
              </Link>
              <Link className="button button-ghost" to="/request">
                {t('home.customRequest')}
              </Link>
            </div>
          </div>
        )}

        <div className="search-home__below">
          <p className="kicker">{t('brand.tagline')}</p>
          <h1>{t('home.title')}</h1>
          <p className="home-lede">{t('home.subtitle')}</p>

          <nav className="quick-categories" aria-label={t('home.quickCategories')}>
            {quickCategorySlugs.map((slug) => {
              const category = marketplaceCategories.find((item) => item.slug === slug);
              if (!category) {
                return null;
              }

              return (
                <Link key={category.slug} to={`/categories/${category.slug}`}>
                  <ServiceIcon name={category.icon} />
                  <span>{category.labels[language]}</span>
                </Link>
              );
            })}
          </nav>

          <div className="home-action-row">
            <Link className="inline-link" to="/categories">{t('home.primary')}</Link>
            <Link className="inline-link" to="/listings">{t('home.secondary')}</Link>
            <Link className="inline-link" to="/request">{t('home.customRequest')}</Link>
          </div>

          <div className="provider-cta">
            <span>{t('home.providerCta')}</span>
            <Link className="button button-primary provider-cta__button" to="/provider/create-listing">
              {t('home.publishService')}
            </Link>
          </div>

          {displayedListings.length > 0 && !noMatch && (
            <div className="home-suggestions">
              <div className="home-section-heading">
                <span>{suggestedResults.length > 0 ? t('home.suggestions') : t('home.featuredListings')}</span>
                <Link to="/listings">{t('home.viewAllListings')}</Link>
              </div>
              <div className="listing-grid">
                {displayedListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    requestLocationId={locationId}
                    searchQuery={searchQuery}
                    variant="showcase"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

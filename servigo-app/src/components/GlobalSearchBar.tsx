import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchServiceMatches, type ServiceSearchMatch } from '../data/marketplaceData';
import {
  getLocation,
  getStoredUserLocation,
  locationChangeEventName
} from '../data/locationData';
import { useTranslation } from '../i18n/useTranslation';

function buildSearchPath(
  query: string,
  locationId: string,
  countryCode: string,
  match?: ServiceSearchMatch
) {
  const params = new URLSearchParams();
  const trimmedQuery = query.trim();
  const selectedLocation = getLocation(locationId);

  if (trimmedQuery) {
    params.set('q', trimmedQuery);
  }

  if (match?.category.slug) {
    params.set('category', match.category.slug);
  }

  if (match?.subcategory?.slug ?? match?.listing?.subcategorySlug) {
    params.set('subcategory', match?.subcategory?.slug ?? match?.listing?.subcategorySlug ?? '');
  }

  if (match?.specialty?.slug ?? match?.listing?.specialtySlug) {
    params.set('specialty', match?.specialty?.slug ?? match?.listing?.specialtySlug ?? '');
  }

  if (countryCode || selectedLocation?.countryCode) {
    params.set('country', countryCode || selectedLocation?.countryCode || '');
  }

  if (locationId) {
    params.set('location', locationId);
  }

  return `/listings${params.toString() ? `?${params.toString()}` : ''}`;
}

export function GlobalSearchBar() {
  const { language, t } = useTranslation();
  const navigate = useNavigate();
  const storedLocation = getStoredUserLocation();
  const [query, setQuery] = useState('');
  const [locationId, setLocationId] = useState(storedLocation?.locationId ?? '');
  const [countryCode, setCountryCode] = useState(
    storedLocation?.countryCode ?? getLocation(storedLocation?.locationId)?.countryCode ?? ''
  );

  const matches = useMemo(
    () => (query.trim() ? searchServiceMatches(query, locationId) : []),
    [locationId, query]
  );

  useEffect(() => {
    const syncLocation = () => {
      const nextStoredLocation = getStoredUserLocation();
      setLocationId(nextStoredLocation?.locationId ?? '');
      setCountryCode(nextStoredLocation?.countryCode ?? getLocation(nextStoredLocation?.locationId)?.countryCode ?? '');
    };

    window.addEventListener(locationChangeEventName, syncLocation);
    return () => window.removeEventListener(locationChangeEventName, syncLocation);
  }, []);

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

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(buildSearchPath(query, locationId, countryCode, matches[0]));
  };

  const selectMatch = (match: ServiceSearchMatch) => {
    setQuery(getMatchLabel(match));
    navigate(buildSearchPath(query || getMatchLabel(match), locationId, countryCode, match));
  };

  return (
    <div className="page-search-band">
      <div className="page-search">
        <form className="page-search__form" onSubmit={submitSearch}>
          <span className="page-search__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M10.8 18a7.2 7.2 0 1 1 5.1-2.1l3.6 3.6-1.4 1.4-3.6-3.6A7.1 7.1 0 0 1 10.8 18Zm0-2a5.2 5.2 0 1 0 0-10.4 5.2 5.2 0 0 0 0 10.4Z" />
            </svg>
          </span>
          <label className="field page-search__input">
            <span className="sr-only">{t('home.searchLabel')}</span>
            <input
              type="search"
              value={query}
              placeholder={t('home.searchPlaceholder')}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <button className="button button-primary page-search__button" type="submit" aria-label={t('home.searchButton')}>
            <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
              <path d="M10.8 18a7.2 7.2 0 1 1 5.1-2.1l3.6 3.6-1.4 1.4-3.6-3.6A7.1 7.1 0 0 1 10.8 18Zm0-2a5.2 5.2 0 1 0 0-10.4 5.2 5.2 0 0 0 0 10.4Z" />
            </svg>
          </button>
        </form>

        {matches.length > 0 && (
          <div className="page-search__suggestions" role="listbox" aria-label={t('home.serviceSuggestions')}>
            {matches.map((match) => (
              <button key={match.id} type="button" role="option" onClick={() => selectMatch(match)}>
                <span className="small-label">{getMatchContext(match)}</span>
                <strong>{getMatchLabel(match)}</strong>
                <small>{t('home.serviceMatchCount', { count: match.listingCount })}</small>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

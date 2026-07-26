import { Link, useNavigate } from 'react-router-dom';
import { ServiceIcon } from './ServiceIcon';
import { findCategory, findSpecialty, findSubcategory } from '../data/marketplaceData';
import { formatLocation, getLocation } from '../data/locationData';
import { buildQuoteContextFromListing, saveDraftFromQuoteContext } from '../data/quoteRequestContext';
import { useTranslation } from '../i18n/useTranslation';
import type { ServiceListing } from '../types/servigo';

interface ListingCardProps {
  listing: ServiceListing;
  requestLocationId?: string;
  searchQuery?: string;
  variant?: 'default' | 'showcase';
}

export function ListingCard({ listing, requestLocationId, searchQuery, variant = 'default' }: ListingCardProps) {
  const navigate = useNavigate();
  const { language, t } = useTranslation();
  const category = findCategory(listing.categorySlug);
  const subcategory = findSubcategory(listing.categorySlug, listing.subcategorySlug);
  const specialty = findSpecialty(listing.categorySlug, listing.subcategorySlug, listing.specialtySlug);
  const baseLocation = getLocation(listing.baseLocationId);
  const providerInitial = listing.providerName.trim().charAt(0).toUpperCase();
  const locationLabel = formatLocation(baseLocation);
  const categoryLabel = category?.labels[language] ?? t('field.category');
  const professionLabel =
    listing.professionTitle?.[language] ??
    listing.professionTitle?.fr ??
    specialty?.labels[language] ??
    subcategory?.labels[language] ??
    listing.title[language];
  const offerTitle = listing.title[language] ?? listing.title.fr ?? '';

  const requestQuote = () => {
    const context = buildQuoteContextFromListing(listing, {
      locationId: requestLocationId,
      sourceType: searchQuery ? 'search' : 'listing',
      searchQuery
    });
    saveDraftFromQuoteContext(context);
    navigate('/request/review');
  };

  const compactPrice = (() => {
    const priceLabel = listing.priceLabel[language] ?? listing.priceLabel.fr ?? '';
    const amountMatch = priceLabel.match(/\d+/);

    if (!amountMatch) {
      return priceLabel;
    }

    if (/heure|hora|hour/i.test(priceLabel)) {
      return `${amountMatch[0]}€/h`;
    }

    if (/partir|from/i.test(priceLabel)) {
      return `${amountMatch[0]}€+`;
    }

    return `${amountMatch[0]}€`;
  })();

  if (variant === 'showcase') {
    return (
      <Link className="listing-card listing-card--showcase" to={`/listings/${listing.id}`}>
        <div className="listing-card__visual">
          {listing.photos?.[0] ? (
            <img src={listing.photos[0]} alt="" />
          ) : (
            <div className="listing-card__visual-content">
              <span className="listing-card__avatar">{providerInitial}</span>
              <span className="listing-card__service-icon">
                <ServiceIcon name={category?.icon ?? 'tools'} />
              </span>
            </div>
          )}
          <strong className="listing-card__price-chip">{compactPrice}</strong>
        </div>

        <div className="listing-card__main">
          <strong className="listing-card__provider-name">{listing.providerName}</strong>
          <span className="listing-card__compact-title">{listing.title[language]}</span>
          <p>{listing.shortDescription[language]}</p>
          <span className="listing-card__compact-location">{locationLabel}</span>
        </div>
      </Link>
    );
  }

  return (
    <article className="listing-card">
      <Link className="listing-card__result-visual" to={`/listings/${listing.id}`} aria-label={professionLabel}>
        {listing.photos?.[0] ? (
          <img src={listing.photos[0]} alt="" />
        ) : (
          <div className="listing-card__visual-content">
            <span className="listing-card__avatar">{providerInitial}</span>
            <span className="listing-card__service-icon">
              <ServiceIcon name={category?.icon ?? 'tools'} />
            </span>
          </div>
        )}
        <strong className="listing-card__price-chip">{compactPrice}</strong>
      </Link>

      <div className="listing-card__main">
        <span className="small-label">{categoryLabel}</span>
        <h2>
          <Link to={`/listings/${listing.id}`}>{professionLabel}</Link>
        </h2>
        <strong className="listing-card__offer-title">{offerTitle}</strong>
        <p>{listing.shortDescription[language]}</p>
        <div className="listing-card__facts">
          <span>{listing.providerName}</span>
          <span>{locationLabel}</span>
          <span>{listing.rating} / 5</span>
        </div>
        <p className="category-line">
          {subcategory?.labels[language]} · {specialty?.labels[language]}
        </p>
      </div>

      <div className="listing-card__meta">
        <strong>{listing.priceLabel[language]}</strong>
        <div className="provider-tags">
          <span>{t(`providerType.${listing.providerType}`)}</span>
          {listing.availability.urgent && <span>{t('availability.urgentRequests')}</span>}
          {listing.remoteAvailable && <span>{t('listing.remote')}</span>}
          {listing.trust.verificationBadge && <span>{t(`trust.${listing.trust.trustLevel}`)}</span>}
        </div>
        <div className="row-actions">
          <Link className="inline-link" to={`/listings/${listing.id}`}>
            {t('listing.open')}
          </Link>
          <button type="button" onClick={requestQuote}>
            {t('listing.requestQuote')}
          </button>
        </div>
      </div>
    </article>
  );
}

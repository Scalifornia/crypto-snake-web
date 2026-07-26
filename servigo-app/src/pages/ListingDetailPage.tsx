import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ServiceIcon } from '../components/ServiceIcon';
import {
  findCategory,
  findListing,
  findSpecialty,
  findSubcategory,
  getEligibleListingsForNotification
} from '../data/marketplaceData';
import { formatLocation, getLocation } from '../data/locationData';
import { buildQuoteContextFromListing, getPreferredLocationId, saveDraftFromQuoteContext } from '../data/quoteRequestContext';
import { useTranslation } from '../i18n/useTranslation';

export function ListingDetailPage() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { language, t } = useTranslation();
  const [contactPreviewOpen, setContactPreviewOpen] = useState(false);
  const listing = findListing(listingId);

  if (!listing) {
    return (
      <section className="page-section">
        <div className="empty-page">
          <p className="kicker">{t('listing.notFound.kicker')}</p>
          <h1>{t('listing.notFound.title')}</h1>
          <Link className="button button-primary" to="/listings">
            {t('listing.back')}
          </Link>
        </div>
      </section>
    );
  }

  const category = findCategory(listing.categorySlug);
  const subcategory = findSubcategory(listing.categorySlug, listing.subcategorySlug);
  const specialty = findSpecialty(listing.categorySlug, listing.subcategorySlug, listing.specialtySlug);
  const baseLocation = getLocation(listing.baseLocationId);
  const providerInitial = listing.providerName.trim().charAt(0).toUpperCase();
  const selectedLocationId = getPreferredLocationId(undefined, listing.baseLocationId);
  const eligibleListings = getEligibleListingsForNotification(
    listing.categorySlug,
    listing.subcategorySlug,
    listing.specialtySlug,
    selectedLocationId
  );

  const requestQuote = () => {
    const context = buildQuoteContextFromListing(listing, { locationId: selectedLocationId });
    saveDraftFromQuoteContext(context);
    navigate('/request/review');
  };
  const languageList = listing.languages.map((locale) => t(`language.${locale}`)).join(' · ');
  const coveredAreasCount = listing.coveredLocationIds.length;

  return (
    <section className="page-section listing-detail-page">
      <div className="listing-detail-hero">
        <div className="listing-detail-visual">
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
        </div>
        <div className="listing-detail-copy">
          <p className="kicker">{category?.labels[language]}</p>
          <h1>{listing.title[language]}</h1>
          <p>{listing.shortDescription[language]}</p>
          <div className="listing-card__facts">
            <span>{listing.providerName}</span>
            <span>{formatLocation(baseLocation)}</span>
            <span>{t(`providerType.${listing.providerType}`)}</span>
          </div>
        </div>
        <aside className="listing-detail-action-card">
          <strong>{listing.priceLabel[language]}</strong>
          <span>
            {listing.rating} / 5 · {listing.reviews} {t('reviews')}
          </span>
          <button className="button button-primary" type="button" onClick={requestQuote}>
            {t('listing.requestQuote')}
          </button>
          <button className="button button-ghost" type="button" onClick={() => setContactPreviewOpen(true)}>
            {t('listing.contactProvider')}
          </button>
        </aside>
      </div>

      <section className="provider-profile-strip">
        <div className="provider-profile-strip__identity">
          <div className="provider-profile-strip__avatar">
            {listing.photos?.[0] ? <img src={listing.photos[0]} alt="" /> : <span>{providerInitial}</span>}
          </div>
          <div>
            <p className="kicker">{t('listing.providerPublicTitle')}</p>
            <h2>{listing.providerName}</h2>
            <p>{t('listing.providerPublicSubtitle', { location: formatLocation(baseLocation) })}</p>
          </div>
        </div>
        <dl className="provider-proof-grid">
          <div>
            <dt>{t('field.status')}</dt>
            <dd>{t(`trust.${listing.trust.trustLevel}`)}</dd>
          </div>
          <div>
            <dt>{t('trust.responseReliability')}</dt>
            <dd>{listing.trust.responseReliability}%</dd>
          </div>
          <div>
            <dt>{t('listing.coversAreas')}</dt>
            <dd>{coveredAreasCount}</dd>
          </div>
          <div>
            <dt>{t('listing.languages')}</dt>
            <dd>{languageList}</dd>
          </div>
        </dl>
      </section>

      {contactPreviewOpen && (
        <article className="brief-card context-alert">
          <h2>{t('listing.contactPreviewTitle')}</h2>
          <p className="muted-copy">{t('listing.contactPreviewText')}</p>
          <dl className="brief-list">
            <dt>{t('field.email')}</dt>
            <dd>{listing.email}</dd>
            <dt>{t('field.phone')}</dt>
            <dd>{listing.phone}</dd>
          </dl>
        </article>
      )}

      <div className="request-detail-grid">
        <article className="brief-card">
          <h2>{t('listing.serviceInfo')}</h2>
          <dl className="brief-list">
            <dt>{t('field.category')}</dt>
            <dd>{category?.labels[language]}</dd>
            <dt>{t('field.subcategory')}</dt>
            <dd>{subcategory?.labels[language]}</dd>
            <dt>{t('field.specialty')}</dt>
            <dd>{specialty?.labels[language]}</dd>
            <dt>{t('field.priceModel')}</dt>
            <dd>{t(`priceModel.${listing.priceModel}`)}</dd>
          </dl>
        </article>

        <article className="brief-card">
          <h2>{t('listing.providerInfo')}</h2>
          <dl className="brief-list">
            <dt>{t('field.providerName')}</dt>
            <dd>{listing.providerName}</dd>
            <dt>{t('field.providerType')}</dt>
            <dd>{t(`providerType.${listing.providerType}`)}</dd>
            <dt>{t('field.mainCommune')}</dt>
            <dd>{formatLocation(baseLocation)}</dd>
            <dt>{t('field.email')}</dt>
            <dd>{listing.email}</dd>
            <dt>{t('field.phone')}</dt>
            <dd>{listing.phone}</dd>
          </dl>
        </article>

        <article className="brief-card">
          <h2>{t('listing.serviceArea')}</h2>
          <div className="pill-list">
            {listing.coveredLocationIds.map((locationId) => (
              <span key={locationId}>{formatLocation(getLocation(locationId))}</span>
            ))}
          </div>
        </article>

        <article className="brief-card">
          <h2>{t('listing.availability')}</h2>
          <div className="pill-list">
            {listing.availability.weekdays && <span>{t('availability.weekdays')}</span>}
            {listing.availability.weekends && <span>{t('availability.weekends')}</span>}
            {listing.availability.urgent && <span>{t('availability.urgentRequests')}</span>}
            {listing.remoteAvailable && <span>{t('listing.remote')}</span>}
          </div>
        </article>

        <article className="brief-card">
          <h2>{t('listing.languages')}</h2>
          <div className="pill-list">
            {listing.languages.map((locale) => (
              <span key={locale}>{t(`language.${locale}`)}</span>
            ))}
          </div>
        </article>

        <article className="brief-card">
          <h2>{t('providerProfile.operations')}</h2>
          <dl className="brief-list">
            <dt>{t('listing.travel')}</dt>
            <dd>{listing.travelToClient ? t('common.yes') : t('common.no')}</dd>
            <dt>{t('listing.radius')}</dt>
            <dd>{listing.serviceRadiusKm} km</dd>
            <dt>{t('listing.registration')}</dt>
            <dd>{listing.professionalRegistration ?? t('common.optional')}</dd>
            <dt>{t('field.vatNumber')}</dt>
            <dd>{listing.vatNumber ?? t('common.optional')}</dd>
            <dt>{t('listing.insurance')}</dt>
            <dd>{listing.insurance ?? t('common.optional')}</dd>
          </dl>
        </article>

        <article className="brief-card">
          <h2>{t('listing.trust')}</h2>
          <dl className="brief-list">
            <dt>{t('field.status')}</dt>
            <dd>{t(`trust.${listing.trust.trustLevel}`)}</dd>
            <dt>{t('trust.incidents')}</dt>
            <dd>{listing.trust.incidentCount}</dd>
            <dt>{t('trust.responseReliability')}</dt>
            <dd>{listing.trust.responseReliability}%</dd>
            <dt>{t('trust.cancellationReliability')}</dt>
            <dd>{listing.trust.cancellationReliability}%</dd>
          </dl>
        </article>

        <article className="brief-card">
          <h2>{t('listing.fitTitle')}</h2>
          <ul className="brief-points">
            <li>{t('listing.fitReasonCategory')}</li>
            <li>{t('listing.fitReasonLocation', { location: formatLocation(baseLocation) })}</li>
            <li>
              {listing.availability.urgent ? t('listing.fitReasonUrgent') : t('listing.fitReasonStandard')}
            </li>
          </ul>
        </article>

        <article className="brief-card">
          <h2>{t('listing.nextStepsTitle')}</h2>
          <ul className="brief-points">
            <li>{t('listing.nextStepBrief')}</li>
            <li>{t('listing.nextStepFiles')}</li>
            <li>{t('listing.nextStepNotification', { count: eligibleListings.length })}</li>
          </ul>
        </article>

        <article className="brief-card request-detail-grid__wide">
          <h2>{t('listing.notificationLogic')}</h2>
          <p className="muted-copy">
            {t('listing.eligibleProviders', {
              count: eligibleListings.length
            })}
          </p>
        </article>
      </div>
    </section>
  );
}

import { Link, useParams } from 'react-router-dom';
import { QuoteCards } from '../components/QuoteCards';
import { StatusBadge } from '../components/StatusBadge';
import { StatusTimeline } from '../components/StatusTimeline';
import { getStoredSubmittedRequest } from '../data/requestDraft';
import { categoryLabel, providers } from '../data/servigoData';
import { findListing } from '../data/marketplaceData';
import { getEligibleListingsForContext } from '../data/quoteRequestContext';
import { getRequestJob, getRequestQuotes, serviceRequests } from '../data/workflowData';
import { useTranslation } from '../i18n/useTranslation';

export function RequestDetailPage() {
  const { id } = useParams();
  const submittedRequest = getStoredSubmittedRequest();
  const request =
    serviceRequests.find((item) => item.id === id) ?? (submittedRequest?.id === id ? submittedRequest : undefined);
  const { language, t } = useTranslation();

  if (!request) {
    return (
      <section className="page-section">
        <div className="empty-page">
          <p className="kicker">{t('request.notFound.kicker')}</p>
          <h1>{t('request.notFound.title')}</h1>
          <Link className="button button-primary" to="/client">
            {t('request.notFound.back')}
          </Link>
        </div>
      </section>
    );
  }

  const matchedProviders = request.matchedProviderIds
    .map((providerId) => providers.find((provider) => provider.id === providerId))
    .filter(Boolean);
  const requestQuotes = getRequestQuotes(request.id);
  const job = getRequestJob(request.id);
  const quoteContext = request.quoteContext;
  const selectedListing = quoteContext?.listingId ? findListing(quoteContext.listingId) : undefined;
  const eligibleProviderCount = quoteContext
    ? new Set(getEligibleListingsForContext(quoteContext).map((listing) => listing.providerId)).size
    : 0;

  return (
    <section className="page-section request-detail-page">
      <div className="page-heading page-heading-row">
        <div>
          <p className="kicker">{request.reference}</p>
          <h1>{request.title}</h1>
          <p>
            {categoryLabel(request.categoryId, language)} · {request.commune} · {request.addressHint}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <div className="request-detail-grid">
        <article className="brief-card">
          <h2>{t('field.client')}</h2>
          <dl className="brief-list">
            <dt>{t('field.name')}</dt>
            <dd>{request.client.name}</dd>
            <dt>{t('field.email')}</dt>
            <dd>{request.client.email}</dd>
            <dt>{t('field.phone')}</dt>
            <dd>{request.client.phone}</dd>
          </dl>
        </article>

        <article className="brief-card">
          <h2>{t('field.service')}</h2>
          <dl className="brief-list">
            <dt>{t('field.category')}</dt>
            <dd>{categoryLabel(request.categoryId, language)}</dd>
            <dt>{t('field.commune')}</dt>
            <dd>{request.commune}</dd>
            <dt>{t('field.urgency')}</dt>
            <dd>{t(`urgency.${request.urgency}`)}</dd>
            <dt>{t('field.propertyType')}</dt>
            <dd>{t(`property.${request.propertyType}`)}</dd>
          </dl>
        </article>

        {quoteContext && (
          <article className="brief-card">
            <h2>{t('quoteContext.title')}</h2>
            <dl className="brief-list">
              <dt>{t('quoteContext.requestedService')}</dt>
              <dd>{quoteContext.serviceTitle?.[language] ?? categoryLabel(request.categoryId, language)}</dd>
              {selectedListing && (
                <>
                  <dt>{t('quoteContext.selectedListing')}</dt>
                  <dd>{selectedListing.title[language]}</dd>
                </>
              )}
              {quoteContext.providerName && (
                <>
                  <dt>{t('quoteContext.selectedProvider')}</dt>
                  <dd>{quoteContext.providerName}</dd>
                </>
              )}
              <dt>{t('quoteContext.matchingProviders')}</dt>
              <dd>
                {t('quoteContext.matchingCount', {
                  count: eligibleProviderCount
                })}
              </dd>
            </dl>
          </article>
        )}

        <article className="brief-card request-detail-grid__wide">
          <h2>{t('request.structuredBrief')}</h2>
          <ul className="brief-points">
            {request.brief.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <dl className="brief-list">
            {request.includeSizeDetails !== false && (
              <>
                <dt>{t('field.surface')}</dt>
                <dd>{request.surface} m2</dd>
                <dt>{t('field.rooms')}</dt>
                <dd>{request.rooms}</dd>
              </>
            )}
            <dt>{t('field.access')}</dt>
            <dd>{request.accessNotes}</dd>
          </dl>
        </article>

        <article className="brief-card">
          <h2>{t('request.estimate')}</h2>
          <div className="estimate estimate-compact">
            <div>
              <span>{t('field.priceRange')}</span>
              <strong>
                {request.estimate.low} - {request.estimate.high} EUR
              </strong>
            </div>
            <div>
              <span>{t('field.duration')}</span>
              <strong>{request.estimate.hours} h</strong>
            </div>
          </div>
        </article>

        {request.attachments && request.attachments.length > 0 && (
          <article className="brief-card">
            <h2>{t('field.attachmentsSelected')}</h2>
            <p className="muted-copy">{t('field.attachmentMockNotice')}</p>
            <div className="attachment-list attachment-list--static">
              {request.attachments.map((attachment) => (
                <article key={attachment.id}>
                  <div>
                    <strong>{attachment.name}</strong>
                    <span>{attachment.type}</span>
                  </div>
                </article>
              ))}
            </div>
          </article>
        )}

        <article className="brief-card">
          <h2>{t('request.mission')}</h2>
          {job ? (
            <dl className="brief-list">
              <dt>{t('field.job')}</dt>
              <dd>{job.id.toUpperCase()}</dd>
              <dt>{t('field.planning')}</dt>
              <dd>{job.scheduledFor}</dd>
              <dt>{t('field.status')}</dt>
              <dd>{t(`job.${job.status}`)}</dd>
            </dl>
          ) : (
            <p className="muted-copy">{t('request.noMission')}</p>
          )}
        </article>
      </div>

      <div className="split-grid">
        <section className="brief-card">
          <h2>{t('request.matchedProviders')}</h2>
          <div className="compact-list">
            {matchedProviders.map((provider) => (
              <article key={provider?.id}>
                <h3>{provider?.name}</h3>
                <p>
                  {provider?.rating} / 5 · {provider?.reviews} {t('reviews')} ·{' '}
                  {provider?.verified ? t('provider.verified') : t('provider.pending')}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="brief-card">
          <h2>{t('request.timeline')}</h2>
          <StatusTimeline items={request.timeline} />
        </section>
      </div>

      <section className="brief-card request-quotes-section">
        <h2>{t('request.quotesReceived')}</h2>
        <QuoteCards quotes={requestQuotes} />
      </section>
    </section>
  );
}

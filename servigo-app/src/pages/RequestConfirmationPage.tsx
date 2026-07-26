import { Link } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import { getStoredSubmittedRequest } from '../data/requestDraft';
import { categoryLabel } from '../data/servigoData';
import { findListing } from '../data/marketplaceData';
import { getEligibleListingsForContext } from '../data/quoteRequestContext';
import { useTranslation } from '../i18n/useTranslation';

export function RequestConfirmationPage() {
  const submittedRequest = getStoredSubmittedRequest();
  const { language, t } = useTranslation();

  if (!submittedRequest) {
    return (
      <section className="page-section">
        <div className="empty-page">
          <p className="kicker">{t('confirmation.empty.kicker')}</p>
          <h1>{t('confirmation.empty.title')}</h1>
          <Link className="button button-primary" to="/request">
            {t('button.startRequest')}
          </Link>
        </div>
      </section>
    );
  }

  const quoteContext = submittedRequest.quoteContext;
  const selectedListing = quoteContext?.listingId ? findListing(quoteContext.listingId) : undefined;
  const eligibleListings = quoteContext ? getEligibleListingsForContext(quoteContext) : [];
  const eligibleProviderCount = new Set(eligibleListings.map((listing) => listing.providerId)).size;

  return (
    <section className="page-section confirmation-page">
      <div className="confirmation-panel">
        <p className="kicker">{t('confirmation.kicker')}</p>
        <h1>{submittedRequest.reference}</h1>
        <p>{t('confirmation.text')}</p>
        <StatusBadge status={submittedRequest.status} />
      </div>

      <div className="request-detail-grid">
        <article className="brief-card">
          <h2>{t('confirmation.summary')}</h2>
          <dl className="brief-list">
            <dt>{t('field.service')}</dt>
            <dd>{quoteContext?.serviceTitle?.[language] ?? categoryLabel(submittedRequest.categoryId, language)}</dd>
            {selectedListing && (
              <>
                <dt>{t('quoteContext.selectedListing')}</dt>
                <dd>{selectedListing.title[language]}</dd>
              </>
            )}
            {quoteContext?.providerName && (
              <>
                <dt>{t('quoteContext.selectedProvider')}</dt>
                <dd>{quoteContext.providerName}</dd>
              </>
            )}
            <dt>{t('field.commune')}</dt>
            <dd>{submittedRequest.commune}</dd>
            <dt>{t('field.urgency')}</dt>
            <dd>{t(`urgency.${submittedRequest.urgency}`)}</dd>
            <dt>{t('request.estimate')}</dt>
            <dd>
              {submittedRequest.estimate.low} - {submittedRequest.estimate.high} EUR
            </dd>
            {quoteContext && (
              <>
                <dt>{t('quoteContext.matchingProviders')}</dt>
                <dd>
                  {t('quoteContext.matchingCount', {
                    count: eligibleProviderCount
                  })}
                </dd>
              </>
            )}
            <dt>{t('field.attachments')}</dt>
            <dd>
              {submittedRequest.attachments?.length
                ? t('field.attachmentCount', {
                    count: submittedRequest.attachments.length
                  })
                : t('common.empty')}
            </dd>
          </dl>
        </article>

        {submittedRequest.attachments && submittedRequest.attachments.length > 0 && (
          <article className="brief-card">
            <h2>{t('field.attachmentsSelected')}</h2>
            <div className="attachment-list attachment-list--static">
              {submittedRequest.attachments.map((attachment) => (
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
          <h2>{t('confirmation.nextSteps')}</h2>
          <ol className="next-steps">
            <li>{t('confirmation.step1')}</li>
            <li>{t('confirmation.step2')}</li>
            <li>{t('confirmation.step3')}</li>
          </ol>
        </article>
      </div>

      <div className="panel-actions">
        <Link className="button button-primary" to="/client">
          {t('button.clientDashboard')}
        </Link>
        <Link className="button button-ghost" to={`/requests/${submittedRequest.id}`}>
          {t('button.openMockDetail')}
        </Link>
      </div>
    </section>
  );
}

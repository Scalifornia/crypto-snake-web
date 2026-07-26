import { Link } from 'react-router-dom';
import { RequestCard } from '../components/RequestCard';
import { getStoredSubmittedRequest } from '../data/requestDraft';
import { quotes, serviceRequests } from '../data/workflowData';
import { useTranslation } from '../i18n/useTranslation';

export function ClientDashboardPage() {
  const { t } = useTranslation();
  const submittedRequest = getStoredSubmittedRequest();
  const requests =
    submittedRequest && !serviceRequests.some((request) => request.id === submittedRequest.id)
      ? [submittedRequest, ...serviceRequests]
      : serviceRequests;
  const activeRequests = requests.filter((request) => !['completed', 'cancelled'].includes(request.status));
  const quotedRequests = requests.filter((request) => quotes.some((quote) => quote.requestId === request.id));
  const attachmentCount = requests.reduce((total, request) => total + (request.attachments?.length ?? 0), 0);

  return (
    <section className="page-section dashboard-page">
      <div className="page-heading page-heading-row">
        <div>
          <p className="kicker">{t('dashboard.client.kicker')}</p>
          <h1>{t('dashboard.client.title')}</h1>
          <p>{t('dashboard.client.description')}</p>
        </div>
        <Link className="button button-primary" to="/request">
          {t('dashboard.client.newRequest')}
        </Link>
      </div>

      <div className="dashboard-metrics">
        <article>
          <span>{t('dashboard.client.activeRequests')}</span>
          <strong>{activeRequests.length}</strong>
          <p>{t('dashboard.client.activeRequestsText')}</p>
        </article>
        <article>
          <span>{t('dashboard.client.requestsWithQuotes')}</span>
          <strong>{quotedRequests.length}</strong>
          <p>{t('dashboard.client.requestsWithQuotesText')}</p>
        </article>
        <article>
          <span>{t('dashboard.client.attachments')}</span>
          <strong>{attachmentCount}</strong>
          <p>{t('dashboard.client.attachmentsText')}</p>
        </article>
      </div>

      <div className="dashboard-list">
        {requests.map((request) => (
          <RequestCard key={request.id} request={request} />
        ))}
      </div>
    </section>
  );
}

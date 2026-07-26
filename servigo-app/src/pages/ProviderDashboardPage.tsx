import { useState } from 'react';
import { Link } from 'react-router-dom';
import { brand } from '../config/brand';
import { categoryLabel, providers } from '../data/servigoData';
import { jobs, quotes, serviceRequests } from '../data/workflowData';
import { useTranslation } from '../i18n/useTranslation';

export function ProviderDashboardPage() {
  const { language, t } = useTranslation();
  const [actionLog, setActionLog] = useState<Record<string, string>>({});
  const demoProviderId = 'luxclean-pro';
  const demoProvider = providers.find((provider) => provider.id === demoProviderId);
  const availableLeads = serviceRequests.filter(
    (request) => request.matchedProviderIds.includes(demoProviderId) && ['matched', 'quoted'].includes(request.status)
  );
  const acceptedJobs = jobs.filter((job) => job.providerId === demoProviderId);
  const quoteOpportunities = serviceRequests.filter(
    (request) =>
      request.matchedProviderIds.includes(demoProviderId) &&
      !quotes.some((quote) => quote.requestId === request.id && quote.providerId === demoProviderId)
  );

  const markAction = (id: string, label: string) => {
    setActionLog((current) => ({ ...current, [id]: label }));
  };

  return (
    <section className="page-section dashboard-page">
      <div className="page-heading">
        <p className="kicker">{t('dashboard.provider.kicker')}</p>
        <h1>{t('dashboard.provider.title')}</h1>
        <p>{t('dashboard.provider.description', { provider: demoProvider?.name ?? brand.brandName })}</p>
      </div>

      <div className="dashboard-metrics">
        <article>
          <span>{t('dashboard.provider.profileCompleteness')}</span>
          <strong>82%</strong>
          <p>{t('dashboard.provider.profileCompletenessText')}</p>
        </article>
        <article>
          <span>{t('dashboard.provider.openLeads')}</span>
          <strong>{availableLeads.length}</strong>
          <p>{t('dashboard.provider.openLeadsText')}</p>
        </article>
        <article>
          <span>{t('dashboard.provider.acceptedJobs')}</span>
          <strong>{acceptedJobs.length}</strong>
          <p>{t('dashboard.provider.acceptedJobsText')}</p>
        </article>
        <article>
          <span>{t('dashboard.provider.responseScore')}</span>
          <strong>92%</strong>
          <p>{t('dashboard.provider.responseScoreText')}</p>
        </article>
      </div>

      <section className="brief-card dashboard-extra dashboard-focus">
        <h2>{t('dashboard.provider.todayFocus')}</h2>
        <div className="compact-list compact-list--columns">
          <article>
            <span className="small-label">{t('dashboard.provider.priorityLead')}</span>
            <h3>{availableLeads[0]?.title ?? t('dashboard.provider.noPriorityLead')}</h3>
            <p>{availableLeads[0]?.nextAction ?? t('dashboard.provider.noPriorityLeadText')}</p>
          </article>
          <article>
            <span className="small-label">{t('dashboard.provider.profileAction')}</span>
            <h3>{t('dashboard.provider.profileActionTitle')}</h3>
            <p>{t('dashboard.provider.profileActionText')}</p>
          </article>
          <article>
            <span className="small-label">{t('dashboard.provider.qualityAction')}</span>
            <h3>{t('dashboard.provider.qualityActionTitle')}</h3>
            <p>{t('dashboard.provider.qualityActionText')}</p>
          </article>
        </div>
      </section>

      <div className="split-grid">
        <section className="brief-card">
          <h2>{t('dashboard.provider.availableLeads')}</h2>
          <div className="compact-list">
            {availableLeads.map((request) => (
              <article key={request.id}>
                <span className="small-label">{request.reference}</span>
                <h3>{request.title}</h3>
                <p>
                  {categoryLabel(request.categoryId, language)} · {request.commune} · {request.estimate.low} -{' '}
                  {request.estimate.high} EUR
                </p>
                <div className="row-actions">
                  <Link className="inline-link" to={`/requests/${request.id}`}>
                    {t('button.view')}
                  </Link>
                  <button type="button" onClick={() => markAction(request.id, t('dashboard.provider.quotePrepared'))}>
                    {t('button.sendQuote')}
                  </button>
                  <button type="button" onClick={() => markAction(`${request.id}-accept`, t('dashboard.provider.jobAccepted'))}>
                    {t('button.acceptJob')}
                  </button>
                </div>
                {actionLog[request.id] && <p className="mock-note">{actionLog[request.id]}</p>}
              </article>
            ))}
          </div>
        </section>

        <section className="brief-card">
          <h2>{t('dashboard.provider.acceptedJobs')}</h2>
          <div className="compact-list">
            {acceptedJobs.map((job) => (
              <article key={job.id}>
                <span className="small-label">{job.id}</span>
                <h3>{job.title}</h3>
                <p>
                  {job.commune} · {job.scheduledFor} · {t(`job.${job.status}`)}
                </p>
                <div className="row-actions">
                  <Link className="inline-link" to={`/requests/${job.requestId}`}>
                    {t('button.open')}
                  </Link>
                  <button type="button" onClick={() => markAction(job.id, t('dashboard.provider.completedLocal'))}>
                    {t('button.markCompleted')}
                  </button>
                </div>
                {actionLog[job.id] && <p className="mock-note">{actionLog[job.id]}</p>}
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="brief-card dashboard-extra">
        <h2>{t('dashboard.provider.quoteOpportunities')}</h2>
        <div className="compact-list">
          {quoteOpportunities.map((request) => (
            <article key={request.id}>
              <span className="small-label">{request.reference}</span>
              <h3>{request.title}</h3>
              <p>
                {request.commune} · {request.nextAction}
              </p>
              <button
                type="button"
                onClick={() => markAction(`${request.id}-quote`, t('dashboard.provider.quoteDrafted'))}
              >
                {t('button.sendQuote')}
              </button>
              {actionLog[`${request.id}-quote`] && <p className="mock-note">{actionLog[`${request.id}-quote`]}</p>}
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

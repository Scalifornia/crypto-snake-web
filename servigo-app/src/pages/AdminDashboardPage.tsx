import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import { categoryLabel } from '../data/servigoData';
import { platformMetrics, providerApprovals, requestStatusTransitions, serviceRequests } from '../data/workflowData';
import { useTranslation } from '../i18n/useTranslation';
import type { RequestStatus, ServiceRequest } from '../types/servigo';

export function AdminDashboardPage() {
  const { language, t } = useTranslation();
  const [requests, setRequests] = useState<ServiceRequest[]>(serviceRequests);
  const submittedRequests = requests.filter((request) => request.status === 'submitted');
  const underReviewRequests = requests.filter((request) => request.status === 'under_review');
  const categoryProposals = [
    {
      id: 'CAT-19',
      title: t('dashboard.admin.proposal.musicTitle'),
      source: t('dashboard.admin.proposal.providerSource'),
      risk: t('dashboard.admin.proposal.lowRisk')
    },
    {
      id: 'CAT-20',
      title: t('dashboard.admin.proposal.poolTitle'),
      source: t('dashboard.admin.proposal.requestSource'),
      risk: t('dashboard.admin.proposal.checkDuplicate')
    }
  ];
  const metrics = useMemo(
    () => [
      {
        label: t('dashboard.metrics.openRequests'),
        value: String(requests.filter((request) => request.status !== 'completed').length)
      },
      { label: t('dashboard.metrics.verifiedProviders'), value: platformMetrics[1].value },
      { label: t('dashboard.metrics.pendingQuotes'), value: platformMetrics[2].value },
      { label: t('dashboard.metrics.acceptedQuoteRate'), value: platformMetrics[3].value },
      { label: t('dashboard.metrics.categoryProposals'), value: String(categoryProposals.length) }
    ],
    [categoryProposals.length, requests, t]
  );

  const updateStatus = (requestId: string, status: RequestStatus) => {
    const nextStatus = requestStatusTransitions[status][0];

    setRequests((current) =>
      current.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status,
              nextAction: nextStatus
                ? t('dashboard.admin.nextStep', { status: t(`status.${nextStatus}`) })
                : t('dashboard.admin.noAction'),
              timeline: [
                ...request.timeline,
                {
                  status,
                  label: t(`status.${status}`),
                  at: t('common.mock'),
                  actor: 'admin',
                  note: t('dashboard.admin.mockStatusChange')
                }
              ]
            }
          : request
      )
    );
  };

  return (
    <section className="page-section dashboard-page">
      <div className="page-heading">
        <p className="kicker">{t('dashboard.admin.kicker')}</p>
        <h1>{t('dashboard.admin.title')}</h1>
        <p>{t('dashboard.admin.description')}</p>
      </div>

      <div className="dashboard-metrics">
        {metrics.map((metric) => (
          <article key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>

      <div className="split-grid">
        <section className="brief-card">
          <h2>{t('dashboard.admin.submitted')}</h2>
          <div className="compact-list">
            {submittedRequests.map((request) => (
              <article key={request.id}>
                <span className="small-label">{request.reference}</span>
                <h3>{request.title}</h3>
                <p>
                  {request.commune} · {request.nextAction}
                </p>
                <StatusBadge status={request.status} />
                <div className="row-actions">
                  <Link className="inline-link" to={`/requests/${request.id}`}>
                    {t('button.open')}
                  </Link>
                  {requestStatusTransitions[request.status].map((status) => (
                    <button key={status} type="button" onClick={() => updateStatus(request.id, status)}>
                      {t('dashboard.admin.transitionTo', { status: t(`status.${status}`) })}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="brief-card">
          <h2>{t('dashboard.admin.review')}</h2>
          <div className="compact-list">
            {underReviewRequests.map((request) => (
              <article key={request.id}>
                <span className="small-label">{request.reference}</span>
                <h3>{request.title}</h3>
                <p>
                  {request.commune} · {request.nextAction}
                </p>
                <StatusBadge status={request.status} />
                <div className="row-actions">
                  <Link className="inline-link" to={`/requests/${request.id}`}>
                    {t('button.open')}
                  </Link>
                  {requestStatusTransitions[request.status].map((status) => (
                    <button key={status} type="button" onClick={() => updateStatus(request.id, status)}>
                      {t('dashboard.admin.transitionTo', { status: t(`status.${status}`) })}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="brief-card dashboard-extra">
        <h2>{t('dashboard.admin.pendingProviders')}</h2>
        <div className="compact-list">
          {providerApprovals.map((provider) => (
            <article key={provider.id}>
              <span className="small-label">{provider.id}</span>
              <h3>{provider.name}</h3>
              <p>
                {categoryLabel(provider.categoryId, language)} · {t('dashboard.admin.documents')} {provider.documents}
              </p>
              <div className="row-actions">
                <button type="button">{t('button.approve')}</button>
                <button type="button">{t('button.requestDocuments')}</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="brief-card dashboard-extra">
        <h2>{t('dashboard.admin.categoryProposals')}</h2>
        <p className="muted-copy">{t('dashboard.admin.categoryProposalsText')}</p>
        <div className="compact-list">
          {categoryProposals.map((proposal) => (
            <article key={proposal.id}>
              <span className="small-label">{proposal.id}</span>
              <h3>{proposal.title}</h3>
              <p>
                {proposal.source} · {proposal.risk}
              </p>
              <div className="row-actions">
                <button type="button">{t('button.review')}</button>
                <button type="button">{t('button.merge')}</button>
                <button type="button">{t('button.reject')}</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

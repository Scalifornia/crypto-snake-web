import { Link } from 'react-router-dom';
import { categoryLabel } from '../data/servigoData';
import { useTranslation } from '../i18n/useTranslation';
import type { ServiceRequest } from '../types/servigo';
import { StatusBadge } from './StatusBadge';

interface RequestCardProps {
  request: ServiceRequest;
}

export function RequestCard({ request }: RequestCardProps) {
  const { language, t } = useTranslation();

  return (
    <article className="dashboard-row request-row">
      <div>
        <span className="small-label">{request.reference}</span>
        <h2>{request.title}</h2>
        <p>
          {categoryLabel(request.categoryId, language)} · {request.commune} · {request.createdAt}
        </p>
        {request.quoteContext && (
          <p className="request-row__context">
            <strong>{t('requestCard.sourceContext')}</strong>{' '}
            {request.quoteContext.serviceTitle?.[language] ?? t('quoteContext.requestedService')}
            {request.quoteContext.providerName ? ` · ${request.quoteContext.providerName}` : ''}
          </p>
        )}
        {request.attachments && request.attachments.length > 0 && (
          <p className="request-row__context">
            <strong>{t('field.attachmentsSelected')}</strong>{' '}
            {t('field.attachmentCount', { count: request.attachments.length })}
          </p>
        )}
      </div>
      <StatusBadge status={request.status} />
      <div className="request-row__action">
        <strong>{request.nextAction}</strong>
        <Link className="inline-link" to={`/requests/${request.id}`}>
          {t('button.openDetail')}
        </Link>
      </div>
    </article>
  );
}

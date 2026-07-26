import { useTranslation } from '../i18n/useTranslation';
import type { RequestStatus } from '../types/servigo';

interface StatusBadgeProps {
  status: RequestStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();

  return <span className={`status-badge status-${status}`}>{t(`status.${status}`)}</span>;
}

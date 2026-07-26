import { useTranslation } from '../i18n/useTranslation';
import type { StatusTimelineItem } from '../types/servigo';
import { StatusBadge } from './StatusBadge';

interface StatusTimelineProps {
  items: StatusTimelineItem[];
}

export function StatusTimeline({ items }: StatusTimelineProps) {
  const { t } = useTranslation();

  return (
    <ol className="status-timeline">
      {items.map((item) => (
        <li key={`${item.status}-${item.at}`}>
          <StatusBadge status={item.status} />
          <div>
            <strong>{t(`status.${item.status}`)}</strong>
            <p>{item.note}</p>
            <span>
              {item.at} · {item.actor}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}

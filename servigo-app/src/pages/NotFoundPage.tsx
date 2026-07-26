import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/useTranslation';

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <section className="page-section">
      <div className="empty-page">
        <p className="kicker">{t('notFound.kicker')}</p>
        <h1>{t('notFound.title')}</h1>
        <Link className="button button-primary" to="/">
          {t('notFound.back')}
        </Link>
      </div>
    </section>
  );
}

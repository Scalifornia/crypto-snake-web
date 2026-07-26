import { Link } from 'react-router-dom';
import { categoryLabel, providers } from '../data/servigoData';
import { useTranslation } from '../i18n/useTranslation';

export function ProvidersPage() {
  const { language, t } = useTranslation();

  return (
    <section className="page-section">
      <div className="page-heading page-heading-row">
        <div>
          <p className="kicker">{t('providers.kicker')}</p>
          <h1>{t('providers.title')}</h1>
          <p>{t('providers.description')}</p>
        </div>
        <Link className="button button-primary" to="/request">
          {t('providers.requestService')}
        </Link>
      </div>

      <div className="provider-directory">
        {providers.map((provider) => (
          <article className="directory-card" key={provider.id}>
            <div>
              <h2>{provider.name}</h2>
              <p>{provider.communes.slice(0, 4).join(', ')}</p>
            </div>
            <div className="provider-tags">
              <span>{provider.rating} / 5</span>
              <span>
                {provider.reviews} {t('reviews')}
              </span>
              {provider.verified && <span>{t('provider.verified')}</span>}
              <span>{t(`availability.${provider.availability}`)}</span>
            </div>
            <p className="category-line">
              {provider.categories.map((categoryId) => categoryLabel(categoryId, language)).join(' · ')}
            </p>
            <Link className="inline-link" to={`/providers/${provider.id}`}>
              {t('providers.viewProfile')}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

import { Link, useParams } from 'react-router-dom';
import { categoryLabel, providers } from '../data/servigoData';
import { useTranslation } from '../i18n/useTranslation';

export function ProviderProfilePage() {
  const { id } = useParams();
  const provider = providers.find((item) => item.id === id);
  const { language, t } = useTranslation();

  if (!provider) {
    return (
      <section className="page-section">
        <div className="empty-page">
          <p className="kicker">{t('providerProfile.notFound.kicker')}</p>
          <h1>{t('providerProfile.notFound.title')}</h1>
          <Link className="button button-primary" to="/providers">
            {t('providerProfile.back')}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="profile-hero">
        <div>
          <p className="kicker">{t('providerProfile.kicker')}</p>
          <h1>{provider.name}</h1>
          <p>
            {t('providerProfile.description', {
              count: provider.communes.length,
              availability: t(`availability.${provider.availability}`).toLowerCase()
            })}
          </p>
        </div>
        <div className="profile-score">
          <strong>{provider.rating} / 5</strong>
          <span>
            {provider.reviews} {t('reviews')}
          </span>
          {provider.verified && <span>{t('provider.verified')}</span>}
        </div>
      </div>

      <div className="profile-grid">
        <article className="brief-card">
          <h2>{t('providerProfile.services')}</h2>
          <div className="pill-list">
            {provider.categories.map((categoryId) => (
              <span key={categoryId}>{categoryLabel(categoryId, language)}</span>
            ))}
          </div>
        </article>

        <article className="brief-card">
          <h2>{t('providerProfile.communes')}</h2>
          <div className="pill-list">
            {provider.communes.map((commune) => (
              <span key={commune}>{commune}</span>
            ))}
          </div>
        </article>

        <article className="brief-card">
          <h2>{t('providerProfile.operations')}</h2>
          <dl className="brief-list">
            <dt>{t('providerProfile.verification')}</dt>
            <dd>{provider.verified ? t('providerProfile.documentsValid') : t('providerProfile.documentsPending')}</dd>
            <dt>{t('providerProfile.availability')}</dt>
            <dd>{t(`availability.${provider.availability}`)}</dd>
            <dt>{t('providerProfile.nextStep')}</dt>
            <dd>{t('providerProfile.nextStepText')}</dd>
          </dl>
        </article>
      </div>
    </section>
  );
}

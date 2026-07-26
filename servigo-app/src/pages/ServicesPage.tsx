import { Link } from 'react-router-dom';
import { ServiceIcon } from '../components/ServiceIcon';
import { marketplaceCategories } from '../data/marketplaceData';
import { useTranslation } from '../i18n/useTranslation';

export function ServicesPage() {
  const { language, t } = useTranslation();

  return (
    <section className="page-section">
      <div className="page-heading">
        <p className="kicker">{t('services.kicker')}</p>
        <h1>{t('services.title')}</h1>
        <p>{t('services.description')}</p>
      </div>

      <div className="catalog-grid">
        {marketplaceCategories.map((category) => (
          <article className="catalog-card" key={category.slug}>
            <ServiceIcon name={category.icon} />
            <div>
              <h2>{category.labels[language]}</h2>
              <p>{category.description[language]}</p>
            </div>
            <Link className="inline-link" to={`/categories/${category.slug}`}>
              {t('categories.openCategory')}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

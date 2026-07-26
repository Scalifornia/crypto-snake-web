import { Link } from 'react-router-dom';
import { ServiceIcon } from '../components/ServiceIcon';
import { marketplaceCategories, serviceListings } from '../data/marketplaceData';
import { useTranslation } from '../i18n/useTranslation';

export function CategoryBrowserPage() {
  const { language, t } = useTranslation();

  return (
    <section className="page-section">
      <div className="page-heading page-heading-row">
        <div>
          <p className="kicker">{t('categories.kicker')}</p>
          <h1>{t('categories.title')}</h1>
          <p>{t('categories.description')}</p>
        </div>
        <Link className="button button-primary" to="/provider/create-listing">
          {t('nav.createListing')}
        </Link>
      </div>

      <div className="marketplace-grid">
        {marketplaceCategories.map((category) => {
          const listingCount = serviceListings.filter((listing) => listing.categorySlug === category.slug).length;

          return (
            <article className="marketplace-card" key={category.slug}>
              <ServiceIcon name={category.icon} />
              <div>
                <h2>{category.labels[language]}</h2>
                <p>{category.description[language]}</p>
              </div>
              <div className="marketplace-card__meta">
                <span>
                  {category.subcategories.length} {t('categories.subcategories')}
                </span>
                <span>
                  {listingCount} {t('listings.results')}
                </span>
              </div>
              <div className="pill-list">
                {category.subcategories.slice(0, 3).map((subcategory) => (
                  <span key={subcategory.slug}>{subcategory.labels[language]}</span>
                ))}
              </div>
              <div className="row-actions">
                <Link className="inline-link" to={`/categories/${category.slug}`}>
                  {t('categories.openCategory')}
                </Link>
                <Link className="inline-link" to={`/listings?category=${category.slug}`}>
                  {t('categories.viewListings')}
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

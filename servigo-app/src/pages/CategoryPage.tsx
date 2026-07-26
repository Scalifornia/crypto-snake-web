import { Link, useNavigate, useParams } from 'react-router-dom';
import { ServiceIcon } from '../components/ServiceIcon';
import { findCategory, getListingsFor } from '../data/marketplaceData';
import {
  buildQuoteContextFromCategory,
  isQuoteContextComplete,
  saveDraftFromQuoteContext
} from '../data/quoteRequestContext';
import { useTranslation } from '../i18n/useTranslation';

export function CategoryPage() {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const { language, t } = useTranslation();
  const category = findCategory(categorySlug);

  if (!category) {
    return (
      <section className="page-section">
        <div className="empty-page">
          <p className="kicker">{t('category.notFound.kicker')}</p>
          <h1>{t('category.notFound.title')}</h1>
          <Link className="button button-primary" to="/categories">
            {t('category.back')}
          </Link>
        </div>
      </section>
    );
  }

  const startRequest = (subcategorySlug?: string) => {
    const context = buildQuoteContextFromCategory({
      categorySlug: category.slug,
      subcategorySlug
    });
    saveDraftFromQuoteContext(context);
    navigate(isQuoteContextComplete(context) ? '/request/review' : '/request');
  };

  return (
    <section className="page-section">
      <div className="page-heading page-heading-row">
        <div>
          <p className="kicker">{t('categories.kicker')}</p>
          <h1>{category.labels[language]}</h1>
          <p>{category.description[language]}</p>
        </div>
        <ServiceIcon name={category.icon} />
      </div>

      <div className="panel-actions">
        <Link className="button button-primary" to={`/listings?category=${category.slug}`}>
          {t('category.browseListings')}
        </Link>
        <button className="button button-ghost" type="button" onClick={() => startRequest()}>
          {t('category.customRequest')}
        </button>
      </div>

      <section className="catalog-grid">
        {category.subcategories.map((subcategory) => {
          const listingCount = getListingsFor(category.slug, subcategory.slug).length;

          return (
            <article className="catalog-card catalog-card--stack" key={subcategory.slug}>
              <div>
                <h2>{subcategory.labels[language]}</h2>
                <p>{subcategory.description[language]}</p>
              </div>
              <div className="marketplace-card__meta">
                <span>
                  {subcategory.specialties.length} {t('categories.specialties')}
                </span>
                <span>
                  {listingCount} {t('listings.results')}
                </span>
              </div>
              <div className="pill-list">
                {subcategory.specialties.map((specialty) => (
                  <span key={specialty.slug}>{specialty.labels[language]}</span>
                ))}
              </div>
              <div className="row-actions">
                <Link className="inline-link" to={`/categories/${category.slug}/${subcategory.slug}`}>
                  {t('category.selectSubcategory')}
                </Link>
                <Link className="inline-link" to={`/listings?category=${category.slug}&subcategory=${subcategory.slug}`}>
                  {t('categories.viewListings')}
                </Link>
                <button type="button" onClick={() => startRequest(subcategory.slug)}>
                  {t('listing.requestQuote')}
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </section>
  );
}

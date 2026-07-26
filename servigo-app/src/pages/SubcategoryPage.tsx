import { Link, useNavigate, useParams } from 'react-router-dom';
import { ListingCard } from '../components/ListingCard';
import { findCategory, findSubcategory, getListingsFor } from '../data/marketplaceData';
import {
  buildQuoteContextFromCategory,
  isQuoteContextComplete,
  saveDraftFromQuoteContext
} from '../data/quoteRequestContext';
import { useTranslation } from '../i18n/useTranslation';

export function SubcategoryPage() {
  const { categorySlug, subcategorySlug } = useParams();
  const navigate = useNavigate();
  const { language, t } = useTranslation();
  const category = findCategory(categorySlug);
  const subcategory = findSubcategory(categorySlug, subcategorySlug);
  const listings = getListingsFor(categorySlug, subcategorySlug);

  if (!category || !subcategory) {
    return (
      <section className="page-section">
        <div className="empty-page">
          <p className="kicker">{t('subcategory.notFound.kicker')}</p>
          <h1>{t('subcategory.notFound.title')}</h1>
          <Link className="button button-primary" to="/categories">
            {t('category.back')}
          </Link>
        </div>
      </section>
    );
  }

  const startRequest = (specialtySlug?: string) => {
    const context = buildQuoteContextFromCategory({
      categorySlug: category.slug,
      subcategorySlug: subcategory.slug,
      specialtySlug
    });
    saveDraftFromQuoteContext(context);
    navigate(isQuoteContextComplete(context) ? '/request/review' : '/request');
  };

  return (
    <section className="page-section">
      <div className="page-heading">
        <p className="kicker">{category.labels[language]}</p>
        <h1>{subcategory.labels[language]}</h1>
        <p>{subcategory.description[language]}</p>
      </div>

      <div className="panel-actions">
        <Link className="button button-primary" to={`/listings?category=${category.slug}&subcategory=${subcategory.slug}`}>
          {t('categories.viewListings')}
        </Link>
        <button className="button button-ghost" type="button" onClick={() => startRequest()}>
          {t('listing.requestQuote')}
        </button>
      </div>

      <section className="brief-card marketplace-section">
        <h2>{t('subcategory.specialtiesTitle')}</h2>
        <div className="compact-list">
          {subcategory.specialties.map((specialty) => (
            <article key={specialty.slug}>
              <h3>{specialty.labels[language]}</h3>
              <div className="row-actions">
                <Link
                  className="inline-link"
                  to={`/listings?category=${category.slug}&subcategory=${subcategory.slug}&specialty=${specialty.slug}`}
                >
                  {t('categories.viewListings')}
                </Link>
                <button type="button" onClick={() => startRequest(specialty.slug)}>
                  {t('listing.requestQuote')}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="marketplace-section">
        <div className="section-heading">
          <p className="kicker">{t('subcategory.matchingListings')}</p>
          <h2>
            {listings.length} {t('listings.results')}
          </h2>
        </div>

        {listings.length > 0 ? (
          <div className="listing-grid">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="empty-page">
            <p>{t('subcategory.noListings')}</p>
            <Link className="button button-primary" to="/request">
              {t('home.customRequest')}
            </Link>
          </div>
        )}
      </section>
    </section>
  );
}

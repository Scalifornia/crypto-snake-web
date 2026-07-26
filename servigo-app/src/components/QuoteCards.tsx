import { providers } from '../data/servigoData';
import { useTranslation } from '../i18n/useTranslation';
import type { Quote } from '../types/servigo';

interface QuoteCardsProps {
  quotes: Quote[];
}

export function QuoteCards({ quotes }: QuoteCardsProps) {
  const { t } = useTranslation();

  if (quotes.length === 0) {
    return <p className="muted-copy">{t('quote.none')}</p>;
  }

  return (
    <div className="quote-grid">
      {quotes.map((quote) => {
        const provider = providers.find((item) => item.id === quote.providerId);

        return (
          <article className="quote-card" key={quote.id}>
            <div className="quote-card__top">
              <div>
                <span className="small-label">{quote.id.toUpperCase()}</span>
                <h3>{provider?.name ?? quote.providerId}</h3>
              </div>
              <span className={`quote-status quote-${quote.status}`}>{t(`quote.status.${quote.status}`)}</span>
            </div>
            <dl className="brief-list">
              <dt>{t('quote.price')}</dt>
              <dd>{quote.proposedPrice} EUR</dd>
              <dt>{t('quote.availability')}</dt>
              <dd>{quote.availabilityDate}</dd>
              <dt>{t('quote.message')}</dt>
              <dd>{quote.message}</dd>
            </dl>
          </article>
        );
      })}
    </div>
  );
}

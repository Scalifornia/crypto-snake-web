import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/useTranslation';

const steps = ['how.step.search', 'how.step.location', 'how.step.compare', 'how.step.contact'];

export function HowItWorksPage() {
  const { t } = useTranslation();

  return (
    <section className="page-section">
      <div className="page-heading">
        <p className="kicker">{t('how.kicker')}</p>
        <h1>{t('how.title')}</h1>
        <p>{t('how.description')}</p>
      </div>

      <div className="dashboard-metrics">
        {steps.map((stepKey, index) => (
          <article key={stepKey}>
            <span>{index + 1}</span>
            <p>{t(stepKey)}</p>
          </article>
        ))}
      </div>

      <div className="panel-actions">
        <Link className="button button-primary" to="/">
          {t('nav.search')}
        </Link>
        <Link className="button button-ghost" to="/provider/create-listing">
          {t('home.publishService')}
        </Link>
      </div>
    </section>
  );
}

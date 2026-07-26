import { useTranslation } from '../i18n/useTranslation';

const allUserRules = [
  'rules.all.commitments',
  'rules.all.changes',
  'rules.all.realIdentity',
  'rules.all.noSpam',
  'rules.all.noFake',
  'rules.all.noAbuse',
  'rules.all.noBypass',
  'rules.all.legal'
];

const providerRules = [
  'rules.providers.accurate',
  'rules.providers.honest',
  'rules.providers.capacity',
  'rules.providers.price',
  'rules.providers.showUp',
  'rules.providers.authorizations'
];

const seekerRules = [
  'rules.seekers.serious',
  'rules.seekers.time',
  'rules.seekers.present',
  'rules.seekers.cancel',
  'rules.seekers.noFalseComplaints',
  'rules.seekers.pay'
];

export function RulesPage() {
  const { t } = useTranslation();

  return (
    <section className="page-section rules-page">
      <div className="page-heading">
        <p className="kicker">{t('rules.kicker')}</p>
        <h1>{t('rules.title')}</h1>
        <p>{t('rules.description')}</p>
      </div>

      <div className="rules-grid">
        <article className="brief-card">
          <h2>{t('rules.all.title')}</h2>
          <ul className="rule-list">
            {allUserRules.map((ruleKey) => (
              <li key={ruleKey}>{t(ruleKey)}</li>
            ))}
          </ul>
        </article>

        <article className="brief-card">
          <h2>{t('rules.providers.title')}</h2>
          <ul className="rule-list">
            {providerRules.map((ruleKey) => (
              <li key={ruleKey}>{t(ruleKey)}</li>
            ))}
          </ul>
        </article>

        <article className="brief-card">
          <h2>{t('rules.seekers.title')}</h2>
          <ul className="rule-list">
            {seekerRules.map((ruleKey) => (
              <li key={ruleKey}>{t(ruleKey)}</li>
            ))}
          </ul>
        </article>

        <article className="brief-card">
          <h2>{t('rules.trust.title')}</h2>
          <p className="muted-copy">{t('rules.trust.text')}</p>
        </article>
      </div>
    </section>
  );
}

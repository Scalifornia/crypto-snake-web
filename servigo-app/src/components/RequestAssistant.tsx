import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  buildEstimate,
  detectCategory,
  getStoredRequestDraft,
  getSuggestedProviders,
  saveRequestDraft,
  shouldUseSizeDetails
} from '../data/requestDraft';
import { propertyTypes, requestCategoryUsesSizeByDefault } from '../data/requestOptions';
import {
  countryCodeFromStoredLocation,
  findRequestLocation,
  getRequestLocationOptions
} from '../data/requestLocationOptions';
import { locationChangeEventName, getStoredUserLocation, saveStoredUserLocation } from '../data/locationData';
import { categories, categoryLabel } from '../data/servigoData';
import { useTranslation } from '../i18n/useTranslation';
import type { PropertyType, RequestAssistantDraft, Urgency } from '../types/servigo';
import { ServiceIcon } from './ServiceIcon';

type Step = 'need' | 'details' | 'brief';

const stepOrder: Step[] = ['need', 'details', 'brief'];
const urgencies: Urgency[] = ['flexible', 'soon', 'urgent'];

export function RequestAssistant() {
  const { language, t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('need');
  const [draft, setDraft] = useState<RequestAssistantDraft>(() => getStoredRequestDraft());
  const [countryCode, setCountryCode] = useState(
    () => countryCodeFromStoredLocation(getStoredUserLocation()) || findRequestLocation(getStoredRequestDraft().commune)?.countryCode || ''
  );

  const selectedCategory = categories.find((category) => category.id === draft.categoryId) ?? categories[0];
  const locationOptions = useMemo(() => getRequestLocationOptions(countryCode), [countryCode]);
  const estimate = useMemo(() => buildEstimate(draft), [draft]);
  const sizeDetailsActive = shouldUseSizeDetails(draft);
  const matchedProviders = useMemo(() => getSuggestedProviders(draft), [draft]);
  const mode =
    selectedCategory.directBooking && draft.urgency !== 'urgent' ? t('booking.mode') : t('quote.mode');

  useEffect(() => {
    saveRequestDraft(draft);
  }, [draft]);

  useEffect(() => {
    const syncCountry = () => {
      setCountryCode(countryCodeFromStoredLocation(getStoredUserLocation()));
    };

    window.addEventListener(locationChangeEventName, syncCountry);
    return () => window.removeEventListener(locationChangeEventName, syncCountry);
  }, []);

  useEffect(() => {
    if (locationOptions.length > 0 && !locationOptions.some((option) => option.value === draft.commune)) {
      setDraft((current) => ({ ...current, commune: locationOptions[0].value }));
    }
  }, [draft.commune, locationOptions]);

  const updateDraft = <Key extends keyof RequestAssistantDraft>(key: Key, value: RequestAssistantDraft[Key]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const updateDescription = (value: string) => {
    const detectedCategory = detectCategory(value);
    setDraft((current) => ({
      ...current,
      description: value,
      categoryId: detectedCategory ?? current.categoryId,
      customCategory: detectedCategory ? '' : current.customCategory,
      includeSizeDetails: detectedCategory
        ? requestCategoryUsesSizeByDefault(detectedCategory)
        : current.includeSizeDetails
    }));
  };

  const updateCategory = (categoryId: RequestAssistantDraft['categoryId']) => {
    setDraft((current) => ({
      ...current,
      categoryId,
      customCategory: categoryId === 'other' ? current.customCategory : '',
      includeSizeDetails: requestCategoryUsesSizeByDefault(categoryId)
    }));
  };

  const categoryDisplayLabel =
    draft.categoryId === 'other' && draft.customCategory?.trim()
      ? draft.customCategory.trim()
      : categoryLabel(draft.categoryId, language);

  const updateCommune = (nextCommune: string) => {
    const nextLocation = findRequestLocation(nextCommune);
    setDraft((current) => ({ ...current, commune: nextCommune }));

    if (nextLocation) {
      saveStoredUserLocation({
        source: 'manual',
        countryCode: nextLocation.countryCode,
        locationId: nextLocation.locationId
      });
    }
  };

  const goToReview = () => {
    saveRequestDraft(draft);
    navigate('/request/review');
  };

  return (
    <section className="assistant-section" id="request">
      <div className="assistant-heading">
        <div>
          <p className="kicker">{t('assistant.kicker')}</p>
          <h2>{t('assistant.title')}</h2>
          <p>{t('assistant.intro')}</p>
        </div>
      </div>

      <div className="assistant-card">
        <ol className="steps" aria-label={t('assistant.progress')}>
          {stepOrder.map((stepName, index) => (
            <li className={step === stepName ? 'is-active' : ''} key={stepName}>
              <span>{index + 1}</span>
              <strong>{t(`assistant.step.${stepName}`)}</strong>
            </li>
          ))}
        </ol>

        {step === 'need' && (
          <div className="assistant-panel">
            <div className="field-block">
              <span>{t('field.category')}</span>
              <div className="category-grid">
                {categories.map((category) => (
                  <button
                    className={category.id === draft.categoryId ? 'category-chip is-active' : 'category-chip'}
                    key={category.id}
                    type="button"
                    onClick={() => updateCategory(category.id)}
                  >
                    <ServiceIcon name={category.icon} />
                    <span>{category.labels[language]}</span>
                  </button>
                ))}
              </div>
              {draft.categoryId === 'other' && (
                <label className="field custom-taxonomy-field">
                  <span>{t('field.customCategory')}</span>
                  <input
                    value={draft.customCategory ?? ''}
                    placeholder={t('field.customCategoryPlaceholder')}
                    onChange={(event) => updateDraft('customCategory', event.target.value)}
                  />
                </label>
              )}
            </div>

            <div className="form-grid">
              <label className="field">
                <span>{t('field.commune')}</span>
                <select value={draft.commune} onChange={(event) => updateCommune(event.target.value)}>
                  {locationOptions.map((location) => (
                    <option key={`${location.countryCode}-${location.value}`} value={location.value}>
                      {location.label}
                    </option>
                  ))}
                </select>
              </label>

              <fieldset className="field segmented">
                <legend>{t('field.urgency')}</legend>
                {urgencies.map((urgency) => (
                  <button
                    className={draft.urgency === urgency ? 'is-active' : ''}
                    key={urgency}
                    type="button"
                    onClick={() => updateDraft('urgency', urgency)}
                  >
                    {t(`urgency.${urgency}`)}
                  </button>
                ))}
              </fieldset>
            </div>

            <div className="panel-actions">
              <button className="button button-primary" type="button" onClick={() => setStep('details')}>
                {t('button.continue')}
              </button>
            </div>
          </div>
        )}

        {step === 'details' && (
          <div className="assistant-panel">
            <div className="form-grid">
              <label className="field">
                <span>{t('field.propertyType')}</span>
                <select
                  value={draft.propertyType}
                  onChange={(event) => updateDraft('propertyType', event.target.value as PropertyType)}
                >
                  {propertyTypes.map((propertyType) => (
                    <option key={propertyType} value={propertyType}>
                      {t(`property.${propertyType}`)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="check-field">
                <input
                  type="checkbox"
                  checked={sizeDetailsActive}
                  onChange={(event) => updateDraft('includeSizeDetails', event.target.checked)}
                />
                <span>{t('field.sizeDetails')}</span>
              </label>

              {sizeDetailsActive && (
                <>
                  <label className="field">
                    <span>{t('field.surfaceM2')}</span>
                    <input
                      min="0"
                      type="number"
                      value={draft.surface}
                      onChange={(event) => updateDraft('surface', Number(event.target.value))}
                    />
                  </label>

                  <label className="field">
                    <span>{t('field.rooms')}</span>
                    <input
                      min="0"
                      type="number"
                      value={draft.rooms}
                      onChange={(event) => updateDraft('rooms', Number(event.target.value))}
                    />
                  </label>
                </>
              )}

              <label className="field">
                <span>{t('field.accessNotes')}</span>
                <input
                  value={draft.accessNotes}
                  placeholder={t('assistant.accessPlaceholder')}
                  onChange={(event) => updateDraft('accessNotes', event.target.value)}
                />
              </label>
            </div>

            <label className="field">
              <span>{t('field.description')}</span>
              <textarea
                rows={5}
                value={draft.description}
                placeholder={t('assistant.descriptionPlaceholder')}
                onChange={(event) => updateDescription(event.target.value)}
              />
            </label>

            <div className="panel-actions">
              <button className="button button-ghost" type="button" onClick={() => setStep('need')}>
                {t('button.back')}
              </button>
              <button className="button button-primary" type="button" onClick={() => setStep('brief')}>
                {t('button.generateBrief')}
              </button>
            </div>
          </div>
        )}

        {step === 'brief' && (
          <div className="assistant-panel">
            <div className="brief-layout">
              <article className="brief-card">
                <div className="brief-title">
                  <h3>{t('assistant.briefTitle')}</h3>
                  <span>{mode}</span>
                </div>

                <dl className="brief-list">
                  <dt>{t('field.category')}</dt>
                  <dd>{categoryDisplayLabel}</dd>
                  <dt>{t('field.commune')}</dt>
                  <dd>{draft.commune}</dd>
                  <dt>{t('field.urgency')}</dt>
                  <dd>{t(`urgency.${draft.urgency}`)}</dd>
                  <dt>{t('field.propertyType')}</dt>
                  <dd>{t(`property.${draft.propertyType}`)}</dd>
                  {sizeDetailsActive && (
                    <>
                      <dt>{t('field.surface')}</dt>
                      <dd>{draft.surface} m2</dd>
                      <dt>{t('field.rooms')}</dt>
                      <dd>{draft.rooms}</dd>
                    </>
                  )}
                  <dt>{t('field.description')}</dt>
                  <dd>{draft.description || t('common.empty')}</dd>
                  <dt>{t('field.accessNotes')}</dt>
                  <dd>{draft.accessNotes || t('common.empty')}</dd>
                </dl>

                <div className="estimate">
                  <h4>{t('assistant.estimateTitle')}</h4>
                  <div>
                    <span>{t('field.priceRange')}</span>
                    <strong>
                      {estimate.low} - {estimate.high} EUR
                    </strong>
                  </div>
                  <div>
                    <span>{t('field.duration')}</span>
                    <strong>{estimate.hours} h</strong>
                  </div>
                  <div>
                    <span>{t('field.jobSize')}</span>
                    <strong>{t(`size.${estimate.jobSize}`)}</strong>
                  </div>
                </div>
              </article>

              <aside className="provider-list">
                <h3>{t('assistant.suggestedProviders')}</h3>
                {matchedProviders.map(({ provider, score }) => (
                  <article className="provider-card" key={provider.id}>
                    <div>
                      <h4>{provider.name}</h4>
                      <p>{t(`availability.${provider.availability}`)}</p>
                    </div>
                    <div className="provider-tags">
                      <span>{provider.rating} / 5</span>
                      <span>
                        {provider.reviews} {t('reviews')}
                      </span>
                      {provider.verified && <span>{t('provider.verified')}</span>}
                    </div>
                    <strong>
                      {t('review.score')} {score}%
                    </strong>
                  </article>
                ))}
              </aside>
            </div>

            <div className="panel-actions">
              <button className="button button-ghost" type="button" onClick={() => setStep('details')}>
                {t('button.back')}
              </button>
              <button className="button button-primary" type="button" onClick={goToReview}>
                {t('assistant.review')}
              </button>
              <p className="mock-note">{t('assistant.mockNotice')}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  buildEstimate,
  createSubmittedRequest,
  getStoredRequestDraft,
  getSuggestedProviders,
  saveRequestDraft,
  saveSubmittedRequest,
  shouldUseSizeDetails
} from '../data/requestDraft';
import {
  buildPhoneWithDialingCode,
  getDialingCodeForCountry,
  getLocalPhoneNumber
} from '../data/phoneDialingCodes';
import { propertyTypes, requestCategoryUsesSizeByDefault } from '../data/requestOptions';
import {
  countryCodeFromStoredLocation,
  findRequestLocation,
  getRequestLocationOptions
} from '../data/requestLocationOptions';
import { categories, categoryLabel } from '../data/servigoData';
import {
  formatLocation,
  getLocation,
  getStoredUserLocation,
  locationChangeEventName,
  saveStoredUserLocation
} from '../data/locationData';
import { findCategory, findListing, findSpecialty, findSubcategory } from '../data/marketplaceData';
import { getCompatibleAlternatives, getEligibleListingsForContext } from '../data/quoteRequestContext';
import { useTranslation } from '../i18n/useTranslation';
import type {
  PreferredContactMethod,
  PreferredInterventionPeriod,
  PropertyType,
  RequestAttachment,
  RequestAssistantDraft
} from '../types/servigo';

type ReviewErrors = Partial<Record<'name' | 'email' | 'phone' | 'commune' | 'categoryId', string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const contactMethods: PreferredContactMethod[] = ['email', 'phone'];
const interventionPeriods: PreferredInterventionPeriod[] = ['asap', 'this_week', 'next_week', 'flexible'];
const acceptedRequestFileTypes = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.heic',
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.txt',
  '.dwg',
  '.dxf'
].join(',');

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) {
    return `${Math.round((size / (1024 * 1024)) * 10) / 10} MB`;
  }

  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

export function RequestReviewPage() {
  const { language, t } = useTranslation();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<RequestAssistantDraft>(() => getStoredRequestDraft());
  const [countryCode, setCountryCode] = useState(
    () => countryCodeFromStoredLocation(getStoredUserLocation()) || findRequestLocation(getStoredRequestDraft().commune)?.countryCode || ''
  );
  const [errors, setErrors] = useState<ReviewErrors>({});

  const estimate = useMemo(() => buildEstimate(draft), [draft]);
  const sizeDetailsActive = shouldUseSizeDetails(draft);
  const communeOptions = useMemo(() => getRequestLocationOptions(countryCode), [countryCode]);
  const selectedRequestLocation = findRequestLocation(draft.commune);
  const selectedCountryCode = selectedRequestLocation?.countryCode || countryCode || 'LU';
  const phoneDialingCode = getDialingCodeForCountry(selectedCountryCode);
  const phoneLocalNumber = getLocalPhoneNumber(draft.client.phone, phoneDialingCode);
  const attachments = draft.attachments ?? [];
  const structuredBrief = useMemo(() => {
    const points = [
      draft.description || t('assistant.descriptionFallback'),
      sizeDetailsActive
        ? `${draft.surface} m2, ${draft.rooms} ${t('field.rooms').toLowerCase()}, ${t(
            'field.propertyType'
          ).toLowerCase()}: ${t(`property.${draft.propertyType}`)}.`
        : `${t('field.propertyType')}: ${t(`property.${draft.propertyType}`)}.`,
      `${t('field.commune')}: ${draft.commune}. ${t('field.urgency')}: ${t(`urgency.${draft.urgency}`)}.`
    ];

    if (draft.accessNotes.trim()) {
      points.push(`${t('field.access')}: ${draft.accessNotes}.`);
    }

    if (attachments.length > 0) {
      points.push(
        t('field.attachmentsBrief', {
          count: attachments.length
        })
      );
    }

    points.push(
      `${t('field.preferredContact')}: ${t(`contact.${draft.preferredContactMethod}`)}. ${t(
        'field.preferredPeriod'
      )}: ${t(`period.${draft.preferredInterventionPeriod}`)}.`
    );

    return points;
  }, [attachments.length, draft, sizeDetailsActive, t]);
  const suggestedProviders = useMemo(() => getSuggestedProviders(draft), [draft]);
  const quoteContext = draft.quoteContext;
  const contextListing = quoteContext?.listingId ? findListing(quoteContext.listingId) : undefined;
  const contextCategory = findCategory(quoteContext?.categorySlug);
  const contextSubcategory = findSubcategory(quoteContext?.categorySlug, quoteContext?.subcategorySlug);
  const contextSpecialty = findSpecialty(
    quoteContext?.categorySlug,
    quoteContext?.subcategorySlug,
    quoteContext?.specialtySlug
  );
  const contextLocation = getLocation(quoteContext?.locationId);
  const eligibleContextListings = useMemo(
    () => (quoteContext ? getEligibleListingsForContext(quoteContext).slice(0, 5) : []),
    [quoteContext]
  );
  const compatibleAlternatives = useMemo(
    () => (quoteContext ? getCompatibleAlternatives(quoteContext, quoteContext.listingId).slice(0, 3) : []),
    [quoteContext]
  );
  const eligibleProviderCount = new Set(eligibleContextListings.map((listing) => listing.providerId)).size;
  const contextProviderName = quoteContext?.providerName ?? contextListing?.providerName;
  const contextProviderInitial = (contextProviderName ?? 'K').trim().charAt(0).toUpperCase();
  const contextServiceTitle =
    quoteContext?.serviceTitle?.[language] ?? contextListing?.title[language] ?? t('review.contextNoListing');
  const draftCategoryLabel =
    draft.categoryId === 'other' && draft.customCategory?.trim()
      ? draft.customCategory.trim()
      : categoryLabel(draft.categoryId, language);

  useEffect(() => {
    const syncCountry = () => {
      setCountryCode(countryCodeFromStoredLocation(getStoredUserLocation()));
    };

    window.addEventListener(locationChangeEventName, syncCountry);
    return () => window.removeEventListener(locationChangeEventName, syncCountry);
  }, []);

  useEffect(() => {
    if (communeOptions.length > 0 && !communeOptions.some((option) => option.value === draft.commune)) {
      setDraft((current) => {
        const next = { ...current, commune: communeOptions[0].value };
        saveRequestDraft(next);
        return next;
      });
    }
  }, [communeOptions, draft.commune]);

  const updateDraft = <Key extends keyof RequestAssistantDraft>(key: Key, value: RequestAssistantDraft[Key]) => {
    setDraft((current) => {
      const next = { ...current, [key]: value };
      saveRequestDraft(next);
      return next;
    });
  };

  const updateClient = (key: keyof RequestAssistantDraft['client'], value: string) => {
    setDraft((current) => {
      const next = { ...current, client: { ...current.client, [key]: value } };
      saveRequestDraft(next);
      return next;
    });
  };

  const updateCommune = (nextCommune: string) => {
    const nextLocation = findRequestLocation(nextCommune);
    setDraft((current) => {
      const next = { ...current, commune: nextCommune };
      saveRequestDraft(next);
      return next;
    });

    if (nextLocation) {
      setCountryCode(nextLocation.countryCode);
      saveStoredUserLocation({
        source: 'manual',
        countryCode: nextLocation.countryCode,
        locationId: nextLocation.locationId
      });
    }
  };

  const updateCategory = (categoryId: RequestAssistantDraft['categoryId']) => {
    setDraft((current) => {
      const next = {
        ...current,
        categoryId,
        customCategory: categoryId === 'other' ? current.customCategory : '',
        includeSizeDetails: requestCategoryUsesSizeByDefault(categoryId)
      };
      saveRequestDraft(next);
      return next;
    });
  };

  const updatePhone = (nextLocalPhone: string) => {
    updateClient('phone', buildPhoneWithDialingCode(nextLocalPhone, phoneDialingCode));
  };

  const updateAttachments = (files: FileList | null) => {
    const nextFiles = Array.from(files ?? []);
    if (nextFiles.length === 0) {
      return;
    }

    const nextAttachments: RequestAttachment[] = nextFiles.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}`,
      name: file.name,
      size: file.size,
      type: file.type || 'file',
      addedAt: 'Maintenant'
    }));

    setDraft((current) => {
      const existingAttachments = current.attachments ?? [];
      const mergedAttachments = [
        ...existingAttachments,
        ...nextAttachments.filter(
          (attachment) => !existingAttachments.some((existing) => existing.id === attachment.id)
        )
      ];
      const next = { ...current, attachments: mergedAttachments };
      saveRequestDraft(next);
      return next;
    });
  };

  const removeAttachment = (attachmentId: string) => {
    setDraft((current) => {
      const next = {
        ...current,
        attachments: (current.attachments ?? []).filter((attachment) => attachment.id !== attachmentId)
      };
      saveRequestDraft(next);
      return next;
    });
  };

  const getDraftWithNormalizedPhone = () => ({
    ...draft,
    client: {
      ...draft.client,
      phone: buildPhoneWithDialingCode(phoneLocalNumber, phoneDialingCode)
    }
  });

  const validate = () => {
    const nextErrors: ReviewErrors = {};

    if (!draft.client.name.trim()) {
      nextErrors.name = t('validation.nameRequired');
    }

    if (!draft.client.email.trim()) {
      nextErrors.email = t('validation.emailRequired');
    } else if (!emailPattern.test(draft.client.email)) {
      nextErrors.email = t('validation.emailInvalid');
    }

    if (!phoneLocalNumber.trim()) {
      nextErrors.phone = t('validation.phoneRequired');
    }

    if (!draft.commune.trim()) {
      nextErrors.commune = t('validation.communeRequired');
    }

    if (!draft.categoryId || (draft.categoryId === 'other' && !draft.customCategory?.trim())) {
      nextErrors.categoryId = t('validation.categoryRequired');
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitMockRequest = () => {
    if (!validate()) {
      return;
    }

    const normalizedDraft = getDraftWithNormalizedPhone();
    setDraft(normalizedDraft);
    saveRequestDraft(normalizedDraft);
    const submittedRequest = createSubmittedRequest(normalizedDraft, structuredBrief);
    saveSubmittedRequest(submittedRequest);
    navigate('/request/confirmation');
  };

  return (
    <section className="page-section request-review-page">
      <div className="page-heading page-heading-row">
        <div>
          <p className="kicker">{t('review.kicker')}</p>
          <h1>{t('review.title')}</h1>
          <p>{t('review.description')}</p>
        </div>
        <Link className="button button-ghost" to="/request">
          {t('button.editAssistant')}
        </Link>
      </div>

      {quoteContext && (
        <section className="request-context-hero">
          <div className="request-context-hero__provider">
            {contextListing?.photos?.[0] ? (
              <img src={contextListing.photos[0]} alt="" />
            ) : (
              <span>{contextProviderInitial}</span>
            )}
          </div>
          <div className="request-context-hero__body">
            <p className="kicker">{t('quoteContext.title')}</p>
            <h2>
              {contextProviderName ?? t('review.contextNoProvider')}
            </h2>
            <p>
              <strong>{t('review.contextServiceLabel')}:</strong> {contextServiceTitle}
            </p>
          </div>
          <div className="request-context-hero__meta">
            <span>
              {t('review.contextProviderCount', {
                count: eligibleProviderCount
              })}
            </span>
            {contextCategory && <span>{contextCategory.labels[language]}</span>}
            <span>{formatLocation(contextLocation) || draft.commune}</span>
          </div>
        </section>
      )}

      <div className="review-layout">
        <section className="brief-card review-form">
          <h2>{t('review.keyInfo')}</h2>
          <div className="form-grid">
            <label className="field">
              <span>{t('field.category')}</span>
              <select
                value={draft.categoryId}
                onChange={(event) => updateCategory(event.target.value as RequestAssistantDraft['categoryId'])}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.labels[language]}
                  </option>
                ))}
              </select>
              {errors.categoryId && <small className="field-error">{errors.categoryId}</small>}
            </label>

            {draft.categoryId === 'other' && (
              <label className="field">
                <span>{t('field.customCategory')}</span>
                <input
                  value={draft.customCategory ?? ''}
                  placeholder={t('field.customCategoryPlaceholder')}
                  onChange={(event) => updateDraft('customCategory', event.target.value)}
                />
              </label>
            )}

            <label className="field">
              <span>{t('field.commune')}</span>
              <select value={draft.commune} onChange={(event) => updateCommune(event.target.value)}>
                {communeOptions.map((location) => (
                  <option key={`${location.countryCode}-${location.value}`} value={location.value}>
                    {location.label}
                  </option>
                ))}
              </select>
              {errors.commune && <small className="field-error">{errors.commune}</small>}
            </label>

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
          </div>

          <label className="field">
            <span>{t('field.selectedDetails')}</span>
            <textarea
              rows={4}
              value={draft.description}
              onChange={(event) => updateDraft('description', event.target.value)}
            />
          </label>

          <label className="field">
            <span>{t('field.accessNotes')}</span>
            <input value={draft.accessNotes} onChange={(event) => updateDraft('accessNotes', event.target.value)} />
          </label>

          <div className="field-block request-attachments">
            <div>
              <span>{t('field.attachments')}</span>
              <p className="field-help">{t('field.attachmentsHelp')}</p>
            </div>
            <label className="attachment-dropzone">
              <input
                accept={acceptedRequestFileTypes}
                multiple
                type="file"
                onChange={(event) => updateAttachments(event.target.files)}
              />
              <strong>{t('field.attachmentsInput')}</strong>
              <small>{t('field.attachmentMockNotice')}</small>
            </label>
            {attachments.length > 0 && (
              <div className="attachment-list" aria-label={t('field.attachmentsSelected')}>
                {attachments.map((attachment) => (
                  <article key={attachment.id}>
                    <div>
                      <strong>{attachment.name}</strong>
                      <span>
                        {attachment.type} · {formatFileSize(attachment.size)}
                      </span>
                    </div>
                    <button type="button" onClick={() => removeAttachment(attachment.id)}>
                      {t('field.removeAttachment')}
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>

          <h2>{t('review.clientContact')}</h2>
          <div className="form-grid">
            <label className="field">
              <span>{t('field.name')}</span>
              <input value={draft.client.name} onChange={(event) => updateClient('name', event.target.value)} />
              {errors.name && <small className="field-error">{errors.name}</small>}
            </label>

            <label className="field">
              <span>{t('field.email')}</span>
              <input value={draft.client.email} onChange={(event) => updateClient('email', event.target.value)} />
              {errors.email && <small className="field-error">{errors.email}</small>}
            </label>

            <label className="field">
              <span>{t('field.phone')}</span>
              <div className="phone-input-group">
                <span className="phone-prefix" aria-label={t('field.phoneCountryCode')}>
                  {phoneDialingCode}
                </span>
                <input
                  inputMode="tel"
                  type="tel"
                  value={phoneLocalNumber}
                  onChange={(event) => updatePhone(event.target.value)}
                />
              </div>
              {errors.phone && <small className="field-error">{errors.phone}</small>}
            </label>

            <label className="field field--wide">
              <span>{t('field.address')}</span>
              <input value={draft.address} onChange={(event) => updateDraft('address', event.target.value)} />
            </label>

            <label className="field">
              <span>{t('field.preferredContact')}</span>
              <select
                value={draft.preferredContactMethod}
                onChange={(event) => updateDraft('preferredContactMethod', event.target.value as PreferredContactMethod)}
              >
                {contactMethods.map((method) => (
                  <option key={method} value={method}>
                    {t(`contact.${method}`)}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>{t('field.preferredPeriod')}</span>
              <select
                value={draft.preferredInterventionPeriod}
                onChange={(event) =>
                  updateDraft('preferredInterventionPeriod', event.target.value as PreferredInterventionPeriod)
                }
              >
                {interventionPeriods.map((period) => (
                  <option key={period} value={period}>
                    {t(`period.${period}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <aside className="review-summary">
          {quoteContext && (
            <article className="brief-card">
              <h2>{t('quoteContext.title')}</h2>
              {quoteContext.outsideSelectedArea && (
                <p className="context-warning">{t('quoteContext.outsideAreaWarning')}</p>
              )}
              <dl className="brief-list">
                <dt>{t('quoteContext.requestedService')}</dt>
                <dd>{quoteContext.serviceTitle?.[language] ?? contextListing?.title[language] ?? draftCategoryLabel}</dd>
                {contextListing && (
                  <>
                    <dt>{t('quoteContext.selectedListing')}</dt>
                    <dd>{contextListing.title[language]}</dd>
                  </>
                )}
                {quoteContext.providerName && (
                  <>
                    <dt>{t('quoteContext.selectedProvider')}</dt>
                    <dd>{quoteContext.providerName}</dd>
                  </>
                )}
                <dt>{t('quoteContext.categoryPath')}</dt>
                <dd>
                  {[contextCategory?.labels[language], contextSubcategory?.labels[language], contextSpecialty?.labels[language]]
                    .filter(Boolean)
                    .join(' / ')}
                </dd>
                <dt>{t('quoteContext.selectedArea')}</dt>
                <dd>{formatLocation(contextLocation) || draft.commune}</dd>
                {quoteContext.priceLabel && (
                  <>
                    <dt>{t('quoteContext.priceModel')}</dt>
                    <dd>
                      {quoteContext.priceModel ? `${t(`priceModel.${quoteContext.priceModel}`)} · ` : ''}
                      {quoteContext.priceLabel[language]}
                    </dd>
                  </>
                )}
              </dl>
            </article>
          )}

          <article className="brief-card">
            <h2>{t('review.generatedBrief')}</h2>
            <ul className="brief-points">
              {structuredBrief.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <dl className="brief-list">
              <dt>{t('field.service')}</dt>
              <dd>{draftCategoryLabel}</dd>
              <dt>{t('field.commune')}</dt>
              <dd>{draft.commune}</dd>
              <dt>{t('field.priceEstimate')}</dt>
              <dd>
                {estimate.low} - {estimate.high} EUR
              </dd>
              <dt>{t('field.duration')}</dt>
              <dd>{estimate.hours} h</dd>
            </dl>
          </article>

          <article className="brief-card">
            <h2>{t('review.selectedAnswers')}</h2>
            <dl className="brief-list">
              <dt>{t('field.urgency')}</dt>
              <dd>{t(`urgency.${draft.urgency}`)}</dd>
              <dt>{t('field.propertyType')}</dt>
              <dd>{t(`property.${draft.propertyType}`)}</dd>
              <dt>{t('field.address')}</dt>
              <dd>{draft.address || t('common.empty')}</dd>
              <dt>{t('field.attachments')}</dt>
              <dd>
                {attachments.length > 0
                  ? t('field.attachmentCount', {
                      count: attachments.length
                    })
                  : t('common.empty')}
              </dd>
              {sizeDetailsActive && (
                <>
                  <dt>{t('field.surface')}</dt>
                  <dd>{draft.surface} m2</dd>
                  <dt>{t('field.rooms')}</dt>
                  <dd>{draft.rooms}</dd>
                </>
              )}
              <dt>{t('field.preferredContact')}</dt>
              <dd>{t(`contact.${draft.preferredContactMethod}`)}</dd>
              <dt>{t('field.preferredPeriod')}</dt>
              <dd>{t(`period.${draft.preferredInterventionPeriod}`)}</dd>
            </dl>
          </article>

          <article className="brief-card">
            <h2>{t('review.suggestedProviders')}</h2>
            <div className="compact-list">
              {suggestedProviders.map(({ provider, score }) => (
                <article key={provider.id}>
                  <h3>{provider.name}</h3>
                  <p>
                    {provider.rating} / 5 · {provider.reviews} {t('reviews')} · {t('review.score')} {score}%
                  </p>
                </article>
              ))}
            </div>
          </article>

          {quoteContext && (
            <article className="brief-card">
              <h2>{t('quoteContext.notificationPreview')}</h2>
              <p className="muted-copy">
                {t('quoteContext.matchingCount', {
                  count: eligibleProviderCount
                })}
              </p>
              {eligibleContextListings.length > 0 ? (
                <div className="compact-list">
                  {eligibleContextListings.map((listing) => (
                    <article key={listing.id}>
                      <h3>{listing.providerName}</h3>
                      <p>
                        {listing.title[language]} · {listing.priceLabel[language]}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="muted-copy">{t('quoteContext.noMatching')}</p>
              )}
            </article>
          )}

          {quoteContext?.listingId && compatibleAlternatives.length > 0 && (
            <article className="brief-card">
              <h2>{t('quoteContext.compatibleAlternatives')}</h2>
              <div className="compact-list">
                {compatibleAlternatives.map((listing) => (
                  <article key={listing.id}>
                    <h3>{listing.title[language]}</h3>
                    <p>
                      {listing.providerName} · {listing.priceLabel[language]}
                    </p>
                  </article>
                ))}
              </div>
            </article>
          )}

          <button className="button button-primary review-submit" type="button" onClick={submitMockRequest}>
            {t('button.confirmSubmit')}
          </button>
        </aside>
      </div>
    </section>
  );
}

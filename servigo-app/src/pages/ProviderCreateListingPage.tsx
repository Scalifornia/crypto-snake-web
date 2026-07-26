import { FormEvent, useMemo, useState } from 'react';
import {
  listingLanguages,
  marketplaceCategories,
  providerTypes
} from '../data/marketplaceData';
import {
  getCoverageAreaOptions,
  getCoverageCountries,
  getDefaultForeignCountryCode
} from '../data/euCoverageOptions';
import {
  buildPhoneWithDialingCode,
  getDialingCodeForCountry,
  getLocalPhoneNumber
} from '../data/phoneDialingCodes';
import { useTranslation } from '../i18n/useTranslation';
import type { Category, Locale, PriceModel, ProviderType } from '../types/servigo';

const priceModels: PriceModel[] = ['fixed', 'hourly', 'forfait', 'quote_only', 'free', 'charity'];
const allTaxonomyValue = 'all';
const defaultResidenceCountryCode = 'LU';
const defaultForeignCountryCode = getDefaultForeignCountryCode(defaultResidenceCountryCode);
const customLanguageValue = 'custom';
const additionalLanguageOptions = ['lb', 'de', 'es', 'it', 'nl', 'pl', 'ro', 'uk', 'ar', 'zh'];
type PublicDisplayMode = 'automatic' | 'first_name' | 'username' | 'business';

function normalizeSearchText(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function getCategorySearchableText(category: Category) {
  return [
    ...Object.values(category.labels),
    ...Object.values(category.description),
    ...category.subcategories.flatMap((subcategory) => [
      ...Object.values(subcategory.labels),
      ...Object.values(subcategory.description),
      ...subcategory.specialties.flatMap((specialty) => Object.values(specialty.labels))
    ])
  ].join(' ');
}

function findBestCategoryMatch(categories: Category[], searchValue: string, language: Locale) {
  const normalizedSearch = normalizeSearchText(searchValue.trim());

  if (!normalizedSearch) {
    return null;
  }

  return (
    categories.find((category) => normalizeSearchText(category.labels[language]).startsWith(normalizedSearch)) ??
    categories.find((category) => normalizeSearchText(category.labels[language]).includes(normalizedSearch)) ??
    categories.find((category) => normalizeSearchText(getCategorySearchableText(category)).includes(normalizedSearch)) ??
    null
  );
}

export function ProviderCreateListingPage() {
  const { language, t } = useTranslation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [providerName, setProviderName] = useState('');
  const [providerType, setProviderType] = useState<ProviderType>('professional');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [doorNumber, setDoorNumber] = useState('');
  const [apartmentOrUnit, setApartmentOrUnit] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [residenceCountryCode, setResidenceCountryCode] = useState(defaultResidenceCountryCode);
  const [publicDisplayMode, setPublicDisplayMode] = useState<PublicDisplayMode>('automatic');
  const [publicUsername, setPublicUsername] = useState('');
  const [profilePhotoFile, setProfilePhotoFile] = useState('');
  const [publicAge, setPublicAge] = useState('');
  const [showPublicAge, setShowPublicAge] = useState(false);
  const [showPublicPhone, setShowPublicPhone] = useState(false);
  const [serviceArea, setServiceArea] = useState<string[]>([]);
  const [coversForeign, setCoversForeign] = useState(false);
  const [selectedForeignCountryCodes, setSelectedForeignCountryCodes] = useState<string[]>([]);
  const [foreignServiceAreasByCountry, setForeignServiceAreasByCountry] = useState<Record<string, string[]>>({});
  const [categorySlug, setCategorySlug] = useState(marketplaceCategories[0].slug);
  const [categorySearch, setCategorySearch] = useState('');
  const [subcategorySlug, setSubcategorySlug] = useState(allTaxonomyValue);
  const [specialtySlug, setSpecialtySlug] = useState(allTaxonomyValue);
  const [serviceTitle, setServiceTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [priceModel, setPriceModel] = useState<PriceModel>('quote_only');
  const [hourlyPrice, setHourlyPrice] = useState('');
  const [forfaitPrice, setForfaitPrice] = useState('');
  const [weekdays, setWeekdays] = useState(true);
  const [weekends, setWeekends] = useState(false);
  const [urgentRequests, setUrgentRequests] = useState(false);
  const [languages, setLanguages] = useState<Locale[]>(['fr']);
  const [extraLanguages, setExtraLanguages] = useState<string[]>([]);
  const [showExtraLanguagePicker, setShowExtraLanguagePicker] = useState(false);
  const [selectedExtraLanguage, setSelectedExtraLanguage] = useState(additionalLanguageOptions[0]);
  const [customLanguageName, setCustomLanguageName] = useState('');
  const [travelToClient, setTravelToClient] = useState(true);
  const [vatNumber, setVatNumber] = useState('');
  const [companyIdentityDocumentFile, setCompanyIdentityDocumentFile] = useState('');
  const [companyRegistrationDocumentFile, setCompanyRegistrationDocumentFile] = useState('');
  const [companyInsuranceDocumentFile, setCompanyInsuranceDocumentFile] = useState('');
  const [companyActivityDocumentFile, setCompanyActivityDocumentFile] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [proposedNew, setProposedNew] = useState(false);
  const [proposedValue, setProposedValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showMissing, setShowMissing] = useState(false);

  const sortedCategories = useMemo(
    () =>
      [...marketplaceCategories].sort((first, second) =>
        first.labels[language].localeCompare(second.labels[language], language)
      ),
    [language]
  );
  const coverageCountries = useMemo(() => getCoverageCountries(language), [language]);

  const selectedCategory = useMemo(
    () => marketplaceCategories.find((category) => category.slug === categorySlug) ?? marketplaceCategories[0],
    [categorySlug]
  );
  const categorySearchTerm = normalizeSearchText(categorySearch);
  const filteredCategories = useMemo(() => {
    if (!categorySearchTerm) {
      return sortedCategories;
    }

    return sortedCategories.filter((category) =>
      normalizeSearchText(getCategorySearchableText(category)).includes(categorySearchTerm)
    );
  }, [categorySearchTerm, sortedCategories]);
  const selectedSubcategory = useMemo(
    () => {
      if (subcategorySlug === allTaxonomyValue) {
        return null;
      }

      return (
        selectedCategory.subcategories.find((subcategory) => subcategory.slug === subcategorySlug) ??
        selectedCategory.subcategories[0]
      );
    },
    [selectedCategory, subcategorySlug]
  );
  const sortedSubcategories = useMemo(
    () =>
      [...selectedCategory.subcategories].sort((first, second) =>
        first.labels[language].localeCompare(second.labels[language], language)
      ),
    [language, selectedCategory]
  );
  const selectedSpecialty = useMemo(
    () => {
      if (!selectedSubcategory || specialtySlug === allTaxonomyValue) {
        return null;
      }

      return (
        selectedSubcategory.specialties.find((specialty) => specialty.slug === specialtySlug) ??
        selectedSubcategory.specialties[0]
      );
    },
    [selectedSubcategory, specialtySlug]
  );
  const sortedSpecialties = useMemo(
    () =>
      selectedSubcategory
        ? [...selectedSubcategory.specialties].sort((first, second) =>
            first.labels[language].localeCompare(second.labels[language], language)
          )
        : [],
    [language, selectedSubcategory]
  );
  const countryLocationOptions = useMemo(
    () => getCoverageAreaOptions(residenceCountryCode),
    [residenceCountryCode]
  );
  const allCountryAreaValues = useMemo(
    () => countryLocationOptions.map((location) => location.value),
    [countryLocationOptions]
  );
  const foreignCountryOptions = useMemo(
    () => coverageCountries.filter((country) => country.countryCode !== residenceCountryCode),
    [coverageCountries, residenceCountryCode]
  );
  const selectedForeignCountries = useMemo(
    () => foreignCountryOptions.filter((country) => selectedForeignCountryCodes.includes(country.countryCode)),
    [foreignCountryOptions, selectedForeignCountryCodes]
  );
  const fullPersonalName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ');
  const publicProviderName = (() => {
    if (publicDisplayMode === 'username') {
      return publicUsername.trim() || t('providerCreate.previewUsernameFallback');
    }

    if (publicDisplayMode === 'first_name') {
      return firstName.trim() || t('providerCreate.previewPrivateFallback');
    }

    if (providerType === 'professional' || publicDisplayMode === 'business') {
      return providerName.trim() || t('providerCreate.previewBusinessFallback');
    }

    return fullPersonalName || t('providerCreate.previewPrivateFallback');
  })();
  const previewLocation = city.trim() || t('providerCreate.previewLocationFallback');
  const previewTitle = serviceTitle.trim() || t('providerCreate.previewServiceFallback');
  const previewDescription = shortDescription.trim() || t('providerCreate.previewDescriptionFallback');
  const previewPrice =
    priceModel === 'hourly' && hourlyPrice.trim()
      ? `${hourlyPrice.trim()} EUR/h`
      : priceModel === 'forfait' && forfaitPrice.trim()
        ? `${forfaitPrice.trim()} EUR`
        : t(`priceModel.${priceModel}`);
  const phoneDialingCode = getDialingCodeForCountry(residenceCountryCode);
  const phoneLocalNumber = getLocalPhoneNumber(phone, phoneDialingCode);

  const requiredComplete =
    firstName.trim() &&
    lastName.trim() &&
    (providerType !== 'professional' || providerName.trim()) &&
    email.trim() &&
    phoneLocalNumber.trim() &&
    streetAddress.trim() &&
    doorNumber.trim() &&
    postalCode.trim() &&
    city.trim() &&
    residenceCountryCode &&
    (providerType !== 'professional' ||
      (vatNumber.trim() &&
        companyIdentityDocumentFile &&
        companyRegistrationDocumentFile &&
        companyInsuranceDocumentFile &&
        companyActivityDocumentFile)) &&
    serviceArea.length > 0 &&
    (!coversForeign ||
      (selectedForeignCountryCodes.length > 0 &&
        selectedForeignCountryCodes.every((countryCode) => (foreignServiceAreasByCountry[countryCode] ?? []).length > 0))) &&
    categorySlug &&
    subcategorySlug &&
    specialtySlug &&
    serviceTitle.trim() &&
    shortDescription.trim() &&
    languages.length + extraLanguages.length > 0;

  const toggleServiceArea = (commune: string) => {
    setServiceArea((current) =>
      current.includes(commune) ? current.filter((item) => item !== commune) : [...current, commune]
    );
  };

  const updateResidenceCountry = (nextCountryCode: string) => {
    const nextDialingCode = getDialingCodeForCountry(nextCountryCode);
    const currentLocalPhone = getLocalPhoneNumber(phone, phoneDialingCode);
    setResidenceCountryCode(nextCountryCode);
    setServiceArea([]);
    setPhone(buildPhoneWithDialingCode(currentLocalPhone, nextDialingCode));

    setSelectedForeignCountryCodes((current) => {
      const availableCountries = current.filter((countryCode) => countryCode !== nextCountryCode);
      return availableCountries.length > 0 || !coversForeign
        ? availableCountries
        : [getDefaultForeignCountryCode(nextCountryCode)];
    });
    setForeignServiceAreasByCountry((current) =>
      Object.fromEntries(Object.entries(current).filter(([countryCode]) => countryCode !== nextCountryCode))
    );
  };

  const selectAllServiceAreas = () => {
    setServiceArea(allCountryAreaValues);
  };

  const clearServiceAreas = () => {
    setServiceArea([]);
  };

  const updateProviderType = (nextProviderType: ProviderType) => {
    setProviderType(nextProviderType);

    if (nextProviderType === 'private') {
      if (publicDisplayMode === 'business') {
        setPublicDisplayMode('automatic');
      }
      setVatNumber('');
      setCompanyIdentityDocumentFile('');
      setCompanyRegistrationDocumentFile('');
      setCompanyInsuranceDocumentFile('');
      setCompanyActivityDocumentFile('');
      setVerificationNotes('');
    }
  };

  const updatePhone = (nextLocalPhone: string) => {
    setPhone(buildPhoneWithDialingCode(nextLocalPhone, phoneDialingCode));
  };

  const toggleForeignCoverage = (checked: boolean) => {
    setCoversForeign(checked);

    if (checked && selectedForeignCountryCodes.length === 0) {
      const nextForeignCountryCode = getDefaultForeignCountryCode(residenceCountryCode);
      setSelectedForeignCountryCodes([nextForeignCountryCode]);
      setForeignServiceAreasByCountry((current) => ({
        ...current,
        [nextForeignCountryCode]: current[nextForeignCountryCode] ?? []
      }));
    }

    if (!checked) {
      setSelectedForeignCountryCodes([]);
      setForeignServiceAreasByCountry({});
    }
  };

  const toggleForeignCountry = (countryCode: string) => {
    if (selectedForeignCountryCodes.includes(countryCode)) {
      setSelectedForeignCountryCodes((current) => current.filter((item) => item !== countryCode));
      setForeignServiceAreasByCountry((current) => {
        const { [countryCode]: removedCountry, ...remainingCountries } = current;
        return remainingCountries;
      });
      return;
    }

    setSelectedForeignCountryCodes((current) => [...current, countryCode]);
    setForeignServiceAreasByCountry((current) => ({
      ...current,
      [countryCode]: current[countryCode] ?? []
    }));
  };

  const toggleForeignServiceArea = (countryCode: string, area: string) => {
    setForeignServiceAreasByCountry((current) => {
      const selectedAreas = current[countryCode] ?? [];
      const nextAreas = selectedAreas.includes(area)
        ? selectedAreas.filter((item) => item !== area)
        : [...selectedAreas, area];

      return {
        ...current,
        [countryCode]: nextAreas
      };
    });
  };

  const selectAllForeignServiceAreas = (countryCode: string) => {
    setForeignServiceAreasByCountry((current) => ({
      ...current,
      [countryCode]: getCoverageAreaOptions(countryCode).map((location) => location.value)
    }));
  };

  const clearForeignServiceAreas = (countryCode: string) => {
    setForeignServiceAreasByCountry((current) => ({
      ...current,
      [countryCode]: []
    }));
  };

  const toggleLanguage = (locale: Locale) => {
    setLanguages((current) =>
      current.includes(locale) ? current.filter((item) => item !== locale) : [...current, locale]
    );
  };

  const addExtraLanguage = () => {
    if (selectedExtraLanguage === customLanguageValue) {
      const normalizedLanguage = customLanguageName.trim();

      if (!normalizedLanguage) {
        return;
      }

      const customLanguage = `${customLanguageValue}:${normalizedLanguage}`;
      setExtraLanguages((current) =>
        current.some((item) => item.toLowerCase() === customLanguage.toLowerCase())
          ? current
          : [...current, customLanguage]
      );
      setCustomLanguageName('');
      return;
    }

    setExtraLanguages((current) =>
      current.includes(selectedExtraLanguage) ? current : [...current, selectedExtraLanguage]
    );
  };

  const removeExtraLanguage = (languageCode: string) => {
    setExtraLanguages((current) => current.filter((item) => item !== languageCode));
  };

  const getExtraLanguageLabel = (languageCode: string) => {
    if (languageCode.startsWith(`${customLanguageValue}:`)) {
      return languageCode.slice(customLanguageValue.length + 1);
    }

    return t(`language.${languageCode}`);
  };

  const updateCategory = (nextCategorySlug: string) => {
    const nextCategory = marketplaceCategories.find((category) => category.slug === nextCategorySlug) ?? marketplaceCategories[0];
    setCategorySlug(nextCategory.slug);
    setSubcategorySlug(allTaxonomyValue);
    setSpecialtySlug(allTaxonomyValue);
  };

  const updateCategorySearch = (nextSearch: string) => {
    setCategorySearch(nextSearch);

    const nextCategory = findBestCategoryMatch(sortedCategories, nextSearch, language);
    if (nextCategory && nextCategory.slug !== categorySlug) {
      updateCategory(nextCategory.slug);
    }
  };

  const chooseCategory = (nextCategorySlug: string) => {
    updateCategory(nextCategorySlug);
    setCategorySearch('');
  };

  const updateSubcategory = (nextSubcategorySlug: string) => {
    if (nextSubcategorySlug === allTaxonomyValue) {
      setSubcategorySlug(allTaxonomyValue);
      setSpecialtySlug(allTaxonomyValue);
      return;
    }

    const nextSubcategory =
      selectedCategory.subcategories.find((subcategory) => subcategory.slug === nextSubcategorySlug) ??
      selectedCategory.subcategories[0];
    setSubcategorySlug(nextSubcategory.slug);
    setSpecialtySlug(allTaxonomyValue);
  };

  const submitMock = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!requiredComplete) {
      setShowMissing(true);
      setSubmitted(false);
      return;
    }

    setShowMissing(false);
    setSubmitted(true);
  };

  return (
    <section className="page-section provider-create-page">
      <div className="page-heading">
        <p className="kicker">{t('providerCreate.kicker')}</p>
        <h1>{t('providerCreate.title')}</h1>
        <p>{t('providerCreate.description')}</p>
      </div>

      <form className="create-listing-form" onSubmit={submitMock}>
        <section className="brief-card">
          <h2>{t('providerCreate.providerSection')}</h2>
          <p className="field-help">{t('providerCreate.identityDescription')}</p>
          <div className="form-grid">
            <label className="field">
              <span>{t('field.providerType')}</span>
              <select value={providerType} onChange={(event) => updateProviderType(event.target.value as ProviderType)}>
                {providerTypes.map((type) => (
                  <option key={type} value={type}>
                    {t(`providerType.${type}`)}
                  </option>
                ))}
              </select>
            </label>

            {providerType === 'professional' && (
              <label className="field">
                <span>
                  {t('field.providerName')} · {t('common.required')}
                </span>
                <input value={providerName} onChange={(event) => setProviderName(event.target.value)} />
              </label>
            )}

            <label className="field">
              <span>
                {t('field.firstName')} · {t('common.required')}
              </span>
              <input autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} />
            </label>

            <label className="field">
              <span>
                {t('field.lastName')} · {t('common.required')}
              </span>
              <input autoComplete="family-name" value={lastName} onChange={(event) => setLastName(event.target.value)} />
            </label>

            <label className="field">
              <span>
                {t('field.email')} · {t('common.required')}
              </span>
              <input autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>

            <label className="field">
              <span>
                {t('field.phone')} · {t('common.required')}
              </span>
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
            </label>

            <label className="field">
              <span>{t('field.residenceCountry')}</span>
              <select value={residenceCountryCode} onChange={(event) => updateResidenceCountry(event.target.value)}>
                {coverageCountries.map((country) => (
                  <option key={country.countryCode} value={country.countryCode}>
                    {country.labels[language]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-subsection">
            <h3>{t('providerCreate.publicProfileSection')}</h3>
            <p className="field-help">{t('providerCreate.publicProfileDescription')}</p>
            <div className="form-grid">
              <label className="field">
                <span>{t('field.publicDisplayName')}</span>
                <select
                  value={publicDisplayMode}
                  onChange={(event) => setPublicDisplayMode(event.target.value as PublicDisplayMode)}
                >
                  <option value="automatic">{t('publicDisplay.automatic')}</option>
                  <option value="first_name">{t('publicDisplay.firstName')}</option>
                  <option value="username">{t('publicDisplay.username')}</option>
                  {providerType === 'professional' && <option value="business">{t('publicDisplay.business')}</option>}
                </select>
              </label>

              <label className="field">
                <span>
                  {t('field.publicUsername')} · {t('common.optional')}
                </span>
                <input value={publicUsername} onChange={(event) => setPublicUsername(event.target.value)} />
              </label>

              <label className="field">
                <span>
                  {t('field.profilePhoto')} · {t('common.optional')}
                </span>
                <input
                  accept=".jpg,.jpeg,.png,.webp"
                  type="file"
                  onChange={(event) => setProfilePhotoFile(event.target.files?.[0]?.name ?? '')}
                />
                <small>{profilePhotoFile || t('field.noFileSelected')}</small>
              </label>

              <label className="field">
                <span>
                  {t('field.publicAge')} · {t('common.optional')}
                </span>
                <input
                  disabled={!showPublicAge}
                  inputMode="numeric"
                  min="16"
                  type="number"
                  value={publicAge}
                  onChange={(event) => setPublicAge(event.target.value)}
                />
              </label>
            </div>

            <div className="form-grid form-grid--compact">
              <label className="check-field">
                <input
                  type="checkbox"
                  checked={showPublicPhone}
                  onChange={(event) => setShowPublicPhone(event.target.checked)}
                />
                <span>{t('field.showPhonePublic')}</span>
              </label>
              <label className="check-field">
                <input
                  type="checkbox"
                  checked={showPublicAge}
                  onChange={(event) => setShowPublicAge(event.target.checked)}
                />
                <span>{t('field.showAgePublic')}</span>
              </label>
            </div>
          </div>

          <div className="form-subsection">
            <h3>{t('providerCreate.addressSection')}</h3>
            <div className="form-grid">
              <label className="field field--wide">
                <span>
                  {t('field.streetAddress')} · {t('common.required')}
                </span>
                <input
                  autoComplete="address-line1"
                  value={streetAddress}
                  onChange={(event) => setStreetAddress(event.target.value)}
                />
              </label>

              <label className="field">
                <span>
                  {t('field.doorNumber')} · {t('common.required')}
                </span>
                <input value={doorNumber} onChange={(event) => setDoorNumber(event.target.value)} />
              </label>

              <label className="field">
                <span>
                  {t('field.apartmentOrUnit')} · {t('common.optional')}
                </span>
                <input
                  autoComplete="address-line2"
                  value={apartmentOrUnit}
                  onChange={(event) => setApartmentOrUnit(event.target.value)}
                />
              </label>

              <label className="field">
                <span>
                  {t('field.postalCode')} · {t('common.required')}
                </span>
                <input
                  autoComplete="postal-code"
                  value={postalCode}
                  onChange={(event) => setPostalCode(event.target.value)}
                />
              </label>

              <label className="field">
                <span>
                  {t('field.city')} · {t('common.required')}
                </span>
                <input autoComplete="address-level2" value={city} onChange={(event) => setCity(event.target.value)} />
              </label>
            </div>
          </div>

          <div className="field-block provider-area-picker">
            <div className="field-block__header">
              <span>{t('field.serviceArea')}</span>
              <div className="field-block__actions">
                <button className="button button-muted" type="button" onClick={selectAllServiceAreas}>
                  {t('field.selectAllAreas')}
                </button>
                <button className="button button-muted" type="button" onClick={clearServiceAreas}>
                  {t('field.clearAreas')}
                </button>
              </div>
            </div>
            <p className="field-help">{t('field.serviceAreaHelp')}</p>
            <div className="checkbox-grid checkbox-grid--scroll">
              {countryLocationOptions.map((location) => (
                <label className="check-field" key={`${location.countryCode}-${location.value}`}>
                  <input
                    type="checkbox"
                    checked={serviceArea.includes(location.value)}
                    onChange={() => toggleServiceArea(location.value)}
                  />
                  <span>{location.label}</span>
                </label>
              ))}
            </div>

            <label className="check-field">
              <input
                type="checkbox"
                checked={coversForeign}
                onChange={(event) => toggleForeignCoverage(event.target.checked)}
              />
              <span>{t('field.coverForeign')}</span>
            </label>

            {coversForeign && (
              <div className="foreign-coverage-panel">
                <div className="field-block">
                  <span>{t('field.foreignCountries')}</span>
                  <p className="field-help">{t('field.foreignCountriesHelp')}</p>
                  <div className="checkbox-grid checkbox-grid--scroll">
                    {foreignCountryOptions.map((country) => (
                      <label className="check-field" key={country.countryCode}>
                        <input
                          type="checkbox"
                          checked={selectedForeignCountryCodes.includes(country.countryCode)}
                          onChange={() => toggleForeignCountry(country.countryCode)}
                        />
                        <span>{country.labels[language]}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {selectedForeignCountries.map((country) => {
                  const foreignLocationOptions = getCoverageAreaOptions(country.countryCode);
                  const selectedForeignAreas = foreignServiceAreasByCountry[country.countryCode] ?? [];

                  return (
                    <div className="field-block foreign-country-regions" key={country.countryCode}>
                      <div className="field-block__header">
                        <span>{t('field.foreignRegionsFor', { country: country.labels[language] })}</span>
                        <div className="field-block__actions">
                          <button
                            className="button button-muted"
                            type="button"
                            onClick={() => selectAllForeignServiceAreas(country.countryCode)}
                          >
                            {t('field.selectAllRegions')}
                          </button>
                          <button
                            className="button button-muted"
                            type="button"
                            onClick={() => clearForeignServiceAreas(country.countryCode)}
                          >
                            {t('field.clearAreas')}
                          </button>
                        </div>
                      </div>
                      <div className="checkbox-grid checkbox-grid--scroll">
                        {foreignLocationOptions.map((location) => (
                          <label className="check-field" key={`${location.countryCode}-${location.value}`}>
                            <input
                              type="checkbox"
                              checked={selectedForeignAreas.includes(location.value)}
                              onChange={() => toggleForeignServiceArea(country.countryCode, location.value)}
                            />
                            <span>{location.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="brief-card">
          <h2>{t('providerCreate.serviceSection')}</h2>
          <div className="form-grid">
            <div className="category-picker">
              <label className="field category-search-field">
                <span>{t('field.category')}</span>
                <div className="category-search-bar">
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <path d="m21 21-4.3-4.3" />
                    <circle cx="11" cy="11" r="7" />
                  </svg>
                  <input
                    value={categorySearch}
                    aria-label={t('field.categorySearch')}
                    placeholder={t('field.categorySearchPlaceholder')}
                    onChange={(event) => updateCategorySearch(event.target.value)}
                  />
                </div>
              </label>

              <div className="category-search-results" role="listbox" aria-label={t('field.category')}>
                {filteredCategories.map((category) => (
                  <button
                    className={category.slug === categorySlug ? 'is-active' : ''}
                    key={category.slug}
                    type="button"
                    role="option"
                    aria-selected={category.slug === categorySlug}
                    onClick={() => chooseCategory(category.slug)}
                  >
                    {category.labels[language]}
                  </button>
                ))}
              </div>
              <p className="field-help">
                {t('field.categorySearchCount', { count: filteredCategories.length })}
              </p>
            </div>

            <label className="field">
              <span>{t('field.subcategory')}</span>
              <select value={selectedSubcategory?.slug ?? allTaxonomyValue} onChange={(event) => updateSubcategory(event.target.value)}>
                <option value={allTaxonomyValue}>{t('common.all')}</option>
                {sortedSubcategories.map((subcategory) => (
                  <option key={subcategory.slug} value={subcategory.slug}>
                    {subcategory.labels[language]}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>{t('field.specialty')}</span>
              <select value={selectedSpecialty?.slug ?? allTaxonomyValue} onChange={(event) => setSpecialtySlug(event.target.value)}>
                <option value={allTaxonomyValue}>{t('common.all')}</option>
                {sortedSpecialties.map((specialty) => (
                  <option key={specialty.slug} value={specialty.slug}>
                    {specialty.labels[language]}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>{t('field.priceModel')}</span>
              <select value={priceModel} onChange={(event) => setPriceModel(event.target.value as PriceModel)}>
                {priceModels.map((model) => (
                  <option key={model} value={model}>
                    {t(`priceModel.${model}`)}
                  </option>
                ))}
              </select>
            </label>

            {priceModel === 'hourly' && (
              <label className="field price-detail-field">
                <span>{t('field.hourlyPrice')}</span>
                <div className="price-input-group">
                  <input
                    inputMode="decimal"
                    min="0"
                    placeholder={t('field.hourlyPricePlaceholder')}
                    type="number"
                    value={hourlyPrice}
                    onChange={(event) => setHourlyPrice(event.target.value)}
                  />
                  <span>EUR/h</span>
                </div>
              </label>
            )}

            {priceModel === 'forfait' && (
              <label className="field price-detail-field">
                <span>{t('field.forfaitPrice')}</span>
                <div className="price-input-group">
                  <input
                    inputMode="decimal"
                    min="0"
                    placeholder={t('field.forfaitPricePlaceholder')}
                    type="number"
                    value={forfaitPrice}
                    onChange={(event) => setForfaitPrice(event.target.value)}
                  />
                  <span>EUR</span>
                </div>
              </label>
            )}

            <label className="field">
              <span>
                {t('field.serviceTitle')} · {t('common.required')}
              </span>
              <input value={serviceTitle} onChange={(event) => setServiceTitle(event.target.value)} />
            </label>
          </div>

          <label className="field">
            <span>
              {t('field.shortDescription')} · {t('common.required')}
            </span>
            <textarea rows={4} value={shortDescription} onChange={(event) => setShortDescription(event.target.value)} />
          </label>

          <div className="form-grid form-grid--compact">
            <label className="check-field">
              <input type="checkbox" checked={weekdays} onChange={(event) => setWeekdays(event.target.checked)} />
              <span>{t('availability.weekdays')}</span>
            </label>
            <label className="check-field">
              <input type="checkbox" checked={weekends} onChange={(event) => setWeekends(event.target.checked)} />
              <span>{t('availability.weekends')}</span>
            </label>
            <label className="check-field">
              <input
                type="checkbox"
                checked={urgentRequests}
                onChange={(event) => setUrgentRequests(event.target.checked)}
              />
              <span>{t('availability.urgentRequests')}</span>
            </label>
            <label className="check-field">
              <input
                type="checkbox"
                checked={travelToClient}
                onChange={(event) => setTravelToClient(event.target.checked)}
              />
              <span>{t('field.travelToClient')}</span>
            </label>
          </div>

          <div className="field-block">
            <div className="field-block__header">
              <span>{t('field.languagesSpoken')}</span>
              <button
                className="button button-muted"
                type="button"
                onClick={() => setShowExtraLanguagePicker((current) => !current)}
              >
                {t('field.addLanguage')}
              </button>
            </div>
            <div className="checkbox-grid">
              {listingLanguages.map((locale) => (
                <label className="check-field" key={locale}>
                  <input type="checkbox" checked={languages.includes(locale)} onChange={() => toggleLanguage(locale)} />
                  <span>{t(`language.${locale}`)}</span>
                </label>
              ))}
            </div>
            {showExtraLanguagePicker && (
              <div className="extra-language-picker">
                <label className="field">
                  <span>{t('field.otherLanguage')}</span>
                  <select
                    value={selectedExtraLanguage}
                    onChange={(event) => setSelectedExtraLanguage(event.target.value)}
                  >
                    {additionalLanguageOptions.map((option) => (
                      <option key={option} value={option}>
                        {t(`language.${option}`)}
                      </option>
                    ))}
                    <option value={customLanguageValue}>{t('language.custom')}</option>
                  </select>
                </label>
                {selectedExtraLanguage === customLanguageValue && (
                  <label className="field">
                    <span>{t('field.customLanguage')}</span>
                    <input
                      placeholder={t('field.customLanguagePlaceholder')}
                      value={customLanguageName}
                      onChange={(event) => setCustomLanguageName(event.target.value)}
                    />
                  </label>
                )}
                <button className="button button-primary" type="button" onClick={addExtraLanguage}>
                  {t('button.add')}
                </button>
              </div>
            )}
            {extraLanguages.length > 0 && (
              <div className="selected-language-list" aria-label={t('field.selectedLanguages')}>
                {extraLanguages.map((languageCode) => (
                  <button key={languageCode} type="button" onClick={() => removeExtraLanguage(languageCode)}>
                    {getExtraLanguageLabel(languageCode)}
                    <span aria-hidden="true">×</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="brief-card listing-preview-panel">
          <div>
            <h2>{t('providerCreate.previewSection')}</h2>
            <p className="field-help">{t('providerCreate.previewDescription')}</p>
          </div>
          <article className="provider-listing-preview">
            <div className="provider-listing-preview__visual">
              <span>{publicProviderName.trim().charAt(0).toUpperCase() || 'K'}</span>
              <strong>{previewPrice}</strong>
              {profilePhotoFile && <small>{profilePhotoFile}</small>}
            </div>
            <div className="provider-listing-preview__body">
              <span className="small-label">{selectedCategory.labels[language]}</span>
              <h3>{previewTitle}</h3>
              <p>{previewDescription}</p>
              <div className="listing-card__facts">
                <span>{publicProviderName}</span>
                <span>{previewLocation}</span>
                <span>{t(`providerType.${providerType}`)}</span>
                {showPublicPhone && phoneLocalNumber && <span>{phoneDialingCode} {phoneLocalNumber}</span>}
                {showPublicAge && publicAge && <span>{t('field.ageValue', { age: publicAge })}</span>}
              </div>
            </div>
          </article>
        </section>

        {providerType === 'professional' && (
          <section className="brief-card">
            <h2>{t('providerProfile.verification')}</h2>
            <p className="field-help">{t('providerCreate.verificationDescription')}</p>
            <div className="form-subsection form-subsection--flush">
              <h3>{t('providerCreate.legalDataSection')}</h3>
              <div className="form-grid">
                <label className="field">
                  <span>
                    {t('field.vatNumber')} · {t('common.required')}
                  </span>
                  <input required value={vatNumber} onChange={(event) => setVatNumber(event.target.value)} />
                </label>
              </div>
            </div>

            <div className="field-block verification-documents">
                <span>
                  {t('field.companyDocuments')} · {t('common.required')}
                </span>
                <p className="field-help">{t('field.companyDocumentsHelp')}</p>
                <div className="document-upload-grid">
                  <label className="document-upload-field">
                    <span>{t('field.companyIdentityDocument')}</span>
                    <input
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      required
                      type="file"
                      onChange={(event) => setCompanyIdentityDocumentFile(event.target.files?.[0]?.name ?? '')}
                    />
                    <small>
                      {companyIdentityDocumentFile || t('field.noFileSelected')}
                    </small>
                  </label>
                  <label className="document-upload-field">
                    <span>{t('field.companyRegistrationDocument')}</span>
                    <input
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      required
                      type="file"
                      onChange={(event) => setCompanyRegistrationDocumentFile(event.target.files?.[0]?.name ?? '')}
                    />
                    <small>
                      {companyRegistrationDocumentFile || t('field.noFileSelected')}
                    </small>
                  </label>
                  <label className="document-upload-field">
                    <span>{t('field.companyInsuranceDocument')}</span>
                    <input
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      required
                      type="file"
                      onChange={(event) => setCompanyInsuranceDocumentFile(event.target.files?.[0]?.name ?? '')}
                    />
                    <small>
                      {companyInsuranceDocumentFile || t('field.noFileSelected')}
                    </small>
                  </label>
                  <label className="document-upload-field">
                    <span>{t('field.companyActivityDocument')}</span>
                    <input
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      required
                      type="file"
                      onChange={(event) => setCompanyActivityDocumentFile(event.target.files?.[0]?.name ?? '')}
                    />
                    <small>
                      {companyActivityDocumentFile || t('field.noFileSelected')}
                    </small>
                  </label>
                </div>
                <div className="expected-documents">
                  <span>{t('field.expectedExtraDocuments')}</span>
                  <ul>
                    <li>{t('field.expectedExtraDocuments.item1')}</li>
                    <li>{t('field.expectedExtraDocuments.item2')}</li>
                    <li>{t('field.expectedExtraDocuments.item3')}</li>
                    <li>{t('field.expectedExtraDocuments.item4')}</li>
                  </ul>
                </div>
                <label className="field">
                  <span>
                    {t('field.verificationNotes')} · {t('common.optional')}
                  </span>
                  <input
                    placeholder={t('field.verificationNotesPlaceholder')}
                    value={verificationNotes}
                    onChange={(event) => setVerificationNotes(event.target.value)}
                  />
                </label>
            </div>
          </section>
        )}

        <section className="brief-card">
          <h2>{t('providerCreate.proposalSection')}</h2>
          <p className="field-help">{t('providerCreate.proposalDescription')}</p>
          <label className="check-field">
            <input type="checkbox" checked={proposedNew} onChange={(event) => setProposedNew(event.target.checked)} />
            <span>{t('field.proposedNew')}</span>
          </label>
          {proposedNew && (
            <label className="field">
              <span>{t('field.proposedValue')}</span>
              <textarea rows={4} value={proposedValue} onChange={(event) => setProposedValue(event.target.value)} />
            </label>
          )}
          {proposedNew && <p className="mock-note">{t('providerCreate.adminReview')}</p>}
        </section>

        {showMissing && <p className="field-error">{t('providerCreate.requiredMissing')}</p>}
        {submitted && <p className="mock-note">{t('providerCreate.mockSaved')}</p>}

        <button className="button button-primary" type="submit">
          {t('providerCreate.publish')}
        </button>
      </form>
    </section>
  );
}

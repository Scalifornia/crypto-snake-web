import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { brand } from '../config/brand';
import { getCoverageCountries } from '../data/euCoverageOptions';
import {
  clearStoredUserLocation,
  findClosestLocation,
  getLocation,
  locationChangeEventName,
  getStoredUserLocation,
  saveStoredUserLocation
} from '../data/locationData';
import { getLanguageForCountry } from '../i18n/countryLanguage';
import { languageNames, supportedLanguages } from '../i18n/translations';
import { useTranslation } from '../i18n/useTranslation';
import type { Locale } from '../types/servigo';

type ThemePreference = 'light' | 'dark' | 'auto';

const themeStorageKey = 'kliko-theme-v2';

const themeOptions: Array<{ mode: ThemePreference; labelKey: string; symbol: string }> = [
  { mode: 'light', labelKey: 'theme.day', symbol: '☀' },
  { mode: 'dark', labelKey: 'theme.night', symbol: '☾' },
  { mode: 'auto', labelKey: 'theme.auto', symbol: '◐' }
];

function getInitialThemePreference(): ThemePreference {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const storedTheme = window.localStorage.getItem(themeStorageKey);
  return storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'auto' ? storedTheme : 'light';
}

function resolveTheme(preference: ThemePreference): 'light' | 'dark' {
  if (preference !== 'auto' || typeof window === 'undefined') {
    return preference === 'dark' ? 'dark' : 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function Layout() {
  const { language, setLanguage, t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [themePreference, setThemePreference] = useState<ThemePreference>(getInitialThemePreference);
  const storedLocation = getStoredUserLocation();
  const storedLocationArea = getLocation(storedLocation?.locationId);
  const [countryCode, setCountryCode] = useState(storedLocation?.countryCode ?? storedLocationArea?.countryCode ?? '');
  const countryOptions = useMemo(() => getCoverageCountries(language), [language]);

  const menuItems = [
    { to: '/', label: t('nav.search') },
    { to: '/categories', label: t('nav.categories') },
    { to: '/listings', label: t('nav.listings') },
    { to: '/provider/create-listing', label: t('nav.createListing') },
    { to: '/how-it-works', label: t('nav.howItWorks') },
    { to: '/client', label: t('nav.client') },
    { to: '/provider', label: t('nav.provider') },
    { to: '/admin', label: t('nav.admin') }
  ];
  const mobileNavItems = [
    { to: '/', label: t('nav.search') },
    { to: '/categories', label: t('nav.categories') },
    { to: '/listings', label: t('nav.listings') },
    { to: '/provider/create-listing', label: t('nav.createListing') }
  ];

  const detectLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const closestLocation = findClosestLocation(position.coords.latitude, position.coords.longitude);
        setCountryCode(closestLocation.countryCode);
        saveStoredUserLocation({
          source: 'browser',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          countryCode: closestLocation.countryCode,
          locationId: closestLocation.id
        });
      },
      () => undefined,
      { enableHighAccuracy: false, maximumAge: 600000, timeout: 8000 }
    );
  };

  useEffect(() => {
    if (!storedLocation?.locationId && !storedLocation?.countryCode) {
      detectLocation();
    }
  }, []);

  useEffect(() => {
    const syncCountry = () => {
      const nextStoredLocation = getStoredUserLocation();
      const nextStoredLocationArea = getLocation(nextStoredLocation?.locationId);
      setCountryCode(nextStoredLocation?.countryCode ?? nextStoredLocationArea?.countryCode ?? '');
    };

    window.addEventListener(locationChangeEventName, syncCountry);
    return () => window.removeEventListener(locationChangeEventName, syncCountry);
  }, []);

  useEffect(() => {
    const applyTheme = () => {
      document.documentElement.dataset.theme = resolveTheme(themePreference);
      document.documentElement.dataset.themePreference = themePreference;
    };

    applyTheme();

    if (themePreference !== 'auto') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', applyTheme);

    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [themePreference]);

  const selectCountry = (nextCountryCode: string) => {
    setCountryCode(nextCountryCode);

    if (!nextCountryCode) {
      clearStoredUserLocation();
      return;
    }

    saveStoredUserLocation({
      source: 'manual',
      countryCode: nextCountryCode
    });
    setLanguage(getLanguageForCountry(nextCountryCode));
  };

  const selectTheme = (nextThemePreference: ThemePreference) => {
    setThemePreference(nextThemePreference);
    window.localStorage.setItem(themeStorageKey, nextThemePreference);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-main">
          <button
            className="menu-button"
            type="button"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? t('nav.closeMenu') : t('nav.menu')}
            onClick={() => setMenuOpen((current) => !current)}
          >
            <span />
            <span />
            <span />
          </button>
          <Link className="brand" to="/" aria-label={brand.brandName} onClick={() => setMenuOpen(false)}>
            <span className="brand-mark">K</span>
            <span className="brand-word">{brand.brandName}</span>
          </Link>
        </div>

        <nav className={menuOpen ? 'hamburger-menu is-open' : 'hamburger-menu'} aria-label={t('nav.primary')}>
          {menuItems.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)}>
              {item.label}
            </NavLink>
          ))}
          <div className="hamburger-theme">
            <span>{t('theme.title')}</span>
            <div className="theme-switcher" aria-label={t('theme.title')}>
              {themeOptions.map((option) => (
                <button
                  className={themePreference === option.mode ? 'is-active' : ''}
                  key={option.mode}
                  type="button"
                  aria-label={t(option.labelKey)}
                  aria-pressed={themePreference === option.mode}
                  title={t(option.labelKey)}
                  onClick={() => selectTheme(option.mode)}
                >
                  <span aria-hidden="true">{option.symbol}</span>
                  <span className="theme-label">{t(option.labelKey)}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="topbar-actions">
          <div className="topbar-location" aria-label={t('location.manual')}>
            <select value={countryCode} aria-label={t('filters.country')} onChange={(event) => selectCountry(event.target.value)}>
              <option value="">{t('common.all')}</option>
              {countryOptions.map((country) => (
                <option key={country.countryCode} value={country.countryCode}>
                  {country.labels[language]}
                </option>
              ))}
            </select>
          </div>
          <div className="language-switcher" aria-label={t('nav.language')}>
            <select
              aria-label={t('nav.language')}
              value={language}
              onChange={(event) => setLanguage(event.target.value as Locale)}
            >
              {supportedLanguages.map((languageOption) => (
                <option key={languageOption} value={languageOption}>
                  {languageNames[languageOption]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <nav className="mobile-app-nav" aria-label={t('nav.primary')}>
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => (isActive ? 'is-active' : undefined)}
            onClick={() => setMenuOpen(false)}
          >
            <span className="mobile-app-nav__indicator" aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <footer className="site-footer">
        <div>
          <strong>{brand.brandName}</strong>
          <p>{t('footer.description')}</p>
        </div>
        <div className="footer-links">
          <Link to="/categories">{t('footer.categories')}</Link>
          <Link to="/listings">{t('footer.listings')}</Link>
          <Link to="/provider/create-listing">{t('footer.createListing')}</Link>
          <Link to="/how-it-works">{t('nav.howItWorks')}</Link>
          <Link to="/rules">{t('nav.rules')}</Link>
          <Link to="/admin">{t('footer.admin')}</Link>
        </div>
      </footer>
    </div>
  );
}

import type { Locale } from '../types/servigo';
import { supportedLanguages } from './translations';

const englishFallback: Locale = 'en';

const countryLanguageMap: Record<string, Locale> = {
  AD: 'es',
  AT: 'de',
  BE: 'fr',
  CH: 'de',
  DE: 'de',
  ES: 'es',
  FR: 'fr',
  GB: 'en',
  IE: 'en',
  IT: 'it',
  LI: 'de',
  LU: 'lb',
  MC: 'fr',
  MT: 'en',
  PT: 'pt',
  SM: 'it',
  VA: 'it'
};

export function getLanguageForCountry(countryCode: string): Locale {
  const mappedLanguage = countryLanguageMap[countryCode.toUpperCase()];
  return mappedLanguage && supportedLanguages.includes(mappedLanguage) ? mappedLanguage : englishFallback;
}

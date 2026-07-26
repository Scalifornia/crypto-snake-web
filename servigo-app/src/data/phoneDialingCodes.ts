const dialingCodesByCountry: Record<string, string> = {
  AD: '+376',
  AL: '+355',
  AM: '+374',
  AT: '+43',
  AZ: '+994',
  BA: '+387',
  BE: '+32',
  BG: '+359',
  BY: '+375',
  CH: '+41',
  CY: '+357',
  CZ: '+420',
  DE: '+49',
  DK: '+45',
  EE: '+372',
  ES: '+34',
  FI: '+358',
  FR: '+33',
  GB: '+44',
  GE: '+995',
  GR: '+30',
  HR: '+385',
  HU: '+36',
  IE: '+353',
  IS: '+354',
  IT: '+39',
  LI: '+423',
  LT: '+370',
  LU: '+352',
  LV: '+371',
  MC: '+377',
  MD: '+373',
  ME: '+382',
  MK: '+389',
  MT: '+356',
  NL: '+31',
  NO: '+47',
  PL: '+48',
  PT: '+351',
  RO: '+40',
  RS: '+381',
  RU: '+7',
  SE: '+46',
  SI: '+386',
  SK: '+421',
  SM: '+378',
  TR: '+90',
  UA: '+380',
  VA: '+39',
  XK: '+383'
};

const knownDialingCodes = Array.from(new Set(Object.values(dialingCodesByCountry))).sort(
  (first, second) => second.length - first.length
);

export function getDialingCodeForCountry(countryCode?: string) {
  return dialingCodesByCountry[countryCode ?? ''] ?? dialingCodesByCountry.LU;
}

export function getLocalPhoneNumber(phone: string, currentDialingCode: string) {
  const trimmedPhone = phone.trim();

  if (!trimmedPhone) {
    return '';
  }

  if (trimmedPhone.startsWith(currentDialingCode)) {
    return trimmedPhone.slice(currentDialingCode.length).trimStart();
  }

  const existingDialingCode = knownDialingCodes.find((dialingCode) => trimmedPhone.startsWith(dialingCode));
  return existingDialingCode ? trimmedPhone.slice(existingDialingCode.length).trimStart() : trimmedPhone;
}

export function buildPhoneWithDialingCode(localPhone: string, dialingCode: string) {
  const trimmedLocalPhone = localPhone.trim();

  if (!trimmedLocalPhone) {
    return '';
  }

  if (trimmedLocalPhone.startsWith('+')) {
    return trimmedLocalPhone;
  }

  return `${dialingCode} ${trimmedLocalPhone}`;
}

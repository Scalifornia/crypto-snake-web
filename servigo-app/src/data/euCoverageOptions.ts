import type { Locale, LocalizedText } from '../types/servigo';
import { getRequestLocationOptions } from './requestLocationOptions';

export interface CoverageCountry {
  countryCode: string;
  labels: LocalizedText;
}

export interface CoverageAreaOption {
  value: string;
  label: string;
  countryCode: string;
}

export const europeCoverageCountries: CoverageCountry[] = [
  { countryCode: 'AL', labels: { fr: 'Albanie', pt: 'Albânia', en: 'Albania' } },
  { countryCode: 'AD', labels: { fr: 'Andorre', pt: 'Andorra', en: 'Andorra' } },
  { countryCode: 'AM', labels: { fr: 'Arménie', pt: 'Arménia', en: 'Armenia' } },
  { countryCode: 'AT', labels: { fr: 'Autriche', pt: 'Áustria', en: 'Austria' } },
  { countryCode: 'AZ', labels: { fr: 'Azerbaïdjan', pt: 'Azerbaijão', en: 'Azerbaijan' } },
  { countryCode: 'BY', labels: { fr: 'Biélorussie', pt: 'Bielorrússia', en: 'Belarus' } },
  { countryCode: 'BE', labels: { fr: 'Belgique', pt: 'Bélgica', en: 'Belgium' } },
  { countryCode: 'BA', labels: { fr: 'Bosnie-Herzégovine', pt: 'Bósnia e Herzegovina', en: 'Bosnia and Herzegovina' } },
  { countryCode: 'BG', labels: { fr: 'Bulgarie', pt: 'Bulgária', en: 'Bulgaria' } },
  { countryCode: 'HR', labels: { fr: 'Croatie', pt: 'Croácia', en: 'Croatia' } },
  { countryCode: 'CY', labels: { fr: 'Chypre', pt: 'Chipre', en: 'Cyprus' } },
  { countryCode: 'CZ', labels: { fr: 'Tchéquie', pt: 'Chéquia', en: 'Czechia' } },
  { countryCode: 'DK', labels: { fr: 'Danemark', pt: 'Dinamarca', en: 'Denmark' } },
  { countryCode: 'EE', labels: { fr: 'Estonie', pt: 'Estónia', en: 'Estonia' } },
  { countryCode: 'FI', labels: { fr: 'Finlande', pt: 'Finlândia', en: 'Finland' } },
  { countryCode: 'FR', labels: { fr: 'France', pt: 'França', en: 'France' } },
  { countryCode: 'GE', labels: { fr: 'Géorgie', pt: 'Geórgia', en: 'Georgia' } },
  { countryCode: 'DE', labels: { fr: 'Allemagne', pt: 'Alemanha', en: 'Germany' } },
  { countryCode: 'GR', labels: { fr: 'Grèce', pt: 'Grécia', en: 'Greece' } },
  { countryCode: 'HU', labels: { fr: 'Hongrie', pt: 'Hungria', en: 'Hungary' } },
  { countryCode: 'IS', labels: { fr: 'Islande', pt: 'Islândia', en: 'Iceland' } },
  { countryCode: 'IE', labels: { fr: 'Irlande', pt: 'Irlanda', en: 'Ireland' } },
  { countryCode: 'IT', labels: { fr: 'Italie', pt: 'Itália', en: 'Italy' } },
  { countryCode: 'XK', labels: { fr: 'Kosovo', pt: 'Kosovo', en: 'Kosovo' } },
  { countryCode: 'LV', labels: { fr: 'Lettonie', pt: 'Letónia', en: 'Latvia' } },
  { countryCode: 'LI', labels: { fr: 'Liechtenstein', pt: 'Liechtenstein', en: 'Liechtenstein' } },
  { countryCode: 'LT', labels: { fr: 'Lituanie', pt: 'Lituânia', en: 'Lithuania' } },
  { countryCode: 'LU', labels: { fr: 'Luxembourg', pt: 'Luxemburgo', en: 'Luxembourg' } },
  { countryCode: 'MT', labels: { fr: 'Malte', pt: 'Malta', en: 'Malta' } },
  { countryCode: 'MD', labels: { fr: 'Moldavie', pt: 'Moldávia', en: 'Moldova' } },
  { countryCode: 'MC', labels: { fr: 'Monaco', pt: 'Mónaco', en: 'Monaco' } },
  { countryCode: 'ME', labels: { fr: 'Monténégro', pt: 'Montenegro', en: 'Montenegro' } },
  { countryCode: 'NL', labels: { fr: 'Pays-Bas', pt: 'Países Baixos', en: 'Netherlands' } },
  { countryCode: 'MK', labels: { fr: 'Macédoine du Nord', pt: 'Macedónia do Norte', en: 'North Macedonia' } },
  { countryCode: 'NO', labels: { fr: 'Norvège', pt: 'Noruega', en: 'Norway' } },
  { countryCode: 'PL', labels: { fr: 'Pologne', pt: 'Polónia', en: 'Poland' } },
  { countryCode: 'PT', labels: { fr: 'Portugal', pt: 'Portugal', en: 'Portugal' } },
  { countryCode: 'RO', labels: { fr: 'Roumanie', pt: 'Roménia', en: 'Romania' } },
  { countryCode: 'RU', labels: { fr: 'Russie', pt: 'Rússia', en: 'Russia' } },
  { countryCode: 'SM', labels: { fr: 'Saint-Marin', pt: 'São Marino', en: 'San Marino' } },
  { countryCode: 'RS', labels: { fr: 'Serbie', pt: 'Sérvia', en: 'Serbia' } },
  { countryCode: 'SK', labels: { fr: 'Slovaquie', pt: 'Eslováquia', en: 'Slovakia' } },
  { countryCode: 'SI', labels: { fr: 'Slovénie', pt: 'Eslovénia', en: 'Slovenia' } },
  { countryCode: 'ES', labels: { fr: 'Espagne', pt: 'Espanha', en: 'Spain' } },
  { countryCode: 'SE', labels: { fr: 'Suède', pt: 'Suécia', en: 'Sweden' } },
  { countryCode: 'CH', labels: { fr: 'Suisse', pt: 'Suíça', en: 'Switzerland' } },
  { countryCode: 'TR', labels: { fr: 'Turquie', pt: 'Turquia', en: 'Turkey' } },
  { countryCode: 'UA', labels: { fr: 'Ukraine', pt: 'Ucrânia', en: 'Ukraine' } },
  { countryCode: 'GB', labels: { fr: 'Royaume-Uni', pt: 'Reino Unido', en: 'United Kingdom' } },
  { countryCode: 'VA', labels: { fr: 'Vatican', pt: 'Vaticano', en: 'Vatican City' } }
];

export const euCoverageCountries = europeCoverageCountries;

const broadRegionsByCountry: Record<string, string[]> = {
  AL: ['Tirana', 'Durres', 'Shkoder', 'Vlore'],
  AD: ['Andorra la Vella', 'Escaldes-Engordany', 'Encamp', 'La Massana'],
  AM: ['Yerevan', 'Gyumri', 'Vanadzor', 'Ararat'],
  AT: ['Vienna', 'Lower Austria', 'Upper Austria', 'Styria', 'Tyrol', 'Salzburg'],
  AZ: ['Baku', 'Ganja', 'Sumqayit', 'Shaki'],
  BY: ['Minsk', 'Gomel', 'Mogilev', 'Vitebsk', 'Brest', 'Grodno'],
  BA: ['Sarajevo', 'Banja Luka', 'Tuzla', 'Mostar'],
  BG: ['Sofia', 'Plovdiv', 'Varna', 'Burgas'],
  HR: ['Zagreb', 'Split-Dalmatia', 'Istria', 'Dubrovnik-Neretva'],
  CY: ['Nicosia', 'Limassol', 'Larnaca', 'Paphos'],
  CZ: ['Prague', 'Central Bohemia', 'South Moravia', 'Moravia-Silesia'],
  DK: ['Copenhagen', 'Zealand', 'Central Denmark', 'Southern Denmark', 'North Denmark'],
  EE: ['Tallinn', 'Tartu', 'Parnu', 'Ida-Viru'],
  FI: ['Uusimaa', 'Southwest Finland', 'Pirkanmaa', 'North Ostrobothnia'],
  GE: ['Tbilisi', 'Batumi', 'Kutaisi', 'Kakheti'],
  DE: [
    'Baden-Wurttemberg',
    'Bavaria',
    'Berlin',
    'Brandenburg',
    'Bremen',
    'Hamburg',
    'Hesse',
    'Lower Saxony',
    'North Rhine-Westphalia',
    'Rhineland-Palatinate',
    'Saarland',
    'Saxony',
    'Saxony-Anhalt',
    'Schleswig-Holstein',
    'Thuringia'
  ],
  GR: ['Attica', 'Central Macedonia', 'Crete', 'Thessaly', 'Western Greece'],
  HU: ['Budapest', 'Pest', 'Gyor-Moson-Sopron', 'Hajdu-Bihar'],
  IS: ['Capital Region', 'Southern Peninsula', 'South Iceland', 'North Iceland'],
  IE: ['Dublin', 'Cork', 'Galway', 'Limerick'],
  IT: ['Lombardy', 'Lazio', 'Piedmont', 'Tuscany', 'Veneto', 'Emilia-Romagna', 'Sicily'],
  XK: ['Pristina', 'Prizren', 'Peja', 'Mitrovica'],
  LV: ['Riga', 'Kurzeme', 'Latgale', 'Vidzeme', 'Zemgale'],
  LI: ['Vaduz', 'Schaan', 'Balzers', 'Triesen'],
  LT: ['Vilnius', 'Kaunas', 'Klaipeda', 'Siauliai'],
  MT: ['Malta', 'Gozo'],
  MD: ['Chisinau', 'Balti', 'Cahul', 'Orhei'],
  MC: ['Monaco', 'Monte Carlo', 'La Condamine', 'Fontvieille'],
  ME: ['Podgorica', 'Niksic', 'Budva', 'Bar'],
  NL: ['North Holland', 'South Holland', 'Utrecht', 'North Brabant', 'Limburg', 'Gelderland', 'Zeeland'],
  MK: ['Skopje', 'Bitola', 'Ohrid', 'Tetovo'],
  NO: ['Oslo', 'Vestland', 'Trondelag', 'Rogaland', 'Troms'],
  PL: ['Masovian', 'Lesser Poland', 'Silesian', 'Greater Poland', 'Pomeranian', 'Lower Silesian'],
  RO: ['Bucharest', 'Cluj', 'Timis', 'Iasi', 'Brasov', 'Constanta'],
  RU: ['Moscow', 'Saint Petersburg', 'Krasnodar', 'Kaliningrad', 'Tatarstan'],
  SM: ['San Marino', 'Serravalle', 'Borgo Maggiore', 'Domagnano'],
  RS: ['Belgrade', 'Vojvodina', 'Nisava', 'Sumadija'],
  SK: ['Bratislava', 'Kosice', 'Nitra', 'Zilina', 'Trnava'],
  SI: ['Ljubljana', 'Maribor', 'Celje', 'Koper'],
  ES: ['Madrid', 'Catalonia', 'Valencia', 'Andalusia', 'Basque Country', 'Galicia', 'Castile and Leon'],
  SE: ['Stockholm', 'Vastra Gotaland', 'Skane', 'Uppsala'],
  CH: ['Zurich', 'Geneva', 'Vaud', 'Bern', 'Ticino', 'Basel'],
  TR: ['Istanbul', 'Ankara', 'Izmir', 'Antalya', 'Bursa'],
  UA: ['Kyiv', 'Lviv', 'Odesa', 'Kharkiv', 'Dnipro'],
  GB: ['London', 'South East England', 'Scotland', 'Wales', 'Northern Ireland', 'North West England'],
  VA: ['Vatican City']
};

const preferredForeignCountries = ['FR', 'BE', 'DE', 'PT', 'LU'];

export function getCoverageCountries(language: Locale) {
  return [...europeCoverageCountries].sort((first, second) =>
    first.labels[language].localeCompare(second.labels[language], language)
  );
}

export function getCoverageCountry(countryCode: string) {
  return europeCoverageCountries.find((country) => country.countryCode === countryCode) ?? europeCoverageCountries[0];
}

export function getCoverageAreaOptions(countryCode: string): CoverageAreaOption[] {
  const requestLocations = getRequestLocationOptions(countryCode);

  if (requestLocations.length > 0) {
    return requestLocations.map((location) => ({
      value: location.value,
      label: location.label,
      countryCode: location.countryCode
    }));
  }

  return (broadRegionsByCountry[countryCode] ?? []).map((region) => ({
    value: region,
    label: region,
    countryCode
  }));
}

export function getDefaultForeignCountryCode(residenceCountryCode: string) {
  return (
    preferredForeignCountries.find((countryCode) => countryCode !== residenceCountryCode) ??
    europeCoverageCountries.find((country) => country.countryCode !== residenceCountryCode)?.countryCode ??
    'FR'
  );
}

export function getDefaultCoverageAreaValue(countryCode: string) {
  return getCoverageAreaOptions(countryCode)[0]?.value ?? '';
}

import type { StoredUserLocation } from '../types/servigo';
import { getLocation } from './locationData';

export interface RequestLocationOption {
  value: string;
  label: string;
  countryCode: string;
  locationId?: string;
}

const luxembourgCommunes = [
  'Beaufort',
  'Bech',
  'Beckerich',
  'Berdorf',
  'Bertrange',
  'Bettembourg',
  'Bettendorf',
  'Betzdorf',
  'Bissen',
  'Biwer',
  'Bourscheid',
  'Bous-Waldbredimus',
  'Clervaux',
  'Colmar-Berg',
  'Consdorf',
  'Contern',
  'Dalheim',
  'Diekirch',
  'Differdange',
  'Dippach',
  'Dudelange',
  'Echternach',
  'Ell',
  'Erpeldange-sur-Sure',
  'Esch-sur-Alzette',
  'Esch-sur-Sure',
  'Ettelbruck',
  'Feulen',
  'Fischbach',
  'Flaxweiler',
  'Frisange',
  'Garnich',
  'Goesdorf',
  'Grevenmacher',
  'Grosbous-Wahl',
  'Habscht',
  'Heffingen',
  'Helperknapp',
  'Hesperange',
  'Junglinster',
  'Kaeerjeng',
  'Kayl',
  'Kehlen',
  'Kiischpelt',
  'Koerich',
  'Kopstal',
  'Lac de la Haute-Sure',
  'Larochette',
  'Lenningen',
  'Leudelange',
  'Lintgen',
  'Lorentzweiler',
  'Luxembourg',
  'Mamer',
  'Manternach',
  'Mersch',
  'Mertert',
  'Mertzig',
  'Mondercange',
  'Mondorf-les-Bains',
  'Niederanven',
  'Nommern',
  'Parc Hosingen',
  'Petange',
  'Preizerdaul',
  'Putscheid',
  'Rambrouch',
  'Reckange-sur-Mess',
  'Redange',
  'Reisdorf',
  'Remich',
  'Roeser',
  'Rosport-Mompach',
  'Rumelange',
  'Saeul',
  'Sandweiler',
  'Sanem',
  'Schengen',
  'Schieren',
  'Schifflange',
  'Schuttrange',
  'Stadtbredimus',
  'Steinfort',
  'Steinsel',
  'Strassen',
  'Tandel',
  'Troisvierges',
  'Useldange',
  'Vallée de l’Ernz',
  'Vianden',
  'Vichten',
  'Waldbillig',
  'Walferdange',
  'Weiler-la-Tour',
  'Weiswampach',
  'Wiltz',
  'Wincrange',
  'Winseler',
  'Wormeldange'
];

const franceLocations = [
  'Auvergne-Rhone-Alpes',
  'Bordeaux',
  'Bourgogne-Franche-Comte',
  'Bretagne',
  'Centre-Val de Loire',
  'Grand Est',
  'Hauts-de-France',
  'Ile-de-France',
  'Lille',
  'Longwy',
  'Lyon',
  'Marseille',
  'Metz',
  'Nancy',
  'Nantes',
  'Normandie',
  'Nouvelle-Aquitaine',
  'Occitanie',
  'Paris',
  'Provence-Alpes-Cote d’Azur',
  'Reims',
  'Strasbourg',
  'Thionville',
  'Toulouse'
];

const portugalLocations = [
  'Aveiro',
  'Beja',
  'Braga',
  'Braganca',
  'Castelo Branco',
  'Coimbra',
  'Evora',
  'Faro',
  'Guarda',
  'Leiria',
  'Lisbon',
  'Madeira',
  'Portalegre',
  'Porto',
  'Santarem',
  'Setubal',
  'Viana do Castelo',
  'Vila Real',
  'Viseu'
];

const belgiumLocations = [
  'Antwerp',
  'Arlon',
  'Brabant Wallon',
  'Bruges',
  'Brussels',
  'Charleroi',
  'Flanders',
  'Ghent',
  'Hainaut',
  'Hasselt',
  'Leuven',
  'Liege',
  'Limburg',
  'Luxembourg Province',
  'Mons',
  'Namur',
  'Oost-Vlaanderen',
  'Vlaams-Brabant',
  'Wallonia',
  'West-Vlaanderen'
];

const locationIdByValue: Record<string, string> = {
  Arlon: 'be-arlon',
  Braga: 'pt-braga',
  Brussels: 'be-brussels',
  Differdange: 'lu-differdange',
  Dudelange: 'lu-dudelange',
  'Esch-sur-Alzette': 'lu-esch-sur-alzette',
  Lisbon: 'pt-lisbon',
  Luxembourg: 'lu-luxembourg',
  Lyon: 'fr-lyon',
  Metz: 'fr-metz',
  Paris: 'fr-paris',
  Porto: 'pt-porto',
  Thionville: 'fr-thionville',
  Viseu: 'pt-viseu'
};

function buildOptions(values: string[], countryCode: string): RequestLocationOption[] {
  return values.map((value) => ({
    value,
    label: value,
    countryCode,
    locationId: locationIdByValue[value]
  }));
}

export const requestLocationOptions: RequestLocationOption[] = [
  ...buildOptions(luxembourgCommunes, 'LU'),
  ...buildOptions(franceLocations, 'FR'),
  ...buildOptions(portugalLocations, 'PT'),
  ...buildOptions(belgiumLocations, 'BE')
].sort((first, second) => first.label.localeCompare(second.label, 'fr'));

export function getRequestLocationOptions(countryCode?: string) {
  return requestLocationOptions.filter((option) => !countryCode || option.countryCode === countryCode);
}

export function findRequestLocation(value?: string) {
  return requestLocationOptions.find((option) => option.value === value);
}

export function countryCodeFromStoredLocation(storedLocation: StoredUserLocation | null) {
  return storedLocation?.countryCode ?? getLocation(storedLocation?.locationId)?.countryCode ?? '';
}

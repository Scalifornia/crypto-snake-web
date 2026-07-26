import type { LocationArea, StoredUserLocation } from '../types/servigo';

export const locationStorageKey = 'kliko-location';
export const locationChangeEventName = 'kliko-location-change';

export const locationAreas: LocationArea[] = [
  {
    id: 'lu-luxembourg',
    country: 'Luxembourg',
    countryCode: 'LU',
    region: 'Luxembourg',
    district: 'Canton de Luxembourg',
    city: 'Luxembourg City',
    postalCode: 'L-1111',
    latitude: 49.6116,
    longitude: 6.1319,
    serviceRadiusKm: 20
  },
  {
    id: 'lu-esch-sur-alzette',
    country: 'Luxembourg',
    countryCode: 'LU',
    region: 'Luxembourg',
    district: 'Canton d’Esch-sur-Alzette',
    city: 'Esch-sur-Alzette',
    postalCode: 'L-4001',
    latitude: 49.4958,
    longitude: 5.9806,
    serviceRadiusKm: 18
  },
  {
    id: 'lu-differdange',
    country: 'Luxembourg',
    countryCode: 'LU',
    region: 'Luxembourg',
    district: 'Canton d’Esch-sur-Alzette',
    city: 'Differdange',
    postalCode: 'L-4501',
    latitude: 49.5242,
    longitude: 5.8911,
    serviceRadiusKm: 18
  },
  {
    id: 'lu-dudelange',
    country: 'Luxembourg',
    countryCode: 'LU',
    region: 'Luxembourg',
    district: 'Canton d’Esch-sur-Alzette',
    city: 'Dudelange',
    postalCode: 'L-3401',
    latitude: 49.4806,
    longitude: 6.0875,
    serviceRadiusKm: 18
  },
  {
    id: 'fr-paris',
    country: 'France',
    countryCode: 'FR',
    region: 'Île-de-France',
    district: 'Paris',
    city: 'Paris',
    postalCode: '75000',
    latitude: 48.8566,
    longitude: 2.3522,
    serviceRadiusKm: 25
  },
  {
    id: 'fr-lyon',
    country: 'France',
    countryCode: 'FR',
    region: 'Auvergne-Rhône-Alpes',
    district: 'Rhône',
    city: 'Lyon',
    postalCode: '69000',
    latitude: 45.764,
    longitude: 4.8357,
    serviceRadiusKm: 25
  },
  {
    id: 'fr-metz',
    country: 'France',
    countryCode: 'FR',
    region: 'Grand Est',
    district: 'Moselle',
    city: 'Metz',
    postalCode: '57000',
    latitude: 49.1193,
    longitude: 6.1757,
    serviceRadiusKm: 25
  },
  {
    id: 'fr-thionville',
    country: 'France',
    countryCode: 'FR',
    region: 'Grand Est',
    district: 'Moselle',
    city: 'Thionville',
    postalCode: '57100',
    latitude: 49.3576,
    longitude: 6.1684,
    serviceRadiusKm: 22
  },
  {
    id: 'pt-lisbon',
    country: 'Portugal',
    countryCode: 'PT',
    region: 'Lisboa',
    district: 'Lisboa',
    city: 'Lisbon',
    postalCode: '1000-001',
    latitude: 38.7223,
    longitude: -9.1393,
    serviceRadiusKm: 25
  },
  {
    id: 'pt-porto',
    country: 'Portugal',
    countryCode: 'PT',
    region: 'Norte',
    district: 'Porto',
    city: 'Porto',
    postalCode: '4000-001',
    latitude: 41.1579,
    longitude: -8.6291,
    serviceRadiusKm: 25
  },
  {
    id: 'pt-viseu',
    country: 'Portugal',
    countryCode: 'PT',
    region: 'Centro',
    district: 'Viseu',
    city: 'Viseu',
    postalCode: '3500-001',
    latitude: 40.6566,
    longitude: -7.9125,
    serviceRadiusKm: 25
  },
  {
    id: 'pt-braga',
    country: 'Portugal',
    countryCode: 'PT',
    region: 'Norte',
    district: 'Braga',
    city: 'Braga',
    postalCode: '4700-001',
    latitude: 41.5454,
    longitude: -8.4265,
    serviceRadiusKm: 25
  },
  {
    id: 'be-brussels',
    country: 'Belgium',
    countryCode: 'BE',
    region: 'Brussels-Capital',
    district: 'Brussels',
    city: 'Brussels',
    postalCode: '1000',
    latitude: 50.8503,
    longitude: 4.3517,
    serviceRadiusKm: 25
  },
  {
    id: 'be-arlon',
    country: 'Belgium',
    countryCode: 'BE',
    region: 'Wallonia',
    district: 'Luxembourg Province',
    city: 'Arlon',
    postalCode: '6700',
    latitude: 49.6833,
    longitude: 5.8167,
    serviceRadiusKm: 22
  },
  {
    id: 'be-liege',
    country: 'Belgium',
    countryCode: 'BE',
    region: 'Wallonia',
    district: 'Liège Province',
    city: 'Liège',
    postalCode: '4000',
    latitude: 50.6326,
    longitude: 5.5797,
    serviceRadiusKm: 25
  }
];

export const countryOptions = Array.from(
  new Map(locationAreas.map((location) => [location.countryCode, location.country])).entries()
).map(([countryCode, country]) => ({ countryCode, country }));

export function getLocation(locationId?: string) {
  return locationAreas.find((location) => location.id === locationId);
}

export function getLocationsByCountry(countryCode?: string) {
  return countryCode ? locationAreas.filter((location) => location.countryCode === countryCode) : locationAreas;
}

export function canUseLocationStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

export function getStoredUserLocation(): StoredUserLocation | null {
  if (!canUseLocationStorage()) {
    return null;
  }

  const stored = window.localStorage.getItem(locationStorageKey);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as StoredUserLocation;
  } catch {
    return null;
  }
}

export function saveStoredUserLocation(location: StoredUserLocation) {
  if (canUseLocationStorage()) {
    window.localStorage.setItem(locationStorageKey, JSON.stringify(location));
    window.dispatchEvent(new CustomEvent(locationChangeEventName, { detail: location }));
  }
}

export function clearStoredUserLocation() {
  if (canUseLocationStorage()) {
    window.localStorage.removeItem(locationStorageKey);
    window.dispatchEvent(new CustomEvent(locationChangeEventName, { detail: null }));
  }
}

export function distanceKm(first: Pick<LocationArea, 'latitude' | 'longitude'>, second: Pick<LocationArea, 'latitude' | 'longitude'>) {
  const earthRadiusKm = 6371;
  const latitudeDelta = ((second.latitude - first.latitude) * Math.PI) / 180;
  const longitudeDelta = ((second.longitude - first.longitude) * Math.PI) / 180;
  const firstLatitude = (first.latitude * Math.PI) / 180;
  const secondLatitude = (second.latitude * Math.PI) / 180;

  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findClosestLocation(latitude: number, longitude: number) {
  return [...locationAreas].sort(
    (first, second) =>
      distanceKm(first, { latitude, longitude }) - distanceKm(second, { latitude, longitude })
  )[0];
}

export function formatLocation(location?: LocationArea) {
  return location ? `${location.city}, ${location.region}, ${location.country}` : '';
}

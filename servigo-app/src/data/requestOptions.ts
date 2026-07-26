import type { CategoryId, PropertyType } from '../types/servigo';

export const propertyTypes: PropertyType[] = [
  'apartment',
  'studio',
  'room',
  'house',
  'office',
  'shop',
  'restaurant',
  'business',
  'sharedBuilding',
  'warehouse',
  'garage',
  'garden',
  'terrace',
  'balcony',
  'facade',
  'roof',
  'basement',
  'attic',
  'stairwell',
  'kitchen',
  'bathroom',
  'technicalRoom',
  'constructionSite',
  'vehicle',
  'car',
  'van',
  'motorcycle',
  'bicycle',
  'boat',
  'furniture',
  'appliance',
  'equipment',
  'eventVenue',
  'remote',
  'land',
  'other'
];

const categoriesWithSizeByDefault: CategoryId[] = [
  'cleaning',
  'endTenancy',
  'postConstruction',
  'painting',
  'gardening',
  'moving'
];

export function requestCategoryUsesSizeByDefault(categoryId: CategoryId) {
  return categoriesWithSizeByDefault.includes(categoryId);
}

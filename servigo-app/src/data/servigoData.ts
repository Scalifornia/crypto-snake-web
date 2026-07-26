import type { CategoryId, Locale, Provider, ServiceCategory } from '../types/servigo';

export const communes = [
  'Luxembourg',
  'Esch-sur-Alzette',
  'Differdange',
  'Dudelange',
  'Strassen',
  'Bertrange',
  'Hesperange',
  'Mamer',
  'Walferdange',
  'Steinsel',
  'Niederanven',
  'Sandweiler',
  'Roeser',
  'Bettembourg',
  'Pétange',
  'Sanem',
  'Schifflange',
  'Kayl',
  'Rumelange',
  'Mondercange',
  'Käerjeng',
  'Steinfort',
  'Mersch',
  'Ettelbruck',
  'Diekirch',
  'Remich',
  'Grevenmacher',
  'Echternach',
  'Junglinster',
  'Wiltz',
  'Clervaux',
  'Vianden',
  'Redange',
  'Thionville',
  'Metz',
  'Longwy',
  'Arlon',
  'Trier'
];

export const categories: ServiceCategory[] = [
  {
    id: 'cleaning',
    icon: 'clean',
    baseHourlyRate: 34,
    directBooking: true,
    labels: { fr: 'Nettoyage', pt: 'Limpeza', en: 'Cleaning' },
    keywords: ['nettoyage', 'ménage', 'cleaning', 'limpeza', 'appartement', 'bureau']
  },
  {
    id: 'endTenancy',
    icon: 'key',
    baseHourlyRate: 42,
    directBooking: false,
    labels: { fr: 'Fin de bail', pt: 'Fim de arrendamento', en: 'End of tenancy' },
    keywords: ['fin de bail', 'état des lieux', 'end of tenancy', 'arrendamento', 'déménagement']
  },
  {
    id: 'postConstruction',
    icon: 'site',
    baseHourlyRate: 46,
    directBooking: false,
    labels: { fr: 'Après chantier', pt: 'Pós-obra', en: 'Post-construction' },
    keywords: ['chantier', 'construction', 'rénovation', 'obra', 'poeira']
  },
  {
    id: 'handyman',
    icon: 'tools',
    baseHourlyRate: 58,
    directBooking: true,
    labels: { fr: 'Petites réparations', pt: 'Pequenas reparações', en: 'Small repairs' },
    keywords: ['réparation', 'bricolage', 'handyman', 'repair', 'montage', 'meuble']
  },
  {
    id: 'plumbing',
    icon: 'water',
    baseHourlyRate: 74,
    directBooking: false,
    labels: { fr: 'Plomberie', pt: 'Canalização', en: 'Plumbing' },
    keywords: ['plomberie', 'fuite', 'wc', 'évier', 'canalização', 'leak', 'plumbing']
  },
  {
    id: 'electricity',
    icon: 'power',
    baseHourlyRate: 82,
    directBooking: false,
    labels: { fr: 'Électricité', pt: 'Eletricidade', en: 'Electricity' },
    keywords: ['électricité', 'prise', 'disjoncteur', 'lumière', 'electricity', 'power']
  },
  {
    id: 'painting',
    icon: 'paint',
    baseHourlyRate: 52,
    directBooking: false,
    labels: { fr: 'Peinture', pt: 'Pintura', en: 'Painting' },
    keywords: ['peinture', 'mur', 'plafond', 'painting', 'pintura']
  },
  {
    id: 'gardening',
    icon: 'leaf',
    baseHourlyRate: 48,
    directBooking: true,
    labels: { fr: 'Jardinage', pt: 'Jardinagem', en: 'Gardening' },
    keywords: ['jardin', 'pelouse', 'haie', 'gardening', 'garden', 'relva']
  },
  {
    id: 'moving',
    icon: 'move',
    baseHourlyRate: 68,
    directBooking: false,
    labels: { fr: 'Déménagement', pt: 'Mudanças', en: 'Moving' },
    keywords: ['déménagement', 'moving', 'transport', 'cartons', 'mudança']
  },
  {
    id: 'urgent',
    icon: 'alert',
    baseHourlyRate: 92,
    directBooking: false,
    labels: { fr: 'Intervention urgente', pt: 'Intervenção urgente', en: 'Urgent intervention' },
    keywords: ['urgent', 'urgence', 'emergency', 'immédiat', 'urgente']
  },
  {
    id: 'other',
    icon: 'tools',
    baseHourlyRate: 55,
    directBooking: false,
    labels: { fr: 'Autre service', pt: 'Outro serviço', en: 'Other service' },
    keywords: ['autre', 'outro', 'other', 'custom', 'personnalisé', 'personalizado']
  }
];

export const providers: Provider[] = [
  {
    id: 'luxclean-pro',
    name: 'LuxClean Pro',
    verified: true,
    rating: 4.8,
    reviews: 126,
    availability: 'today',
    categories: ['cleaning', 'endTenancy', 'postConstruction'],
    communes: ['Luxembourg', 'Strassen', 'Bertrange', 'Hesperange', 'Esch-sur-Alzette']
  },
  {
    id: 'atelier-fix',
    name: 'Atelier Fix Luxembourg',
    verified: true,
    rating: 4.7,
    reviews: 89,
    availability: 'tomorrow',
    categories: ['handyman', 'painting'],
    communes: ['Luxembourg', 'Esch-sur-Alzette', 'Differdange', 'Dudelange']
  },
  {
    id: 'plomberie-muller',
    name: 'Plomberie Muller',
    verified: true,
    rating: 4.9,
    reviews: 74,
    availability: 'today',
    categories: ['plumbing', 'urgent'],
    communes: ['Luxembourg', 'Mersch', 'Ettelbruck', 'Junglinster']
  },
  {
    id: 'electroplus-lux',
    name: 'ElectroPlus Lux',
    verified: true,
    rating: 4.8,
    reviews: 61,
    availability: 'today',
    categories: ['electricity', 'urgent'],
    communes: ['Luxembourg', 'Bertrange', 'Strassen', 'Hesperange']
  },
  {
    id: 'greencare-jardins',
    name: 'GreenCare Jardins',
    verified: true,
    rating: 4.6,
    reviews: 48,
    availability: 'week',
    categories: ['gardening'],
    communes: ['Mersch', 'Junglinster', 'Ettelbruck', 'Wiltz', 'Remich']
  },
  {
    id: 'movelux-services',
    name: 'MoveLux Services',
    verified: false,
    rating: 4.5,
    reviews: 37,
    availability: 'tomorrow',
    categories: ['moving'],
    communes: ['Luxembourg', 'Esch-sur-Alzette', 'Differdange', 'Dudelange']
  }
];

export const categoryLabel = (categoryId: CategoryId, locale: Locale) =>
  categories.find((category) => category.id === categoryId)?.labels[locale] ?? categoryId;

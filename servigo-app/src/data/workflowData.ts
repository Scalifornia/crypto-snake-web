import type { Job, JobStatus, Quote, QuoteStatus, RequestStatus, ServiceRequest } from '../types/servigo';

export const requestWorkflow: RequestStatus[] = [
  'draft',
  'submitted',
  'under_review',
  'matched',
  'quoted',
  'accepted',
  'scheduled',
  'in_progress',
  'completed',
  'cancelled'
];

export const requestStatusLabels: Record<RequestStatus, string> = {
  draft: 'Brouillon',
  submitted: 'Soumise',
  under_review: 'En revue',
  matched: 'Prestataires trouvés',
  quoted: 'Devis reçus',
  accepted: 'Acceptée',
  scheduled: 'Planifiée',
  in_progress: 'En cours',
  completed: 'Terminée',
  cancelled: 'Annulée'
};

export const requestStatusTransitions: Record<RequestStatus, RequestStatus[]> = {
  draft: ['submitted', 'cancelled'],
  submitted: ['under_review', 'matched', 'cancelled'],
  under_review: ['matched', 'cancelled'],
  matched: ['quoted', 'cancelled'],
  quoted: ['accepted', 'cancelled'],
  accepted: ['scheduled', 'cancelled'],
  scheduled: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: []
};

export const quoteStatusLabels: Record<QuoteStatus, string> = {
  pending: 'En attente',
  accepted: 'Accepté',
  rejected: 'Refusé'
};

export const jobStatusLabels: Record<JobStatus, string> = {
  accepted: 'Accepté',
  scheduled: 'Planifié',
  in_progress: 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé'
};

export const serviceRequests: ServiceRequest[] = [
  {
    id: 'req-1046',
    reference: 'REQ-1046',
    client: {
      name: 'Claire Hoffmann',
      email: 'claire.hoffmann@example.lu',
      phone: '+352 621 000 146'
    },
    title: 'Urgence électrique commerce',
    categoryId: 'electricity',
    commune: 'Luxembourg',
    addressHint: 'Gare, local professionnel',
    urgency: 'urgent',
    propertyType: 'business',
    surface: 85,
    rooms: 4,
    brief: [
      'Disjoncteur principal déclenche plusieurs fois par jour.',
      'Commerce ouvert au public, intervention demandée avant la fin de journée.',
      'Tableau électrique accessible depuis la réserve.'
    ],
    accessNotes: 'Accès par l’entrée livraison, stationnement 20 minutes possible.',
    estimate: { low: 260, high: 420, hours: 3.5 },
    status: 'submitted',
    nextAction: 'Validation admin et matching urgent',
    matchedProviderIds: ['electroplus-lux'],
    createdAt: '2026-06-27 09:12',
    timeline: [
      {
        status: 'submitted',
        label: 'Demande soumise',
        at: '2026-06-27 09:12',
        actor: 'client',
        note: 'La cliente a envoyé une demande urgente.'
      }
    ]
  },
  {
    id: 'req-1045',
    reference: 'REQ-1045',
    client: {
      name: 'João Pereira',
      email: 'joao.pereira@example.lu',
      phone: '+352 661 000 145'
    },
    title: 'Déménagement studio',
    categoryId: 'moving',
    commune: 'Dudelange',
    addressHint: 'Centre, 2e étage sans ascenseur',
    urgency: 'soon',
    propertyType: 'apartment',
    surface: 38,
    rooms: 1,
    brief: [
      'Transport d’un studio vers Luxembourg-Bonnevoie.',
      'Lit, table, cartons, petit électroménager.',
      'Aide demandée pour chargement et déchargement.'
    ],
    accessNotes: 'Rue étroite, créneau de chargement à confirmer.',
    estimate: { low: 340, high: 520, hours: 5 },
    status: 'under_review',
    nextAction: 'Clarifier volume et accès camion',
    matchedProviderIds: ['movelux-services'],
    createdAt: '2026-06-26 17:30',
    timeline: [
      {
        status: 'submitted',
        label: 'Demande soumise',
        at: '2026-06-26 17:30',
        actor: 'client',
        note: 'Le client a décrit le déménagement.'
      },
      {
        status: 'under_review',
        label: 'Revue opérationnelle',
        at: '2026-06-26 18:05',
        actor: 'admin',
        note: 'Volume à préciser avant envoi aux prestataires.'
      }
    ]
  },
  {
    id: 'req-1042',
    reference: 'REQ-1042',
    client: {
      name: 'Sophie Muller',
      email: 'sophie.muller@example.lu',
      phone: '+352 621 000 142'
    },
    title: 'Nettoyage fin de bail à Esch',
    categoryId: 'endTenancy',
    commune: 'Esch-sur-Alzette',
    addressHint: 'Appartement 70 m2, proche gare',
    urgency: 'soon',
    propertyType: 'apartment',
    surface: 70,
    rooms: 3,
    brief: [
      'Nettoyage complet de fin de bail avant état des lieux.',
      'Inclure vitres, four, salle de bain et balcon.',
      'Appartement vide à partir de jeudi matin.'
    ],
    accessNotes: 'Boîte à clés disponible, ascenseur dans l’immeuble.',
    estimate: { low: 240, high: 360, hours: 5 },
    status: 'quoted',
    nextAction: 'Comparer les devis et accepter un prestataire',
    matchedProviderIds: ['luxclean-pro', 'atelier-fix', 'movelux-services'],
    createdAt: '2026-06-25 14:18',
    timeline: [
      {
        status: 'submitted',
        label: 'Demande soumise',
        at: '2026-06-25 14:18',
        actor: 'client',
        note: 'Description initiale reçue.'
      },
      {
        status: 'matched',
        label: 'Prestataires compatibles',
        at: '2026-06-25 14:31',
        actor: 'system',
        note: 'Trois prestataires suggérés selon commune, service et disponibilité.'
      },
      {
        status: 'quoted',
        label: 'Devis reçus',
        at: '2026-06-25 16:42',
        actor: 'provider',
        note: 'Deux devis sont disponibles pour comparaison.'
      }
    ]
  },
  {
    id: 'req-1041',
    reference: 'REQ-1041',
    client: {
      name: 'Nadia Ferreira',
      email: 'nadia.ferreira@example.lu',
      phone: '+352 621 000 141'
    },
    title: 'Nettoyage bureau hebdomadaire',
    categoryId: 'cleaning',
    commune: 'Luxembourg',
    addressHint: 'Kirchberg, bureau 120 m2',
    urgency: 'flexible',
    propertyType: 'office',
    surface: 120,
    rooms: 6,
    brief: [
      'Nettoyage hebdomadaire de bureaux en soirée.',
      'Inclure sols, sanitaires, kitchenette et vidage poubelles.',
      'Contrat récurrent à cadrer après premier passage.'
    ],
    accessNotes: 'Badge visiteur à récupérer à l’accueil avant 18:00.',
    estimate: { low: 150, high: 240, hours: 4 },
    status: 'matched',
    nextAction: 'Attendre les devis des prestataires matchés',
    matchedProviderIds: ['luxclean-pro'],
    createdAt: '2026-06-25 09:45',
    timeline: [
      {
        status: 'submitted',
        label: 'Demande soumise',
        at: '2026-06-25 09:45',
        actor: 'client',
        note: 'Demande récurrente envoyée.'
      },
      {
        status: 'matched',
        label: 'Prestataire compatible',
        at: '2026-06-25 10:02',
        actor: 'system',
        note: 'LuxClean Pro correspond à la commune, au service et au volume estimé.'
      }
    ]
  },
  {
    id: 'req-1037',
    reference: 'REQ-1037',
    client: {
      name: 'Marc Weber',
      email: 'marc.weber@example.lu',
      phone: '+352 691 000 137'
    },
    title: 'Réparation fuite cuisine',
    categoryId: 'plumbing',
    commune: 'Luxembourg',
    addressHint: 'Belair, maison',
    urgency: 'urgent',
    propertyType: 'house',
    surface: 20,
    rooms: 1,
    brief: [
      'Fuite sous évier de cuisine.',
      'L’eau peut être coupée depuis la cave.',
      'Intervention souhaitée avant demain midi.'
    ],
    accessNotes: 'Présence sur place toute la matinée.',
    estimate: { low: 180, high: 290, hours: 2.5 },
    status: 'scheduled',
    nextAction: 'Confirmer l’accès au logement',
    matchedProviderIds: ['plomberie-muller'],
    createdAt: '2026-06-24 08:40',
    timeline: [
      {
        status: 'submitted',
        label: 'Demande soumise',
        at: '2026-06-24 08:40',
        actor: 'client',
        note: 'Demande urgente transmise.'
      },
      {
        status: 'accepted',
        label: 'Devis accepté',
        at: '2026-06-24 09:20',
        actor: 'client',
        note: 'Le devis Plomberie Muller a été accepté.'
      },
      {
        status: 'scheduled',
        label: 'Intervention planifiée',
        at: '2026-06-24 09:35',
        actor: 'provider',
        note: 'Créneau confirmé pour demain 10:00.'
      }
    ]
  },
  {
    id: 'req-1029',
    reference: 'REQ-1029',
    client: {
      name: 'Anne Schmit',
      email: 'anne.schmit@example.lu',
      phone: '+352 661 000 129'
    },
    title: 'Tonte et taille de haie',
    categoryId: 'gardening',
    commune: 'Mersch',
    addressHint: 'Maison avec jardin',
    urgency: 'flexible',
    propertyType: 'house',
    surface: 180,
    rooms: 0,
    brief: [
      'Tonte d’une pelouse moyenne et taille d’une haie.',
      'Évacuation des déchets verts demandée.',
      'Créneau flexible dans la semaine.'
    ],
    accessNotes: 'Accès par portail latéral.',
    estimate: { low: 180, high: 260, hours: 4 },
    status: 'completed',
    nextAction: 'Laisser un avis',
    matchedProviderIds: ['greencare-jardins'],
    createdAt: '2026-06-20 11:05',
    timeline: [
      {
        status: 'submitted',
        label: 'Demande soumise',
        at: '2026-06-20 11:05',
        actor: 'client',
        note: 'Demande jardinage reçue.'
      },
      {
        status: 'scheduled',
        label: 'Mission planifiée',
        at: '2026-06-20 13:15',
        actor: 'provider',
        note: 'Créneau confirmé avec GreenCare Jardins.'
      },
      {
        status: 'completed',
        label: 'Mission terminée',
        at: '2026-06-22 16:30',
        actor: 'provider',
        note: 'Intervention marquée terminée.'
      }
    ]
  }
];

export const quotes: Quote[] = [
  {
    id: 'quote-9001',
    requestId: 'req-1042',
    providerId: 'luxclean-pro',
    proposedPrice: 285,
    availabilityDate: '2026-06-29 08:30',
    message: 'Équipe de deux personnes, produits inclus, vitres et four compris.',
    status: 'pending'
  },
  {
    id: 'quote-9002',
    requestId: 'req-1042',
    providerId: 'atelier-fix',
    proposedPrice: 330,
    availabilityDate: '2026-06-28 14:00',
    message: 'Créneau plus rapide, supplément pour nettoyage vitres inclus.',
    status: 'pending'
  },
  {
    id: 'quote-8990',
    requestId: 'req-1037',
    providerId: 'plomberie-muller',
    proposedPrice: 230,
    availabilityDate: '2026-06-25 10:00',
    message: 'Diagnostic et réparation fuite sous évier, petites pièces incluses.',
    status: 'accepted'
  },
  {
    id: 'quote-8974',
    requestId: 'req-1029',
    providerId: 'greencare-jardins',
    proposedPrice: 210,
    availabilityDate: '2026-06-22 13:00',
    message: 'Tonte, taille de haie et évacuation des déchets verts.',
    status: 'accepted'
  }
];

export const jobs: Job[] = [
  {
    id: 'job-510',
    requestId: 'req-1037',
    providerId: 'plomberie-muller',
    title: 'Réparation fuite cuisine',
    commune: 'Luxembourg',
    scheduledFor: '2026-06-25 10:00',
    status: 'scheduled'
  },
  {
    id: 'job-506',
    requestId: 'req-1029',
    providerId: 'greencare-jardins',
    title: 'Tonte et taille de haie',
    commune: 'Mersch',
    scheduledFor: '2026-06-22 13:00',
    status: 'completed'
  },
  {
    id: 'job-512',
    requestId: 'req-1042',
    providerId: 'luxclean-pro',
    title: 'Nettoyage fin de bail à Esch',
    commune: 'Esch-sur-Alzette',
    scheduledFor: 'À planifier après acceptation',
    status: 'accepted'
  }
];

export const providerApprovals = [
  { id: 'PRO-88', name: 'Clean & Go SARL', categoryId: 'cleaning', documents: '2/3' },
  { id: 'PRO-87', name: 'Lux Jardin Service', categoryId: 'gardening', documents: '3/3' }
] as const;

export const platformMetrics = [
  { label: 'Demandes ouvertes', value: String(serviceRequests.filter((request) => request.status !== 'completed').length) },
  { label: 'Prestataires vérifiés', value: '118' },
  { label: 'Devis en attente', value: String(quotes.filter((quote) => quote.status === 'pending').length) },
  { label: 'Taux devis acceptés', value: '63%' }
];

export function getRequestQuotes(requestId: string) {
  return quotes.filter((quote) => quote.requestId === requestId);
}

export function getRequestJob(requestId: string) {
  return jobs.find((job) => job.requestId === requestId);
}

export function getNextStatusLabel(status: RequestStatus) {
  const next = requestStatusTransitions[status][0];
  return next ? requestStatusLabels[next] : 'Aucune transition';
}

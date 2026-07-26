import { brand } from '../config/brand';
import { requestCategoryUsesSizeByDefault } from './requestOptions';
import { categories, providers } from './servigoData';
import type {
  CategoryId,
  Estimate,
  Provider,
  RequestAssistantDraft,
  RequestDraft,
  ServiceRequest
} from '../types/servigo';

const draftStorageKey = 'servigo-request-draft';
const submittedStorageKey = 'servigo-submitted-request';

export const defaultRequestDraft: RequestAssistantDraft = {
  categoryId: 'cleaning',
  commune: 'Luxembourg',
  urgency: 'flexible',
  propertyType: 'apartment',
  surface: 70,
  rooms: 3,
  description: '',
  address: '',
  accessNotes: '',
  attachments: [],
  client: {
    name: '',
    email: '',
    phone: ''
  },
  preferredContactMethod: 'email',
  preferredInterventionPeriod: 'this_week'
};

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

export function getStoredRequestDraft(): RequestAssistantDraft {
  if (!canUseStorage()) {
    return defaultRequestDraft;
  }

  const stored = window.localStorage.getItem(draftStorageKey);
  if (!stored) {
    return defaultRequestDraft;
  }

  try {
    const parsedDraft = JSON.parse(stored) as Partial<RequestAssistantDraft>;
    return {
      ...defaultRequestDraft,
      ...parsedDraft,
      client: {
        ...defaultRequestDraft.client,
        ...parsedDraft.client
      },
      attachments: parsedDraft.attachments ?? []
    } as RequestAssistantDraft;
  } catch {
    return defaultRequestDraft;
  }
}

export function saveRequestDraft(draft: RequestAssistantDraft) {
  if (canUseStorage()) {
    window.localStorage.setItem(draftStorageKey, JSON.stringify(draft));
  }
}

export function getStoredSubmittedRequest(): ServiceRequest | null {
  if (!canUseStorage()) {
    return null;
  }

  const stored = window.localStorage.getItem(submittedStorageKey);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as ServiceRequest;
  } catch {
    return null;
  }
}

export function saveSubmittedRequest(request: ServiceRequest) {
  if (canUseStorage()) {
    window.localStorage.setItem(submittedStorageKey, JSON.stringify(request));
  }
}

export function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function detectCategory(description: string): CategoryId | null {
  const normalized = normalize(description);
  let bestMatch: CategoryId | null = null;
  let bestScore = 0;

  categories.forEach((category) => {
    const score = category.keywords.reduce((total, keyword) => {
      return normalized.includes(normalize(keyword)) ? total + keyword.length : total;
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = category.id;
    }
  });

  return bestMatch;
}

export function buildEstimate(draft: RequestDraft): Estimate {
  const category = categories.find((item) => item.id === draft.categoryId) ?? categories[0];
  const includeSizeDetails = shouldUseSizeDetails(draft);
  let hours = 2;

  if (includeSizeDetails && draft.surface > 0) {
    hours = Math.max(hours, Math.ceil(draft.surface / 25));
  }

  if (includeSizeDetails && draft.rooms > 0) {
    hours = Math.max(hours, Math.ceil(draft.rooms * 1.1));
  }

  if (draft.categoryId === 'endTenancy') {
    hours *= 1.35;
  }

  if (draft.categoryId === 'postConstruction') {
    hours *= 1.45;
  }

  if (draft.categoryId === 'moving') {
    hours = Math.max(hours, 5);
  }

  if (draft.categoryId === 'urgent') {
    hours = Math.max(hours, 3);
  }

  const urgencyMultiplier = draft.urgency === 'urgent' ? 1.35 : draft.urgency === 'soon' ? 1.12 : 1;
  const low = Math.round((hours * category.baseHourlyRate * urgencyMultiplier * 0.85) / 10) * 10;
  const high = Math.round((hours * category.baseHourlyRate * urgencyMultiplier * 1.25) / 10) * 10;

  return {
    hours: Math.max(1.5, Math.round(hours * 2) / 2),
    low,
    high: Math.max(high, low + 30),
    jobSize: hours >= 7 ? 'large' : hours >= 4 ? 'medium' : 'small'
  };
}

export function shouldUseSizeDetails(draft: RequestDraft) {
  return draft.includeSizeDetails ?? requestCategoryUsesSizeByDefault(draft.categoryId);
}

export function scoreProvider(provider: Provider, draft: RequestDraft) {
  const categoryMatch = provider.categories.includes(draft.categoryId);
  const urgentMatch = draft.urgency === 'urgent' && provider.categories.includes('urgent');
  const communeMatch = provider.communes.includes(draft.commune);
  const centralCoverage = provider.communes.includes('Luxembourg');
  const availabilityScore =
    draft.urgency === 'urgent' && provider.availability === 'today'
      ? 18
      : draft.urgency === 'soon' && provider.availability !== 'week'
        ? 13
        : provider.availability === 'today'
          ? 10
          : 4;

  return Math.min(
    100,
    Math.round(
      (categoryMatch ? 34 : 0) +
        (urgentMatch ? 10 : 0) +
        (communeMatch ? 18 : centralCoverage ? 8 : 0) +
        availabilityScore +
        (provider.verified ? 12 : 0) +
        provider.rating * 5
    )
  );
}

export function getSuggestedProviders(draft: RequestDraft) {
  return providers
    .map((provider) => ({ provider, score: scoreProvider(provider, draft) }))
    .sort((first, second) => second.score - first.score)
    .slice(0, 3);
}

export function buildStructuredBrief(draft: RequestAssistantDraft) {
  const points = [
    draft.description || `Demande décrite via l’assistant ${brand.brandName}.`,
    shouldUseSizeDetails(draft)
      ? `${draft.surface} m2, ${draft.rooms} pièce(s), type de lieu : ${draft.propertyType}.`
      : `Type de lieu : ${draft.propertyType}.`,
    `Commune : ${draft.commune}. Urgence : ${draft.urgency}.`
  ];

  if (draft.accessNotes.trim()) {
    points.push(`Accès : ${draft.accessNotes}.`);
  }

  if (draft.address.trim()) {
    points.push(`Adresse : ${draft.address}.`);
  }

  points.push(`Contact préféré : ${draft.preferredContactMethod}. Période souhaitée : ${draft.preferredInterventionPeriod}.`);

  return points;
}

export function createSubmittedRequest(draft: RequestAssistantDraft, brief = buildStructuredBrief(draft)): ServiceRequest {
  const estimate = buildEstimate(draft);
  const reference = `REQ-${Math.floor(2000 + Math.random() * 7000)}`;

  return {
    id: `mock-${reference.toLowerCase()}`,
    reference,
    client: draft.client,
    title: draft.description ? draft.description.slice(0, 72) : `Nouvelle demande ${brand.brandName}`,
    categoryId: draft.categoryId,
    commune: draft.commune,
    addressHint: draft.address || draft.accessNotes || 'Adresse à préciser après contact',
    urgency: draft.urgency,
    propertyType: draft.propertyType,
    includeSizeDetails: shouldUseSizeDetails(draft),
    surface: draft.surface,
    rooms: draft.rooms,
    brief,
    accessNotes: draft.accessNotes,
    attachments: draft.attachments,
    estimate: {
      low: estimate.low,
      high: estimate.high,
      hours: estimate.hours
    },
    status: 'submitted',
    nextAction: `${brand.brandName} vérifie la demande et prépare le matching prestataires`,
    matchedProviderIds: getSuggestedProviders(draft).map(({ provider }) => provider.id),
    quoteContext: draft.quoteContext,
    createdAt: 'Maintenant',
    timeline: [
      {
        status: 'submitted',
        label: 'Demande soumise',
        at: 'Maintenant',
        actor: 'client',
        note: 'Demande créée depuis le flux de confirmation frontend.'
      }
    ]
  };
}

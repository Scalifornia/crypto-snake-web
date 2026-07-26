export type BaseLocale = 'fr' | 'pt' | 'en';
export type Locale = BaseLocale | 'lb' | 'de' | 'es' | 'it';

export type CategoryId =
  | 'cleaning'
  | 'endTenancy'
  | 'postConstruction'
  | 'handyman'
  | 'plumbing'
  | 'electricity'
  | 'painting'
  | 'gardening'
  | 'moving'
  | 'urgent';

export type Urgency = 'flexible' | 'soon' | 'urgent';

export type PropertyType =
  | 'apartment'
  | 'studio'
  | 'room'
  | 'house'
  | 'office'
  | 'shop'
  | 'restaurant'
  | 'business'
  | 'sharedBuilding'
  | 'warehouse'
  | 'garage'
  | 'garden'
  | 'terrace'
  | 'balcony'
  | 'facade'
  | 'roof'
  | 'basement'
  | 'attic'
  | 'stairwell'
  | 'kitchen'
  | 'bathroom'
  | 'technicalRoom'
  | 'constructionSite'
  | 'vehicle'
  | 'car'
  | 'van'
  | 'motorcycle'
  | 'bicycle'
  | 'boat'
  | 'furniture'
  | 'appliance'
  | 'equipment'
  | 'eventVenue'
  | 'remote'
  | 'land'
  | 'other';

export type PreferredContactMethod = 'email' | 'phone';

export type PreferredInterventionPeriod = 'asap' | 'this_week' | 'next_week' | 'flexible';

export type RequestStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'matched'
  | 'quoted'
  | 'accepted'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type QuoteStatus = 'pending' | 'accepted' | 'rejected';

export type JobStatus = 'accepted' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export type LocalizedText = Record<BaseLocale, string> & Record<string, string>;

export type ProviderType = 'private' | 'professional';

export type PriceModel = 'fixed' | 'hourly' | 'forfait' | 'quote_only' | 'from_price' | 'free' | 'charity';

export interface LocationArea {
  id: string;
  country: string;
  countryCode: string;
  region: string;
  district: string;
  city: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  serviceRadiusKm: number;
}

export interface StoredUserLocation {
  locationId?: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
  source: 'manual' | 'browser';
}

export interface TrustProfile {
  trustLevel: 'new' | 'standard' | 'trusted' | 'verified';
  incidentCount: number;
  responseReliability: number;
  cancellationReliability: number;
  verificationBadge: boolean;
}

export interface Specialty {
  slug: string;
  labels: LocalizedText;
}

export interface Subcategory {
  slug: string;
  labels: LocalizedText;
  description: LocalizedText;
  specialties: Specialty[];
}

export interface Category {
  slug: string;
  icon: string;
  labels: LocalizedText;
  description: LocalizedText;
  subcategories: Subcategory[];
}

export interface ServiceCategory {
  id: CategoryId;
  icon: string;
  labels: LocalizedText;
  keywords: string[];
  baseHourlyRate: number;
  directBooking: boolean;
}

export interface Provider {
  id: string;
  name: string;
  type?: ProviderType;
  email?: string;
  phone?: string;
  mainCommune?: string;
  baseLocationId?: string;
  coveredLocationIds?: string[];
  serviceRadiusKm?: number;
  remoteAvailable?: boolean;
  categories: CategoryId[];
  communes: string[];
  rating: number;
  reviews: number;
  verified: boolean;
  availability: 'today' | 'tomorrow' | 'week';
  languages?: Locale[];
  vatNumber?: string;
  insurance?: string;
}

export interface ServiceListing {
  id: string;
  providerId: string;
  providerName: string;
  providerType: ProviderType;
  email: string;
  phone: string;
  mainCommune: string;
  serviceArea: string[];
  baseLocationId: string;
  coveredLocationIds: string[];
  serviceRadiusKm: number;
  remoteAvailable: boolean;
  categorySlug: string;
  subcategorySlug: string;
  specialtySlug: string;
  professionTitle?: LocalizedText;
  title: LocalizedText;
  shortDescription: LocalizedText;
  priceModel: PriceModel;
  priceLabel: LocalizedText;
  availability: {
    weekdays: boolean;
    weekends: boolean;
    urgent: boolean;
  };
  languages: Locale[];
  travelToClient: boolean;
  professionalRegistration?: string;
  vatNumber?: string;
  insurance?: string;
  photos?: string[];
  rating: number;
  reviews: number;
  trust: TrustProfile;
}

export type QuoteRequestSourceType = 'listing' | 'category' | 'subcategory' | 'specialty' | 'search' | 'assistant';

export interface QuoteRequestContext {
  sourceType: QuoteRequestSourceType;
  listingId?: string;
  providerId?: string;
  providerName?: string;
  categorySlug?: string;
  subcategorySlug?: string;
  specialtySlug?: string;
  locationId?: string;
  serviceTitle?: LocalizedText;
  priceModel?: PriceModel;
  priceLabel?: LocalizedText;
  searchQuery?: string;
  eligibleListingIds: string[];
  alternativeListingIds: string[];
  outsideSelectedArea?: boolean;
}

export interface RequestAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  addedAt: string;
}

export interface RequestDraft {
  categoryId: CategoryId;
  commune: string;
  urgency: Urgency;
  propertyType: PropertyType;
  includeSizeDetails?: boolean;
  surface: number;
  rooms: number;
  description: string;
  address: string;
  accessNotes: string;
  attachments: RequestAttachment[];
}

export interface RequestAssistantDraft extends RequestDraft {
  client: {
    name: string;
    email: string;
    phone: string;
  };
  preferredContactMethod: PreferredContactMethod;
  preferredInterventionPeriod: PreferredInterventionPeriod;
  quoteContext?: QuoteRequestContext;
}

export interface Estimate {
  low: number;
  high: number;
  hours: number;
  jobSize: 'small' | 'medium' | 'large';
}

export interface StatusTimelineItem {
  status: RequestStatus;
  label: string;
  at: string;
  actor: 'client' | 'provider' | 'admin' | 'system';
  note: string;
}

export interface Quote {
  id: string;
  requestId: string;
  providerId: string;
  proposedPrice: number;
  availabilityDate: string;
  message: string;
  status: QuoteStatus;
}

export interface Job {
  id: string;
  requestId: string;
  providerId: string;
  title: string;
  commune: string;
  scheduledFor: string;
  status: JobStatus;
}

export interface ServiceRequest {
  id: string;
  reference: string;
  client: {
    name: string;
    email: string;
    phone: string;
  };
  title: string;
  categoryId: CategoryId;
  commune: string;
  addressHint: string;
  urgency: Urgency;
  propertyType: PropertyType;
  includeSizeDetails?: boolean;
  surface: number;
  rooms: number;
  brief: string[];
  accessNotes: string;
  estimate: {
    low: number;
    high: number;
    hours: number;
  };
  status: RequestStatus;
  nextAction: string;
  matchedProviderIds: string[];
  quoteContext?: QuoteRequestContext;
  attachments?: RequestAttachment[];
  timeline: StatusTimelineItem[];
  createdAt: string;
}

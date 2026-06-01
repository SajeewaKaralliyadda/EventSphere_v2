/**
 * publicService.ts
 *
 * All unauthenticated public API calls, typed against the Spring Boot DTO shapes.
 * Uses the shared axios instance from lib/api.ts.
 *
 * The JWT interceptor in api.ts only attaches a token when a Supabase session
 * exists — so these calls work correctly for both authenticated and anonymous users.
 *
 * Endpoints:
 *   GET /api/public/home/stats
 *   GET /api/public/home/universities
 *   GET /api/public/events          (paginated, filtered)
 *   GET /api/public/events/{id}     (full event detail)
 *   GET /api/public/organizers/{id} (organizer public profile)
 */
import api from '../lib/api';

// ─── Response Types (mirrors Spring Boot records) ──────────────────────────

/** GET /api/public/home/stats */
export interface PlatformStatsResponse {
  totalUniversities: number;
  totalEventsHosted: number;
  totalTicketsSold: number;
}

/** GET /api/public/home/universities — one item per active tenant */
export interface TenantSummaryResponse {
  id: string;
  name: string;
  domain: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  slug: string;
  location: string | null;
  description: string | null;
  primaryColor: string | null;
  contactEmail: string | null;
}

/** GET /api/public/home/announcements */
export interface PublicAnnouncementResponse {
  id: string;
  message: string;
  bannerColor: 'blue' | 'yellow' | 'red';
}

/** GET /api/public/events — card projection used in the discovery listing */
export interface PublicEventResponse {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;          // ISO-8601 LocalDateTime
  location: string | null;
  totalCapacity: number;
  coverImageUrl: string | null;
  organizerName: string | null;
  organizerId: string;
  minTicketPrice: number | null;
  maxTicketPrice: number | null;
  isFree: boolean;
  availableTickets: number;
}

/** Spring Data Page<T> wrapper returned by the discovery endpoint */
export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;    // 0-based current page number
  size: number;
  last: boolean;
}

/** GET /api/public/events/{eventId} — full detail including nested records */
export interface PublicEventDetailResponse {
  id: string;
  tenantId: string;
  title: string;
  description: string | null;
  eventDate: string;
  location: string | null;
  totalCapacity: number;
  coverImageUrl: string | null;
  organizer: OrganizerSummary;
  ticketTiers: TicketTierInfo[];
  reviews: ReviewInfo[];
  averageRating: number;
  totalReviews: number;
}

export interface OrganizerSummary {
  id: string;
  organizationName: string;
  contactEmail: string;
}

export interface TicketTierInfo {
  id: string;
  name: string;
  price: number;
  capacity: number;
}

/** Anonymized review — userId NOT exposed in public projection */
export interface ReviewInfo {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  eventName?: string;
  reviewerName?: string;
}

/** GET /api/public/organizers/{organizerId} */
export interface PublicOrganizerResponse {
  id: string;
  tenantId: string;
  organizationName: string;
  contactEmail: string;
  upcomingEvents: PublicEventResponse[];
  averageRating: number;
  totalReviews: number;
  reviews: ReviewInfo[];
}

// ─── Filter params for event discovery ──────────────────────────────────────

export interface DiscoverEventsParams {
  category?: string;
  startDate?: string;   // ISO-8601 LocalDateTime, e.g. "2026-07-01T00:00:00"
  endDate?: string;
  isFree?: boolean;
  minPrice?: number;
  maxPrice?: number;
  hasAvailableTickets?: boolean;
  page?: number;        // 0-based
  size?: number;
  tenantId?: string;
}

export interface PartnershipSubmissionRequest {
  universityName: string;
  representativeName: string;
  designation: string;
  officialEmail: string;
  phoneNumber: string;
  message: string;
}

export interface FacultyDto {
  id: string;
  name: string;
}

// ─── API Functions ───────────────────────────────────────────────────────────

/**
 * GET /api/public/home/stats
 * Returns aggregate platform metrics for the landing page hero.
 */
export const getPlatformStats = (): Promise<PlatformStatsResponse> =>
  api.get<PlatformStatsResponse>('/api/public/home/stats').then(r => r.data);

/**
 * GET /api/public/home/universities
 * Returns all active university tenants for the home page listing.
 */
export const getActiveUniversities = (): Promise<TenantSummaryResponse[]> =>
  api.get<TenantSummaryResponse[]>('/api/public/home/universities').then(r => r.data);

/**
 * GET /api/public/home/universities/{slug}
 * Returns details of a specific active university (tenant).
 */
export const getUniversityBySlug = (slug: string): Promise<TenantSummaryResponse> =>
  api.get<TenantSummaryResponse>(`/api/public/home/universities/${slug}`).then(r => r.data);

/**
 * GET /api/public/home/announcements
 * Returns a list of active announcements.
 */
export const getActiveAnnouncements = (): Promise<PublicAnnouncementResponse[]> =>
  api.get<PublicAnnouncementResponse[]>('/api/public/home/announcements').then(r => r.data);

/**
 * GET /api/public/events
 * Paginated, filtered event discovery.
 * Maps filter state directly to Spring @RequestParam names.
 */
export const discoverEvents = (
  params: DiscoverEventsParams = {}
): Promise<SpringPage<PublicEventResponse>> => {
  const qp = new URLSearchParams();
  if (params.category)               qp.set('category', params.category);
  if (params.startDate)              qp.set('startDate', params.startDate);
  if (params.endDate)                qp.set('endDate', params.endDate);
  if (params.isFree !== undefined)   qp.set('isFree', String(params.isFree));
  if (params.minPrice !== undefined) qp.set('minPrice', String(params.minPrice));
  if (params.maxPrice !== undefined) qp.set('maxPrice', String(params.maxPrice));
  if (params.hasAvailableTickets !== undefined)
    qp.set('hasAvailableTickets', String(params.hasAvailableTickets));
  if (params.tenantId)
    qp.set('tenantId', params.tenantId);
  qp.set('page', String(params.page ?? 0));
  qp.set('size', String(params.size ?? 12));

  return api
    .get<SpringPage<PublicEventResponse>>(`/api/public/events?${qp.toString()}`)
    .then(r => r.data);
};

/**
 * GET /api/public/events/{eventId}
 * Full event detail with organizer summary, ticket tiers, and reviews.
 */
export const getEventDetail = (eventId: string): Promise<PublicEventDetailResponse> =>
  api
    .get<PublicEventDetailResponse>(`/api/public/events/${eventId}`)
    .then(r => r.data);

/**
 * GET /api/public/organizers/{organizerId}
 * Public organizer profile with upcoming events and aggregated review scores.
 */
export const getOrganizerProfile = (organizerId: string): Promise<PublicOrganizerResponse> =>
  api
    .get<PublicOrganizerResponse>(`/api/public/organizers/${organizerId}`)
    .then(r => r.data);

/**
 * POST /api/public/contact/partnership
 * Submits a new university partnership request.
 */
export const submitPartnershipRequest = (
  payload: PartnershipSubmissionRequest
): Promise<{ status: string; message: string }> =>
  api
    .post<{ status: string; message: string }>('/api/public/contact/partnership', payload)
    .then(r => r.data);

/**
 * GET /api/public/tenants/{tenantId}/faculties
 */
export const getTenantFaculties = (tenantId: string): Promise<FacultyDto[]> =>
  api.get<FacultyDto[]>(`/api/public/tenants/${tenantId}/faculties`).then(r => r.data);

/**
 * POST /api/v1/public/disputes
 */
export const submitDispute = (payload: {
  targetId: string;
  targetType: 'EVENT' | 'ORGANIZER';
  tenantId: string;
  reason: string;
  description?: string;
  reporterId?: string;
}): Promise<{ message: string; disputeId: string }> =>
  api.post('/api/v1/public/disputes', payload).then(r => r.data);

/**
 * POST /api/public/contact
 */
export const submitContactForm = (payload: {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ status: string; message: string }> =>
  api.post<{ status: string; message: string }>('/api/public/contact', payload).then(r => r.data);

/**
 * organizerService.ts
 *
 * All organizer-scoped API calls, typed against the Spring Boot DTO shapes.
 * Uses the shared axios instance from lib/api.ts which auto-attaches the
 * Supabase JWT Bearer token via the request interceptor.
 *
 * IMPORTANT: In this system, organizerId === user.id (1:1 DB mapping).
 * Pass user.id directly from AuthContext — no extra lookup needed.
 */
import api from '../lib/api';

// ─── Response Types (mirrors Spring Boot records) ──────────────────────────

export interface EventResponse {
  id: string;
  organizerId: string;
  title: string;
  description: string | null;
  eventDate: string;        // ISO-8601 LocalDateTime string
  location: string | null;
  totalCapacity: number;
  coverImageUrl: string | null;
  approvalDocumentUrl: string | null;
  /** EventStatus enum value from backend: DRAFT | PENDING | APPROVED | REJECTED | CANCELLED */
  status: string;
  createdAt: string;
  updatedAt: string;
  // UI convenience fields — populated by the backend analytics layer
  capacity?: number;
  venue?: string;
  bookings?: number;
  revenue?: string;
}

export interface TeamMemberResponse {
  id: string;
  organizerId: string;
  userId: string;
  role: 'ORGANIZER' | 'CO_ORGANIZER' | 'GATE_SCANNER';
  invitedById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketTierResponse {
  id: string;
  eventId: string;
  name: string;
  price: number;
  capacity: number;
  soldCount: number;
  createdAt: string;
}

export interface PromoCodeResponse {
  id: string;
  eventId: string;
  code: string;
  discountType: 'FLAT' | 'PERCENTAGE';
  discountValue: number;
  validUntil: string | null;
  maxUses: number | null;
  usesCount: number;
  active: boolean;
  createdAt: string;
}

export interface BookingResponse {
  id: string;
  eventId: string;
  eventTitle: string;
  purchaserId: string;
  purchaserEmail: string;
  totalAmount: number;
  status: string;
  stripePaymentIntentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AttendeeResponse {
  id: string;
  bookingId: string;
  firstName: string;
  lastName: string;
  email: string;
  ticketTierId: string;
  ticketTierName: string;
  qrCodeUrl: string | null;
}

export interface ReceiptPreviewResponse {
  booking: BookingResponse;
  attendees: AttendeeResponse[];
  emailSubject: string;
  suggestedHtmlBody: string;
}

export interface RefundResult {
  refundId: string;
  status: string;
  amount: number;
  currency: string;
  message: string;
}

// ─── Event Management ───────────────────────────────────────────────────────

/**
 * GET /api/v1/organizers/{organizerId}/events
 */
export const listEvents = (organizerId: string): Promise<EventResponse[]> =>
  api.get<EventResponse[]>(`/api/v1/organizers/${organizerId}/events`).then(r => r.data);

/**
 * GET /api/v1/organizers/{organizerId}/events/{eventId}
 */
export const getEvent = (organizerId: string, eventId: string): Promise<EventResponse> =>
  api.get<EventResponse>(`/api/v1/organizers/${organizerId}/events/${eventId}`).then(r => r.data);

/**
 * POST /api/v1/organizers/{organizerId}/events  (multipart/form-data)
 *
 * Backend @RequestParam fields: title, description, eventDate (ISO-8601), location,
 * totalCapacity, category (string). Optional @RequestPart: coverImage (file).
 */
export const createEvent = (
  organizerId: string,
  payload: {
    title: string;
    description: string;
    eventDate: string;   // ISO-8601 LocalDateTime, e.g. "2026-07-15T09:00:00"
    location: string;
    totalCapacity: number;
    category: string;
    coverImage: File | null;
    approvalDocument: File | null;
  }
): Promise<EventResponse> => {
  const form = new FormData();
  form.append('title', payload.title);
  form.append('description', payload.description);
  form.append('eventDate', payload.eventDate);
  form.append('location', payload.location);
  form.append('totalCapacity', String(payload.totalCapacity));
  form.append('category', payload.category);
  if (payload.coverImage) {
    form.append('coverImage', payload.coverImage);
  }
  if (payload.approvalDocument) {
    form.append('approvalDocument', payload.approvalDocument);
  }
  // CRITICAL FIX: Explicitly set the Content-Type header
  return api
    .post<EventResponse>(`/api/v1/organizers/${organizerId}/events`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then(r => r.data);
};

/**
 * PUT /api/v1/organizers/{organizerId}/events/{eventId}/postpone
 *
 * Body: { newDate: LocalDateTime } — must be a future date.
 */
export const postponeEvent = (
  organizerId: string,
  eventId: string,
  newDate: string   // ISO-8601 LocalDateTime e.g. "2026-09-20T14:00:00"
): Promise<EventResponse> =>
  api
    .put<EventResponse>(`/api/v1/organizers/${organizerId}/events/${eventId}/postpone`, { newDate })
    .then(r => r.data);

/**
 * PUT /api/v1/organizers/{organizerId}/events/{eventId}
 */
export const updateEvent = (
  organizerId: string,
  eventId: string,
  payload: any
): Promise<EventResponse> =>
  api
    .put<EventResponse>(`/api/v1/organizers/${organizerId}/events/${eventId}`, payload)
    .then(r => r.data);

/**
 * DELETE /api/v1/organizers/{organizerId}/events/{eventId}
 */
export const deleteEvent = (organizerId: string, eventId: string): Promise<void> =>
  api.delete(`/api/v1/organizers/${organizerId}/events/${eventId}`).then(() => undefined);

/**
 * POST /api/v1/organizers/{organizerId}/events/{eventId}/email
 */
export const emailAttendees = (
  organizerId: string,
  eventId: string,
  payload: { subject: string; body: string }
): Promise<void> =>
  api.post(`/api/v1/organizers/${organizerId}/events/${eventId}/email`, payload).then(() => undefined);

// ─── Team Management ────────────────────────────────────────────────────────

/**
 * GET /api/v1/organizers/{organizerId}/team/members
 */
export const listTeamMembers = (organizerId: string): Promise<TeamMemberResponse[]> =>
  api.get<TeamMemberResponse[]>(`/api/v1/organizers/${organizerId}/team/members`).then(r => r.data);

/**
 * POST /api/v1/organizers/{organizerId}/team/members
 *
 * Body: { email, role }  — backend resolves UUID internally.
 */
export const inviteTeamMember = (
  organizerId: string,
  email: string,
  role: 'CO_ORGANIZER' | 'GATE_SCANNER'
): Promise<TeamMemberResponse> =>
  api
    .post<TeamMemberResponse>(`/api/v1/organizers/${organizerId}/team/members`, { email, role })
    .then(r => r.data);

/**
 * DELETE /api/v1/organizers/{organizerId}/team/members/{memberId}
 */
export const removeTeamMember = (organizerId: string, memberId: string): Promise<void> =>
  api
    .delete(`/api/v1/organizers/${organizerId}/team/members/${memberId}`)
    .then(() => undefined);

// ─── Ticket Tiers ───────────────────────────────────────────────────────────

/**
 * GET /api/v1/organizers/events/{eventId}/tiers
 */
export const listTicketTiers = (eventId: string): Promise<TicketTierResponse[]> => {
  if (!eventId || eventId === 'undefined') return Promise.resolve([]);
  return api.get<TicketTierResponse[]>(`/api/v1/organizers/events/${eventId}/tiers`).then(r => r.data);
};

/**
 * POST /api/v1/organizers/events/{eventId}/tiers
 *
 * Body: { name, price (BigDecimal), capacity (int ≥ 1) }
 * Backend validates that sum of tier capacities ≤ event.totalCapacity.
 */
export const createTicketTier = (
  eventId: string,
  payload: { name: string; price: number; capacity: number }
): Promise<TicketTierResponse> =>
  api
    .post<TicketTierResponse>(`/api/v1/organizers/events/${eventId}/tiers`, payload)
    .then(r => r.data);

// ─── Promo Codes ────────────────────────────────────────────────────────────

/**
 * GET /api/v1/organizers/events/{eventId}/promo-codes
 */
export const listPromoCodes = (eventId: string): Promise<PromoCodeResponse[]> => {
  if (!eventId || eventId === 'undefined') return Promise.resolve([]);
  return api.get<PromoCodeResponse[]>(`/api/v1/organizers/events/${eventId}/promo-codes`).then(r => r.data);
};

/**
 * POST /api/v1/organizers/events/{eventId}/promo-codes
 *
 * Body: { code, discountType: "FLAT"|"PERCENTAGE", discountValue, validUntil?, maxUses? }
 */
export const createPromoCode = (
  eventId: string,
  payload: {
    code: string;
    discountType: 'FLAT' | 'PERCENTAGE';
    discountValue: number;
    validUntil?: string | null;
    maxUses?: number | null;
  }
): Promise<PromoCodeResponse> =>
  api
    .post<PromoCodeResponse>(`/api/v1/organizers/events/${eventId}/promo-codes`, payload)
    .then(r => r.data);

/**
 * DELETE /api/v1/organizers/promo-codes/{promoCodeId}
 */
export const deactivatePromoCode = (promoCodeId: string): Promise<void> =>
  api.delete(`/api/v1/organizers/promo-codes/${promoCodeId}`).then(() => undefined);

// ─── Booking & Receipt Flow ─────────────────────────────────────────────────

/**
 * GET /api/v1/organizers/events/{eventId}/bookings
 */
export const listBookings = (eventId: string): Promise<BookingResponse[]> => {
  if (!eventId || eventId === 'undefined') return Promise.resolve([]);
  return api.get<BookingResponse[]>(`/api/v1/organizers/events/${eventId}/bookings`).then(r => r.data);
};

/**
 * GET /api/v1/organizers/bookings/{bookingId}
 */
export const getBookingDetail = (bookingId: string): Promise<BookingResponse> =>
  api.get<BookingResponse>(`/api/v1/organizers/bookings/${bookingId}`).then(r => r.data);

/**
 * POST /api/v1/organizers/bookings/{bookingId}/generate-receipt
 *
 * Step 1: Generates QR codes and returns an HTML preview. No email sent yet.
 */
export const generateReceiptPreview = (bookingId: string): Promise<ReceiptPreviewResponse> =>
  api
    .post<ReceiptPreviewResponse>(`/api/v1/organizers/bookings/${bookingId}/generate-receipt`)
    .then(r => r.data);

/**
 * POST /api/v1/organizers/bookings/{bookingId}/dispatch-receipt
 *
 * Step 2: Organizer approves and triggers the actual receipt email.
 * Backend expects @RequestParam — send as application/x-www-form-urlencoded.
 */
export const dispatchReceipt = (bookingId: string, customHtmlBody: string): Promise<void> => {
  const params = new URLSearchParams();
  params.append('customHtmlBody', customHtmlBody);
  return api
    .post(`/api/v1/organizers/bookings/${bookingId}/dispatch-receipt`, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    .then(() => undefined);
};

/**
 * POST /api/v1/organizers/bookings/{bookingId}/refund
 *
 * Body: { refundPercentage: number (0.01–100), reason?: string }
 * Returns Stripe refund details.
 */
export const issueRefund = (
  bookingId: string,
  refundPercentage: number,
  reason?: string
): Promise<RefundResult> =>
  api
    .post<RefundResult>(`/api/v1/organizers/bookings/${bookingId}/refund`, {
      refundPercentage,
      reason: reason ?? null,
    })
    .then(r => r.data);

/**
 * POST /api/v1/organizers/tickets/validate
 */
export const validateTicket = (ticketId: string): Promise<any> =>
  api.post(`/api/v1/organizers/tickets/validate`, { ticketId }).then(r => r.data);

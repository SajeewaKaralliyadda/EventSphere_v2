/**
 * attendeeService.ts
 *
 * All Supabase-JWT-protected attendee API calls, typed against the Spring Boot DTO shapes.
 * Uses the shared axios instance from lib/api.ts which auto-attaches the JWT via interceptor.
 *
 * Endpoints:
 *   POST   /api/v1/attendee/profile/complete           (multipart/form-data)
 *   GET    /api/v1/attendee/tickets/upcoming
 *   GET    /api/v1/attendee/tickets/past
 *   POST   /api/v1/attendee/tickets/{bookingId}/refund-request
 *   POST   /api/v1/attendee/events/{eventId}/reviews
 *   GET    /api/v1/attendee/wishlist
 *   POST   /api/v1/attendee/wishlist/{eventId}
 *   DELETE /api/v1/attendee/wishlist/{eventId}
 */
import api from '../lib/api';

// ─── Response Types (mirrors Spring Boot records) ──────────────────────────

/** POST /api/v1/attendee/profile/complete → RegistrationResponse */
export interface RegistrationResponse {
  profileId: string;
  userId: string;
  student: boolean;
  address: string | null;
  faculty: string | null;
  batchYear: number | null;
  universityEmail: string | null;
  idCardUrl: string | null;
  message: string;
}

/** GET /api/v1/attendee/tickets/upcoming|past → MyTicketResponse[] */
export interface MyTicketResponse {
  bookingId: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;       // ISO-8601 LocalDateTime
  location: string | null;
  coverImageUrl: string | null;
  totalAmount: number;
  status: string;          // CONFIRMED | REFUND_PENDING | CANCELLED | etc.
  purchaseDate: string;    // ISO-8601 LocalDateTime (createdAt)
}

/** POST /api/v1/attendee/tickets/{bookingId}/refund-request → RefundRequestResponse */
export interface RefundRequestResponse {
  id: string;
  bookingId: string;
  reason: string;
  status: string;          // REFUND_PENDING
  createdAt: string;
  message: string;
}

/** POST /api/v1/attendee/events/{eventId}/reviews → ReviewResponse */
export interface AttendeeReviewResponse {
  id: string;
  eventId: string;
  userId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

/** GET /api/v1/attendee/wishlist → WishlistResponse[] */
export interface WishlistResponse {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;       // ISO-8601 LocalDateTime
  location: string | null;
  coverImageUrl: string | null;
  addedAt: string;
}

/** POST /api/v1/attendee/events/{eventId}/bookings → BookingResponse */
export interface BookingResponse {
  bookingId: string;
  totalAmount: number;
  status: string;
  checkoutUrl?: string;
}

// ─── Request payload shape for profile completion ────────────────────────────

export interface CompleteProfilePayload {
  address: string;
  isStudent: boolean;
  tenantId?: string | null;
  faculty?: string | null;
  batchYear?: number | null;
  universityEmail?: string | null;
}

// ─── API Functions ───────────────────────────────────────────────────────────

/**
 * POST /api/v1/attendee/profile/complete
 *
 * Two-tier registration:
 *  - Outside Attendee: only address needed, isStudent=false.
 *  - University Student: isStudent=true, requires tenantId, universityEmail,
 *    faculty, batchYear, and an idCard file (multipart).
 *
 * The backend @RequestPart("data") expects the JSON as a blob with type application/json.
 */
export const completeProfile = (
  payload: CompleteProfilePayload,
  idCard?: File | null
): Promise<RegistrationResponse> => {
  const form = new FormData();
  form.append(
    'data',
    new Blob([JSON.stringify(payload)], { type: 'application/json' })
  );
  if (idCard) {
    form.append('idCard', idCard);
  }
  return api
    .post<RegistrationResponse>('/api/v1/attendee/profile/complete', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then(r => r.data);
};

/**
 * GET /api/v1/attendee/tickets/upcoming
 * Returns tickets for events that haven't happened yet.
 */
export const getUpcomingTickets = (): Promise<MyTicketResponse[]> =>
  api.get<MyTicketResponse[]>('/api/v1/attendee/tickets/upcoming').then(r => r.data);

/**
 * GET /api/v1/attendee/tickets/past
 * Returns tickets for events that have already passed.
 */
export const getPastTickets = (): Promise<MyTicketResponse[]> =>
  api.get<MyTicketResponse[]>('/api/v1/attendee/tickets/past').then(r => r.data);

/**
 * POST /api/v1/attendee/tickets/{bookingId}/refund-request
 *
 * Immediately sets booking status to REFUND_PENDING, invalidating the QR code.
 * Body: { reason: string } — reason is required by backend @NotBlank.
 */
export const requestRefund = (
  bookingId: string,
  reason: string
): Promise<RefundRequestResponse> =>
  api
    .post<RefundRequestResponse>(
      `/api/v1/attendee/tickets/${bookingId}/refund-request`,
      { reason }
    )
    .then(r => r.data);

/**
 * POST /api/v1/attendee/events/{eventId}/reviews
 *
 * Submit a review for a past attended event.
 * Fails with 400/409 if event is upcoming or user has no confirmed booking.
 * rating: 1–5 (validated by backend @Min/@Max)
 * comment: optional free-text
 */
export const submitReview = (
  eventId: string,
  rating: number,
  comment?: string
): Promise<AttendeeReviewResponse> =>
  api
    .post<AttendeeReviewResponse>(`/api/v1/attendee/events/${eventId}/reviews`, {
      rating,
      comment: comment ?? null,
    })
    .then(r => r.data);

/**
 * GET /api/v1/attendee/wishlist
 * Returns all wishlist entries for the authenticated user.
 */
export const getWishlist = (): Promise<WishlistResponse[]> =>
  api.get<WishlistResponse[]>('/api/v1/attendee/wishlist').then(r => r.data);

/**
 * POST /api/v1/attendee/wishlist/{eventId}
 * Adds an event to the authenticated user's wishlist.
 */
export const addToWishlist = (eventId: string): Promise<WishlistResponse> =>
  api
    .post<WishlistResponse>(`/api/v1/attendee/wishlist/${eventId}`)
    .then(r => r.data);

/**
 * DELETE /api/v1/attendee/wishlist/{eventId}
 * Removes an event from the authenticated user's wishlist. Returns 204 No Content.
 */
export const removeFromWishlist = (eventId: string): Promise<void> =>
  api
    .delete(`/api/v1/attendee/wishlist/${eventId}`)
    .then(() => undefined);

/**
 * POST /api/v1/attendee/events/{eventId}/bookings
 * Create a new booking for an event with specified ticket quantities.
 */
export const createBooking = (
  eventId: string,
  tickets: Record<string, number>,
  promoCode?: string
): Promise<BookingResponse> => {
  return api.post<BookingResponse>(`/api/v1/attendee/events/${eventId}/bookings`, { tickets, promoCode })
    .then(r => r.data);
};

/**
 * POST /api/v1/attendee/bookings/confirm
 * Confirms a booking after successful Stripe payment.
 */
export const confirmBooking = (sessionId: string): Promise<void> =>
  api.post(`/api/v1/attendee/bookings/confirm`, { sessionId }).then(() => undefined);

/**
 * GET /api/v1/attendee/profile
 * Retrieves the current attendee's profile.
 */
export const getAttendeeProfile = (): Promise<any> => 
  api.get('/api/v1/attendee/profile').then(r => r.data);

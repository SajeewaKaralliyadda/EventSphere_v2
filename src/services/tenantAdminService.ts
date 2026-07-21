/**
 * tenantAdminService.ts
 *
 * All Tenant Admin-scoped API calls, typed against the Spring Boot DTO shapes.
 * Uses the shared axios instance from lib/api.ts which auto-attaches the
 * Supabase JWT Bearer token via the request interceptor.
 *
 * Endpoint base: /api/v1/tenantadmin
 * Note: the frontend previously used /api/tenant-admin/* — these are aligned
 * to the confirmed backend route prefix /api/v1/tenantadmin/*.
 */
import api from '../lib/api';

// ─── Dashboard Response Types ─────────────────────────────────────────────────

export interface RecentActivityDto {
  type: string; // "ORGANIZER" | "EVENT"
  title: string;
  subtitle: string;
  timeAgo: string;
  timestamp: string;
}

export interface TenantDashboardStats {
  registeredStudents: number;
  activeOrganizers: number;
  upcomingEventsCount: number;
  totalTicketsSold?: number;
  totalRevenue?: string;
  recentActivities?: RecentActivityDto[];
}

export interface TicketSalesPoint {
  period: string;
  totalSales: number;
  ticketCount: number;
}

// ─── Approval Response Types ──────────────────────────────────────────────────

export interface OrganizerApprovalRequest {
  id: string;
  name: string;
  email: string;
  clubName: string;
  description?: string;
  phone?: string;
  documentUrl?: string;
  date: string;
}

export interface EventApprovalRequest {
  id: string;
  title: string;
  organizer: string;
  category?: string;
  date: string;
  time?: string;
  venue?: string;
  capacity?: number;
  status: string;
  coverImageUrl?: string;
  documentUrl?: string;
  audience?: string;
}

export type ApprovalAction = 'APPROVED' | 'REJECTED';

export interface ApprovalDecisionRequest {
  decision: ApprovalAction;
  reason?: string;
}

// ─── Dispute Response Types ───────────────────────────────────────────────────

export interface DisputeResponse {
  id: string;
  targetName: string;
  targetType: string;
  reason: string;
  description?: string;
  status: string;
  createdAt: string;
}

// ─── Customization Response Types ────────────────────────────────────────────

export interface PortalCustomization {
  welcomeMessage?: string;
  primaryColor?: string;
  secondaryColor?: string;
  bannerImageUrl?: string;
  logoUrl?: string;
}

// ─── Faculty Response Types ───────────────────────────────────────────────────

export interface FacultyResponse {
  id: string;
  name: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/tenantadmin/dashboard/stats
 */
export const getDashboardStats = (): Promise<TenantDashboardStats> =>
  api
    .get<TenantDashboardStats>('/api/v1/tenantadmin/dashboard/stats')
    .then(r => r.data);

/**
 * GET /api/v1/tenantadmin/dashboard/ticket-sales
 * Returns a weekly/daily time-series of ticket sales for the chart.
 */
export const getTicketSalesData = (): Promise<TicketSalesPoint[]> =>
  api
    .get<TicketSalesPoint[]>('/api/v1/tenantadmin/dashboard/ticket-sales')
    .then(r => r.data);

// ─── Approval Center ─────────────────────────────────────────────────────────

/**
 * GET /api/v1/tenantadmin/approvals/organizers
 * Lists all pending organizer approval requests for this tenant.
 */
export const listOrganizerApprovals = (): Promise<OrganizerApprovalRequest[]> =>
  api
    .get<OrganizerApprovalRequest[]>('/api/v1/tenantadmin/approvals/organizers')
    .then(r => r.data);

/**
 * PUT /api/v1/tenantadmin/approvals/organizers/{requestId}
 *
 * Approves or rejects an organizer request.
 * Body: { action: 'APPROVED' | 'REJECTED', reason?: string }
 */
export const decideOrganizerApproval = (
  requestId: string,
  decision: ApprovalDecisionRequest,
): Promise<void> =>
  api
    .put(`/api/v1/tenantadmin/approvals/organizers/${requestId}`, decision)
    .then(() => undefined);

/**
 * GET /api/v1/tenantadmin/approvals/events
 * Lists all pending event approval requests for this tenant.
 */
export const listEventApprovals = (): Promise<EventApprovalRequest[]> =>
  api
    .get<EventApprovalRequest[]>('/api/v1/tenantadmin/approvals/events')
    .then(r => r.data);

/**
 * PUT /api/v1/tenantadmin/approvals/events/{eventId}
 *
 * Approves or rejects an event request.
 * Body: { action: 'APPROVED' | 'REJECTED', reason?: string }
 */
export const decideEventApproval = (
  eventId: string,
  decision: ApprovalDecisionRequest,
): Promise<void> =>
  api
    .put(`/api/v1/tenantadmin/approvals/events/${eventId}`, decision)
    .then(() => undefined);

// ─── Disputes ────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/tenantadmin/disputes
 */
export const listDisputes = (): Promise<DisputeResponse[]> =>
  api
    .get<DisputeResponse[]>('/api/v1/tenantadmin/disputes')
    .then(r => r.data);

/**
 * PATCH /api/v1/tenantadmin/disputes/{disputeId}/status
 * Body: { status: string }
 */
export const updateDisputeStatus = (
  disputeId: string,
  status: string,
): Promise<DisputeResponse> =>
  api
    .patch<DisputeResponse>(`/api/v1/tenantadmin/disputes/${disputeId}/status`, { status })
    .then(r => r.data);

/**
 * POST /api/v1/tenantadmin/disputes/{disputeId}/warn
 * Sends a warning to the organizer involved in the dispute.
 */
export const sendDisputeWarning = (disputeId: string): Promise<void> =>
  api
    .post(`/api/v1/tenantadmin/disputes/${disputeId}/warn`)
    .then(() => undefined);

/**
 * POST /api/v1/tenantadmin/disputes/{disputeId}/suspend
 * Suspends the organizer's account for this dispute.
 */
export const suspendDisputeOrganizer = (disputeId: string): Promise<void> =>
  api
    .post(`/api/v1/tenantadmin/disputes/${disputeId}/suspend`)
    .then(() => undefined);

// ─── Portal Customization ─────────────────────────────────────────────────────

/**
 * GET /api/v1/tenantadmin/customization
 * Fetches the tenant's current portal customization settings.
 */
export const getCustomization = (): Promise<PortalCustomization> =>
  api
    .get<PortalCustomization>('/api/v1/tenantadmin/customization')
    .then(r => r.data);

/**
 * PUT /api/v1/tenantadmin/customization
 *
 * Updates portal customization. If a bannerFile is provided, sends as
 * multipart/form-data; otherwise sends as JSON.
 */
export const updateCustomization = (
  settings: Omit<PortalCustomization, 'bannerImageUrl'>,
  bannerFile?: File | null,
): Promise<PortalCustomization> => {
  const form = new FormData();
  form.append(
    'settings',
    new Blob([JSON.stringify(settings)], { type: 'application/json' })
  );
  if (bannerFile) {
    form.append('file', bannerFile);
  }
  // CRITICAL FIX: Override default headers for multipart
  return api
    .put<PortalCustomization>('/api/v1/tenantadmin/customization', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then(r => r.data);
};

// ─── Faculty Management ──────────────────────────────────────────────────────

/**
 * GET /api/v1/tenantadmin/faculties
 */
export const listFaculties = (): Promise<FacultyResponse[]> =>
  api
    .get<FacultyResponse[]>('/api/v1/tenantadmin/faculties')
    .then(r => r.data);

/**
 * POST /api/v1/tenantadmin/faculties
 * Body: { name: string }
 */
export const createFaculty = (name: string): Promise<FacultyResponse> =>
  api
    .post<FacultyResponse>('/api/v1/tenantadmin/faculties', { name })
    .then(r => r.data);

/**
 * DELETE /api/v1/tenantadmin/faculties/{facultyId}
 */
export const deleteFaculty = (facultyId: string): Promise<void> =>
  api
    .delete(`/api/v1/tenantadmin/faculties/${facultyId}`)
    .then(() => undefined);

/**
 * POST /api/v1/tenantadmin/organizers/invite
 * Invites a new organizer via email.
 */
export const inviteOrganizer = (email: string): Promise<void> =>
  api
    .post('/api/v1/tenantadmin/organizers/invite', { email })
    .then(() => undefined);

/**
 * DELETE /api/v1/events/{eventId}
 */
export const deleteGlobalEvent = (eventId: string): Promise<void> =>
  api.delete(`/api/v1/events/${eventId}`).then(() => undefined);

/**
 * GET /api/v1/tenantadmin/dashboard/events
 */
export const listEvents = (): Promise<any[]> =>
  api.get('/api/v1/tenantadmin/dashboard/events').then(r => r.data);


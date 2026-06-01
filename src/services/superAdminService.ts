/**
 * superAdminService.ts
 *
 * All Super Admin-scoped API calls, typed against the Spring Boot DTO shapes.
 * Uses the shared axios instance from lib/api.ts which auto-attaches the
 * Supabase JWT Bearer token via the request interceptor.
 *
 * Endpoint base: /api/v1/superadmin
 */
import api from '../lib/api';

// ─── Response Types ──────────────────────────────────────────────────────────

export interface TenantResponse {
  id: string;
  name: string;
  domain: string;
  active: boolean;
  primaryColor?: string;
  logoUrl?: string | null;
  createdAt?: string;
}

export interface PayoutResponse {
  id: string;
  tenant: string;
  tenantId?: string;
  totalSales: number;
  feePercentage: number;
  netPayout: number;
  status: 'PENDING' | 'PAID';
  date: string;
  transactionRef?: string;
}

export interface GeneralCampaignRequest {
  subject: string;
  body: string;
  targetRole?: string;
  targetUniversity?: string;
}

export interface NewsletterGenerationRequest {
  startDate?: string | null;
  endDate?: string | null;
  customMessage: string;
  additionalRecipients?: string[];
}

export interface CampaignPreviewResponse {
  htmlContent: string;
}

export interface AnnouncementResponse {
  id: string;
  message: string;
  bannerColor: 'blue' | 'yellow' | 'red';
  expiryDate: string;
  createdAt: string;
}

export interface CreateAnnouncementRequest {
  message: string;
  bannerColor: 'blue' | 'yellow' | 'red';
  expiryDate: string;
}

export interface PartnershipRequestResponse {
  id: string;
  universityName: string;
  representativeName: string;
  designation: string;
  officialEmail: string;
  phoneNumber: string;
  message?: string;
  status: 'PENDING' | 'CONTACTED' | 'REJECTED' | 'ACCEPTED';
  createdAt: string;
}

export interface ContactMessageResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'RESOLVED';
  createdAt: string;
  updatedAt: string;
}

// ─── Tenant Management ───────────────────────────────────────────────────────

/**
 * GET /api/v1/superadmin/tenants
 * Lists all tenants on the platform.
 */
export const listTenants = (): Promise<TenantResponse[]> =>
  api.get<TenantResponse[]>('/api/v1/superadmin/tenants').then(r => r.data);

/**
 * POST /api/v1/superadmin/tenants  (multipart/form-data)
 *
 * Creates a new tenant. Logo and banner files are optional.
 * Required fields: universityName, domain, adminFullName, adminDesignation, adminEmail
 * Optional fields: primaryColor, logo (File), banner (File)
 */
export const createTenant = (payload: {
  universityName: string;
  domain: string;
  primaryColor?: string;
  adminFullName: string;
  adminDesignation: string;
  adminEmail: string;
  logo?: File | null;
  banner?: File | null;
}): Promise<TenantResponse> => {
  const form = new FormData();
  form.append('universityName', payload.universityName);
  form.append('domain', payload.domain);
  if (payload.primaryColor) form.append('primaryColor', payload.primaryColor);
  form.append('adminFullName', payload.adminFullName);
  form.append('adminDesignation', payload.adminDesignation);
  form.append('adminEmail', payload.adminEmail);
  if (payload.logo) form.append('logo', payload.logo);
  if (payload.banner) form.append('banner', payload.banner);

  return api
    .post<TenantResponse>('/api/v1/superadmin/tenants', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then(r => r.data);
};

// ─── Payout Management ───────────────────────────────────────────────────────

/**
 * GET /api/v1/superadmin/payouts
 * Lists all payout records across all tenants.
 */
export const listPayouts = (): Promise<PayoutResponse[]> =>
  api.get<PayoutResponse[]>('/api/v1/superadmin/payouts').then(r => r.data);

/**
 * PUT /api/v1/superadmin/payouts/{payoutId}/mark-paid
 *
 * Marks a pending payout as paid, recording the transaction reference.
 * Body: { transactionRef: string }
 */
export const markPayoutAsPaid = (
  payoutId: string,
  transactionRef: string,
): Promise<PayoutResponse> =>
  api
    .put<PayoutResponse>(`/api/v1/superadmin/payouts/${payoutId}/mark-paid`, {
      transactionRef,
    })
    .then(r => r.data);

// ─── Email Campaigns / Broadcast ─────────────────────────────────────────────

/**
 * POST /api/v1/superadmin/campaigns/general/broadcast
 *
 * Broadcasts a mass email to a filtered set of users.
 */
export const broadcastGeneralCampaign = (
  request: GeneralCampaignRequest,
): Promise<void> =>
  api
    .post('/api/v1/superadmin/campaigns/general/broadcast', request)
    .then(() => undefined);

/**
 * POST /api/v1/superadmin/campaigns/newsletter/preview
 */
export const previewNewsletter = (
  request: NewsletterGenerationRequest,
): Promise<CampaignPreviewResponse> =>
  api
    .post<CampaignPreviewResponse>('/api/v1/superadmin/campaigns/newsletter/preview', request)
    .then(r => r.data);

/**
 * POST /api/v1/superadmin/campaigns/newsletter/broadcast
 */
export const broadcastNewsletter = (
  request: NewsletterGenerationRequest,
): Promise<void> =>
  api
    .post('/api/v1/superadmin/campaigns/newsletter/broadcast', request)
    .then(() => undefined);

// ─── Global Announcements ────────────────────────────────────────────────────

/**
 * GET /api/v1/superadmin/announcements
 * Retrieves all active global announcements.
 */
export const listAnnouncements = (): Promise<AnnouncementResponse[]> =>
  api
    .get<AnnouncementResponse[]>('/api/v1/superadmin/announcements')
    .then(r => r.data);

/**
 * POST /api/v1/superadmin/announcements
 *
 * Publishes a new platform-wide announcement banner.
 * Body: { message, color: 'blue'|'yellow'|'red', expiryDate: 'YYYY-MM-DD' }
 */
export const createAnnouncement = (
  request: CreateAnnouncementRequest,
): Promise<AnnouncementResponse> =>
  api
    .post<AnnouncementResponse>('/api/v1/superadmin/announcements', request)
    .then(r => r.data);

// ─── Partnership Requests ────────────────────────────────────────────────────

/**
 * GET /api/v1/superadmin/partnerships
 * Retrieves all partnership requests submitted via the public portal.
 */
export const getPartnershipRequests = (): Promise<PartnershipRequestResponse[]> =>
  api
    .get<PartnershipRequestResponse[]>('/api/v1/superadmin/partnerships')
    .then(r => r.data);

/**
 * GET /api/v1/superadmin/contact-messages
 */
export const getContactMessages = (): Promise<ContactMessageResponse[]> =>
  api.get<ContactMessageResponse[]>('/api/v1/superadmin/contact-messages').then(r => r.data);

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { TenantProvider } from "./contexts/TenantContext";

import LandingPage from "./pages/public/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";
import PendingApproval from "./pages/auth/PendingApproval";
import AcceptInvite from "./pages/auth/AcceptInvite";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./pages/auth/Unauthorized";
import SuperAdminDashboard from "./pages/super-admin/SuperAdminDashboard";
import TenantAdminDashboard from "./pages/tenant-admin/TenantAdminDashboard";
import TenantSettings from "./pages/tenant-admin/TenantSettings";
import ApprovalCenter from "./pages/tenant-admin/ApprovalCenter";
import OrganizerDashboard from "./pages/organizer/OrganizerDashboard";
import OrganizerReports from "./pages/organizer/OrganizerReports";
import RefundManagement from "./pages/organizer/RefundManagement";
import AttendeeDashboard from "./pages/attendee/AttendeeDashboard";
import EventDetails from "./pages/public/EventDetails";
import EventCreationWizard from "./pages/organizer/EventCreationWizard";
import QRScannerMobile from "./pages/organizer/QRScannerMobile";
import CheckoutWizard from "./pages/attendee/CheckoutWizard";
import OrganizerPublicProfile from "./pages/public/OrganizerPublicProfile";
import TenantAdminSetup from "./pages/auth/TenantAdminSetup";
import ProfileSettings from "./pages/shared/ProfileSettings";
import EditEvent from "./pages/organizer/EditEvent";
import NotFound from "./pages/shared/NotFound";
import PayoutManagement from "./pages/super-admin/PayoutManagement";
import UniversityDirectory from "./pages/public/UniversityDirectory";
import UniversityDetail from "./pages/public/UniversityDetail";
import HelpCenter from "./pages/public/HelpCenter";
import ContactSupport from "./pages/public/ContactSupport";
import TermsAndConditions from "./pages/public/TermsAndConditions";
import PrivacyPolicy from "./pages/public/PrivacyPolicy";
import Wishlist from "./pages/attendee/Wishlist";
import AttendeeCalendar from "./pages/attendee/AttendeeCalendar";
import AttendeeOnboarding from "./pages/attendee/AttendeeOnboarding";
import CheckoutSuccess from "./pages/attendee/CheckoutSuccess";

import PromoManagement from "./pages/organizer/PromoManagement";
import GuestList from "./pages/organizer/GuestList";
import TeamManagement from "./pages/organizer/TeamManagement";
import TenantCustomizer from "./pages/tenant-admin/TenantCustomizer";
import DisputeResolution from "./pages/tenant-admin/DisputeResolution";
import GlobalAnnouncements from "./pages/super-admin/GlobalAnnouncements";
import EmailCampaignManager from "./pages/super-admin/EmailCampaignManager";
import PartnershipRequests from "./pages/super-admin/PartnershipRequests";
import ContactMessages from "./pages/super-admin/ContactMessages";

import EventsListPage from "./pages/public/EventsListPage";
//import { useAuth } from "./contexts/AuthContext";

function OrganizerIndexRedirect() {
  const { user } = useAuth();
  if (user?.role === "GATE_SCANNER") {
    return <Navigate to="/organizer/scanner" replace />;
  }
  return <Navigate to="/organizer/dashboard" replace />;
}

function OrganizerStrictGuard() {
  const { user } = useAuth();
  if (user?.role === "GATE_SCANNER") {
    return <Navigate to="/organizer/scanner" replace />;
  }
  return <Outlet />;
}

export default function App() {
  // Ensure dark mode is applied by default on the HTML element for the initial render
  useEffect(() => {
    document.documentElement.classList.add("dark");
    const hash = window.location.hash;
    if (hash && hash.includes("type=invite")) {
      // Invite link - Accept Invite
      window.location.replace("/accept-invite" + hash);
    } else if (hash && hash.includes("type=recovery")) {
      // Password Reset link - Reset Password
      window.location.replace("/reset-password" + hash);
    }
  }, []);

  return (
    <AuthProvider>
      <TenantProvider>
        <BrowserRouter>
          <Toaster
            position="bottom-right"
            toastOptions={{ className: "dark:bg-slate-800 dark:text-white" }}
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/events" element={<EventsListPage />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/universities" element={<UniversityDirectory />} />
            <Route path="/universities/:slug" element={<UniversityDetail />} />
            <Route
              path="/organizer/:organizerId"
              element={<OrganizerPublicProfile />}
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<SignUpPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/pending-approval" element={<PendingApproval />} />
            <Route path="/accept-invite" element={<AcceptInvite />} />
            <Route path="/setup-admin" element={<TenantAdminSetup />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/contact" element={<ContactSupport />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/checkout" element={<CheckoutWizard />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]} />}>
              <Route
                path="/super-admin/dashboard"
                element={<SuperAdminDashboard />}
              />
              <Route
                path="/super-admin/payouts"
                element={<PayoutManagement />}
              />
              <Route
                path="/super-admin/announcements"
                element={<GlobalAnnouncements />}
              />
              <Route
                path="/super-admin/emails"
                element={<EmailCampaignManager />}
              />
              <Route
                path="/super-admin/partnerships"
                element={<PartnershipRequests />}
              />
              <Route
                path="/super-admin/contact"
                element={<ContactMessages />}
              />
              <Route
                path="/super-admin"
                element={<Navigate to="/super-admin/dashboard" replace />}
              />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["TENANT_ADMIN"]} />}>
              <Route
                path="/tenant-admin/dashboard"
                element={<TenantAdminDashboard />}
              />
              <Route
                path="/tenant-admin/settings"
                element={<TenantSettings />}
              />
              <Route
                path="/tenant-admin/approvals"
                element={<ApprovalCenter />}
              />
              <Route
                path="/tenant-admin/customize"
                element={<TenantCustomizer />}
              />
              <Route
                path="/tenant-admin/disputes"
                element={<DisputeResolution />}
              />
              <Route
                path="/tenant-admin"
                element={<Navigate to="/tenant-admin/dashboard" replace />}
              />
            </Route>

            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["ORGANIZER", "CO_ORGANIZER", "GATE_SCANNER"]}
                />
              }
            >
              <Route path="/organizer/scanner" element={<QRScannerMobile />} />
              <Route path="/organizer" element={<OrganizerIndexRedirect />} />

              <Route element={<OrganizerStrictGuard />}>
                <Route
                  path="/organizer/dashboard"
                  element={<OrganizerDashboard />}
                />
                <Route
                  path="/organizer/reports"
                  element={<OrganizerReports />}
                />
                <Route
                  path="/organizer/refunds"
                  element={<RefundManagement />}
                />
                <Route
                  path="/organizer/create-event"
                  element={<EventCreationWizard />}
                />
                <Route
                  path="/organizer/edit-event/:id"
                  element={<EditEvent />}
                />
                <Route path="/organizer/promo" element={<PromoManagement />} />
                <Route path="/organizer/guests" element={<GuestList />} />
                <Route path="/organizer/team" element={<TeamManagement />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["ATTENDEE"]} />}>
              <Route path="/attendee/wallet" element={<AttendeeDashboard />} />
              <Route path="/attendee/wishlist" element={<Wishlist />} />
              <Route path="/attendee/calendar" element={<AttendeeCalendar />} />
              <Route
                path="/attendee/onboarding"
                element={<AttendeeOnboarding />}
              />
              <Route
                path="/attendee/checkout/success"
                element={<CheckoutSuccess />}
              />
              <Route
                path="/attendee"
                element={<Navigate to="/attendee/wallet" replace />}
              />
            </Route>

            <Route
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "SUPER_ADMIN",
                    "TENANT_ADMIN",
                    "ORGANIZER",
                    "CO_ORGANIZER",
                    "GATE_SCANNER",
                    "ATTENDEE",
                  ]}
                />
              }
            >
              <Route path="/settings" element={<ProfileSettings />} />
              <Route
                path="/profile"
                element={<Navigate to="/settings" replace />}
              />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TenantProvider>
    </AuthProvider>
  );
}

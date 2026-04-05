import React, { useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Globe, Clock, ShieldAlert, LogOut } from "lucide-react";
import DynamicButton from "../../components/ui/DynamicButton";
import { useAuth, Role } from "../../contexts/AuthContext";

function dashboardPathForRole(role: Role): string {
  if (role === "SUPER_ADMIN") return "/super-admin/dashboard";
  if (role === "TENANT_ADMIN") return "/tenant-admin/dashboard";
  if (
    role === "ORGANIZER" ||
    role === "CO_ORGANIZER" ||
    role === "GATE_SCANNER"
  ) {
    return "/organizer";
  }
  return "/attendee";
}

export default function PendingApproval() {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading || !user) return;
    if (user.status === "ACTIVE") {
      navigate(dashboardPathForRole(user.role), { replace: true });
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.status === "ACTIVE") {
    return <Navigate to={dashboardPathForRole(user.role)} replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950">
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-amber-900 via-orange-900 to-rose-900 overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523580494112-071dcb849a1d?auto=format&fit=crop&q=80')] opacity-10 mix-blend-overlay bg-cover bg-center" />

        <div className="relative z-10 w-full max-w-lg text-center lg:text-left">
          <Link to="/" className="inline-flex items-center gap-2 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              EventSphere
            </span>
          </Link>

          <div className="inline-flex p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-8">
            <Clock className="w-14 h-14 text-amber-200" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            Almost there
          </h1>
          <p className="text-lg text-orange-100 max-w-md">
            Your profile is being reviewed so we can keep the campus community
            safe and trusted.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-200/50 dark:border-amber-500/20">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Awaiting approval
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  Your account has been created and is awaiting approval from
                  your University Administrator.
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 text-center lg:text-left">
            We will email you at{" "}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {user.email}
            </span>{" "}
            once your access is approved. You can sign out and return later.
          </p>

          <DynamicButton
            type="button"
            variant="outline"
            className="w-full py-3 text-base font-semibold gap-2"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </DynamicButton>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Wrong account?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Sign in with a different email
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

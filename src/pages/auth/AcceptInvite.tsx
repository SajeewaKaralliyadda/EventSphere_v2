import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Globe, AlertCircle, KeyRound, CheckCircle2 } from "lucide-react";
import DynamicButton from "../../components/ui/DynamicButton";
import { supabase } from "../../lib/supabase";
import api from "../../lib/api";
import { useAuth, Role } from "../../contexts/AuthContext";
import logo from "../../assets/logo.png";

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all";

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

export default function AcceptInvite() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const [sessionReady, setSessionReady] = useState(false);
  const [inviteEmail, setInviteEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setInviteEmail(session.user.email ?? null);
        const meta = session.user.user_metadata as Record<string, string | undefined>;
        setFullName(meta?.full_name ?? meta?.fullName ?? "");
        setPhone(meta?.phone ?? "");
      }
      setSessionReady(true);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "No active invite session. Open the link from your email again.",
        );
      }

      const { error: pwError } = await supabase.auth.updateUser({
        password,
      });
      if (pwError) throw pwError;

      const meta = user.user_metadata as Record<string, string | undefined>;
      const role = (meta?.role as Role) || "CO_ORGANIZER";
      const tenantRaw = meta?.tenant_id ?? meta?.tenantId;
      const invitedBy = meta?.invited_by ?? meta?.invitedBy ?? null;

      const displayName =
        fullName.trim() ||
        meta?.full_name ||
        meta?.fullName ||
        user.email?.split("@")[0] ||
        "Team member";

      await api.post("/api/identity/users/register", {
        id: user.id,
        email: user.email,
        fullName: displayName,
        phone: phone.trim() || meta?.phone || "",
        role,
        status: "ACTIVE",
        tenantId: tenantRaw || null,
        invitedBy,
        attendeeProfile: null,
        organizerProfile: null,
      });

      setSuccess(true);
      await refreshProfile();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        try {
          const { data: me } = await api.get<{ role: Role; status: string }>(
            "/api/identity/users/me",
            {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            },
          );
          setTimeout(() => {
            navigate(dashboardPathForRole(me.role), { replace: true });
          }, 800);
          return;
        } catch {
          setTimeout(() => navigate("/login", { replace: true }), 1200);
          return;
        }
      }

      setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (err: unknown) {
      console.error(err);
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: string }).message)
          : "Could not complete setup. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!sessionReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!inviteEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 p-8">
        <div className="max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Invalid or expired link
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Open the invitation link from your email, or sign in if you already
            completed setup.
          </p>
          <Link
            to="/login"
            className="inline-block font-medium text-blue-600 dark:text-blue-400"
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950">
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80')] opacity-10 mix-blend-overlay bg-cover bg-center" />

        <div className="relative z-10 w-full max-w-lg">
          <Link to="/" className="inline-flex items-center gap-2 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center p-1">
              <img src={logo} alt="EventSphere Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              EventSphere
            </span>
          </Link>

          <div className="inline-flex p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-8">
            <KeyRound className="w-12 h-12 text-blue-200" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            Join the team
          </h1>
          <p className="text-lg text-blue-100 max-w-md">
            Set a secure password to activate your organizer account and access
            the dashboard.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Complete your invite
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Signed in as{" "}
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {inviteEmail}
              </span>
            </p>
          </div>

          {success && (
            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 p-4 rounded-xl flex items-start gap-3 text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <p>Account activated. Redirecting…</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Full name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Phone <span className="text-slate-400">(optional)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
                placeholder="+1 …"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                New password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Confirm password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>

            <DynamicButton
              type="submit"
              disabled={isLoading || success}
              className="w-full py-3 text-base font-bold"
            >
              {isLoading ? "Saving…" : "Activate account"}
            </DynamicButton>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Already set up?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

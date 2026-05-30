import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import DynamicButton from "../../components/ui/DynamicButton";
import { Calendar, Users, Ticket, Globe, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import logo from "../../assets/logo.png";

export default function LoginPage() {
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { status, role } = await login(email, password);

      const redirectUrl = sessionStorage.getItem("redirectAfterLogin");
      if (redirectUrl) {
        sessionStorage.removeItem("redirectAfterLogin");
      }

      if (status === "PENDING") {
        navigate("/pending-approval", { replace: true });
        return;
      }

      if (redirectUrl) {
        navigate(redirectUrl, { replace: true });
        return;
      }

      if (role === "SUPER_ADMIN") {
        navigate("/super-admin/dashboard", { replace: true });
      } else if (role === "TENANT_ADMIN") {
        navigate("/tenant-admin/dashboard", { replace: true });
      } else if (
        role === "ORGANIZER" ||
        role === "CO_ORGANIZER" ||
        role === "GATE_SCANNER"
      ) {
        navigate("/organizer", { replace: true });
      } else if (role === "ATTENDEE") {
        navigate("/attendee", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      // Translate Supabase AuthApiError (400) into a friendly message
      const isInvalidCreds =
        err?.status === 400 ||
        err?.message?.toLowerCase().includes("invalid login credentials") ||
        err?.message?.toLowerCase().includes("invalid email or password");
      const friendly = isInvalidCreds
        ? "Invalid email or password. Please try again."
        : (err?.message ?? "Failed to sign in. Please check your credentials.");
      setError(friendly);
      toast.error(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email address first, then click Forgot password.");
      return;
    }
    setForgotPasswordLoading(true);
    try {
      await resetPassword(email.trim());
      toast.success("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to send reset email. Please try again.");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950">
      {/* Left Side - Branding */}
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

          <h1 className="text-5xl font-extrabold text-white mb-6 leading-tight">
            Your Campus.
            <br />
            Your Events.
          </h1>
          <p className="text-lg text-blue-100 mb-12 max-w-md">
            The unified platform for discovering, managing, and experiencing
            university events like never before.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white">
              <Calendar className="w-6 h-6 text-blue-300 mb-2" />
              <div className="text-2xl font-bold">200+</div>
              <div className="text-sm text-blue-200">Events</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white">
              <Users className="w-6 h-6 text-purple-300 mb-2" />
              <div className="text-2xl font-bold">15K+</div>
              <div className="text-sm text-blue-200">Active Students</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white">
              <Ticket className="w-6 h-6 text-emerald-300 mb-2" />
              <div className="text-2xl font-bold">50K+</div>
              <div className="text-sm text-blue-200">Tickets</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Please enter your details to sign in.
            </p>
          </div>

          {/* Error Message පෙන්නන කොටස */}
          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-slate-700 dark:text-slate-300"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={forgotPasswordLoading}
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {forgotPasswordLoading ? "Sending…" : "Forgot password?"}
                </button>
              </div>
            </div>

            <DynamicButton
              type="submit"
              className="w-full py-3 text-base font-bold"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </DynamicButton>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Globe, Lock, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import logo from "../../assets/logo.png";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all";

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // ── Validation ───────────────────────────────────────────────
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      /**
       * When the user clicks the Supabase-generated reset link, Supabase
       * automatically parses the `access_token` from the URL hash and
       * establishes a temporary session client-side. We can therefore call
       * updateUser() directly — no manual token extraction needed.
       */
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      setIsSuccess(true);
      toast.success("Password updated successfully!");

      // Sign out the temporary session so the user logs in fresh
      await supabase.auth.signOut();

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2500);
    } catch (err: any) {
      const message =
        err?.message ?? "Failed to update password. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950">
      {/* Left side — branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80')] opacity-10 mix-blend-overlay bg-cover bg-center" />

        <div className="relative z-10 w-full max-w-lg">
          {/* Logo */}
          <div className="inline-flex items-center gap-2 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center p-1">
              <img src={logo} alt="EventSphere Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              EventSphere
            </span>
          </div>

          <h1 className="text-5xl font-extrabold text-white mb-6 leading-tight">
            Create a New
            <br />
            Password
          </h1>
          <p className="text-lg text-blue-100 max-w-md">
            Choose a strong password to keep your EventSphere account secure.
            You'll be redirected to login once it's updated.
          </p>

          {/* Security tips */}
          <div className="mt-10 space-y-3">
            {[
              "At least 6 characters long",
              "Mix of letters and numbers recommended",
              "Avoid reusing old passwords",
            ].map((tip) => (
              <div key={tip} className="flex items-center gap-3 text-blue-100">
                <div className="w-5 h-5 rounded-full bg-emerald-400/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                </div>
                <span className="text-sm">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24">
        <div className="w-full max-w-md space-y-8">

          {isSuccess ? (
            /* ── Success state ─────────────────────────────────────────── */
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
                Password Updated!
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-2">
                Your password has been changed successfully.
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Redirecting you to login…
              </p>
            </div>
          ) : (
            /* ── Form state ────────────────────────────────────────────── */
            <>
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 mb-4 lg:hidden">
                  <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Reset your password
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Enter and confirm your new password below.
                </p>
              </div>

              {/* Validation error banner */}
              {error && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start gap-3 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* New password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className={`${inputClass} pl-11 pr-12`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {/* Strength indicator */}
                  {newPassword.length > 0 && (
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            newPassword.length >= level * 4
                              ? level === 1
                                ? "bg-red-400"
                                : level === 2
                                  ? "bg-yellow-400"
                                  : "bg-emerald-500"
                              : "bg-slate-200 dark:bg-slate-700"
                          }`}
                        />
                      ))}
                      <span className="text-xs text-slate-400 ml-1 self-center">
                        {newPassword.length < 4
                          ? "Weak"
                          : newPassword.length < 8
                            ? "Fair"
                            : "Strong"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your new password"
                      className={`${inputClass} pl-11 pr-20 ${
                        confirmPassword.length > 0 && confirmPassword !== newPassword
                          ? "border-red-400 dark:border-red-500 focus:ring-red-400"
                          : confirmPassword.length > 0 && confirmPassword === newPassword
                            ? "border-emerald-400 dark:border-emerald-500 focus:ring-emerald-400"
                            : ""
                      }`}
                      autoComplete="new-password"
                    />
                    {/* Toggle Password button */}
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    {/* Match indicator icon */}
                    {confirmPassword.length > 0 && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {confirmPassword === newPassword ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Updating password…
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                Remembered it?{" "}
                <a
                  href="/login"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  Sign in
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

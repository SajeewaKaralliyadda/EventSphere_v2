import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Globe, Upload, AlertCircle } from "lucide-react";
import DynamicButton from "../../components/ui/DynamicButton";
import { supabase } from "../../lib/supabase";
import api from "../../lib/api";

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all";

const fileInputClass = `${inputClass} file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium dark:file:bg-slate-800 text-sm`;

interface PublicTenant {
  id: string;
  name: string;
  domain: string;
}

function normalizeDomain(domain: string): string {
  return domain.replace(/^@/, "").trim().toLowerCase();
}

/** True if the email's host equals the tenant domain or is a subdomain of it. */
function universityEmailMatchesDomain(
  email: string,
  tenantDomain: string,
): boolean {
  const norm = normalizeDomain(tenantDomain);
  if (!norm || !email.trim()) return false;
  const at = email.trim().toLowerCase().lastIndexOf("@");
  if (at === -1) return false;
  const host = email
    .trim()
    .toLowerCase()
    .slice(at + 1);
  return host === norm || host.endsWith("." + norm);
}

async function uploadStudentIdCard(file: File, userId: string): Promise<string> {
  const safeName = file.name.replace(/[^\w.-]/g, "_");
  const path = `${userId}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from("id-cards").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (!error) {
    const { data } = supabase.storage.from("id-cards").getPublicUrl(path);
    return data.publicUrl;
  }
  console.warn("id-cards storage upload failed, using mock URL", error);
  await new Promise((r) => setTimeout(r, 450));
  return `https://cdn.eventsphere.app/mock/id-cards/${userId}/${crypto.randomUUID()}`;
}

export default function SignUpPage() {
  const [role, setRole] = useState<"ATTENDEE" | "ORGANIZER">("ATTENDEE");
  const [isStudent, setIsStudent] = useState(false);
  const navigate = useNavigate();

  const [tenants, setTenants] = useState<PublicTenant[]>([]);
  const [tenantsLoading, setTenantsLoading] = useState(true);
  const [tenantsError, setTenantsError] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [address, setAddress] = useState("");
  const [faculty, setFaculty] = useState("");
  const [batchYear, setBatchYear] = useState("");
  const [universityEmail, setUniversityEmail] = useState("");
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [idCardUrl, setIdCardUrl] = useState<string | null>(null);
  const [idCardUploading, setIdCardUploading] = useState(false);

  const [clubName, setClubName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get<PublicTenant[]>("/api/public/tenants");
        if (!cancelled) setTenants(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setTenantsError("Could not load universities. Please refresh the page.");
          setTenants([]);
        }
      } finally {
        if (!cancelled) setTenantsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isStudent) {
      setTenantId(null);
      setIdCardFile(null);
      setIdCardUrl(null);
      setFaculty("");
      setBatchYear("");
      setUniversityEmail("");
    }
  }, [isStudent]);

  useEffect(() => {
    if (role === "ATTENDEE" && !isStudent) {
      setTenantId(null);
    }
  }, [role, isStudent]);

  const selectedTenant = tenantId
    ? tenants.find((t) => t.id === tenantId)
    : undefined;

  const handleIdCardChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError("");
    setIdCardFile(file ?? null);
    setIdCardUrl(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file for your student ID.");
      setIdCardFile(null);
      e.target.value = "";
      return;
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (role === "ORGANIZER") {
      if (!tenantId) {
        setError("Please select your university.");
        return;
      }
    }

    if (role === "ATTENDEE" && isStudent) {
      if (!tenantId) {
        setError("Please select your university.");
        return;
      }
      if (!selectedTenant) {
        setError("Invalid university selection.");
        return;
      }
      if (!universityEmail.trim()) {
        setError("University email is required.");
        return;
      }
      if (!universityEmailMatchesDomain(universityEmail, selectedTenant.domain)) {
        setError(
          `University email must use your institution's domain (@${normalizeDomain(selectedTenant.domain)}).`,
        );
        return;
      }
      if (!idCardFile && !idCardUrl) {
        setError("Please upload a photo of your student ID.");
        return;
      }
    }

    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        setError("Could not create account. Please try again.");
        return;
      }

      let finalIdCardUrl = idCardUrl;
      if (role === "ATTENDEE" && isStudent && idCardFile) {
        setIdCardUploading(true);
        try {
          finalIdCardUrl = await uploadStudentIdCard(
            idCardFile,
            authData.user.id,
          );
          setIdCardUrl(finalIdCardUrl);
        } finally {
          setIdCardUploading(false);
        }
      }

      const isPending =
        role === "ORGANIZER" || (role === "ATTENDEE" && isStudent);
      const status = isPending ? "PENDING" : "ACTIVE";

      const resolvedTenantId =
        role === "ORGANIZER"
          ? tenantId
          : role === "ATTENDEE" && isStudent
            ? tenantId
            : null;

      await api.post("/api/identity/users/register", {
        id: authData.user.id,
        email: email,
        fullName: fullName,
        phone: phone,
        role: role,
        status,
        tenantId: resolvedTenantId,
        invitedBy: null,
        attendeeProfile:
          role === "ATTENDEE"
            ? {
                address: address || null,
                isStudent: isStudent,
                faculty: isStudent ? faculty || null : null,
                batchYear: isStudent && batchYear ? parseInt(batchYear, 10) : null,
                universityEmail:
                  isStudent && universityEmail ? universityEmail : null,
                idCardUrl: isStudent ? finalIdCardUrl ?? null : null,
              }
            : null,
        organizerProfile:
          role === "ORGANIZER"
            ? {
                clubName: clubName,
                description: description,
                approvalDocumentUrl: null,
              }
            : null,
      });

      if (isPending) {
        navigate("/pending-approval", { replace: true });
      } else {
        navigate("/attendee", { replace: true });
      }
    } catch (err: unknown) {
      console.error("Sign up failed:", err);
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: string }).message)
          : "Registration failed. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950">
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523580494112-071dcb849a1d?auto=format&fit=crop&q=80')] opacity-10 mix-blend-overlay bg-cover bg-center" />

        <div className="relative z-10 w-full max-w-lg">
          <Link to="/" className="inline-flex items-center gap-2 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              EventSphere
            </span>
          </Link>

          <h1 className="text-5xl font-extrabold text-white mb-6 leading-tight">
            Join the Campus
            <br />
            Community
          </h1>
          <p className="text-lg text-blue-100 max-w-md">
            Create an account to discover events, manage your tickets, or start
            organizing your own campus experiences.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 py-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Create an account
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Choose your role and fill in your details.
            </p>
          </div>

          {(error || tenantsError) && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error || tenantsError}</p>
            </div>
          )}

          <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
            <button
              onClick={() => setRole("ATTENDEE")}
              type="button"
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                role === "ATTENDEE"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Student / Attendee
            </button>
            <button
              onClick={() => setRole("ORGANIZER")}
              type="button"
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                role === "ORGANIZER"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Event Organizer
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleSignUp}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+94 77 000 0000"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password
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
            </div>

            {role === "ATTENDEE" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main St, City, State"
                    className={inputClass}
                  />
                </div>

                <div className="flex items-center mt-6 mb-4">
                  <input
                    id="is-student"
                    type="checkbox"
                    checked={isStudent}
                    onChange={(e) => setIsStudent(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="is-student"
                    className="ml-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    I am a university student
                  </label>
                </div>

                {isStudent && (
                  <div className="space-y-5 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        University <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={tenantId ?? ""}
                        onChange={(e) =>
                          setTenantId(e.target.value || null)
                        }
                        disabled={tenantsLoading}
                        className={inputClass}
                      >
                        <option value="">
                          {tenantsLoading
                            ? "Loading universities…"
                            : "Select your university"}
                        </option>
                        {tenants.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Faculty / Major
                        </label>
                        <input
                          type="text"
                          required
                          value={faculty}
                          onChange={(e) => setFaculty(e.target.value)}
                          placeholder="e.g. Computer Science"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Batch / Year
                        </label>
                        <input
                          type="text"
                          required
                          value={batchYear}
                          onChange={(e) => setBatchYear(e.target.value)}
                          placeholder="e.g. 2026"
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        University Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={universityEmail}
                        onChange={(e) => setUniversityEmail(e.target.value)}
                        placeholder={
                          selectedTenant
                            ? `you@${normalizeDomain(selectedTenant.domain)}`
                            : "student@university.edu"
                        }
                        className={inputClass}
                      />
                      {selectedTenant && (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Must match @{normalizeDomain(selectedTenant.domain)}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Student ID photo <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleIdCardChange}
                          className={fileInputClass}
                        />
                      </div>
                      {idCardFile && (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Upload className="w-3.5 h-3.5" />
                          {idCardFile.name}
                          {idCardUploading && " — uploading…"}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {role === "ORGANIZER" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    University <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={tenantId ?? ""}
                    onChange={(e) => setTenantId(e.target.value || null)}
                    disabled={tenantsLoading}
                    className={inputClass}
                  >
                    <option value="">
                      {tenantsLoading
                        ? "Loading universities…"
                        : "Select your university"}
                    </option>
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Club / Society Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    placeholder="e.g. Computer Science Society"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe your organization..."
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </>
            )}

            <DynamicButton
              type="submit"
              disabled={isLoading || idCardUploading}
              className="w-full py-3 text-base font-bold mt-6"
            >
              {isLoading || idCardUploading
                ? "Processing..."
                : role === "ORGANIZER"
                  ? "Register & Request Approval"
                  : "Create Account"}
            </DynamicButton>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
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

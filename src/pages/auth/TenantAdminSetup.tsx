import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DynamicButton from '../../components/ui/DynamicButton';
import { Globe, Building2, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import api from '../../lib/api';
import logo from '../../assets/logo.png';

export default function TenantAdminSetup() {
  const { demoLoginAs } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tenantId = searchParams.get('tenantId');
  const token = searchParams.get('token');
  const queryEmail = searchParams.get('email');
  const queryName = searchParams.get('name');

  const [email, setEmail] = useState(queryEmail || 'admin@university.edu');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!tenantId) {
      setError('Invalid invite link. Missing tenant identifier.');
    }
  }, [tenantId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Create the user in Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Account creation failed. Please try again.');
      }

      // 2. Synchronize with the backend with TENANT_ADMIN role
      await api.post('/api/identity/users/register', {
        id: authData.user.id,
        email: email,
        fullName: queryName || 'Tenant Admin',
        phone: null,
        role: 'TENANT_ADMIN',
        status: 'ACTIVE',
        tenantId: tenantId,
        invitedBy: null,
        attendeeProfile: null,
        organizerProfile: null,
      });

      setIsSuccess(true);
      
      setTimeout(() => {
        window.location.href = '/tenant-admin'; // Force reload to apply session
      }, 1500);

    } catch (err: any) {
      console.error('Setup failed:', err);
      setError(err.message || 'Registration failed. Please contact support.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-200 dark:border-slate-800">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Account Activated!</h2>
          <p className="text-slate-500 dark:text-slate-400">
            Redirecting you to your University Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950">
      {/* Left Side - Branding & Welcome */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80')] opacity-10 mix-blend-overlay bg-cover bg-center" />
        
        <div className="relative z-10 w-full max-w-lg">
          <Link to="/" className="inline-flex items-center gap-2 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center p-1">
              <img src={logo} alt="EventSphere Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">EventSphere</span>
          </Link>

          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-8">
            <Building2 className="w-8 h-8 text-purple-300" />
          </div>

          <h1 className="text-5xl font-extrabold text-white mb-6 leading-tight">
            Welcome to EventSphere!
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-md font-medium">
            Set up your University Workspace.
          </p>
          <p className="text-blue-200/80 max-w-md">
            You've been invited to manage events, approve organizers, and oversee digital ticketing for your institution. Complete your account setup to get started.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Complete Setup</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Set a secure password for your Tenant Admin account.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Official Email</label>
                <input 
                  type="email" 
                  value={email}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed outline-none transition-all"
                />
                <p className="text-xs text-slate-500 mt-1">This email is tied to your university invitation.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Set Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <DynamicButton 
              type="submit" 
              className="w-full py-3 text-base font-bold"
              disabled={!!error && !password || isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2 justify-center">
                  <Loader2 className="w-5 h-5 animate-spin" /> Setting Up...
                </span>
              ) : 'Activate Account & Go to Dashboard'}
            </DynamicButton>
          </form>
        </div>
      </div>
    </div>
  );
}

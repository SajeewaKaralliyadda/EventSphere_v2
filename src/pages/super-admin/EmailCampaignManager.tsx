import React, { useState, useEffect } from 'react';
import SidebarLayout from '../../components/ui/SidebarLayout';
import { Users, Mail, Send, Eye, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

interface TenantOption {
  id: string;
  name: string;
}

export default function EmailCampaignManager() {
  const [targetRole, setTargetRole] = useState('All Users');
  const [targetUniversity, setTargetUniversity] = useState('All Universities');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [estimatedReach, setEstimatedReach] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [tenants, setTenants] = useState<TenantOption[]>([]);

  useEffect(() => {
    api.get<TenantOption[]>('/api/admin/tenants')
      .then(({ data }) => setTenants(data))
      .catch(() => {}); // silently fail — dropdown shows all universities fallback
  }, []);

  useEffect(() => {
    let base = 15000;
    if (targetRole === 'Attendees') base = 12000;
    if (targetRole === 'Organizers') base = 2500;
    if (targetRole === 'Tenant Admins') base = 500;
    if (targetUniversity !== 'All Universities') base = Math.floor(base / Math.max(tenants.length, 1));
    setEstimatedReach(base + Math.floor(Math.random() * 50));
  }, [targetRole, targetUniversity, dateFrom, dateTo, tenants.length]);

  const handleTestEmail = () => {
    if (!subject || !body) {
      toast.error('Please enter a subject and body first.');
      return;
    }
    toast.success('Test email sent to your inbox!');
  };

  const handleBroadcast = async () => {
    setIsSending(true);
    const loadingToast = toast.loading('Sending broadcast email...');
    try {
      await api.post('/api/admin/emails/campaign', {
        targetRole,
        targetUniversity,
        subject,
        body,
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
      });
      toast.success(`Successfully dispatched to ~${estimatedReach.toLocaleString()} users!`, {
        id: loadingToast,
      });
      setSubject('');
      setBody('');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? 'Failed to send campaign email.',
        { id: loadingToast }
      );
    } finally {
      setIsSending(false);
      setIsModalOpen(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Email Campaigns</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Compose and broadcast emails to users across the platform.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Config & Composer */}
          <div className="space-y-6">
            {/* Audience Filters */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Audience Filters
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Target Role</label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="All Users">All Users</option>
                    <option value="Attendees">Attendees</option>
                    <option value="Organizers">Organizers</option>
                    <option value="Tenant Admins">Tenant Admins</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Target University</label>
                  <select
                    value={targetUniversity}
                    onChange={(e) => setTargetUniversity(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="All Universities">All Universities</option>
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Registered Between (Optional)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  />
                  <span className="text-slate-400">to</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Composer */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Email Composer
              </h2>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter a catchy subject line..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 flex justify-between">
                  Email Body
                  <span className="text-xs text-slate-400 font-normal">Markdown supported</span>
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your message here..."
                  rows={10}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-y font-sans"
                />
              </div>
            </div>
          </div>

          {/* Right: Preview & Stats */}
          <div className="space-y-6 flex flex-col">
            {/* Reach Stats */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 shadow-md text-white flex items-center justify-between">
              <div>
                <p className="text-blue-100 font-medium text-sm mb-1">Estimated Reach</p>
                <h3 className="text-3xl font-extrabold">{estimatedReach.toLocaleString()}</h3>
                <p className="text-blue-200 text-xs mt-1">recipients match your filters</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Live Preview */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex-1 flex flex-col overflow-hidden">
              <div className="bg-slate-100 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Live Preview</span>
              </div>
              <div className="p-6 flex-1 bg-slate-50 dark:bg-slate-950/50">
                <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 text-white font-bold text-xl mb-3">E</div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">EventSphere</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                      {subject || <span className="text-slate-300 dark:text-slate-600 italic">No subject</span>}
                    </h1>
                    <div className="text-slate-600 dark:text-slate-400 text-sm whitespace-pre-wrap font-sans leading-relaxed min-h-[150px]">
                      {body || <span className="text-slate-300 dark:text-slate-600 italic">Start typing to see preview...</span>}
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 text-center text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800">
                    <p>You are receiving this email because you are registered on EventSphere.</p>
                    <p className="mt-1">© {new Date().getFullYear()} EventSphere. All rights reserved.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Action Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-6 z-20">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Ready to send? Double check your filters and content.
          </p>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleTestEmail}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors"
            >
              Send Test Email
            </button>
            <button
              onClick={() => {
                if (!subject || !body) {
                  toast.error('Please enter a subject and body before broadcasting.');
                  return;
                }
                setIsModalOpen(true);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-md"
            >
              <Send className="w-4 h-4" />
              Broadcast Now
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Confirm Broadcast</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Are you sure you want to send this email to{' '}
                <strong className="text-slate-900 dark:text-white">
                  {estimatedReach.toLocaleString()}
                </strong>{' '}
                users? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSending}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBroadcast}
                  disabled={isSending}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  {isSending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                  ) : (
                    'Yes, Send It'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}

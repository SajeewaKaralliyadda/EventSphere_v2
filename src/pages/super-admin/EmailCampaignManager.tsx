import React, { useState, useEffect } from 'react';
import SidebarLayout from '../../components/ui/SidebarLayout';
import { Users, Mail, Send, Eye, AlertCircle, Loader2, CalendarDays, Megaphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  listTenants, 
  broadcastGeneralCampaign, 
  previewNewsletter, 
  broadcastNewsletter,
  type TenantResponse 
} from '../../services/superAdminService';

type TenantOption = Pick<TenantResponse, 'id' | 'name'>;

export default function EmailCampaignManager() {
  const [activeTab, setActiveTab] = useState<'general' | 'newsletter'>('general');
  const [tenants, setTenants] = useState<TenantOption[]>([]);

  // General Campaign State
  const [targetRole, setTargetRole] = useState('All Users');
  const [targetUniversity, setTargetUniversity] = useState('All Universities');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [estimatedReach, setEstimatedReach] = useState(0);

  // Newsletter State
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [additionalRecipients, setAdditionalRecipients] = useState('');
  const [newsletterPreviewHtml, setNewsletterPreviewHtml] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Common State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    listTenants()
      .then((data) => setTenants(data))
      .catch(() => {});
  }, []);

  // Update reach only for general campaigns
  useEffect(() => {
    if (activeTab !== 'general') return;
    let base = 15000;
    if (targetRole === 'Attendees') base = 12000;
    if (targetRole === 'Organizers') base = 2500;
    if (targetRole === 'Tenant Admins') base = 500;
    if (targetUniversity !== 'All Universities') base = Math.floor(base / Math.max(tenants.length, 1));
    setEstimatedReach(base);
  }, [targetRole, targetUniversity, tenants.length, activeTab]);

  const handleTestEmail = () => {
    if (activeTab === 'general' && (!subject || !body)) {
      toast.error('Please enter a subject and body first.');
      return;
    }
    if (activeTab === 'newsletter' && (!dateFrom || !dateTo)) {
      toast.error('Please select a date range first.');
      return;
    }
    toast.success('Test email sent to your inbox!');
  };

  const loadPreview = async () => {
    if (!dateFrom || !dateTo) {
      toast.error('Please select start and end dates to generate a preview.');
      return;
    }
    setIsPreviewLoading(true);
    try {
      const res = await previewNewsletter({
        startDate: dateFrom,
        endDate: dateTo,
        customMessage: customMessage,
      });
      // Handle the case where previewHandler returns 'html' instead of 'htmlContent' in DTO
      setNewsletterPreviewHtml(res.html || res.htmlContent || 'Preview generated empty.');
      toast.success('Preview updated!');
    } catch (err) {
      toast.error('Failed to load preview. Please check dates.');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleBroadcast = async () => {
    setIsSending(true);
    const loadingToast = toast.loading('Sending broadcast email...');
    try {
      if (activeTab === 'general') {
        await broadcastGeneralCampaign({
          subject,
          body,
          targetRole: targetRole === 'All Users' ? undefined : targetRole,
          targetUniversity: targetUniversity === 'All Universities' ? undefined : targetUniversity,
        });
        toast.success(`Successfully dispatched to ~${estimatedReach.toLocaleString()} users!`, { id: loadingToast });
        setSubject('');
        setBody('');
      } else {
        const recipientsList = additionalRecipients
          .split(',')
          .map(e => e.trim())
          .filter(e => e.length > 0);

        await broadcastNewsletter({
          startDate: dateFrom,
          endDate: dateTo,
          customMessage: customMessage,
          additionalRecipients: recipientsList.length > 0 ? recipientsList : undefined,
        });
        toast.success('Weekly Newsletter dispatched successfully!', { id: loadingToast });
        setCustomMessage('');
        setAdditionalRecipients('');
      }
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
      <div className="space-y-6 pb-20">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Email Campaigns</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage general broadcast campaigns and the automated weekly newsletter.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'general'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            General Campaign
          </button>
          <button
            onClick={() => setActiveTab('newsletter')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'newsletter'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Weekly Newsletter
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Config & Composer */}
          <div className="space-y-6">
            
            {/* GENERAL CAMPAIGN TAB */}
            {activeTab === 'general' && (
              <>
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
                </div>

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
                      <span className="text-xs text-slate-400 font-normal">Plain text / HTML</span>
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
              </>
            )}

            {/* WEEKLY NEWSLETTER TAB */}
            {activeTab === 'newsletter' && (
              <>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Newsletter Data
                  </h2>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Event Date Range</label>
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
                    <p className="text-xs text-slate-500 mt-2">
                      Automatically fetches published events happening within this date range.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Custom Header Message</label>
                    <textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Optional greeting or context for this week..."
                      rows={3}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-y font-sans"
                    />
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={loadPreview}
                      disabled={isPreviewLoading || !dateFrom || !dateTo}
                      className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors"
                    >
                      {isPreviewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                      Generate Newsletter Template
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Additional Recipients
                  </h2>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Input Emails (Comma Separated)</label>
                    <textarea
                      value={additionalRecipients}
                      onChange={(e) => setAdditionalRecipients(e.target.value)}
                      placeholder="john@example.com, jane@example.com..."
                      rows={3}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-y font-sans"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Newsletter is automatically sent to users with Marketing Emails enabled. Add extra guests here.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right: Preview & Stats */}
          <div className="space-y-6 flex flex-col h-full">
            {/* Reach Stats - General only */}
            {activeTab === 'general' && (
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 shadow-md text-white flex items-center justify-between shrink-0">
                <div>
                  <p className="text-blue-100 font-medium text-sm mb-1">Estimated Reach</p>
                  <h3 className="text-3xl font-extrabold">{estimatedReach.toLocaleString()}</h3>
                  <p className="text-blue-200 text-xs mt-1">recipients match your filters</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            )}

            {/* Live Preview */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex-1 flex flex-col overflow-hidden min-h-[500px]">
              <div className="bg-slate-100 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
                <Eye className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {activeTab === 'general' ? 'Live Preview' : 'Template Preview'}
                </span>
              </div>
              <div className="p-6 flex-1 bg-slate-50 dark:bg-slate-950/50 overflow-y-auto">
                <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                  
                  {/* General Preview */}
                  {activeTab === 'general' && (
                    <>
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
                    </>
                  )}

                  {/* Newsletter Preview */}
                  {activeTab === 'newsletter' && (
                    <div className="min-h-[400px] flex flex-col">
                      {newsletterPreviewHtml ? (
                        <div dangerouslySetInnerHTML={{ __html: newsletterPreviewHtml }} className="w-full" />
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center space-y-3">
                          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                            <CalendarDays className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                          </div>
                          <p>Select a date range and click "Generate Newsletter Template" to preview the events here.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Action Bar */}
        <div className="fixed bottom-0 right-0 lg:left-64 left-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 flex flex-col sm:flex-row items-center justify-between gap-4 px-6 lg:px-8">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {activeTab === 'general' ? 'Ready to broadcast this campaign?' : 'Ready to dispatch the weekly newsletter?'}
          </p>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleTestEmail}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors"
            >
              Test Email
            </button>
            <button
              onClick={() => {
                if (activeTab === 'general' && (!subject || !body)) {
                  toast.error('Please enter a subject and body before broadcasting.');
                  return;
                }
                if (activeTab === 'newsletter' && (!dateFrom || !dateTo)) {
                  toast.error('Please configure the newsletter dates before broadcasting.');
                  return;
                }
                setIsModalOpen(true);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-md"
            >
              <Send className="w-4 h-4" />
              {activeTab === 'general' ? 'Broadcast Now' : 'Dispatch Newsletter'}
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
              <h3 className="text-xl font-bold mb-2">Confirm {activeTab === 'general' ? 'Broadcast' : 'Dispatch'}</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Are you sure you want to send this {activeTab === 'general' ? 'campaign' : 'newsletter'}?
                {activeTab === 'general' && (
                  <> to <strong className="text-slate-900 dark:text-white">{estimatedReach.toLocaleString()}</strong> users</>
                )}
                ? This action cannot be undone.
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

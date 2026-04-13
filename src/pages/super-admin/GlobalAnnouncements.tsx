import React, { useState, useEffect } from 'react';
import SidebarLayout from '../../components/ui/SidebarLayout';
import { Megaphone, Send, Clock, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

interface Announcement {
  id: string;
  message: string;
  color: 'blue' | 'yellow' | 'red';
  expiryDate: string;
  createdAt: string;
}

const COLOR_STYLE: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export default function GlobalAnnouncements() {
  const [message, setMessage] = useState('');
  const [color, setColor] = useState<'blue' | 'yellow' | 'red'>('blue');
  const [expiryDate, setExpiryDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get<Announcement[]>('/api/admin/announcements');
      setAnnouncements(data);
    } catch {
      // Silently fail — show empty state
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message || !expiryDate) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await api.post<Announcement>('/api/admin/announcements', {
        message,
        color,
        expiryDate,
      });

      // Also keep the localStorage banner so GlobalNavbar updates immediately
      localStorage.setItem('globalAnnouncement', JSON.stringify({ message, color, expiryDate }));
      window.dispatchEvent(new Event('announcementUpdated'));

      setAnnouncements((prev) => [data, ...prev]);
      toast.success('Global announcement published!');
      setMessage('');
      setExpiryDate('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to publish announcement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Global Announcements</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Publish platform-wide alert banners to all users.
          </p>
        </div>

        {/* Publish Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            New Announcement
          </h2>

          <form onSubmit={handlePublish} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Announcement Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. Scheduled maintenance on Sunday at 2 AM UTC."
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Banner Color</label>
              <div className="flex gap-4">
                {(['blue', 'yellow', 'red'] as const).map((c) => (
                  <label key={c} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="color"
                      value={c}
                      checked={color === c}
                      onChange={() => setColor(c)}
                      className="w-4 h-4"
                    />
                    <span className={`px-3 py-1 rounded-md text-sm font-medium ${COLOR_STYLE[c]}`}>
                      {c === 'blue' ? 'Info (Blue)' : c === 'yellow' ? 'Warning (Yellow)' : 'Critical (Red)'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full md:w-1/2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-md"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Publishing...</>
                ) : (
                  <><Send className="w-5 h-5" /> Publish Announcement</>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Active Announcements List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-500" />
            Published Announcements
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
              No active announcements. Publish one above.
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{ann.message}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${COLOR_STYLE[ann.color]}`}>
                        {ann.color.charAt(0).toUpperCase() + ann.color.slice(1)}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Expires: {ann.expiryDate}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}

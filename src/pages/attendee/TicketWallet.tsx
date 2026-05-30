import React, { useState, useEffect } from 'react';
import { LayoutGrid, List, Calendar, MapPin, Ticket as TicketIcon, Star, AlertTriangle, Loader2, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'motion/react';
import DigitalPassModal from '../../components/ui/DigitalPassModal';
import ReviewModal from '../../components/ui/ReviewModal';
import { cn } from '../../lib/utils';
import {
  getUpcomingTickets, getPastTickets, requestRefund, submitReview,
  MyTicketResponse,
} from '../../services/attendeeService';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return iso; }
}
function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

// Adapter so DigitalPassModal keeps working with the real response shape
function toPassTicket(t: MyTicketResponse) {
  return {
    id: t.bookingId,
    title: t.eventTitle,
    date: formatDate(t.eventDate),
    time: formatTime(t.eventDate),
    location: t.location ?? 'TBA',
    thumbnail: t.coverImageUrl || `https://picsum.photos/seed/${t.eventId}/800/600`,
    tenantName: '',
    tier: `Rs. ${t.totalAmount}`,
    status: t.status,
    attendeeName: 'Attendee',
  };
}

// Refund modal component (inline, no separate file)
function RefundModal({
  ticket,
  onClose,
  onSuccess,
}: {
  ticket: MyTicketResponse;
  onClose: () => void;
  onSuccess: (bookingId: string) => void;
}) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) { toast.error('Please provide a reason for the refund.'); return; }
    setSubmitting(true);
    try {
      await requestRefund(ticket.bookingId, reason);
      toast.success('Refund requested — your ticket is now REFUND_PENDING. The QR code has been invalidated.');
      onSuccess(ticket.bookingId);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Refund request failed. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="h-1 bg-rose-500 w-full" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-bold flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-rose-500" /> Request Refund</h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
            Requesting a refund for <strong className="text-slate-900 dark:text-white">{ticket.eventTitle}</strong>. This will immediately invalidate your ticket QR code.
          </p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Reason for refund *</label>
              <textarea
                rows={4}
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Please describe why you are requesting a refund..."
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-rose-500 transition-all resize-none text-sm"
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !reason.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors disabled:opacity-60"
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default function TicketWallet() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [upcoming, setUpcoming] = useState<MyTicketResponse[]>([]);
  const [past, setPast] = useState<MyTicketResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [refundTicket, setRefundTicket] = useState<MyTicketResponse | null>(null);
  const [reviewTicket, setReviewTicket] = useState<MyTicketResponse | null>(null);
  const [submittedReviews, setSubmittedReviews] = useState<Record<string, boolean>>({});
  const [refundedIds, setRefundedIds] = useState<Set<string>>(new Set());

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const [up, ps] = await Promise.all([getUpcomingTickets(), getPastTickets()]);
      setUpcoming(up);
      setPast(ps);
    } catch (err: any) {
      setError('Could not load tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleRefundSuccess = (bookingId: string) => {
    setRefundedIds(prev => new Set([...prev, bookingId]));
    setRefundTicket(null);
    // Optimistically move to refund_pending state in upcoming list
    setUpcoming(prev => prev.map(t => t.bookingId === bookingId ? { ...t, status: 'REFUND_PENDING' } : t));
  };

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!reviewTicket) return;
    try {
      await submitReview(reviewTicket.eventId, rating, comment || undefined);
      setSubmittedReviews(prev => ({ ...prev, [reviewTicket.bookingId]: true }));
      toast.success('Review submitted successfully!');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Could not submit review. You may not have attended this event.';
      toast.error(msg);
    }
  };

  const displayedTickets = activeTab === 'upcoming' ? upcoming : past;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-10 w-56 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl" />
          <div className="h-10 w-20 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse h-64" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
        <p className="text-slate-700 dark:text-slate-300 font-bold mb-4">{error}</p>
        <button onClick={fetchTickets} className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl w-fit">
          <button onClick={() => setActiveTab('upcoming')} className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all", activeTab === 'upcoming' ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white")}>
            Upcoming ({upcoming.length})
          </button>
          <button onClick={() => setActiveTab('past')} className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all", activeTab === 'past' ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white")}>
            Past Events ({past.length})
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchTickets} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-500">
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl">
            {(['grid', 'list'] as const).map(v => (
              <button key={v} onClick={() => setViewMode(v)} className={cn("p-2 rounded-lg transition-all", viewMode === v ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")}>
                {v === 'grid' ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tickets */}
      {displayedTickets.length === 0 ? (
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <TicketIcon className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">No {activeTab} tickets</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">You don't have any {activeTab} event registrations in your wallet.</p>
        </div>
      ) : (
        <div className={cn("grid gap-6", viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
          {displayedTickets.map(ticket => {
            const isRefundPending = refundedIds.has(ticket.bookingId) || ticket.status === 'REFUND_PENDING';
            const isRefunded = ticket.status === 'REFUNDED';
            const isInvalidated = isRefundPending || isRefunded;
            
            return (
              <div
                key={ticket.bookingId}
                onClick={() => activeTab === 'upcoming' && !isInvalidated && setSelectedTicket(toPassTicket(ticket))}
                className={cn(
                  "group bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border rounded-3xl overflow-hidden transition-all",
                  viewMode === 'list' ? "flex flex-col sm:flex-row h-auto sm:h-44" : "flex flex-col",
                  activeTab === 'upcoming' && !isInvalidated ? "cursor-pointer hover:shadow-xl hover:border-blue-500/50 dark:hover:border-blue-500/50 border-slate-200 dark:border-slate-800" : "border-slate-200 dark:border-slate-800",
                  isInvalidated ? "opacity-70" : ""
                )}
              >
                {/* Thumbnail */}
                <div className={cn("relative overflow-hidden", viewMode === 'list' ? "w-full sm:w-48 h-48 sm:h-full shrink-0" : "w-full aspect-video")}>
                  <img
                    src={ticket.coverImageUrl || `https://picsum.photos/seed/${ticket.eventId}/800/600`}
                    alt={ticket.eventTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  {(activeTab === 'past' || isInvalidated) && (
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="bg-slate-900/80 text-white px-3 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider border border-white/20">
                        {isRefunded ? 'Refunded' : isRefundPending ? 'Refund Pending' : 'Ended'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="mb-2">
                    <h3 className="font-bold text-lg line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{ticket.eventTitle}</h3>
                  </div>
                  <div className="space-y-2 mb-4 mt-auto">
                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                      <Calendar className="w-4 h-4 mr-2 shrink-0" />
                      <span className="truncate">{formatDate(ticket.eventDate)} • {formatTime(ticket.eventDate)}</span>
                    </div>
                    {ticket.location && (
                      <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                        <MapPin className="w-4 h-4 mr-2 shrink-0" />
                        <span className="truncate">{ticket.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg truncate">
                      Rs. {ticket.totalAmount} paid
                    </span>

                    {activeTab === 'past' ? (
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          if (!submittedReviews[ticket.bookingId]) setReviewTicket(ticket);
                        }}
                        disabled={submittedReviews[ticket.bookingId]}
                        className={cn(
                          "text-sm font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shrink-0",
                          submittedReviews[ticket.bookingId]
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                            : "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20"
                        )}
                      >
                        {submittedReviews[ticket.bookingId] ? 'Reviewed ✓' : <><Star className="w-3.5 h-3.5" /> Review</>}
                      </button>
                    ) : (
                      !isInvalidated && (
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); setRefundTicket(ticket); }}
                          className="text-sm font-medium px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors shrink-0"
                        >
                          Refund
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Digital Pass Modal */}
      <DigitalPassModal isOpen={!!selectedTicket} onClose={() => setSelectedTicket(null)} ticket={selectedTicket} />

      {/* Review Modal */}
      <ReviewModal
        isOpen={!!reviewTicket}
        onClose={() => setReviewTicket(null)}
        onSubmit={handleReviewSubmit}
        eventTitle={reviewTicket?.eventTitle || ''}
      />

      {/* Refund Modal */}
      <AnimatePresence>
        {refundTicket && (
          <RefundModal
            ticket={refundTicket}
            onClose={() => setRefundTicket(null)}
            onSuccess={handleRefundSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

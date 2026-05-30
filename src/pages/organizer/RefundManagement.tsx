import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SidebarLayout from '../../components/ui/SidebarLayout';
import {
  Search, Filter, RefreshCw, CheckCircle, XCircle, AlertCircle,
  X, DollarSign, Mail, Loader2, Send,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import {
  listEvents, listBookings, generateReceiptPreview, dispatchReceipt, issueRefund,
  type EventResponse, type BookingResponse, type ReceiptPreviewResponse,
} from '../../services/organizerService';

// ─── Refund Modal ──────────────────────────────────────────────────────────────

interface RefundModalProps {
  booking: BookingResponse;
  onClose: () => void;
  onSuccess: (bookingId: string) => void;
}

function RefundModal({ booking, onClose, onSuccess }: RefundModalProps) {
  const [percentage, setPercentage] = useState<number | ''>(100);
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const base = Number(booking.totalAmount) || 0;
  const refundAmount = percentage !== '' ? ((base * (percentage as number)) / 100).toFixed(2) : '0.00';

  const handleConfirm = async () => {
    if (percentage === '' || (percentage as number) <= 0) {
      toast.error('Enter a refund percentage greater than 0.');
      return;
    }
    setIsProcessing(true);
    try {
      await issueRefund(booking.id, percentage as number, reason.trim() || undefined);
      toast.success('Refund processed successfully via Stripe!');
      onSuccess(booking.id);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? err.response?.data?.message ?? 'Stripe refund failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Process Refund</h3>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-6 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Booking ID</span>
              <span className="font-mono text-xs text-slate-700 dark:text-slate-300">{booking.id.slice(0, 8)}…</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Purchaser</span>
              <span className="font-medium text-slate-900 dark:text-white">{booking.purchaserEmail}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700 mt-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Amount Paid</span>
              <span className="font-bold text-lg text-slate-900 dark:text-white">Rs. {base.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Refund Percentage (%)</label>
              <div className="relative">
                <input type="number" min="1" max="100" value={percentage}
                  onChange={e => {
                    const v = e.target.value;
                    if (v === '') { setPercentage(''); return; }
                    const n = Number(v);
                    if (n >= 1 && n <= 100) setPercentage(n);
                  }}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-blue-500" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">%</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                <DollarSign className="w-5 h-5" />
                <span className="font-medium">Final Refund Amount</span>
              </div>
              <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300">Rs. {refundAmount}</span>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Reason <span className="text-slate-400 font-normal">(optional)</span></label>
              <textarea rows={2} value={reason} onChange={e => setReason(e.target.value)}
                placeholder="e.g. Event cancelled due to weather"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button onClick={handleConfirm} disabled={isProcessing || percentage === ''}
              className="px-5 py-2.5 rounded-xl font-medium bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
              {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing Stripe…</> : 'Confirm & Refund'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Receipt Preview Modal ────────────────────────────────────────────────────

interface ReceiptModalProps {
  preview: ReceiptPreviewResponse;
  onClose: () => void;
}

function ReceiptModal({ preview, onClose }: ReceiptModalProps) {
  const [htmlBody, setHtmlBody] = useState(preview.suggestedHtmlBody);
  const [isDispatching, setIsDispatching] = useState(false);

  const handleDispatch = async () => {
    setIsDispatching(true);
    try {
      await dispatchReceipt(preview.booking.id, htmlBody);
      toast.success('Receipt email dispatched to attendee!');
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to dispatch receipt.');
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-xl font-bold">Receipt Preview</h3>
            <p className="text-sm text-slate-500 mt-0.5">Subject: <span className="font-medium">{preview.emailSubject}</span></p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* HTML Preview */}
        <div className="flex-1 overflow-auto p-6">
          <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">Email Preview</p>
          <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
            <iframe
              srcDoc={htmlBody}
              title="Receipt preview"
              className="w-full h-80 bg-white"
              sandbox="allow-same-origin"
            />
          </div>
          <div className="mt-4">
            <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">Edit HTML Body (optional)</p>
            <textarea
              rows={6}
              value={htmlBody}
              onChange={e => setHtmlBody(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs resize-none"
            />
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <p className="text-sm text-slate-500">
            Sending to <span className="font-medium text-slate-700 dark:text-slate-300">{preview.booking.purchaserEmail}</span>
          </p>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button onClick={handleDispatch} disabled={isDispatching}
              className="px-5 py-2.5 rounded-xl font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
              {isDispatching ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><Send className="w-4 h-4" /> Confirm & Send</>}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RefundManagement() {
  const { user } = useAuth();

  // ── Event selector ─────────────────────────────────────────────────────────
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    listEvents(user.id)
      .then(data => { setEvents(data); if (data.length > 0) setSelectedEventId(data[0].id); })
      .catch(() => toast.error('Failed to load events.'))
      .finally(() => setIsLoadingEvents(false));
  }, [user?.id]);

  // ── Bookings list ──────────────────────────────────────────────────────────
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [search, setSearch] = useState('');

  const fetchBookings = useCallback(async () => {
    if (!selectedEventId) return;
    setIsLoadingBookings(true);
    try {
      const data = await listBookings(selectedEventId);
      setBookings(data);
    } catch {
      toast.error('Failed to load bookings.');
    } finally {
      setIsLoadingBookings(false);
    }
  }, [selectedEventId]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const filtered = bookings.filter(b => {
    const q = search.toLowerCase();
    return (
      b.purchaserEmail.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q) ||
      b.status.toLowerCase().includes(q)
    );
  });

  // ── Receipt (two-step) ─────────────────────────────────────────────────────
  const [generatingReceiptId, setGeneratingReceiptId] = useState<string | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<ReceiptPreviewResponse | null>(null);

  const handleGenerateReceipt = async (booking: BookingResponse) => {
    setGeneratingReceiptId(booking.id);
    try {
      const preview = await generateReceiptPreview(booking.id);
      setReceiptPreview(preview);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to generate receipt preview.');
    } finally {
      setGeneratingReceiptId(null);
    }
  };

  // ── Refund ─────────────────────────────────────────────────────────────────
  const [refundTarget, setRefundTarget] = useState<BookingResponse | null>(null);

  const handleRefundSuccess = (bookingId: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'REFUNDED' } : b));
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400';
      case 'REFUNDED': return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
      case 'CANCELLED': return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400';
      default: return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
    }
  };

  return (
    <SidebarLayout>
      <div className="max-w-6xl mx-auto pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Booking Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Send receipts and process refunds for bookings across your events.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          {/* Event picker */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">Event:</label>
            {isLoadingEvents ? (
              <div className="flex items-center gap-2 text-sm text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
            ) : (
              <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none">
                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
              </select>
            )}
          </div>

          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Search by email or status…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>

          <button onClick={fetchBookings} disabled={isLoadingBookings}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <RefreshCw className={`w-4 h-4 ${isLoadingBookings ? 'animate-spin text-blue-500' : ''}`} /> Refresh
          </button>
        </div>

        {/* Bookings Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
                  <th className="p-4 font-medium">Booking ID</th>
                  <th className="p-4 font-medium">Purchaser</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {isLoadingBookings ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" /> Loading bookings…
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    {selectedEventId ? 'No bookings found.' : 'Select an event to view bookings.'}
                  </td></tr>
                ) : filtered.map(booking => {
                  const isGenReceiptLoading = generatingReceiptId === booking.id;
                  const canRefund = booking.status === 'CONFIRMED' && booking.stripePaymentIntentId;
                  const alreadyRefunded = booking.status === 'REFUNDED';
                  return (
                    <tr key={booking.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <span className="font-mono text-xs text-slate-500">{booking.id.slice(0, 8)}…</span>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-slate-900 dark:text-white text-sm">{booking.purchaserEmail}</div>
                      </td>
                      <td className="p-4 font-medium text-slate-900 dark:text-white">
                        Rs. {Number(booking.totalAmount).toFixed(2)}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusBadge(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-500">
                        {booking.createdAt ? format(new Date(booking.createdAt), 'MMM dd, yyyy') : '—'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Send Receipt (2-step) */}
                          <button
                            onClick={() => handleGenerateReceipt(booking)}
                            disabled={isGenReceiptLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                            title="Generate & preview receipt"
                          >
                            {isGenReceiptLoading
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Mail className="w-3.5 h-3.5" />}
                            Receipt
                          </button>

                          {/* Refund */}
                          {alreadyRefunded ? (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 text-slate-400 text-xs font-medium rounded-lg">
                              <CheckCircle className="w-3.5 h-3.5" /> Refunded
                            </span>
                          ) : (
                            <button
                              onClick={() => setRefundTarget(booking)}
                              disabled={!canRefund}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-700 dark:text-red-400 text-xs font-bold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              title={canRefund ? 'Process Stripe refund' : 'No payment intent — cannot refund'}
                            >
                              <XCircle className="w-3.5 h-3.5" /> Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Receipt Preview Modal (Step 1 + 2) */}
      <AnimatePresence>
        {receiptPreview && (
          <ReceiptModal
            preview={receiptPreview}
            onClose={() => setReceiptPreview(null)}
          />
        )}
      </AnimatePresence>

      {/* Refund Modal */}
      <AnimatePresence>
        {refundTarget && (
          <RefundModal
            booking={refundTarget}
            onClose={() => setRefundTarget(null)}
            onSuccess={handleRefundSuccess}
          />
        )}
      </AnimatePresence>
    </SidebarLayout>
  );
}

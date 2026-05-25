import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SidebarLayout from '../../components/ui/SidebarLayout';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  X,
  DollarSign
} from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { useEffect } from 'react';
import { format } from 'date-fns';

export default function RefundManagement() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundPercentage, setRefundPercentage] = useState<number | ''>(100);

  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [declineRequestId, setDeclineRequestId] = useState<string | null>(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/organizer/refunds/pending');
      setRequests(res.data);
    } catch (e) {
      toast.error('Failed to fetch pending refunds');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleProcessClick = (request: any) => {
    setSelectedRequest(request);
    setRefundPercentage(100);
    setIsRefundModalOpen(true);
  };

  const handleDeclineClick = (id: string) => {
    setDeclineRequestId(id);
    setDeclineReason('');
    setIsDeclineModalOpen(true);
  };

  const handleConfirmDecline = async () => {
    if (!declineReason.trim()) {
      toast.error("Please provide a reason for declining.");
      return;
    }
    try {
      await api.post(`/api/organizer/refunds/${declineRequestId}/decline`, { reason: declineReason });
      toast.success("Refund declined.");
      setRequests(requests.filter(req => req.id !== declineRequestId));
    } catch (e) {
      toast.error("Failed to decline refund.");
    } finally {
      setIsDeclineModalOpen(false);
      setDeclineRequestId(null);
    }
  };

  const handleConfirmRefund = async () => {
    if (!selectedRequest) return;
    try {
      await api.post(`/api/organizer/refunds/${selectedRequest.id}/process`);
      toast.success("Refund processed successfully.");
      setRequests(requests.filter(req => req.id !== selectedRequest.id));
    } catch (e) {
      toast.error("Failed to process refund.");
    } finally {
      setIsRefundModalOpen(false);
      setSelectedRequest(null);
    }
  };

  const baseAmount = selectedRequest?.amount || selectedRequest?.booking?.amountPaid || 0;
  const calculatedRefund = selectedRequest && refundPercentage !== '' 
    ? (baseAmount * (refundPercentage / 100)).toFixed(2) 
    : '0.00';

  return (
    <SidebarLayout>
      <div className="max-w-6xl mx-auto pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Refund Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Review and process attendee cancellation requests.</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search requests..." 
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Filter className="w-4 h-4" /> Filter
            </button>
            <button onClick={fetchRequests} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-500' : ''}`} /> Refresh
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
                  <th className="p-4 font-medium">Attendee Name</th>
                  <th className="p-4 font-medium">Event</th>
                  <th className="p-4 font-medium">Ticket Type</th>
                  <th className="p-4 font-medium">Amount Paid</th>
                  <th className="p-4 font-medium">Request Date</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">Loading requests...</td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                      No pending cancellation requests.
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 font-medium text-slate-900 dark:text-white">{req.booking?.attendee?.fullName || 'Anonymous'}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">{req.booking?.event?.title || 'Unknown Event'}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-medium">
                          {req.booking?.ticketType || 'Ticket'}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-slate-900 dark:text-white">Rs. {(req.amount || req.booking?.amountPaid || 0).toFixed(2)}</td>
                      <td className="p-4 text-slate-500 dark:text-slate-400 text-sm">{req.requestDate ? format(new Date(req.requestDate), 'MMM dd, yyyy') : 'N/A'}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleProcessClick(req)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Process Refund
                          </button>
                          <button 
                            onClick={() => handleDeclineClick(req.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-700 dark:text-red-400 text-xs font-bold rounded-lg transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Decline
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Process Refund Modal */}
      <AnimatePresence>
        {isRefundModalOpen && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsRefundModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Process Refund</h3>
                  <button onClick={() => setIsRefundModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Attendee</span>
                    <span className="font-medium text-slate-900 dark:text-white">{selectedRequest.booking?.attendee?.fullName || 'Anonymous'}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Ticket Type</span>
                    <span className="font-medium text-slate-900 dark:text-white">{selectedRequest.booking?.ticketType || 'Ticket'}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700 mt-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Amount Paid</span>
                    <span className="font-bold text-lg text-slate-900 dark:text-white">Rs. {(selectedRequest.amount || selectedRequest.booking?.amountPaid || 0).toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-sm font-medium mb-2">Refund Percentage (%)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        min="0"
                        max="100"
                        value={refundPercentage}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') setRefundPercentage('');
                          else {
                            const num = Number(val);
                            if (num >= 0 && num <= 100) setRefundPercentage(num);
                          }
                        }}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">%</div>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                      <DollarSign className="w-5 h-5" />
                      <span className="font-medium">Final Refund Amount</span>
                    </div>
                    <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                      Rs. {calculatedRefund}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button 
                    onClick={() => setIsRefundModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleConfirmRefund}
                    disabled={refundPercentage === ''}
                    className="px-5 py-2.5 rounded-xl font-medium bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Confirm & Refund
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Decline Reason Modal */}
      <AnimatePresence>
        {isDeclineModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsDeclineModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6 text-red-600 dark:text-red-400">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold">Decline Refund</h3>
                  </div>
                  <button onClick={() => setIsDeclineModalOpen(false)} className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  Please provide a reason for declining this refund request. This will be visible to the attendee.
                </p>

                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-sm font-medium mb-2">Reason</label>
                    <textarea 
                      required
                      rows={3}
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                      placeholder="e.g. Past the 24-hour cancellation window..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button 
                    onClick={() => setIsDeclineModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleConfirmDecline}
                    disabled={!declineReason.trim()}
                    className="px-5 py-2.5 rounded-xl font-medium bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Confirm Decline
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </SidebarLayout>
  );
}

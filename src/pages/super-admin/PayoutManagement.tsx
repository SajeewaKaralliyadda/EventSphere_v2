import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DollarSign,
  TrendingUp,
  CheckCircle,
  X,
  Search,
  Filter,
  Building2,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import DynamicButton from '../../components/ui/DynamicButton';
import SidebarLayout from '../../components/ui/SidebarLayout';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface Payout {
  id: string;
  tenant: string;
  totalSales: number;
  feePercentage: number;
  netPayout: number;
  status: 'PENDING' | 'PAID';
  date: string;
  transactionRef?: string;
}

export default function PayoutManagement() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPayouts = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get<Payout[]>('/api/admin/payouts');
      setPayouts(data);
    } catch (err: any) {
      toast.error('Failed to load payout records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const totalRevenue = payouts.reduce(
    (acc, curr) => acc + (curr.totalSales - curr.netPayout),
    0
  );
  const pendingPayouts = payouts
    .filter((p) => p.status === 'PENDING')
    .reduce((acc, curr) => acc + curr.netPayout, 0);

  const filteredPayouts = payouts.filter(
    (p) =>
      p.tenant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMarkAsPaidClick = (payout: Payout) => {
    setSelectedPayout(payout);
    setTransactionRef('');
    setIsModalOpen(true);
  };

  const handleConfirmPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayout || !transactionRef) return;
    setIsSubmitting(true);
    try {
      const { data } = await api.post<Payout>(
        `/api/admin/payouts/${selectedPayout.id}/mark-paid`,
        { transactionRef }
      );
      setPayouts((prev) =>
        prev.map((p) => (p.id === data.id ? data : p))
      );
      toast.success('Payout marked as paid!');
      setIsModalOpen(false);
      setSelectedPayout(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to update payout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
    }).format(amount);

  const glassCard =
    'bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm';

  return (
    <SidebarLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payout Management</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage funds owed to Universities and track platform revenue.
            </p>
          </div>
          <button
            onClick={fetchPayouts}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`${glassCard} p-6 flex items-center gap-6`}>
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                Total Platform Revenue
              </p>
              <h2 className="text-3xl font-bold">{formatCurrency(totalRevenue)}</h2>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                EventSphere's Cut
              </p>
            </div>
          </div>

          <div className={`${glassCard} p-6 flex items-center gap-6`}>
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <DollarSign className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                Pending Payouts
              </p>
              <h2 className="text-3xl font-bold">{formatCurrency(pendingPayouts)}</h2>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                Money owed to Tenants
              </p>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className={`${glassCard} overflow-hidden`}>
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-xl font-bold">Payout Records</h2>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search tenants or IDs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                />
              </div>
              <button className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
                    <th className="px-6 py-4 font-medium">Payout ID &amp; Date</th>
                    <th className="px-6 py-4 font-medium">Tenant Name</th>
                    <th className="px-6 py-4 font-medium">Total Sales</th>
                    <th className="px-6 py-4 font-medium">Fee (%)</th>
                    <th className="px-6 py-4 font-medium">Net Payout</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800/50">
                  {filteredPayouts.length > 0 ? (
                    filteredPayouts.map((payout) => (
                      <tr
                        key={payout.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900 dark:text-white">
                            {payout.id.substring(0, 8).toUpperCase()}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {payout.date}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          {payout.tenant}
                        </td>
                        <td className="px-6 py-4">{formatCurrency(payout.totalSales)}</td>
                        <td className="px-6 py-4 text-slate-500">{payout.feePercentage}%</td>
                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                          {formatCurrency(payout.netPayout)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                              payout.status === 'PAID'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                            }`}
                          >
                            {payout.status === 'PAID' ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <AlertCircle className="w-3 h-3" />
                            )}
                            {payout.status}
                          </span>
                          {payout.transactionRef && (
                            <div className="text-[10px] text-slate-500 mt-1">
                              Ref: {payout.transactionRef}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {payout.status === 'PENDING' ? (
                            <button
                              onClick={() => handleMarkAsPaidClick(payout)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
                            >
                              Mark as Paid
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium px-3 py-1.5">
                              Completed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-12 text-center text-slate-500 dark:text-slate-400"
                      >
                        {searchTerm
                          ? 'No payouts found matching your search.'
                          : 'No payout records yet.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isModalOpen && selectedPayout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Record Payout
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Marking payout for {selectedPayout.tenant}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Net Payout Amount</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {formatCurrency(selectedPayout.netPayout)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Payout ID</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white font-mono">
                      {selectedPayout.id.substring(0, 8).toUpperCase()}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleConfirmPayout}>
                  <div className="space-y-2 mb-8">
                    <label className="block text-sm font-medium text-slate-900 dark:text-white">
                      Transaction Reference Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TRX-123456789"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Enter the bank reference or transaction ID for record keeping.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-4 py-3 rounded-xl font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <DynamicButton type="submit" className="flex-1 py-3" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        'Confirm Payout'
                      )}
                    </DynamicButton>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </SidebarLayout>
  );
}

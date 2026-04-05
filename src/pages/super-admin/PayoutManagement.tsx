import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  X, 
  Search, 
  Filter, 
  ArrowLeft,
  Building2,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DynamicButton from '../../components/ui/DynamicButton';

// Mock Data
const MOCK_PAYOUTS = [
  {
    id: 'PO-1001',
    tenant: 'University of Moratuwa',
    totalSales: 500000,
    feePercentage: 5,
    netPayout: 475000,
    status: 'Pending',
    date: '2026-04-01'
  },
  {
    id: 'PO-1002',
    tenant: 'University of Colombo',
    totalSales: 200000,
    feePercentage: 5,
    netPayout: 190000,
    status: 'Paid',
    date: '2026-03-28',
    transactionRef: 'TRX-9928172'
  },
  {
    id: 'PO-1003',
    tenant: 'SLIIT',
    totalSales: 850000,
    feePercentage: 5,
    netPayout: 807500,
    status: 'Pending',
    date: '2026-04-02'
  },
  {
    id: 'PO-1004',
    tenant: 'University of Peradeniya',
    totalSales: 150000,
    feePercentage: 5,
    netPayout: 142500,
    status: 'Paid',
    date: '2026-03-15',
    transactionRef: 'TRX-1123984'
  }
];

export default function PayoutManagement() {
  const navigate = useNavigate();
  const [payouts, setPayouts] = useState(MOCK_PAYOUTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<any>(null);
  const [transactionRef, setTransactionRef] = useState('');

  // Calculate Stats
  const totalRevenue = payouts.reduce((acc, curr) => acc + (curr.totalSales - curr.netPayout), 0);
  const pendingPayouts = payouts.filter(p => p.status === 'Pending').reduce((acc, curr) => acc + curr.netPayout, 0);

  const filteredPayouts = payouts.filter(p => 
    p.tenant.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMarkAsPaidClick = (payout: any) => {
    setSelectedPayout(payout);
    setTransactionRef('');
    setIsModalOpen(true);
  };

  const handleConfirmPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayout || !transactionRef) return;

    setPayouts(payouts.map(p => 
      p.id === selectedPayout.id 
        ? { ...p, status: 'Paid', transactionRef } 
        : p
    ));
    
    setIsModalOpen(false);
    setSelectedPayout(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate('/super-admin')}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payout Management</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage funds owed to Universities and track platform revenue.</p>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Platform Revenue</p>
              <h2 className="text-3xl font-bold">{formatCurrency(totalRevenue)}</h2>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">EventSphere's Cut</p>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <DollarSign className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Pending Payouts</p>
              <h2 className="text-3xl font-bold">{formatCurrency(pendingPayouts)}</h2>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">Money owed to Tenants</p>
            </div>
          </div>
        </div>

        {/* Data Table Section */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
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
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
                  <th className="px-6 py-4 font-medium">Payout ID & Date</th>
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
                    <tr key={payout.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-white">{payout.id}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{payout.date}</div>
                      </td>
                      <td className="px-6 py-4 font-medium flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        {payout.tenant}
                      </td>
                      <td className="px-6 py-4">{formatCurrency(payout.totalSales)}</td>
                      <td className="px-6 py-4 text-slate-500">{payout.feePercentage}%</td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{formatCurrency(payout.netPayout)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          payout.status === 'Paid' 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' 
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                        }`}>
                          {payout.status === 'Paid' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {payout.status}
                        </span>
                        {payout.transactionRef && (
                          <div className="text-[10px] text-slate-500 mt-1">Ref: {payout.transactionRef}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {payout.status === 'Pending' ? (
                          <button 
                            onClick={() => handleMarkAsPaidClick(payout)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
                          >
                            Mark as Paid
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium px-3 py-1.5">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      No payouts found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Record Payout</h3>
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
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(selectedPayout.netPayout)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Payout ID</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{selectedPayout.id}</span>
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
                    <DynamicButton type="submit" className="flex-1 py-3">
                      Confirm Payout
                    </DynamicButton>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

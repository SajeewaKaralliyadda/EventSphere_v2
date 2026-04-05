import React, { useState } from 'react';
import SidebarLayout from '../../components/ui/SidebarLayout';
import { Tag, Plus, Trash2, Edit2, Percent, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

interface PromoCode {
  id: string;
  code: string;
  type: 'percentage' | 'flat';
  value: number;
  usageLimit: number;
  used: number;
  status: 'Active' | 'Expired';
}

const MOCK_PROMOS: PromoCode[] = [
  { id: '1', code: 'EARLYBIRD20', type: 'percentage', value: 20, usageLimit: 100, used: 45, status: 'Active' },
  { id: '2', code: 'STUDENT50', type: 'flat', value: 50, usageLimit: 200, used: 200, status: 'Expired' },
];

export default function PromoManagement() {
  const [promos, setPromos] = useState<PromoCode[]>(MOCK_PROMOS);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'flat'>('percentage');
  const [value, setValue] = useState('');
  const [usageLimit, setUsageLimit] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !value || !usageLimit) {
      toast.error('Please fill in all fields');
      return;
    }

    const newPromo: PromoCode = {
      id: Date.now().toString(),
      code: code.toUpperCase(),
      type,
      value: Number(value),
      usageLimit: Number(usageLimit),
      used: 0,
      status: 'Active'
    };

    setPromos([newPromo, ...promos]);
    setIsCreating(false);
    setCode('');
    setValue('');
    setUsageLimit('');
    toast.success('Promo code created successfully!');
  };

  const handleDelete = (id: string) => {
    setPromos(promos.filter(p => p.id !== id));
    toast.success('Promo code deleted');
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Promo Codes</h1>
            <p className="text-slate-500 dark:text-slate-400">Create and manage discount codes for your events.</p>
          </div>
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            {isCreating ? 'Cancel' : 'Create Promo Code'}
          </button>
        </div>

        {isCreating && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">New Promo Code</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Promo Code Name</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. EARLYBIRD20"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Discount Type</label>
                <div className="flex bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setType('percentage')}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${type === 'percentage' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    <Percent className="w-4 h-4" /> Percentage
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('flat')}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${type === 'flat' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    <DollarSign className="w-4 h-4" /> Flat Amount
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Discount Value</label>
                <input 
                  type="number" 
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={type === 'percentage' ? 'e.g. 20' : 'e.g. 50'}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Usage Limit</label>
                <input 
                  type="number" 
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors">
                  Save Promo Code
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4 font-bold text-sm text-slate-500 dark:text-slate-400">Code</th>
                  <th className="p-4 font-bold text-sm text-slate-500 dark:text-slate-400">Discount</th>
                  <th className="p-4 font-bold text-sm text-slate-500 dark:text-slate-400">Usage</th>
                  <th className="p-4 font-bold text-sm text-slate-500 dark:text-slate-400">Status</th>
                  <th className="p-4 font-bold text-sm text-slate-500 dark:text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {promos.map((promo) => (
                  <tr key={promo.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 inline-block px-2 py-1 rounded">
                        {promo.code}
                      </div>
                    </td>
                    <td className="p-4 font-medium">
                      {promo.type === 'percentage' ? `${promo.value}%` : `$${promo.value}`}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden w-24">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${(promo.used / promo.usageLimit) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-500">{promo.used}/{promo.usageLimit}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        promo.status === 'Active' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {promo.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDelete(promo.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {promos.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">
                      No promo codes found. Create one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

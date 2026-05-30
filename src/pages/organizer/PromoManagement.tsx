import React, { useState, useEffect, useCallback } from 'react';
import SidebarLayout from '../../components/ui/SidebarLayout';
import { Tag, Plus, Trash2, Percent, DollarSign, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import {
  listEvents,
  listPromoCodes,
  createPromoCode,
  deactivatePromoCode,
  type EventResponse,
  type PromoCodeResponse,
} from '../../services/organizerService';

export default function PromoManagement() {
  const { user } = useAuth();

  // ── Event selector ─────────────────────────────────────────────────────────
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    setIsLoadingEvents(true);
    listEvents(user.id)
      .then(data => {
        setEvents(data);
        if (data.length > 0) setSelectedEventId(data[0].id);
      })
      .catch(() => toast.error('Failed to load events.'))
      .finally(() => setIsLoadingEvents(false));
  }, [user?.id]);

  // ── Promo codes list ───────────────────────────────────────────────────────
  const [promos, setPromos] = useState<PromoCodeResponse[]>([]);
  const [isLoadingPromos, setIsLoadingPromos] = useState(false);

  const fetchPromos = useCallback(async () => {
    if (!selectedEventId) return;
    setIsLoadingPromos(true);
    try {
      const data = await listPromoCodes(selectedEventId);
      setPromos(data);
    } catch {
      toast.error('Failed to load promo codes.');
    } finally {
      setIsLoadingPromos(false);
    }
  }, [selectedEventId]);

  useEffect(() => { fetchPromos(); }, [fetchPromos]);

  // ── Create form ────────────────────────────────────────────────────────────
  const [isCreating, setIsCreating] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FLAT'>('PERCENTAGE');
  const [value, setValue] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) { toast.error('Promo code name is required.'); return; }
    if (!value || Number(value) <= 0) { toast.error('Discount value must be greater than 0.'); return; }
    if (!selectedEventId) { toast.error('Please select an event first.'); return; }

    if (discountType === 'PERCENTAGE' && Number(value) > 100) {
      toast.error('Percentage discount cannot exceed 100%.');
      return;
    }

    setIsSaving(true);
    try {
      const created = await createPromoCode(selectedEventId, {
        code: code.toUpperCase().trim(),
        discountType,
        discountValue: parseFloat(value),
        maxUses: usageLimit ? parseInt(usageLimit) : null,
        validUntil: validUntil ? `${validUntil}T23:59:59` : null,
      });
      setPromos(prev => [created, ...prev]);
      // Reset form
      setCode('');
      setValue('');
      setUsageLimit('');
      setValidUntil('');
      setIsCreating(false);
      toast.success(`Promo code "${created.code}" created!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to create promo code.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Deactivate (delete) promo ──────────────────────────────────────────────
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeactivate = async (promo: PromoCodeResponse) => {
    setDeletingId(promo.id);
    try {
      await deactivatePromoCode(promo.id);
      setPromos(prev => prev.filter(p => p.id !== promo.id));
      toast.success(`"${promo.code}" deactivated.`);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to deactivate promo code.');
    } finally {
      setDeletingId(null);
    }
  };

  const usagePercent = (p: PromoCodeResponse) =>
    p.maxUses ? Math.round((p.usesCount / p.maxUses) * 100) : 0;

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Promo Codes</h1>
            <p className="text-slate-500 dark:text-slate-400">
              Create and manage discount codes for your events.
            </p>
          </div>
          <button
            onClick={() => setIsCreating(v => !v)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            {isCreating ? 'Cancel' : 'Create Promo Code'}
          </button>
        </div>

        {/* Event Selector */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
            Event:
          </label>
          {isLoadingEvents ? (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading events...
            </div>
          ) : events.length === 0 ? (
            <span className="text-sm text-slate-400">No events found. Create an event first.</span>
          ) : (
            <select
              value={selectedEventId}
              onChange={e => setSelectedEventId(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none text-sm"
            >
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
          )}
          <button
            onClick={fetchPromos}
            disabled={isLoadingPromos || !selectedEventId}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            title="Refresh promo codes"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingPromos ? 'animate-spin text-blue-500' : ''}`} />
          </button>
        </div>

        {/* Create Form */}
        {isCreating && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">New Promo Code</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Promo Code <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
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
                    onClick={() => setDiscountType('PERCENTAGE')}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      discountType === 'PERCENTAGE'
                        ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <Percent className="w-4 h-4" /> Percentage
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('FLAT')}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      discountType === 'FLAT'
                        ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <DollarSign className="w-4 h-4" /> Flat Amount
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Discount Value{' '}
                  <span className="text-slate-400">
                    ({discountType === 'PERCENTAGE' ? '%' : 'Rs.'})
                  </span>
                  <span className="text-red-500"> *</span>
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  placeholder={discountType === 'PERCENTAGE' ? 'e.g. 20' : 'e.g. 500'}
                  min="0.01"
                  step="0.01"
                  max={discountType === 'PERCENTAGE' ? '100' : undefined}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Usage Limit{' '}
                  <span className="text-slate-400 font-normal">(optional — blank = unlimited)</span>
                </label>
                <input
                  type="number"
                  value={usageLimit}
                  onChange={e => setUsageLimit(e.target.value)}
                  placeholder="e.g. 100"
                  min="1"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Valid Until{' '}
                  <span className="text-slate-400 font-normal">(optional — blank = no expiry)</span>
                </label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={e => setValidUntil(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? 'Saving...' : 'Save Promo Code'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Promo Codes Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4 font-bold text-sm text-slate-500 dark:text-slate-400">Code</th>
                  <th className="p-4 font-bold text-sm text-slate-500 dark:text-slate-400">Discount</th>
                  <th className="p-4 font-bold text-sm text-slate-500 dark:text-slate-400">Usage</th>
                  <th className="p-4 font-bold text-sm text-slate-500 dark:text-slate-400">Expires</th>
                  <th className="p-4 font-bold text-sm text-slate-500 dark:text-slate-400">Status</th>
                  <th className="p-4 font-bold text-sm text-slate-500 dark:text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingPromos ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                      Loading promo codes...
                    </td>
                  </tr>
                ) : promos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                      {selectedEventId
                        ? 'No promo codes for this event. Create one to get started.'
                        : 'Select an event above to manage its promo codes.'}
                    </td>
                  </tr>
                ) : (
                  promos.map(promo => {
                    const pct = usagePercent(promo);
                    const isDeleting = deletingId === promo.id;
                    return (
                      <tr
                        key={promo.id}
                        className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 inline-block px-2 py-1 rounded">
                            {promo.code}
                          </div>
                        </td>
                        <td className="p-4 font-medium">
                          {promo.discountType === 'PERCENTAGE'
                            ? `${promo.discountValue}%`
                            : `Rs. ${promo.discountValue}`}
                        </td>
                        <td className="p-4">
                          {promo.maxUses ? (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden w-24">
                                <div
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-sm text-slate-500">
                                {promo.usesCount}/{promo.maxUses}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">
                              {promo.usesCount} / ∞
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                          {promo.validUntil
                            ? new Date(promo.validUntil).toLocaleDateString()
                            : '—'}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              promo.active
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {promo.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeactivate(promo)}
                            disabled={isDeleting || !promo.active}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            title={promo.active ? 'Deactivate promo code' : 'Already inactive'}
                          >
                            {isDeleting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

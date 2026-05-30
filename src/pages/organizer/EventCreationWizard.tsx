import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check, ChevronRight, ChevronLeft, Upload, Image as ImageIcon, FileText,
  Calendar, Clock, MapPin, Ticket, DollarSign, X, Plus, Info, Loader2,
} from 'lucide-react';
import SidebarLayout from '../../components/ui/SidebarLayout';
import DynamicButton from '../../components/ui/DynamicButton';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { createEvent, createTicketTier } from '../../services/organizerService';

const STEPS = [
  { id: 1, title: 'Basic Info' },
  { id: 2, title: 'Details' },
  { id: 3, title: 'Tickets' },
];

const CATEGORIES = ['ACADEMIC', 'CULTURAL', 'SPORTS', 'WORKSHOP', 'SOCIAL', 'OTHER'];

interface TicketTier {
  id: string;
  name: string;
  price: string;
  quantity: string;
}

export default function EventCreationWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── Step tracker ───────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Step 1: Basic Info ─────────────────────────────────────────────────────
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  // Cover image — file + local preview URL (created via URL.createObjectURL)
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPEG, PNG, WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be smaller than 10 MB.');
      return;
    }
    // Revoke previous object URL to avoid memory leaks
    if (coverImagePreview) URL.revokeObjectURL(coverImagePreview);
    setCoverImageFile(file);
    setCoverImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveCoverImage = () => {
    if (coverImagePreview) URL.revokeObjectURL(coverImagePreview);
    setCoverImageFile(null);
    setCoverImagePreview(null);
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  // Approval Document
  const [approvalDocFile, setApprovalDocFile] = useState<File | null>(null);
  const [approvalDocPreview, setApprovalDocPreview] = useState<string | null>(null);
  const approvalDocInputRef = useRef<HTMLInputElement>(null);

  const handleApprovalDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('Please select an image or PDF file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be smaller than 10 MB.');
      return;
    }
    if (approvalDocPreview && !approvalDocPreview.startsWith('data:') && approvalDocPreview !== 'pdf-icon') {
      URL.revokeObjectURL(approvalDocPreview);
    }
    setApprovalDocFile(file);
    if (file.type.startsWith('image/')) {
        setApprovalDocPreview(URL.createObjectURL(file));
    } else {
        setApprovalDocPreview('pdf-icon');
    }
  };

  const handleRemoveApprovalDoc = () => {
    if (approvalDocPreview && !approvalDocPreview.startsWith('data:') && approvalDocPreview !== 'pdf-icon') {
      URL.revokeObjectURL(approvalDocPreview);
    }
    setApprovalDocFile(null);
    setApprovalDocPreview(null);
    if (approvalDocInputRef.current) approvalDocInputRef.current.value = '';
  };


  // ── Step 2: Event Details ──────────────────────────────────────────────────
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [venue, setVenue] = useState('');
  const [noLimit, setNoLimit] = useState(false);
  const [totalCapacity, setTotalCapacity] = useState('');

  // ── Step 3: Ticket Tiers ───────────────────────────────────────────────────
  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>([
    { id: '1', name: 'General Admission', price: '0', quantity: '50' },
  ]);

  const handleAddTier = () => {
    setTicketTiers(prev => [
      ...prev,
      { id: Date.now().toString(), name: '', price: '', quantity: '' },
    ]);
  };

  const handleRemoveTier = (id: string) => {
    setTicketTiers(prev => prev.filter(t => t.id !== id));
  };

  const updateTier = (id: string, field: keyof TicketTier, value: string) => {
    setTicketTiers(prev => prev.map(t => (t.id === id ? { ...t, [field]: value } : t)));
  };

  // ── Navigation ─────────────────────────────────────────────────────────────
  const handleNext = async () => {
    if (currentStep === 1) {
      if (!title.trim()) { toast.error('Event title is required.'); return; }
      if (!category) { toast.error('Please select a category.'); return; }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!eventDate || !eventTime) { toast.error('Please set a date and time.'); return; }
      if (!venue.trim()) { toast.error('Venue is required.'); return; }
      if (!noLimit && !totalCapacity) {
        toast.error('Please specify a total capacity or check "No Limit".');
        return;
      }
      setCurrentStep(3);
    } else {
      // Step 3: validate tiers then submit
      if (ticketTiers.length === 0) { toast.error('Add at least one ticket tier.'); return; }
      for (const t of ticketTiers) {
        if (!t.name.trim()) { toast.error('All tier names are required.'); return; }
        if (t.price === '' || Number(t.price) < 0) { toast.error('Tier price must be ≥ 0.'); return; }
        if (!t.quantity || Number(t.quantity) < 1) { toast.error('Tier quantity must be ≥ 1.'); return; }
      }
      if (!noLimit && totalCapacity) {
        const totalTierQty = ticketTiers.reduce((s, t) => s + (parseInt(t.quantity) || 0), 0);
        if (totalTierQty > parseInt(totalCapacity)) {
          toast.error(
            `Tier quantities (${totalTierQty}) exceed event capacity (${totalCapacity}).`
          );
          return;
        }
      }
      await handleSubmit();
    }
  };

  /**
   * Main submission handler:
   * 1. POST event with multipart/form-data
   * 2. POST each ticket tier sequentially, gracefully showing any capacity errors
   */
  const handleSubmit = async () => {
    if (!user?.id) { toast.error('Not authenticated.'); return; }
    setIsSubmitting(true);

    try {
      // ── 1. Create the event ───────────────────────────────────────────────
      const isoDateTime = `${eventDate}T${eventTime}:00`;
      const createdEvent = await createEvent(user.id, {
        title: title.trim(),
        description: description.trim(),
        eventDate: isoDateTime,
        location: venue.trim(),
        totalCapacity: noLimit ? 999999 : parseInt(totalCapacity),
        category: category.toUpperCase(), // CRITICAL FIX
        coverImage: coverImageFile,
        approvalDocument: approvalDocFile,
      });

      toast.success(`Event "${createdEvent.title}" created!`);

      // ── 2. Create ticket tiers ────────────────────────────────────────────
      let tierErrors = 0;
      for (const tier of ticketTiers) {
        try {
          await createTicketTier(createdEvent.id, {
            name: tier.name.trim(),
            price: parseFloat(tier.price) || 0,
            capacity: parseInt(tier.quantity),
          });
        } catch (err: any) {
          tierErrors++;
          const msg = err.response?.data?.message ?? `Failed to create tier "${tier.name}"`;
          toast.error(msg, { duration: 6000 });
        }
      }

      if (tierErrors === 0) {
        toast.success('All ticket tiers created!');
      }

      navigate('/organizer/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Failed to create event. Please try again.';
      toast.error(msg, { duration: 6000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Create New Event</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Fill out the details below to publish a new event to the university portal.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            />
            {STEPS.map(step => (
              <div key={step.id} className="relative flex flex-col items-center gap-2 z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                    currentStep > step.id
                      ? 'bg-blue-600 text-white'
                      : currentStep === step.id
                      ? 'bg-blue-600 text-white ring-4 ring-blue-600/20'
                      : 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                </div>
                <span
                  className={`text-xs font-medium absolute -bottom-6 whitespace-nowrap ${
                    currentStep >= step.id ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-10 shadow-sm min-h-[400px] mt-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* ── STEP 1: Basic Info ─────────────────────────────────────── */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-6">Basic Information</h2>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Event Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. Annual Tech Symposium 2026"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Describe your event..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
                      ))}
                    </select>
                  </div>

                  {/* Cover Image with live preview */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Event Cover Image</label>

                    {coverImagePreview ? (
                      <div className="relative rounded-2xl overflow-hidden border-2 border-blue-500">
                        <img
                          src={coverImagePreview}
                          alt="Cover preview"
                          className="w-full h-56 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex flex-col justify-end p-4">
                          <p className="text-white text-sm font-medium truncate">{coverImageFile?.name}</p>
                          <p className="text-white/70 text-xs mt-0.5">
                            {coverImageFile ? (coverImageFile.size / 1024 / 1024).toFixed(2) + ' MB' : ''}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoverImage}
                          className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                          title="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="block border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group">
                        <input
                          ref={coverInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleCoverImageChange}
                          className="hidden"
                        />
                        <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <ImageIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                          Drag &amp; drop your image here
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          or click to browse (1920×1080px recommended, max 10 MB)
                        </p>
                      </label>
                    )}
                  </div>

                  {/* Approval Document with live preview */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Approval Document (Image/PDF)</label>

                    {approvalDocPreview ? (
                      <div className="relative rounded-2xl overflow-hidden border-2 border-blue-500 bg-slate-50 dark:bg-slate-800 flex items-center justify-center h-56">
                        {approvalDocPreview === 'pdf-icon' ? (
                          <div className="flex flex-col items-center">
                            <FileText className="w-16 h-16 text-red-500 mb-2" />
                            <span className="text-slate-700 dark:text-slate-300 font-medium px-4 text-center">{approvalDocFile?.name}</span>
                          </div>
                        ) : (
                           <img
                             src={approvalDocPreview}
                             alt="Document preview"
                             className="w-full h-56 object-cover"
                           />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex flex-col justify-end p-4 pointer-events-none">
                          <p className="text-white text-sm font-medium truncate">{approvalDocFile?.name}</p>
                          <p className="text-white/70 text-xs mt-0.5">
                            {approvalDocFile ? (approvalDocFile.size / 1024 / 1024).toFixed(2) + ' MB' : ''}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveApprovalDoc}
                          className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors z-10"
                          title="Remove document"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="block border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group">
                        <input
                          ref={approvalDocInputRef}
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleApprovalDocChange}
                          className="hidden"
                        />
                        <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                          Drag &amp; drop your document here
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          or click to browse (PDF or Image, max 10 MB)
                        </p>
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* ── STEP 2: Event Details ──────────────────────────────────── */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-6">Event Details</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Event Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="date"
                          value={eventDate}
                          onChange={e => setEventDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Event Time <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="time"
                          value={eventTime}
                          onChange={e => setEventTime(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Venue <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={venue}
                        onChange={e => setVenue(e.target.value)}
                        placeholder="e.g. Main Campus Auditorium"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium">Total Capacity</label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={noLimit}
                          onChange={e => {
                            setNoLimit(e.target.checked);
                            if (e.target.checked) setTotalCapacity('');
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-slate-600 dark:text-slate-400">No Limit</span>
                      </label>
                    </div>
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      value={totalCapacity}
                      onChange={e => setTotalCapacity(e.target.value)}
                      disabled={noLimit}
                      min="1"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {!noLimit && totalCapacity && (
                      <div className="mt-3 flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20">
                        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Ticket tiers cannot exceed a combined total of{' '}
                          <strong>{totalCapacity}</strong> tickets.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── STEP 3: Ticket Tiers ───────────────────────────────────── */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-6">Ticketing Tiers</h2>

                  <div className="space-y-4 mb-6">
                    <AnimatePresence>
                      {ticketTiers.map(tier => (
                        <motion.div
                          key={tier.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                          className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 relative"
                        >
                          {ticketTiers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveTier(tier.id)}
                              className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Tier Name</label>
                              <div className="relative">
                                <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                  type="text"
                                  value={tier.name}
                                  onChange={e => updateTier(tier.id, 'name', e.target.value)}
                                  placeholder="e.g. General Admission"
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Price (Rs.)</label>
                              <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                  type="number"
                                  value={tier.price}
                                  onChange={e => updateTier(tier.id, 'price', e.target.value)}
                                  placeholder="0 for free"
                                  min="0"
                                  step="0.01"
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Quantity</label>
                              <input
                                type="number"
                                value={tier.quantity}
                                onChange={e => updateTier(tier.id, 'quantity', e.target.value)}
                                placeholder="e.g. 100"
                                min="1"
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddTier}
                    className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-slate-500 dark:text-slate-400 font-medium hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Another Tier
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Footer Navigation */}
          <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="px-6 py-3 rounded-xl font-medium flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>

            <DynamicButton
              onClick={handleNext}
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl font-bold flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Publishing...
                </>
              ) : currentStep === 3 ? (
                'Publish Event'
              ) : (
                <>
                  Continue <ChevronRight className="w-5 h-5" />
                </>
              )}
            </DynamicButton>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

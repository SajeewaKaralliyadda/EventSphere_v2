import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, GraduationCap, Upload, CheckCircle2, Loader2, AlertCircle,
  Building2, Mail, MapPin, BookOpen, Calendar, X, ArrowRight
} from 'lucide-react';
import SidebarLayout from '../../components/ui/SidebarLayout';
import DynamicButton from '../../components/ui/DynamicButton';
import toast from 'react-hot-toast';
import {
  completeProfile, CompleteProfilePayload,
} from '../../services/attendeeService';
import { getActiveUniversities, TenantSummaryResponse } from '../../services/publicService';

export default function AttendeeOnboarding() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [isStudent, setIsStudent] = useState(false);
  const [address, setAddress] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [universityEmail, setUniversityEmail] = useState('');
  const [faculty, setFaculty] = useState('');
  const [batchYear, setBatchYear] = useState('');
  const [idCard, setIdCard] = useState<File | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // UI state
  const [universities, setUniversities] = useState<TenantSummaryResponse[]>([]);
  const [loadingUnis, setLoadingUnis] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // Fetch universities for the student dropdown
  useEffect(() => {
    if (!isStudent) return;
    setLoadingUnis(true);
    getActiveUniversities()
      .then(setUniversities)
      .catch(() => toast.error('Could not load university list.'))
      .finally(() => setLoadingUnis(false));
  }, [isStudent]);

  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      toast.error('Only JPG, PNG, WebP, or PDF files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be smaller than 5MB.');
      return;
    }
    setIdCard(file);
    if (file.type.startsWith('image/')) {
      setIdCardPreview(URL.createObjectURL(file));
    } else {
      setIdCardPreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files[0] ?? null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isStudent && !idCard) {
      toast.error('Please upload your student ID card.');
      return;
    }
    if (isStudent && !tenantId) {
      toast.error('Please select your university.');
      return;
    }

    const payload: CompleteProfilePayload = {
      address,
      isStudent,
      tenantId: isStudent ? tenantId : null,
      universityEmail: isStudent ? universityEmail : null,
      faculty: isStudent ? faculty : null,
      batchYear: isStudent && batchYear ? parseInt(batchYear, 10) : null,
    };

    setSubmitting(true);
    try {
      await completeProfile(payload, isStudent ? idCard : null);
      setDone(true);
      toast.success('Profile completed successfully!');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <SidebarLayout>
        <div className="max-w-xl mx-auto mt-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-10 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-emerald-500" />
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-extrabold mb-3">Profile Completed!</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">
              {isStudent ? 'Your student profile is set up. You can now access student-exclusive events.' : 'Your profile is ready. Start discovering amazing events!'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => navigate('/')} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2">
                Browse Events <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={() => navigate('/attendee')} className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl transition-colors">
                My Tickets
              </button>
            </div>
          </motion.div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Complete Your Profile</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Set up your attendee profile to book tickets and access exclusive events.
          </p>
        </div>

        {/* Type Toggle */}
        <div className="mb-8 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setIsStudent(false)}
            className={`flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-sm transition-all ${!isStudent ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            <User className="w-4 h-4" /> Outside Attendee
          </button>
          <button
            type="button"
            onClick={() => setIsStudent(true)}
            className={`flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-sm transition-all ${isStudent ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            <GraduationCap className="w-4 h-4" /> University Student
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Address (always shown) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
            <h2 className="font-bold text-lg">Basic Information</h2>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> Address</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="123 University Ave, City, Country"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Student Fields */}
          <AnimatePresence>
            {isStudent && (
              <motion.div
                key="student-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-blue-200 dark:border-blue-800/50 p-6 shadow-sm space-y-5">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-500" /> Student Details
                  </h2>

                  {/* University Selector */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      <span className="flex items-center gap-2"><Building2 className="w-4 h-4 text-slate-400" /> University *</span>
                    </label>
                    {loadingUnis ? (
                      <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading universities...</div>
                    ) : (
                      <select
                        value={tenantId}
                        onChange={e => setTenantId(e.target.value)}
                        required={isStudent}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      >
                        <option value="">Select your university</option>
                        {universities.map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* University Email */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /> University Email *</span>
                    </label>
                    <input
                      type="email"
                      value={universityEmail}
                      onChange={e => setUniversityEmail(e.target.value)}
                      placeholder="you@university.edu"
                      required={isStudent}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                    <p className="text-xs text-slate-400 mt-1">Must match your selected university's domain.</p>
                  </div>

                  {/* Faculty & Batch */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-slate-400" /> Faculty</span>
                      </label>
                      <input
                        type="text"
                        value={faculty}
                        onChange={e => setFaculty(e.target.value)}
                        placeholder="e.g. Engineering"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" /> Batch Year</span>
                      </label>
                      <input
                        type="number"
                        value={batchYear}
                        onChange={e => setBatchYear(e.target.value)}
                        placeholder={String(new Date().getFullYear())}
                        min="2000"
                        max={new Date().getFullYear() + 5}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* ID Card Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Student ID Card Photo *
                    </label>
                    <div
                      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : idCard ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        className="sr-only"
                        onChange={e => handleFileSelect(e.target.files?.[0] ?? null)}
                      />
                      {idCard ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {idCardPreview ? (
                              <img src={idCardPreview} alt="ID preview" className="w-14 h-14 rounded-lg object-cover shadow-md border border-slate-200 dark:border-slate-700" />
                            ) : (
                              <div className="w-14 h-14 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center"><Upload className="w-6 h-6 text-slate-400" /></div>
                            )}
                            <div className="text-left">
                              <p className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm">{idCard.name}</p>
                              <p className="text-xs text-slate-500">{(idCard.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={e => { e.stopPropagation(); setIdCard(null); setIdCardPreview(null); }}
                            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                          <p className="font-semibold text-slate-700 dark:text-slate-300">Drop your ID card here</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">or click to browse · JPG, PNG, PDF · max 5MB</p>
                        </>
                      )}
                    </div>
                    {!idCard && (
                      <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 mt-2">
                        <AlertCircle className="w-3.5 h-3.5" /> Required for student registration
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <DynamicButton
            type="submit"
            disabled={submitting}
            className="w-full py-4 text-base font-bold"
          >
            {submitting ? (
              <><Loader2 className="w-5 h-5 animate-spin mr-2" /> {isStudent ? 'Uploading & registering...' : 'Saving profile...'}</>
            ) : (
              `Complete ${isStudent ? 'Student ' : ''}Registration`
            )}
          </DynamicButton>
        </form>
      </div>
    </SidebarLayout>
  );
}

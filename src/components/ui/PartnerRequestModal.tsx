import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Loader2 } from 'lucide-react';
import DynamicButton from './DynamicButton';
import { submitPartnershipRequest } from '../../services/publicService';

interface PartnerRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PartnerRequestModal({ isOpen, onClose }: PartnerRequestModalProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    universityName: '',
    representativeName: '',
    designation: '',
    officialEmail: '',
    phoneNumber: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      await submitPartnershipRequest(formData);
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit partnership request. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setError(null);
    setFormData({
      universityName: '',
      representativeName: '',
      designation: '',
      officialEmail: '',
      phoneNumber: '',
      message: ''
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold">Partner Your University</h3>
                <button onClick={handleClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isSubmitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Request Sent Successfully!</h4>
                  <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8">
                    Thank you for your interest in EventSphere. Our partnership team will review your request and contact you at your official email address shortly.
                  </p>
                  <DynamicButton onClick={handleClose} className="px-8 py-3">
                    Close Window
                  </DynamicButton>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm mb-4">
                      {error}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">University Name <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        name="universityName"
                        value={formData.universityName}
                        onChange={handleChange}
                        required 
                        placeholder="e.g. EventSphere"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Official Representative Name <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        name="representativeName"
                        value={formData.representativeName}
                        onChange={handleChange}
                        required 
                        placeholder="e.g. Dr. Jane Doe"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Designation <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        required 
                        placeholder="e.g. Director of Student Affairs"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Official Email <span className="text-red-500">*</span></label>
                      <input 
                        type="email" 
                        name="officialEmail"
                        value={formData.officialEmail}
                        onChange={handleChange}
                        required 
                        pattern=".*(\.ac\.lk|\.edu|\.edu\.lk|\.lk)$"
                        title="Must be a valid institutional email address (e.g., .ac.lk, .edu.lk, .edu, or .lk)"
                        placeholder="e.g. jane.doe@stanford.edu"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      />
                      <p className="text-xs text-slate-500">Must be a valid institutional address (.ac.lk, .edu, etc.)</p>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="block text-sm font-medium">Phone Number <span className="text-red-500">*</span></label>
                      <input 
                        type="tel" 
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required 
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="block text-sm font-medium">Message (Optional)</label>
                      <textarea 
                        rows={4}
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us a bit about your university's event management needs..."
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <button 
                      type="button"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="px-6 py-3 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <DynamicButton type="submit" disabled={isSubmitting} className="px-8 py-3 flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Send Partnership Request'
                      )}
                    </DynamicButton>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

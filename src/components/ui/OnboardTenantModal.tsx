import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Upload, CheckCircle2 } from "lucide-react";
import DynamicButton from "./DynamicButton";

interface OnboardTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardTenantModal({
  isOpen,
  onClose,
}: OnboardTenantModalProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#3b82f6"); // Default blue

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
    }, 800);
  };

  const handleClose = () => {
    setIsSubmitted(false);
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
            className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <h3 className="text-xl font-bold">Onboard New University</h3>
              <button
                onClick={handleClose}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    Tenant created successfully!
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8">
                    Invitation email sent to the Tenant Admin. They can now log
                    in and configure their university portal.
                  </p>
                  <DynamicButton onClick={handleClose} className="px-8 py-3">
                    Close Window
                  </DynamicButton>
                </motion.div>
              ) : (
                <form
                  id="onboard-tenant-form"
                  onSubmit={handleSubmit}
                  className="space-y-8"
                >
                  {/* Section 1: University Details */}
                  <div className="space-y-6">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
                      Section 1: University Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">
                          University Name{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Stanford University"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">
                          Domain <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. stanford.edu"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        />
                        <p className="text-xs text-slate-500">
                          Used to restrict student emails
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">
                          Primary Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="w-12 h-12 rounded-xl cursor-pointer border-0 p-0 bg-transparent"
                          />
                          <input
                            type="text"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-mono uppercase"
                          />
                        </div>
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <label className="block text-sm font-medium">
                          Logo Upload
                        </label>
                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                          <Upload className="w-6 h-6 text-slate-400 mb-2" />
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Drag & drop or click to upload
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Tenant Admin Details */}
                  <div className="space-y-6">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
                      Section 2: Tenant Admin Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Jane Doe"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">
                          Designation <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. IT Director"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <label className="block text-sm font-medium">
                          Official Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. admin@stanford.edu"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Footer Actions */}
            {!isSubmitted && (
              <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 shrink-0 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <DynamicButton
                  type="submit"
                  form="onboard-tenant-form"
                  className="px-5 py-2.5 rounded-xl font-medium"
                >
                  Create Tenant & Send Invite
                </DynamicButton>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

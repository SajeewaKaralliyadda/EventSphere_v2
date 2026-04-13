import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Upload, CheckCircle2, Loader2, Image as ImageIcon } from "lucide-react";
import DynamicButton from "./DynamicButton";
import api from "../../lib/api";
import toast from "react-hot-toast";

interface OnboardTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardTenantModal({
  isOpen,
  onClose,
}: OnboardTenantModalProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    setIsLoading(true);
    try {
      let finalLogoUrl = "";
      
      // Upload to Cloudinary via backend if file selected
      if (logoFile) {
        const formData = new FormData();
        formData.append("file", logoFile);
        
        try {
          const uploadRes = await api.post("/api/upload/image", formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          finalLogoUrl = uploadRes.data.url;
        } catch (uploadError: any) {
          throw new Error("Logo upload failed: " + (uploadError.response?.data?.error || uploadError.message));
        }
      }

      const payload = {
        universityName: data.get("universityName") as string,
        domain: data.get("domain") as string,
        primaryColor,
        logoUrl: finalLogoUrl,
        adminFullName: data.get("adminFullName") as string,
        adminDesignation: data.get("adminDesignation") as string,
        adminEmail: data.get("adminEmail") as string,
      };

      await api.post("/api/admin/tenants", payload);
      setIsSubmitted(true);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to create tenant.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
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
            className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-700"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700 shrink-0">
              <h3 className="text-xl font-bold text-white">Onboard New University</h3>
              <button
                onClick={handleClose}
                className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
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
                  <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-4">
                    Tenant Created Successfully!
                  </h4>
                  <p className="text-slate-400 max-w-md mx-auto mb-8">
                    An invitation email has been dispatched to the Tenant Admin.
                    They can set their password and start configuring the university portal.
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
                    <h4 className="text-lg font-bold text-white border-b border-slate-700 pb-2">
                      Section 1: University Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-200">
                          University Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          name="universityName"
                          type="text"
                          required
                          placeholder="e.g. Stanford University"
                          className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-200">
                          Domain <span className="text-red-400">*</span>
                        </label>
                        <input
                          name="domain"
                          type="text"
                          required
                          placeholder="e.g. stanford.edu"
                          className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        />
                        <p className="text-xs text-slate-500">
                          Used to restrict student emails
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-200">
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
                            className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-mono uppercase"
                          />
                        </div>
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-200">
                          Logo Upload <span className="text-xs text-slate-400 font-normal">(optional)</span>
                        </label>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileChange}
                          accept="image/*"
                          className="hidden" 
                        />
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-600 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-800/50 transition-colors cursor-pointer relative overflow-hidden"
                        >
                          {logoPreview ? (
                            <div className="flex flex-col items-center">
                              <img src={logoPreview} alt="Preview" className="h-16 object-contain mb-3" />
                              <p className="text-sm text-slate-300">Click to change logo</p>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-6 h-6 text-slate-400 mb-2" />
                              <p className="text-sm text-slate-400">
                                Drag &amp; drop or click to select image
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Tenant Admin Details */}
                  <div className="space-y-6">
                    <h4 className="text-lg font-bold text-white border-b border-slate-700 pb-2">
                      Section 2: Tenant Admin Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-200">
                          Full Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          name="adminFullName"
                          type="text"
                          required
                          placeholder="e.g. Jane Doe"
                          className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-200">
                          Designation <span className="text-red-400">*</span>
                        </label>
                        <input
                          name="adminDesignation"
                          type="text"
                          required
                          placeholder="e.g. IT Director"
                          className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-200">
                          Official Email <span className="text-red-400">*</span>
                        </label>
                        <input
                          name="adminEmail"
                          type="email"
                          required
                          placeholder="e.g. admin@stanford.edu"
                          className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        />
                        <p className="text-xs text-slate-500">
                          An invitation link will be sent to this email address.
                        </p>
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Footer Actions */}
            {!isSubmitted && (
              <div className="p-6 border-t border-slate-700 bg-slate-800/30 shrink-0 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-xl font-medium text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <DynamicButton
                  type="submit"
                  form="onboard-tenant-form"
                  className="px-5 py-2.5 rounded-xl font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    "Create Tenant & Send Invite"
                  )}
                </DynamicButton>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

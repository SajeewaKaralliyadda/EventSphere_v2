import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronRight, ChevronLeft, Upload, Image as ImageIcon, Calendar, Clock, MapPin, Ticket, DollarSign, FileText, X, Plus, Info } from 'lucide-react';
import SidebarLayout from '../../components/ui/SidebarLayout';
import DynamicButton from '../../components/ui/DynamicButton';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  { id: 1, title: 'Basic Info' },
  { id: 2, title: 'Details' },
  { id: 3, title: 'Tickets' }
];

export default function EventCreationWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [noLimit, setNoLimit] = useState(false);
  const [totalCapacity, setTotalCapacity] = useState('');
  const [audienceRestriction, setAudienceRestriction] = useState<'university' | 'public'>('university');
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(prev => prev + 1);
    else {
      // Submit form
      navigate('/organizer');
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
          <p className="text-slate-500 dark:text-slate-400 mt-1">Fill out the details below to publish a new event to the university portal.</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500" 
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            />
            
            {STEPS.map((step) => (
              <div key={step.id} className="relative flex flex-col items-center gap-2 z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                  currentStep > step.id 
                    ? 'bg-blue-600 text-white' 
                    : currentStep === step.id 
                      ? 'bg-blue-600 text-white ring-4 ring-blue-600/20' 
                      : 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-400'
                }`}>
                  {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                </div>
                <span className={`text-xs font-medium absolute -bottom-6 whitespace-nowrap ${
                  currentStep >= step.id ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                }`}>
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
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-6">Basic Information</h2>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Event Title</label>
                    <input type="text" placeholder="e.g. Annual Tech Symposium 2026" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea rows={4} placeholder="Describe your event..." className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none">
                        <option value="">Select Category</option>
                        <option value="academic">Academic</option>
                        <option value="cultural">Cultural</option>
                        <option value="sports">Sports</option>
                        <option value="workshop">Workshop</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Faculty</label>
                      <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none">
                        <option value="">Select Faculty</option>
                        <option value="engineering">Engineering</option>
                        <option value="science">Science</option>
                        <option value="arts">Arts</option>
                        <option value="business">Business</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Event Cover Image</label>
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                      <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <ImageIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">Drag & drop your image here</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">or click to browse (1920x1080px recommended)</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">University Approval Document <span className="text-red-500">*</span></label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Required for all events. Upload the signed approval letter (PNG, JPG, PDF).</p>
                    <div className="border-2 border-dashed border-emerald-300 dark:border-emerald-700/50 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors cursor-pointer group">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FileText className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300 mb-1">Upload Approval Document</p>
                      <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">Drag & drop or click to browse</p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-6">Event Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Event Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="date" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Event Time</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="time" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Venue</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input type="text" placeholder="e.g. Main Campus Auditorium" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium">Total Capacity</label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={noLimit}
                          onChange={(e) => {
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
                      onChange={(e) => setTotalCapacity(e.target.value)}
                      disabled={noLimit}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                    />
                    {!noLimit && totalCapacity && (
                      <div className="mt-3 flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20">
                        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Ticket tiers configured in the next step cannot exceed a combined total of <strong>{totalCapacity}</strong> tickets.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Audience Restriction */}
                  <div>
                    <label className="block text-sm font-medium mb-3">Audience Restriction</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className={`relative flex flex-col border-2 rounded-2xl p-4 cursor-pointer transition-all ${
                        audienceRestriction === 'university' 
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-bold ${audienceRestriction === 'university' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                            University Students Only
                          </span>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            audienceRestriction === 'university' ? 'border-blue-600' : 'border-slate-300 dark:border-slate-600'
                          }`}>
                            {audienceRestriction === 'university' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Restricts ticket purchases to users logged in with the university's domain.
                        </p>
                        <input 
                          type="radio" 
                          name="audience" 
                          value="university" 
                          checked={audienceRestriction === 'university'}
                          onChange={() => setAudienceRestriction('university')}
                          className="sr-only" 
                        />
                      </label>

                      <label className={`relative flex flex-col border-2 rounded-2xl p-4 cursor-pointer transition-all ${
                        audienceRestriction === 'public' 
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-bold ${audienceRestriction === 'public' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                            Open to Public
                          </span>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            audienceRestriction === 'public' ? 'border-blue-600' : 'border-slate-300 dark:border-slate-600'
                          }`}>
                            {audienceRestriction === 'public' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Anyone can view and purchase tickets for this event.
                        </p>
                        <input 
                          type="radio" 
                          name="audience" 
                          value="public" 
                          checked={audienceRestriction === 'public'}
                          onChange={() => setAudienceRestriction('public')}
                          className="sr-only" 
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-6">Ticketing Tiers</h2>
                  
                  <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 relative group">
                    <button className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Tier Name</label>
                        <div className="relative">
                          <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input type="text" defaultValue="General Admission" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Price</label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input type="number" defaultValue="15" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                      <input type="text" defaultValue="Access to all main stage talks." className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                    </div>
                  </div>

                  <button className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-slate-500 dark:text-slate-400 font-medium hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2">
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
            
            <DynamicButton onClick={handleNext} className="px-8 py-3 rounded-xl font-bold flex items-center gap-2">
              {currentStep === 3 ? 'Publish Event' : 'Continue'}
              {currentStep !== 3 && <ChevronRight className="w-5 h-5" />}
            </DynamicButton>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

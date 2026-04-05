import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Upload, Image as ImageIcon, Calendar, Clock, MapPin, Ticket, DollarSign, FileText, Info, ArrowLeft, CheckCircle2 } from 'lucide-react';
import SidebarLayout from '../../components/ui/SidebarLayout';
import DynamicButton from '../../components/ui/DynamicButton';
import { useNavigate, useParams } from 'react-router-dom';

export default function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Simulated state for whether tickets have been sold
  const ticketsSold = true; 
  const [isSaved, setIsSaved] = useState(false);

  const [formData, setFormData] = useState({
    title: 'Annual Tech Symposium 2026',
    category: 'Technology',
    description: 'Join us for the biggest tech event of the year featuring keynote speakers from top tech companies, hands-on workshops, and a 24-hour hackathon.',
    date: '2026-05-15',
    time: '09:00',
    venue: 'Main Campus Auditorium',
    capacity: '500',
    audienceRestriction: 'university',
    ticketTiers: [
      { id: 1, name: 'Early Bird', price: '500', qty: '100' },
      { id: 2, name: 'General Admission', price: '1000', qty: '400' }
    ]
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      navigate('/organizer');
    }, 2000);
  };

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto pb-12">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate('/organizer')}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Event</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Update details for your upcoming event.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Section 1: Basic Info */}
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" /> Basic Information
            </h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Event Title <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Category <span className="text-red-500">*</span></label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm appearance-none"
                >
                  <option value="Technology">Technology</option>
                  <option value="Arts & Culture">Arts & Culture</option>
                  <option value="Sports">Sports</option>
                  <option value="Academic">Academic</option>
                  <option value="Entertainment">Entertainment</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Description <span className="text-red-500">*</span></label>
                <textarea 
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Event Banner</label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">Click to replace banner image</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">16:9 aspect ratio recommended. Max 5MB.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Date & Venue */}
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" /> Date & Venue
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Date <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Time <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="time" 
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium">Venue <span className="text-red-500">*</span></label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    value={formData.venue}
                    onChange={(e) => setFormData({...formData, venue: e.target.value})}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Tickets */}
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-emerald-500" /> Ticketing & Capacity
            </h2>

            <div className="space-y-8">
              {/* Audience Restriction */}
              <div className="space-y-3">
                <label className="block text-sm font-medium">Who can attend? <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.audienceRestriction === 'university' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'}`}>
                    <input 
                      type="radio" 
                      name="audience" 
                      value="university" 
                      checked={formData.audienceRestriction === 'university'}
                      onChange={() => setFormData({...formData, audienceRestriction: 'university'})}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">University Only</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Only students with a valid university email can register.</p>
                    </div>
                  </label>
                  <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.audienceRestriction === 'public' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'}`}>
                    <input 
                      type="radio" 
                      name="audience" 
                      value="public" 
                      checked={formData.audienceRestriction === 'public'}
                      onChange={() => setFormData({...formData, audienceRestriction: 'public'})}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Open to Public</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Anyone can register. External attendees may require approval.</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Total Capacity */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium">Total Capacity</label>
                  {ticketsSold && (
                    <span className="text-xs flex items-center gap-1 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-md">
                      <Info className="w-3 h-3" /> Cannot decrease below sold tickets
                    </span>
                  )}
                </div>
                <input 
                  type="number" 
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  disabled={ticketsSold}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              {/* Ticket Tiers */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium">Ticket Tiers</label>
                  {ticketsSold && (
                    <span className="text-xs flex items-center gap-1 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-md">
                      <Info className="w-3 h-3" /> Price locked after first sale
                    </span>
                  )}
                </div>
                
                {formData.ticketTiers.map((tier, index) => (
                  <div key={tier.id} className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <div className="flex-1 space-y-1">
                      <label className="text-xs font-medium text-slate-500">Tier Name</label>
                      <input 
                        type="text" 
                        value={tier.name}
                        onChange={(e) => {
                          const newTiers = [...formData.ticketTiers];
                          newTiers[index].name = e.target.value;
                          setFormData({...formData, ticketTiers: newTiers});
                        }}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      />
                    </div>
                    <div className="w-full sm:w-32 space-y-1">
                      <label className="text-xs font-medium text-slate-500">Price (Rs.)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="number" 
                          value={tier.price}
                          disabled={ticketsSold}
                          onChange={(e) => {
                            const newTiers = [...formData.ticketTiers];
                            newTiers[index].price = e.target.value;
                            setFormData({...formData, ticketTiers: newTiers});
                          }}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div className="w-full sm:w-32 space-y-1">
                      <label className="text-xs font-medium text-slate-500">Quantity</label>
                      <input 
                        type="number" 
                        value={tier.qty}
                        onChange={(e) => {
                          const newTiers = [...formData.ticketTiers];
                          newTiers[index].qty = e.target.value;
                          setFormData({...formData, ticketTiers: newTiers});
                        }}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <DynamicButton type="submit" className="px-8 py-3 text-base font-bold">
              Save Changes
            </DynamicButton>
          </div>
        </form>
      </div>

      {/* Success Toast */}
      {isSaved && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 font-medium z-50"
        >
          <CheckCircle2 className="w-5 h-5" />
          Event updated successfully
        </motion.div>
      )}
    </SidebarLayout>
  );
}

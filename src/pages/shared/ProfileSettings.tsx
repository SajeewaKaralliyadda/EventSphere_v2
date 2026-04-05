import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Lock, Bell, Upload, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DynamicButton from '../../components/ui/DynamicButton';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileSettings() {
  const [activeTab, setActiveTab] = useState<'personal' | 'security' | 'notifications'>('personal');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleBack = () => {
    if (user?.role === 'SUPER_ADMIN') navigate('/super-admin/dashboard');
    else if (user?.role === 'TENANT_ADMIN') navigate('/tenant-admin/dashboard');
    else if (
      user?.role === 'ORGANIZER' ||
      user?.role === 'CO_ORGANIZER' ||
      user?.role === 'GATE_SCANNER'
    )
      navigate('/organizer/dashboard');
    else navigate('/attendee/calendar');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={handleBack}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage your account details and preferences.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Vertical Tabs */}
          <div className="w-full md:w-64 shrink-0 space-y-2">
            <TabButton 
              active={activeTab === 'personal'} 
              onClick={() => setActiveTab('personal')} 
              icon={<User className="w-5 h-5" />} 
              label="Personal Info" 
            />
            <TabButton 
              active={activeTab === 'security'} 
              onClick={() => setActiveTab('security')} 
              icon={<Lock className="w-5 h-5" />} 
              label="Security" 
            />
            <TabButton 
              active={activeTab === 'notifications'} 
              onClick={() => setActiveTab('notifications')} 
              icon={<Bell className="w-5 h-5" />} 
              label="Notification Preferences" 
            />
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === 'personal' && (
                <motion.div
                  key="personal"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-xl font-bold mb-6">Personal Information</h2>
                  <form onSubmit={handleSave} className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                        JD
                      </div>
                      <div>
                        <button type="button" className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-medium transition-colors mb-2">
                          <Upload className="w-4 h-4" /> Upload New Avatar
                        </button>
                        <p className="text-xs text-slate-500 dark:text-slate-400">JPG, GIF or PNG. Max size of 2MB.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Full Name</label>
                        <input 
                          type="text" 
                          defaultValue="Jane Doe"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Email Address</label>
                        <input 
                          type="email" 
                          defaultValue="jane.doe@example.com"
                          disabled
                          className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none text-slate-500 cursor-not-allowed text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Phone Number</label>
                        <input 
                          type="tel" 
                          defaultValue="+1 (555) 123-4567"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <label className="block text-sm font-medium">Address</label>
                        <textarea 
                          rows={3}
                          defaultValue="123 University Ave, Campus City, ST 12345"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none text-sm"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <DynamicButton type="submit" className="px-6 py-2.5">
                        Save Changes
                      </DynamicButton>
                    </div>
                  </form>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-xl font-bold mb-6">Security Settings</h2>
                  <form onSubmit={handleSave} className="space-y-6 max-w-md">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Current Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">New Password</label>
                      <input 
                        type="password" 
                        placeholder="Min. 8 characters"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Confirm New Password</label>
                      <input 
                        type="password" 
                        placeholder="Re-enter new password"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      />
                    </div>

                    <div className="pt-4">
                      <DynamicButton type="submit" className="px-6 py-2.5">
                        Update Password
                      </DynamicButton>
                    </div>
                  </form>
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-xl font-bold mb-6">Notification Preferences</h2>
                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-4">
                      <ToggleRow 
                        title="Email Notifications" 
                        description="Receive updates about your events and tickets via email." 
                        defaultChecked={true} 
                      />
                      <ToggleRow 
                        title="Push Notifications" 
                        description="Receive real-time alerts in your browser." 
                        defaultChecked={false} 
                      />
                      <ToggleRow 
                        title="Event Reminders" 
                        description="Get notified 24 hours before an event starts." 
                        defaultChecked={true} 
                      />
                      <ToggleRow 
                        title="Marketing Emails" 
                        description="Receive news, special offers, and platform updates." 
                        defaultChecked={false} 
                      />
                    </div>

                    <div className="pt-4 flex justify-end">
                      <DynamicButton type="submit" className="px-6 py-2.5">
                        Save Preferences
                      </DynamicButton>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Toast */}
            <AnimatePresence>
              {isSaved && (
                <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  className="absolute bottom-6 right-6 bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 font-medium"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Settings saved successfully
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-left ${
        active 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ToggleRow({ title, description, defaultChecked }: { title: string, description: string, defaultChecked: boolean }) {
  const [isChecked, setIsChecked] = useState(defaultChecked);

  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
      <div className="pr-4">
        <h4 className="font-medium text-slate-900 dark:text-white">{title}</h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
      </div>
      <button 
        type="button"
        onClick={() => setIsChecked(!isChecked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 shrink-0 ${
          isChecked ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
        }`}
      >
        <span 
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isChecked ? 'translate-x-6' : 'translate-x-1'
          }`} 
        />
      </button>
    </div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, Plus, Trash2, Save, MapPin, Globe, Mail } from 'lucide-react';
import SidebarLayout from '../../components/ui/SidebarLayout';
import DynamicButton from '../../components/ui/DynamicButton';
import toast from 'react-hot-toast';
import {
  listFaculties,
  createFaculty,
  deleteFaculty,
  getCustomization,
  updateCustomization,
} from '../../services/tenantAdminService';
import type { FacultyResponse } from '../../services/tenantAdminService';

export default function TenantSettings() {
  const [faculties, setFaculties] = useState<FacultyResponse[]>([]);
  const [newFaculty, setNewFaculty] = useState('');
  const [settings, setSettings] = useState<any>({
    name: '',
    domain: '',
    contactEmail: '',
    address: ''
  });
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [customization, facultyList] = await Promise.all([
          getCustomization(),
          listFaculties(),
        ]);
        setSettings({
          name: (customization as any).name || '',
          domain: (customization as any).domain || '',
          contactEmail: (customization as any).contactEmail || '',
          address: (customization as any).address || '',
        });
        setFaculties(facultyList);
      } catch (err) {
        toast.error('Failed to load tenant settings');
      }
    };
    fetchSettings();
  }, []);

  const handleAddFaculty = async () => {
    if (newFaculty.trim()) {
      try {
        const created = await createFaculty(newFaculty.trim());
        setFaculties(prev => [...prev, created]);
        setNewFaculty('');
        toast.success(`Faculty "${created.name}" added.`);
      } catch (err) {
        toast.error('Failed to add faculty.');
      }
    }
  };

  const handleDeleteFaculty = async (id: string | number) => {
    try {
      await deleteFaculty(String(id));
      setFaculties(prev => prev.filter(f => f.id !== id));
      toast.success('Faculty removed.');
    } catch (err) {
      toast.error('Failed to remove faculty.');
    }
  };

  const handleSave = async () => {
    try {
      const payload = { ...settings };
      await updateCustomization(payload, bannerFile);
      toast.success('Settings saved successfully');
      setBannerFile(null); // Reset after saving
    } catch (err) {
      toast.error('Failed to save settings');
    }
  };

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Tenant Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your university profile and organizational structure.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - University Details */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">University Profile</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Update your institution's core information.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Institution Name</label>
                  <input type="text" value={settings.name} onChange={e => setSettings({...settings, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Domain</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input type="text" value={settings.domain} onChange={e => setSettings({...settings, domain: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Contact Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input type="email" value={settings.contactEmail} onChange={e => setSettings({...settings, contactEmail: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" value={settings.address} onChange={e => setSettings({...settings, address: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Banner Image</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => setBannerFile(e.target.files?.[0] || null)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                  />
                  {bannerFile && (
                    <p className="text-xs text-emerald-600 mt-2">Selected: {bannerFile.name}</p>
                  )}
                </div>

                <div className="pt-4 flex justify-end">
                  <DynamicButton onClick={handleSave} className="px-6 py-2.5 rounded-xl font-medium flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </DynamicButton>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Manage Faculties */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm sticky top-8">
              <h2 className="text-xl font-bold mb-2">Manage Faculties</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Add or remove faculties for your institution.</p>

              <div className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  placeholder="New Faculty Name" 
                  value={newFaculty}
                  onChange={(e) => setNewFaculty(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddFaculty()}
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" 
                />
                <DynamicButton onClick={handleAddFaculty} className="px-4 py-2.5 rounded-xl flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </DynamicButton>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence>
                  {faculties.map((faculty) => (
                    <motion.div 
                      key={faculty.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl group hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                    >
                      <span className="font-medium text-sm">{faculty.name}</span>
                      <button 
                        onClick={() => handleDeleteFaculty(faculty.id)}
                        className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {faculties.length === 0 && (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
                    No faculties added yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

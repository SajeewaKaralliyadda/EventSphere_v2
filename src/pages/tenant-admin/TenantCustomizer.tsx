import React, { useState } from 'react';
import SidebarLayout from '../../components/ui/SidebarLayout';
import { Image as ImageIcon, Palette, Save, Type } from 'lucide-react';
import toast from 'react-hot-toast';

import api from '../../lib/api';

export default function TenantCustomizer() {
  const [welcomeMessage, setWelcomeMessage] = useState('Welcome to the University Events Portal');
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [secondaryColor, setSecondaryColor] = useState('#1e40af');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/api/tenant-admin/settings');
        const settings = response.data;
        if (settings.welcomeMessage) setWelcomeMessage(settings.welcomeMessage);
        if (settings.primaryColor) setPrimaryColor(settings.primaryColor);
        if (settings.secondaryColor) setSecondaryColor(settings.secondaryColor);
        if (settings.bannerImageUrl) setBannerImageUrl(settings.bannerImageUrl);
      } catch (err) {
        toast.error('Failed to load settings');
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await api.get('/api/tenant-admin/settings');
      const payload = { ...resp.data, welcomeMessage, primaryColor, secondaryColor, bannerImageUrl };
      await api.put('/api/tenant-admin/settings', payload);
      toast.success('Portal customization saved successfully!');
    } catch (err) {
      toast.error('Failed to save customization');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);

      try {
        setIsUploading(true);
        const res = await api.post('/api/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setBannerImageUrl(res.data.url);
        toast.success('Image uploaded!');
      } catch (err) {
        toast.error('Image upload failed');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portal Customizer</h1>
          <p className="text-slate-500 dark:text-slate-400">Customize the look and feel of your university's event portal.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Welcome Message */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Type className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Welcome Message
            </h2>
            <div>
              <label className="block text-sm font-medium mb-2">Custom Welcome Message</label>
              <input 
                type="text" 
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <p className="text-xs text-slate-500 mt-2">This message will be displayed prominently on the student dashboard.</p>
            </div>
          </div>

          {/* Banner Image */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Main Banner Image
            </h2>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer relative overflow-hidden h-48 flex flex-col items-center justify-center group"
            >
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
              />
              
              {isUploading ? (
                <div className="flex flex-col items-center text-blue-600 dark:text-blue-400">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="font-medium">Uploading...</p>
                </div>
              ) : bannerImageUrl ? (
                <>
                  <img src={bannerImageUrl} alt="Banner Preview" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" />
                  <div className="relative z-10 bg-black/60 text-white px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Change Image
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <p className="font-medium text-slate-900 dark:text-white mb-1">Click to upload banner image</p>
                  <p className="text-sm text-slate-500">PNG, JPG or WEBP (Recommended 1920x400px)</p>
                </>
              )}
            </div>
          </div>

          {/* Brand Colors */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Brand Colors
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer border-0 p-0"
                  />
                  <input 
                    type="text" 
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Secondary Color</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer border-0 p-0"
                  />
                  <input 
                    type="text" 
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-md hover:shadow-lg">
              <Save className="w-5 h-5" />
              Save Customization
            </button>
          </div>
        </form>
      </div>
    </SidebarLayout>
  );
}

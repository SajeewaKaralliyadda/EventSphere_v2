import React, { useState } from 'react';
import SidebarLayout from '../../components/ui/SidebarLayout';
import { Megaphone, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GlobalAnnouncements() {
  const [message, setMessage] = useState('');
  const [color, setColor] = useState<'blue' | 'yellow' | 'red'>('blue');
  const [expiryDate, setExpiryDate] = useState('');

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message || !expiryDate) {
      toast.error('Please fill in all fields');
      return;
    }
    
    // In a real app, this would save to a global state or database
    // For now, we'll just simulate it and use localStorage to pass it to the navbar
    const announcement = { message, color, expiryDate };
    localStorage.setItem('globalAnnouncement', JSON.stringify(announcement));
    
    // Dispatch a custom event so the navbar can update immediately
    window.dispatchEvent(new Event('announcementUpdated'));
    
    toast.success('Global announcement published!');
    setMessage('');
    setExpiryDate('');
  };

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Global Announcements</h1>
          <p className="text-slate-500 dark:text-slate-400">Publish platform-wide alert banners to all users.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            New Announcement
          </h2>
          
          <form onSubmit={handlePublish} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Announcement Message</label>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. Scheduled maintenance on Sunday at 2 AM UTC."
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Banner Color</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="color" 
                    value="blue" 
                    checked={color === 'blue'} 
                    onChange={() => setColor('blue')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-md text-sm font-medium">Info (Blue)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="color" 
                    value="yellow" 
                    checked={color === 'yellow'} 
                    onChange={() => setColor('yellow')}
                    className="w-4 h-4 text-yellow-600"
                  />
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-md text-sm font-medium">Warning (Yellow)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="color" 
                    value="red" 
                    checked={color === 'red'} 
                    onChange={() => setColor('red')}
                    className="w-4 h-4 text-red-600"
                  />
                  <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-md text-sm font-medium">Critical (Red)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Expiry Date</label>
              <input 
                type="date" 
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full md:w-1/2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-md hover:shadow-lg">
                <Send className="w-5 h-5" />
                Publish Announcement
              </button>
            </div>
          </form>
        </div>
      </div>
    </SidebarLayout>
  );
}

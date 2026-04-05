import React from 'react';
import { Heart, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SidebarLayout from '../../components/ui/SidebarLayout';
import EventGrid from '../../components/common/EventGrid';

// Mock saved events
const SAVED_EVENTS = [
  { id: '1', title: 'Annual Tech Symposium 2026', date: 'Oct 15, 2026', price: 15, thumbnail: 'https://picsum.photos/seed/tech/800/600', tenantName: 'Stanford University' },
  { id: '2', title: 'Fall Music Festival', date: 'Nov 2, 2026', price: 25, thumbnail: 'https://picsum.photos/seed/music/800/600', tenantName: 'MIT' },
  { id: '6', title: 'Guest Lecture: Future of AI', date: 'Nov 15, 2026', price: 10, thumbnail: 'https://picsum.photos/seed/ai/800/600', tenantName: 'Harvard University' },
];

export default function Wishlist() {
  const navigate = useNavigate();

  return (
    <SidebarLayout>
      
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <button 
            onClick={() => navigate('/attendee')}
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center">
              <Heart className="w-6 h-6 fill-red-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Wishlist</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Events you've saved for later.</p>
            </div>
          </div>
        </div>

        {SAVED_EVENTS.length > 0 ? (
          <EventGrid events={SAVED_EVENTS} />
        ) : (
          <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Heart className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Your wishlist is empty</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Discover events and tap the heart icon to save them here.</p>
            <Link to="/" className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
              Browse Events
            </Link>
          </div>
        )}
      </main>
    </SidebarLayout>
  );
}

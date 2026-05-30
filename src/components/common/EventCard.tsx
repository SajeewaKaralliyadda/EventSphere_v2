import React, { useState } from 'react';
import { Calendar, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { addToWishlist, removeFromWishlist } from '../../services/attendeeService';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export interface EventData {
  id: string;
  title: string;
  date: string;
  price: number;
  thumbnail: string;
  tenantName: string;
}

export default function EventCard({ event }: { event: EventData }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to event details
    e.stopPropagation();

    if (!user) {
      toast('Please log in to save events', { icon: '🔒' });
      navigate('/login');
      return;
    }
    
    // Only attendees can save to wishlist (backend enforces this via role check)
    if (user.role !== 'ATTENDEE') {
      toast.error('Only attendees can save events to a wishlist.');
      return;
    }

    setIsLoading(true);
    try {
      if (!isSaved) {
        await addToWishlist(event.id);
        setIsSaved(true);
        toast.success('Event saved to wishlist!');
      } else {
        await removeFromWishlist(event.id);
        setIsSaved(false);
        toast('Removed from wishlist', { icon: '💔' });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to update wishlist.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Link 
      to={`/events/${event.id}`} 
      className="group flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-[0_8px_30px_rgb(59,130,246,0.15)] hover:-translate-y-2 transition-all duration-300 relative"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={event.thumbnail} 
          alt={event.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          referrerPolicy="no-referrer" 
        />
        <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">
          {event.tenantName}
        </div>
        <button 
          onClick={handleSave}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm hover:scale-110 transition-transform z-10 disabled:opacity-70"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          ) : (
            <Heart className={`w-5 h-5 transition-colors ${isSaved ? 'fill-red-500 text-red-500' : 'text-slate-600 dark:text-slate-300'}`} />
          )}
        </button>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-bold line-clamp-2 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {event.title}
        </h3>
        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-6 mt-auto font-medium">
          <Calendar className="w-4 h-4 mr-2" />
          {event.date}
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <span className="font-bold text-xl">{event.price === 0 ? 'Free' : `Rs. ${event.price}`}</span>
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
            Get Tickets &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}

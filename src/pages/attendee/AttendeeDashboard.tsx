import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Heart, Calendar as CalendarIcon } from 'lucide-react';
import SidebarLayout from '../../components/ui/SidebarLayout';
import DynamicButton from '../../components/ui/DynamicButton';
import TicketWallet from './TicketWallet';
import { Link } from 'react-router-dom';

export default function AttendeeDashboard() {
  const { user } = useAuth();

  return (
    <SidebarLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Tickets</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">View and manage your event registrations.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/attendee/wishlist">
            <button className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-slate-600 dark:text-slate-300">
              <Heart className="w-5 h-5" />
            </button>
          </Link>
          <Link to="/attendee/calendar">
            <button className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-slate-600 dark:text-slate-300">
              <CalendarIcon className="w-5 h-5" />
            </button>
          </Link>
          <Link to="/">
            <DynamicButton variant="outline" className="gap-2">
              Browse Events
            </DynamicButton>
          </Link>
        </div>
      </div>

      <TicketWallet />
    </SidebarLayout>
  );
}

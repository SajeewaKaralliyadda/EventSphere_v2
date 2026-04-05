import React, { useState } from 'react';
import { LayoutGrid, List, Calendar, MapPin, Ticket as TicketIcon, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import DigitalPassModal from '../../components/ui/DigitalPassModal';
import ReviewModal from '../../components/ui/ReviewModal';
import { cn } from '../../lib/utils';

// Mock Data
const MOCK_TICKETS = [
  {
    id: 'TKT-8492-A',
    title: 'Annual Tech Symposium 2026',
    date: 'Oct 15, 2026',
    time: '09:00 AM',
    location: 'Main Campus Auditorium',
    thumbnail: 'https://picsum.photos/seed/tech/800/600',
    tenantName: 'Stanford University',
    tier: 'VIP Pass',
    status: 'upcoming',
    attendeeName: 'Demo Attendee'
  },
  {
    id: 'TKT-1123-B',
    title: 'Fall Music Festival',
    date: 'Nov 2, 2026',
    time: '04:00 PM',
    location: 'Stadium Grounds',
    thumbnail: 'https://picsum.photos/seed/music/800/600',
    tenantName: 'MIT',
    tier: 'General Admission',
    status: 'upcoming',
    attendeeName: 'Demo Attendee'
  },
  {
    id: 'TKT-9941-C',
    title: 'Startup Pitch Night',
    date: 'Sep 28, 2025',
    time: '06:00 PM',
    location: 'Innovation Hub',
    thumbnail: 'https://picsum.photos/seed/startup/800/600',
    tenantName: 'Harvard University',
    tier: 'Student',
    status: 'past',
    attendeeName: 'Demo Attendee'
  }
];

export default function TicketWallet() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [reviewTicket, setReviewTicket] = useState<any | null>(null);
  const [submittedReviews, setSubmittedReviews] = useState<Record<string, boolean>>({});

  const filteredTickets = MOCK_TICKETS.filter(t => t.status === activeTab);

  const handleReviewSubmit = (rating: number, review: string) => {
    if (reviewTicket) {
      setSubmittedReviews(prev => ({ ...prev, [reviewTicket.id]: true }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === 'upcoming' 
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            Upcoming ({MOCK_TICKETS.filter(t => t.status === 'upcoming').length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === 'past' 
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            Past Events
          </button>
        </div>

        <div className="flex items-center gap-2 bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl w-fit">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-2 rounded-lg transition-all",
              viewMode === 'grid' ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "p-2 rounded-lg transition-all",
              viewMode === 'list' ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tickets Display */}
      {filteredTickets.length === 0 ? (
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <TicketIcon className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">No {activeTab} tickets</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            You don't have any {activeTab} event registrations in your wallet.
          </p>
        </div>
      ) : (
        <div className={cn(
          "grid gap-6",
          viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          {filteredTickets.map(ticket => (
            <div 
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className={cn(
                "group bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-xl hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all cursor-pointer",
                viewMode === 'list' ? "flex flex-col sm:flex-row h-auto sm:h-40" : "flex flex-col"
              )}
            >
              {/* Thumbnail */}
              <div className={cn(
                "relative overflow-hidden",
                viewMode === 'list' ? "w-full sm:w-48 h-48 sm:h-full shrink-0" : "w-full aspect-video"
              )}>
                <img src={ticket.thumbnail} alt={ticket.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white px-2 py-1 rounded-lg text-xs font-bold">
                  {ticket.tenantName}
                </div>
                {activeTab === 'past' && (
                  <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="bg-slate-900/80 text-white px-3 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider border border-white/20">Ended</span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{ticket.title}</h3>
                </div>
                
                <div className="space-y-2 mb-4 mt-auto">
                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                    <Calendar className="w-4 h-4 mr-2 shrink-0" />
                    <span className="truncate">{ticket.date} • {ticket.time}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                    <MapPin className="w-4 h-4 mr-2 shrink-0" />
                    <span className="truncate">{ticket.location}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                    {ticket.tier}
                  </span>
                  
                  {activeTab === 'past' ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!submittedReviews[ticket.id]) {
                          setReviewTicket(ticket);
                        }
                      }}
                      disabled={submittedReviews[ticket.id]}
                      className={cn(
                        "text-sm font-medium px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5",
                        submittedReviews[ticket.id] 
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed" 
                          : "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20"
                      )}
                    >
                      {submittedReviews[ticket.id] ? (
                        <>Review Submitted</>
                      ) : (
                        <>
                          <Star className="w-4 h-4" />
                          Leave a Review
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                      View Pass &rarr;
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Digital Pass Modal */}
      <DigitalPassModal 
        isOpen={!!selectedTicket} 
        onClose={() => setSelectedTicket(null)} 
        ticket={selectedTicket} 
      />

      <ReviewModal
        isOpen={!!reviewTicket}
        onClose={() => setReviewTicket(null)}
        onSubmit={handleReviewSubmit}
        eventTitle={reviewTicket?.title || ''}
      />
    </div>
  );
}

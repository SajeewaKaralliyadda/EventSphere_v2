import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ArrowLeft, 
  Plus, 
  Minus, 
  Star, 
  User, 
  Users, 
  Share2, 
  Facebook, 
  Twitter, 
  MessageCircle 
} from 'lucide-react';
import GlobalNavbar from '../../components/ui/GlobalNavbar';
import { useTenant } from '../../contexts/TenantContext';

import { useAuth } from '../../contexts/AuthContext';

// Mock data fetcher
const getEventDetails = (id: string) => ({
  id,
  title: 'Annual Tech Symposium 2026',
  status: 'Upcoming',
  rating: 4.8,
  reviewsCount: 124,
  date: 'October 15, 2026',
  time: '09:00 AM - 05:00 PM',
  location: 'Main Campus Auditorium',
  organizer: 'Computer Science Society',
  organizerId: '1',
  availableSeats: 150,
  thumbnail: 'https://picsum.photos/seed/tech/1920/1080?blur=2',
  tenantName: 'Stanford University',
  description: `Join us for the most anticipated tech event of the year. We will be exploring the latest trends in AI, Quantum Computing, and Sustainable Tech. 

Key Highlights:
• Keynote speeches from industry leaders
• Hands-on workshops on Machine Learning
• Networking sessions with top tech companies
• Exclusive access to beta software releases

Don't miss this opportunity to network and learn from the best in the field.`,
  tags: ['Technology', 'AI', 'Networking', 'Workshop', 'Career'],
  reviews: [
    { id: 1, user: 'Alex Johnson', avatar: 'A', date: '2 days ago', rating: 5, text: 'Attended last year and it was incredible. Looking forward to this one!' },
    { id: 2, user: 'Sarah Miller', avatar: 'S', date: '1 week ago', rating: 4, text: 'Great lineup of speakers. The venue is usually a bit chilly, so bring a jacket.' },
    { id: 3, user: 'David Chen', avatar: 'D', date: '2 weeks ago', rating: 5, text: 'The networking opportunities alone make this worth attending.' }
  ],
  tiers: [
    { id: 't1', name: 'General Admission', price: 15, description: 'Access to all main stage talks.', capacity: 100 },
    { id: 't2', name: 'VIP Pass', price: 50, description: 'Includes front-row seating and exclusive networking lunch.', capacity: 20 },
    { id: 't3', name: 'Student', price: 0, description: 'Free entry with valid student ID.', capacity: 30 }
  ]
});

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const event = getEventDetails(id || '1');
  const { currentTenant } = useTenant();
  const { user } = useAuth();
  
  const [tickets, setTickets] = useState<Record<string, number>>({});

  const updateTicketCount = (tierId: string, delta: number) => {
    setTickets(prev => {
      const current = prev[tierId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [tierId]: next };
    });
  };

  const totalTickets = Object.values(tickets).reduce((a, b) => a + b, 0);
  const totalPrice = event.tiers.reduce((total, tier) => total + (tier.price * (tickets[tier.id] || 0)), 0);

  const handleCheckout = () => {
    if (!user) {
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }
    navigate('/checkout', { 
      state: { event, tickets, totalPrice } 
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-500 pb-24">
      <GlobalNavbar />
      
      {/* Top Section: Full-width Event Banner */}
      <div className="relative h-64 md:h-96 w-full group">
        <img 
          src={event.thumbnail} 
          alt={event.title} 
          className="w-full h-full object-cover" 
          referrerPolicy="no-referrer" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
        
        <div className="absolute top-6 left-6 md:top-8 md:left-8 z-10">
          <button onClick={() => navigate(-1)} className="inline-flex items-center px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-colors font-medium shadow-sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </button>
        </div>
      </div>

      {/* Main Content (Two Columns) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Left Column (70% width) */}
          <div className="lg:w-[70%] space-y-10">
            
            {/* Header Info Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  event.status === 'Upcoming' 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {event.status}
                </span>
                <span className="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                  {event.tenantName}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight">
                {event.title}
              </h1>
              
              <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-1.5" />
                  <span className="font-bold text-slate-900 dark:text-white mr-1">{event.rating}</span>
                  <span>({event.reviewsCount} reviews)</span>
                </div>
              </div>
            </div>

            {/* 2x2 Grid Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div className="flex items-start gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Date & Time</p>
                  <p className="font-bold text-slate-900 dark:text-white">{event.date}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{event.time}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Venue</p>
                  <p className="font-bold text-slate-900 dark:text-white">{event.location}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">View on map</p>
                </div>
              </div>

              <Link to={`/organizer/${event.organizerId}`} className="flex items-start gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500 dark:hover:border-blue-500 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0 group-hover:scale-110 transition-transform">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Organized By</p>
                  <p className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{event.organizer}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">View Profile &rarr;</p>
                </div>
              </Link>

              <div className="flex items-start gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Available Seats</p>
                  <p className="font-bold text-slate-900 dark:text-white">{event.availableSeats} remaining</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Out of 500 capacity</p>
                </div>
              </div>
            </div>

            {/* About This Event */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-2xl font-bold mb-6">About this event</h2>
              <div className="prose prose-lg dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 whitespace-pre-line">
                {event.description}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Tags</h2>
              <div className="flex flex-wrap gap-3">
                {event.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium transition-colors cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Reviews</h2>
                <button className="text-blue-600 dark:text-blue-400 font-medium hover:underline text-sm">
                  View all {event.reviewsCount} reviews
                </button>
              </div>
              
              <div className="space-y-6">
                {event.reviews.map(review => (
                  <div key={review.id} className="pb-6 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-sm">
                          {review.avatar}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{review.user}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 dark:text-slate-700'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column (30% width, Sticky) */}
          <div className="lg:w-[30%]">
            <div className="sticky top-24 space-y-6">
              
              {/* Select Tickets Card */}
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 md:p-8">
                <h3 className="text-2xl font-bold mb-6">Select Tickets</h3>
                
                <div className="space-y-5 mb-8">
                  {event.tiers.map(tier => (
                    <div key={tier.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-lg text-slate-900 dark:text-white">{tier.name}</h4>
                          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-2">
                            {tier.capacity} left
                          </p>
                        </div>
                        <p className="font-bold text-xl text-slate-900 dark:text-white">
                          {tier.price === 0 ? 'Free' : `$${tier.price}`}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Quantity</span>
                        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-700 shadow-sm">
                          <button 
                            onClick={() => updateTicketCount(tier.id, -1)}
                            disabled={!tickets[tier.id]}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-transparent transition-colors text-slate-600 dark:text-slate-300"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-6 text-center font-bold text-slate-900 dark:text-white">
                            {tickets[tier.id] || 0}
                          </span>
                          <button 
                            onClick={() => updateTicketCount(tier.id, 1)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Total ({totalTickets})</span>
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">${totalPrice}</span>
                  </div>
                  <button 
                    className="w-full py-4 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:pointer-events-none"
                    disabled={totalTickets === 0}
                    onClick={handleCheckout}
                  >
                    Book Now
                  </button>
                </div>
              </div>

              {/* Share Event Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 text-center">
                <h3 className="font-bold text-lg mb-4 flex items-center justify-center gap-2">
                  <Share2 className="w-5 h-5" /> Share Event
                </h3>
                <div className="flex items-center justify-center gap-4">
                  <button className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:scale-110 transition-transform">
                    <Facebook className="w-5 h-5" />
                  </button>
                  <button className="w-12 h-12 rounded-full bg-sky-50 dark:bg-sky-500/10 text-sky-500 dark:text-sky-400 flex items-center justify-center hover:scale-110 transition-transform">
                    <Twitter className="w-5 h-5" />
                  </button>
                  <button className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center hover:scale-110 transition-transform">
                    <MessageCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

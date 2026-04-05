import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, Star, ArrowLeft, UserPlus, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import GlobalNavbar from '../../components/ui/GlobalNavbar';
import EventCard from '../../components/common/EventCard';

// Mock data
const getOrganizerDetails = (id: string) => ({
  id,
  name: 'Computer Science Society',
  university: 'Stanford University',
  totalEvents: 24,
  averageRating: 4.8,
  description: 'The official Computer Science Society of Stanford University. We organize hackathons, tech talks, and networking events for students passionate about technology.',
  upcomingEvents: [
    { id: '1', title: 'Annual Tech Symposium 2026', date: 'Oct 15, 2026', price: 15, thumbnail: 'https://picsum.photos/seed/tech/800/600', tenantName: 'Stanford University' },
    { id: '7', title: 'AI Workshop: Neural Networks', date: 'Nov 10, 2026', price: 0, thumbnail: 'https://picsum.photos/seed/ai2/800/600', tenantName: 'Stanford University' },
  ],
  reviews: [
    { id: 1, user: 'Alex Johnson', avatar: 'A', date: '2 days ago', rating: 5, text: 'Always hosts the best tech events on campus!' },
    { id: 2, user: 'Sarah Miller', avatar: 'S', date: '1 month ago', rating: 4, text: 'Great workshops, very informative.' },
    { id: 3, user: 'David Chen', avatar: 'D', date: '2 months ago', rating: 5, text: 'Well organized and great networking opportunities.' }
  ]
});

export default function OrganizerPublicProfile() {
  const { organizerId } = useParams<{ organizerId: string }>();
  const organizer = getOrganizerDetails(organizerId || '1');
  const [activeTab, setActiveTab] = useState<'events' | 'reviews'>('events');
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    if (!isFollowing) {
      toast.success(`You will now receive updates from ${organizer.name}.`);
    } else {
      toast('Unfollowed organizer.', { icon: 'ℹ️' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-500 pb-24">
      <GlobalNavbar />
      
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
          </Link>
          
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl shrink-0">
              {organizer.name.charAt(0)}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  {organizer.university}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-4">{organizer.name}</h1>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-lg mb-6">
                {organizer.description}
              </p>
              <button 
                onClick={handleFollow}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${
                  isFollowing 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-xl hover:-translate-y-0.5'
                }`}
              >
                {isFollowing ? (
                  <><Check className="w-5 h-5" /> Following</>
                ) : (
                  <><UserPlus className="w-5 h-5" /> Follow Organizer</>
                )}
              </button>
            </div>
            
            <div className="flex md:flex-col gap-4 md:gap-6 shrink-0 w-full md:w-auto">
              <div className="flex-1 md:flex-none bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{organizer.totalEvents}</div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Events</div>
              </div>
              <div className="flex-1 md:flex-none bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  {organizer.averageRating} <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                </div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Tabs */}
        <div className="flex items-center gap-8 border-b border-slate-200 dark:border-slate-800 mb-8">
          <button
            onClick={() => setActiveTab('events')}
            className={`pb-4 text-lg font-bold transition-colors relative ${
              activeTab === 'events' 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Upcoming Events
            {activeTab === 'events' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 text-lg font-bold transition-colors relative ${
              activeTab === 'reviews' 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Reviews
            {activeTab === 'reviews' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'events' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizer.upcomingEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="max-w-3xl">
            <div className="space-y-6">
              {organizer.reviews.map(review => (
                <div key={review.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
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
        )}
      </main>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Building2, Star, ArrowLeft, Loader2 } from 'lucide-react';
import GlobalNavbar from '../../components/ui/GlobalNavbar';
import EventCard from '../../components/common/EventCard';
import { getOrganizerProfile, PublicOrganizerResponse, PublicEventResponse } from '../../services/publicService';
import { type EventData } from '../../components/common/EventCard';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return iso; }
}

function toEventData(e: PublicEventResponse): EventData {
  return {
    id: e.id,
    title: e.title,
    date: formatDate(e.eventDate),
    price: e.isFree ? 0 : (e.minTicketPrice ?? 0),
    thumbnail: e.coverImageUrl || `https://picsum.photos/seed/${e.id}/800/600`,
    tenantName: e.organizerName || 'EventSphere',
  };
}

function formatReviewDate(iso: string): string {
  try {
    const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
    if (days === 0) return 'Today';
    if (days < 30) return `${days} days ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  } catch { return ''; }
}

export default function OrganizerPublicProfile() {
  const { organizerId } = useParams<{ organizerId: string }>();
  const navigate = useNavigate();
  const [organizer, setOrganizer] = useState<PublicOrganizerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'events' | 'reviews'>('events');

  useEffect(() => {
    if (!organizerId) return;
    setLoading(true);
    getOrganizerProfile(organizerId)
      .then(setOrganizer)
      .catch(() => setError('Organizer profile not found.'))
      .finally(() => setLoading(false));
  }, [organizerId]);

  const handleReport = async () => {
    if (!reportReason) {
      toast.error('Please select a reason.');
      return;
    }
    if (!organizer) return;

    setIsReporting(true);
    try {
      await submitDispute({
        targetId: organizer.id,
        targetType: 'ORGANIZER',
        tenantId: organizer.tenantId,
        reason: reportReason,
        description: reportDescription,
        reporterId: user?.id,
      });
      toast.success('Report submitted successfully.');
      setReportModalOpen(false);
    } catch (err) {
      toast.error('Failed to submit report.');
    } finally {
      setIsReporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <GlobalNavbar />
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center animate-pulse">
              <div className="w-32 h-32 rounded-3xl bg-slate-200 dark:bg-slate-700 shrink-0" />
              <div className="flex-1 space-y-4">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/4" />
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/2" />
                <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !organizer) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-900 dark:text-white">
        <GlobalNavbar />
        <div className="text-center mt-24">
          <h2 className="text-2xl font-bold mb-4">{error || 'Organizer not found'}</h2>
          <button onClick={() => navigate('/events')} className="text-blue-600 hover:underline">Browse events</button>
        </div>
      </div>
    );
  }

  const upcomingEventData = organizer.upcomingEvents.map(toEventData);
  const initials = organizer.organizationName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-500 pb-24">
      <GlobalNavbar />

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl shrink-0">
              {initials}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Organizer
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2">{organizer.organizationName}</h1>
              <p className="text-slate-500 dark:text-slate-400 mb-1 text-sm">{organizer.contactEmail}</p>
            </div>

            <div className="flex md:flex-col gap-4 md:gap-6 shrink-0 w-full md:w-auto">
              <div className="flex-1 md:flex-none bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{organizer.upcomingEvents.length}</div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Upcoming Events</div>
              </div>
              <div className="flex-1 md:flex-none bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  {organizer.averageRating.toFixed(1)} <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                </div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Avg Rating ({organizer.totalReviews})
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Tabs */}
        <div className="flex items-center gap-8 border-b border-slate-200 dark:border-slate-800 mb-8">
          {(['events', 'reviews'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-lg font-bold transition-colors relative capitalize ${activeTab === tab ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
            >
              {tab === 'events' ? 'Upcoming Events' : 'Reviews'}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'events' ? (
          upcomingEventData.length === 0 ? (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400">
              <p>No upcoming events from this organizer.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEventData.map(event => <EventCard key={event.id} event={event} />)}
            </div>
          )
        ) : (
          <div className="max-w-3xl">
            {organizer.reviews && organizer.reviews.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-8">
                  <div className="text-4xl font-extrabold">{organizer.averageRating.toFixed(1)}</div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < Math.round(organizer.averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 dark:text-slate-700'}`} />
                      ))}
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Based on {organizer.totalReviews} review{organizer.totalReviews !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {organizer.reviews.map(review => (
                    <div key={review.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                            {review.reviewerName?.charAt(0).toUpperCase() || 'A'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {review.reviewerName || 'Anonymous Attendee'}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 dark:text-slate-700'}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap ml-4">{formatReviewDate(review.createdAt)}</span>
                      </div>
                      
                      {review.eventName && (
                        <div className="mb-4">
                          <span className="inline-flex text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                            Reviewed for: {review.eventName}
                          </span>
                        </div>
                      )}
                      {review.comment ? (
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{review.comment}</p>
                      ) : (
                        <p className="text-slate-400 dark:text-slate-500 italic text-sm">No comment provided.</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <Star className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No reviews yet</h3>
                <p className="text-slate-500 dark:text-slate-400">This organizer hasn't received any reviews for their past events.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-4">Report Organizer</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a reason</option>
                  <option value="Fake Organization">Fake Organization</option>
                  <option value="Scam/Fraud">Scam / Fraud</option>
                  <option value="Inappropriate Content">Inappropriate Content</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Details (Optional)</label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Provide more details..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setReportModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={isReporting || !reportReason}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isReporting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

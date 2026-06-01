import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, ArrowLeft, Plus, Minus, Star, User, Users, Share2, Facebook, Twitter, MessageCircle, Loader2, Flag } from 'lucide-react';
import GlobalNavbar from '../../components/ui/GlobalNavbar';
import { useAuth } from '../../contexts/AuthContext';
import { getEventDetail, submitDispute, PublicEventDetailResponse } from '../../services/publicService';
import toast from 'react-hot-toast';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  } catch { return iso; }
}
function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}
function formatReviewDate(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 30) return `${days} days ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  } catch { return ''; }
}

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState<PublicEventDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Record<string, number>>({});
  
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getEventDetail(id)
      .then(setEvent)
      .catch(() => setError('Event not found or unavailable.'))
      .finally(() => setLoading(false));
  }, [id]);

  const updateTicketCount = (tierId: string, delta: number) => {
    setTickets(prev => {
      const next = Math.max(0, (prev[tierId] || 0) + delta);
      return { ...prev, [tierId]: next };
    });
  };

  const totalTickets = Object.values(tickets).reduce((a, b) => a + b, 0);
  const totalPrice = event?.ticketTiers.reduce((total, tier) =>
    total + (tier.price * (tickets[tier.id] || 0)), 0) ?? 0;

  const handleCheckout = () => {
    if (!user) {
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }
    if (!event) return;
    // Build a checkout-compatible event shape
    const checkoutEvent = {
      id: event.id,
      title: event.title,
      date: formatDate(event.eventDate),
      time: formatTime(event.eventDate),
      location: event.location,
      thumbnail: event.coverImageUrl || `https://picsum.photos/seed/${event.id}/800/600`,
      organizerId: event.organizer.id,
      tiers: event.ticketTiers.map(t => ({ id: t.id, name: t.name, price: t.price, capacity: t.capacity, description: '' })),
    };
    navigate('/checkout', { state: { event: checkoutEvent, tickets, totalPrice } });
  };

  const handleReport = async () => {
    if (!reportReason) {
      toast.error('Please select a reason.');
      return;
    }
    if (!event) return;

    setIsReporting(true);
    try {
      await submitDispute({
        targetId: event.id,
        targetType: 'EVENT',
        tenantId: event.tenantId,
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
        <div className="h-64 md:h-96 w-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 flex flex-col lg:flex-row gap-8 lg:gap-12">
          <div className="lg:w-[70%] space-y-6">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse h-40" />)}
          </div>
          <div className="lg:w-[30%]"><div className="rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse h-64" /></div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-900 dark:text-white">
        <GlobalNavbar />
        <div className="text-center mt-24">
          <h2 className="text-2xl font-bold mb-4">{error || 'Event not found'}</h2>
          <button onClick={() => navigate('/events')} className="text-blue-600 hover:underline">Browse all events</button>
        </div>
      </div>
    );
  }

  const isUpcoming = new Date(event.eventDate) > new Date();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-500 pb-24">
      <GlobalNavbar />

      {/* Banner */}
      <div className="relative h-64 md:h-96 w-full">
        <img src={event.coverImageUrl || `https://picsum.photos/seed/${event.id}/1920/1080`} alt={event.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
        <div className="absolute top-6 left-6 md:top-8 md:left-8 z-10">
          <button onClick={() => navigate(-1)} className="inline-flex items-center px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-colors font-medium shadow-sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

          {/* Left Column */}
          <div className="lg:w-[70%] space-y-10">

            {/* Header Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isUpcoming ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {isUpcoming ? 'Upcoming' : 'Past Event'}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight">{event.title}</h1>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-slate-900 dark:text-white">{event.averageRating.toFixed(1)}</span>
                <span>({event.totalReviews} reviews)</span>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div className="flex items-start gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0"><Calendar className="w-6 h-6" /></div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Date & Time</p>
                  <p className="font-bold text-slate-900 dark:text-white">{formatDate(event.eventDate)}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{formatTime(event.eventDate)}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0"><MapPin className="w-6 h-6" /></div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Venue</p>
                  <p className="font-bold text-slate-900 dark:text-white">{event.location || 'TBA'}</p>
                </div>
              </div>

              <Link to={`/organizer/${event.organizer.id}`} className="flex items-start gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500 dark:hover:border-blue-500 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0 group-hover:scale-110 transition-transform"><User className="w-6 h-6" /></div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Organized By</p>
                  <p className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{event.organizer.organizationName}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">View Profile &rarr;</p>
                </div>
              </Link>

              <div className="flex items-start gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0"><Users className="w-6 h-6" /></div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Capacity</p>
                  <p className="font-bold text-slate-900 dark:text-white">{event.totalCapacity} total seats</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="text-2xl font-bold mb-6">About this event</h2>
                <div className="prose prose-lg dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 whitespace-pre-line">{event.description}</div>
              </div>
            )}

            {/* Reviews */}
            {event.reviews.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold">Reviews</h2>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold">{event.averageRating.toFixed(1)}</span>
                    <span className="text-slate-500 text-sm">({event.totalReviews})</span>
                  </div>
                </div>
                <div className="space-y-6">
                  {event.reviews.map(review => (
                    <div key={review.id} className="pb-6 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-sm">
                            {review.comment?.charAt(0).toUpperCase() || 'R'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">Anonymous Reviewer</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{formatReviewDate(review.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 dark:text-slate-700'}`} />
                          ))}
                        </div>
                      </div>
                      {review.comment && <p className="text-slate-600 dark:text-slate-300">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column — Ticket Selection */}
          <div className="lg:w-[30%]">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 md:p-8">
                <h3 className="text-2xl font-bold mb-6">Select Tickets</h3>
                {event.ticketTiers.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 text-sm">No ticket tiers available.</p>
                ) : (
                  <div className="space-y-5 mb-8">
                    {event.ticketTiers.map(tier => (
                      <div key={tier.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-lg text-slate-900 dark:text-white">{tier.name}</h4>
                            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-2">{tier.capacity} capacity</p>
                          </div>
                          <p className="font-bold text-xl text-slate-900 dark:text-white">
                            {tier.price === 0 ? 'Free' : `Rs. ${tier.price}`}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-sm text-slate-500 dark:text-slate-400">Quantity</span>
                          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <button onClick={() => updateTicketCount(tier.id, -1)} disabled={!tickets[tier.id]} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors text-slate-600 dark:text-slate-300">
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-6 text-center font-bold text-slate-900 dark:text-white">{tickets[tier.id] || 0}</span>
                            <button onClick={() => updateTicketCount(tier.id, 1)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300">
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Total ({totalTickets})</span>
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">Rs. {totalPrice}</span>
                  </div>
                  <button
                    className="w-full py-4 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:pointer-events-none"
                    disabled={totalTickets === 0 || !isUpcoming}
                    onClick={handleCheckout}
                  >
                    {isUpcoming ? 'Book Now' : 'Event Ended'}
                  </button>
                </div>
              </div>

              {/* Share & Actions */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 text-center">
                <h3 className="font-bold text-lg mb-4 flex items-center justify-center gap-2"><Share2 className="w-5 h-5" /> Share Event</h3>
                <div className="flex items-center justify-center gap-4 mb-6">
                  <button className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:scale-110 transition-transform"><Facebook className="w-5 h-5" /></button>
                  <button className="w-12 h-12 rounded-full bg-sky-50 dark:bg-sky-500/10 text-sky-500 dark:text-sky-400 flex items-center justify-center hover:scale-110 transition-transform"><Twitter className="w-5 h-5" /></button>
                  <button className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center hover:scale-110 transition-transform"><MessageCircle className="w-5 h-5" /></button>
                </div>
                
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setReportModalOpen(true)}
                    className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-red-500 transition-colors mx-auto"
                  >
                    <Flag className="w-4 h-4" /> Report this event
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-4">Report Event</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a reason</option>
                  <option value="Inappropriate Content">Inappropriate Content</option>
                  <option value="Scam/Fraud">Scam / Fraud</option>
                  <option value="Intellectual Property Violation">Intellectual Property Violation</option>
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

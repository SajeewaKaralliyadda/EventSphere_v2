import React, { useState, useEffect, useCallback } from 'react';
import { Heart, ArrowLeft, Loader2, Trash2, Calendar, MapPin, ExternalLink, AlertTriangle, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SidebarLayout from '../../components/ui/SidebarLayout';
import toast from 'react-hot-toast';
import { getWishlist, removeFromWishlist, WishlistResponse } from '../../services/attendeeService';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return iso; }
}

export default function Wishlist() {
  const navigate = useNavigate();
  const [items, setItems] = useState<WishlistResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWishlist();
      setItems(data);
    } catch {
      setError('Could not load your wishlist. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const handleRemove = async (item: WishlistResponse) => {
    setRemovingIds(prev => new Set([...prev, item.id]));
    try {
      await removeFromWishlist(item.eventId);
      setItems(prev => prev.filter(i => i.id !== item.id));
      toast('Removed from wishlist', { icon: '💔' });
    } catch {
      toast.error('Could not remove from wishlist.');
      setRemovingIds(prev => { const s = new Set(prev); s.delete(item.id); return s; });
    }
  };

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

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center">
                <Heart className="w-6 h-6 fill-red-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">My Wishlist</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Events you've saved for later.</p>
              </div>
            </div>
            {!loading && (
              <button
                onClick={fetchWishlist}
                className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-500"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse h-72" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
            <p className="text-slate-700 dark:text-slate-300 font-bold mb-4">{error}</p>
            <button onClick={fetchWishlist} className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Heart className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Your wishlist is empty</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Discover events and tap the heart icon to save them here.</p>
            <Link to="/" className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
              <div key={item.id} className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={item.coverImageUrl || `https://picsum.photos/seed/${item.eventId}/800/600`}
                    alt={item.eventTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(item)}
                    disabled={removingIds.has(item.id)}
                    className="absolute top-3 right-3 p-2.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm hover:scale-110 transition-all disabled:opacity-60 z-10"
                  >
                    {removingIds.has(item.id)
                      ? <Loader2 className="w-5 h-5 animate-spin text-rose-500" />
                      : <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                    }
                  </button>
                  <p className="absolute bottom-3 left-3 text-xs font-semibold text-white/80">
                    Added {formatDate(item.addedAt)}
                  </p>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-lg line-clamp-2 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.eventTitle}
                  </h3>
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                      <Calendar className="w-4 h-4 mr-2 shrink-0" />
                      {formatDate(item.eventDate)}
                    </div>
                    {item.location && (
                      <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                        <MapPin className="w-4 h-4 mr-2 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Link
                      to={`/events/${item.eventId}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4" /> View Event
                    </Link>
                    <button
                      onClick={() => handleRemove(item)}
                      disabled={removingIds.has(item.id)}
                      className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 rounded-xl transition-colors disabled:opacity-60"
                    >
                      {removingIds.has(item.id)
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </SidebarLayout>
  );
}

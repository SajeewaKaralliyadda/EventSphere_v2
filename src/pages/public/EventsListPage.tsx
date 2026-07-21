import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import GlobalNavbar from '../../components/ui/GlobalNavbar';
import EventGrid from '../../components/common/EventGrid';
import { Search, Calendar, X, Loader2, SlidersHorizontal } from 'lucide-react';
import { discoverEvents, PublicEventResponse, SpringPage } from '../../services/publicService';
import { type EventData } from '../../components/common/EventCard';

function formatEventDate(isoDate: string): string {
  try {
    return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return isoDate; }
}

function toEventData(e: PublicEventResponse): EventData {
  return {
    id: e.id,
    title: e.title,
    date: formatEventDate(e.eventDate),
    price: e.isFree ? 0 : (e.minTicketPrice ?? 0),
    thumbnail: e.coverImageUrl || `https://picsum.photos/seed/${e.id}/800/600`,
    tenantName: e.organizerName || 'EventSphere',
  };
}

const CATEGORIES = ['All', 'Technology', 'Music', 'Business', 'Arts', 'Social', 'Health', 'Sports'];

export default function EventsListPage() {
  const navigate = useNavigate();

  // Filter state
  const [category, setCategory] = useState(() => new URLSearchParams(window.location.search).get('category') || 'All');
  const [isFree, setIsFree] = useState<boolean | undefined>(undefined);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Data state
  const [events, setEvents] = useState<EventData[]>([]);
  const [page, setPage] = useState<SpringPage<PublicEventResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // Debounce ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchEvents = useCallback(async (pageNum: number, append: boolean) => {
    if (pageNum === 0) setLoading(true); else setLoadingMore(true);
    try {
      const params: Parameters<typeof discoverEvents>[0] = { page: pageNum, size: 12 };
      if (category && category !== 'All') params.category = category;
      if (isFree !== undefined) params.isFree = isFree;
      if (minPrice) params.minPrice = parseFloat(minPrice);
      if (maxPrice) params.maxPrice = parseFloat(maxPrice);

      const data = await discoverEvents(params);
      setPage(data);
      setEvents(prev => append ? [...prev, ...data.content.map(toEventData)] : data.content.map(toEventData));
    } catch {
      if (!append) setEvents([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [category, isFree, minPrice, maxPrice]);

  // Re-fetch when filters change (debounced)
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setCurrentPage(0);
      fetchEvents(0, false);
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [fetchEvents]);

  const handleLoadMore = () => {
    const next = currentPage + 1;
    setCurrentPage(next);
    fetchEvents(next, true);
  };

  const clearFilters = () => {
    setCategory('All');
    setIsFree(undefined);
    setMinPrice('');
    setMaxPrice('');
  };

  const hasActiveFilters = category !== 'All' || isFree !== undefined || minPrice || maxPrice;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-500">
      <GlobalNavbar />
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Discover Events</h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl">Find the best campus events, workshops, and parties happening across top universities.</p>

          {/* Search + Filter Toggle */}
          <div className="mt-8 flex flex-col md:flex-row gap-4 max-w-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by keyword (press Enter)..."
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    setCategory((e.target as HTMLInputElement).value || 'All');
                  }
                }}
              />
            </div>
            <button
              onClick={() => setShowFilters(p => !p)}
              className={`px-6 py-3.5 font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 ${showFilters ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filters
              {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-amber-400" />}
            </button>
          </div>

          {/* Expanded Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-3xl flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Price Type</label>
                <div className="flex gap-2">
                  {[{ label: 'Any', val: undefined }, { label: 'Free', val: true }, { label: 'Paid', val: false }].map(opt => (
                    <button
                      key={String(opt.val)}
                      onClick={() => setIsFree(opt.val)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isFree === opt.val ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Min Price (Rs. )</label>
                <input type="number" min="0" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="0" className="w-24 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Max Price (Rs. )</label>
                <input type="number" min="0" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Any" className="w-24 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              </div>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm font-medium text-rose-500 hover:text-rose-600 transition-colors">
                  <X className="w-4 h-4" /> Clear All
                </button>
              )}
            </div>
          )}

          {/* Category Pills */}
          <div className="flex overflow-x-auto pb-2 mt-8 gap-2 no-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === cat
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {category === 'All' ? 'All Events' : `${category} Events`}
            {!loading && page && (
              <span className="text-slate-500 text-base font-normal ml-2">({page.totalElements} results)</span>
            )}
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse h-72" />
            ))}
          </div>
        ) : events.length > 0 ? (
          <>
            <EventGrid events={events} />
            {page && !page.last && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-8 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm disabled:opacity-60"
                >
                  {loadingMore ? <><Loader2 className="w-5 h-5 animate-spin" /> Loading...</> : 'Load More Events'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No events found</h3>
            <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or category filters.</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="mt-4 text-blue-600 dark:text-blue-400 font-medium hover:underline">Clear all filters</button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

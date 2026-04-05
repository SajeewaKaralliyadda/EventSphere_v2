import React, { useState } from 'react';
import GlobalNavbar from '../../components/ui/GlobalNavbar';
import EventGrid from '../../components/common/EventGrid';
import { Search, Filter, Calendar, MapPin } from 'lucide-react';

// Using the same mock data standard from the app
const MOCK_EVENTS = [
  { id: '1', title: 'Annual Tech Symposium 2026', date: 'Oct 15, 2026', price: 15, thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80', tenantName: 'Stanford University', category: 'Technology' },
  { id: '2', title: 'Fall Music Festival', date: 'Nov 2, 2026', price: 25, thumbnail: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80', tenantName: 'MIT', category: 'Music' },
  { id: '3', title: 'Startup Pitch Night', date: 'Sep 28, 2026', price: 0, thumbnail: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80', tenantName: 'Berkeley', category: 'Business' },
  { id: '4', title: 'Health & Wellness Workshop', date: 'Oct 5, 2026', price: 5, thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80', tenantName: 'UCLA', category: 'Health' },
  { id: '5', title: 'Art & Design Exhibition', date: 'Oct 20, 2026', price: 10, thumbnail: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80', tenantName: 'NYU', category: 'Arts' },
  { id: '6', title: 'Hackathon 2026', date: 'Nov 12, 2026', price: 0, thumbnail: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80', tenantName: 'Stanford University', category: 'Technology' },
  { id: '7', title: 'Business Case Competition', date: 'Dec 5, 2026', price: 20, thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80', tenantName: 'Harvard University', category: 'Business' },
  { id: '8', title: 'Winter Gala', date: 'Dec 15, 2026', price: 50, thumbnail: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&q=80', tenantName: 'Yale University', category: 'Social' },
];

const CATEGORIES = ['All', 'Technology', 'Music', 'Business', 'Arts', 'Social', 'Health'];

export default function EventsListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredEvents = MOCK_EVENTS.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          event.tenantName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-500">
      <GlobalNavbar />
      
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Discover Events</h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl">
            Find the best campus events, workshops, and parties happening across top universities.
          </p>

          {/* Search Bar */}
          <div className="mt-8 flex flex-col md:flex-row gap-4 max-w-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search events, universities..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
              />
            </div>
            <button className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2">
              <Filter className="w-5 h-5" /> Filters
            </button>
          </div>

          {/* Category Pills */}
          <div className="flex overflow-x-auto pb-2 mt-8 gap-2 no-scrollbar">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {selectedCategory === 'All' ? 'All Events' : `${selectedCategory} Events`}
            <span className="text-slate-500 text-base font-normal ml-2">({filteredEvents.length} results)</span>
          </h2>
        </div>

        {filteredEvents.length > 0 ? (
          <EventGrid events={filteredEvents} />
        ) : (
          <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
             <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
             <h3 className="text-xl font-bold mb-2">No events found</h3>
             <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or category filters.</p>
          </div>
        )}
      </main>
    </div>
  );
}

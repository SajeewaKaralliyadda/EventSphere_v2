import React, { useState } from 'react';
import { Building2, Search, ArrowRight, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import GlobalNavbar from '../../components/ui/GlobalNavbar';
import { useNavigate } from 'react-router-dom';

const MOCK_UNIVERSITIES = [
  { id: '1', name: 'Stanford University', location: 'Stanford, CA', domain: 'stanford.eventsphere.com', logo: 'S', color: 'from-red-600 to-red-800', events: 142 },
  { id: '2', name: 'Massachusetts Institute of Technology', location: 'Cambridge, MA', domain: 'mit.eventsphere.com', logo: 'M', color: 'from-slate-700 to-slate-900', events: 89 },
  { id: '3', name: 'Harvard University', location: 'Cambridge, MA', domain: 'harvard.eventsphere.com', logo: 'H', color: 'from-rose-700 to-rose-900', events: 210 },
  { id: '4', name: 'University of California, Berkeley', location: 'Berkeley, CA', domain: 'berkeley.eventsphere.com', logo: 'B', color: 'from-blue-700 to-yellow-600', events: 156 },
  { id: '5', name: 'University of Moratuwa', location: 'Moratuwa, Sri Lanka', domain: 'uom.eventsphere.com', logo: 'UoM', color: 'from-blue-600 to-blue-800', events: 45 },
  { id: '6', name: 'University of Colombo', location: 'Colombo, Sri Lanka', domain: 'cmb.eventsphere.com', logo: 'UoC', color: 'from-yellow-500 to-yellow-700', events: 62 },
];

export default function UniversityDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredUniversities = MOCK_UNIVERSITIES.filter(uni => 
    uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    uni.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <GlobalNavbar />
      
      {/* Header */}
      <div className="pt-32 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Participating Universities
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
            Find your campus and discover amazing events happening near you. EventSphere connects students across the globe.
          </p>
          
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by university name or location..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm text-lg"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUniversities.map((uni, index) => (
            <motion.div 
              key={uni.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              onClick={() => navigate('/')} // In a real app, this would set the tenant context or navigate to the tenant subdomain
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${uni.color} flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0`}>
                  {uni.logo}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{uni.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-3">
                    <MapPin className="w-3 h-3" /> {uni.location}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-600 dark:text-slate-300">
                      {uni.events} Upcoming Events
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {filteredUniversities.length === 0 && (
          <div className="text-center py-20">
            <Building2 className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No universities found</h3>
            <p className="text-slate-500 dark:text-slate-400">Try adjusting your search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}

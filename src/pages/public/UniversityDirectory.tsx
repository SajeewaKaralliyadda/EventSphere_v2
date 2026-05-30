import React, { useState, useEffect } from 'react';
import { Building2, Search, ArrowRight, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import GlobalNavbar from '../../components/ui/GlobalNavbar';
import { useNavigate } from 'react-router-dom';
import { getActiveUniversities, TenantSummaryResponse } from '../../services/publicService';

export default function UniversityDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [universities, setUniversities] = useState<TenantSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getActiveUniversities()
      .then(data => {
        setUniversities(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load universities", err);
        setLoading(false);
      });
  }, []);

  const filteredUniversities = universities.filter(uni => 
    uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (uni.location && uni.location.toLowerCase().includes(searchTerm.toLowerCase()))
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
        {loading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 dark:text-slate-400">Loading universities...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUniversities.map((uni, index) => (
              <motion.div 
                key={uni.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                onClick={() => navigate(`/universities/${uni.slug}`)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between h-full"
              >
                {uni.coverImageUrl ? (
                  <div className="h-32 w-full overflow-hidden">
                    <img src={uni.coverImageUrl} alt={`${uni.name} banner`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                ) : (
                  <div 
                    className="h-32 w-full"
                    style={{ background: uni.primaryColor ? uni.primaryColor : 'linear-gradient(to bottom right, #3b82f6, #1d4ed8)' }}
                  />
                )}
                
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-start gap-4 mb-4 -mt-12">
                    {uni.logoUrl ? (
                      <img src={uni.logoUrl} alt={`${uni.name} logo`} className="w-16 h-16 rounded-2xl object-cover shadow-md shrink-0 bg-white dark:bg-slate-900 border-4 border-white dark:border-slate-900" />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl shadow-md shrink-0 bg-white dark:bg-slate-900 p-1 flex items-center justify-center">
                        <div 
                          className="w-full h-full rounded-xl flex items-center justify-center text-white font-bold text-xl"
                          style={{ background: uni.primaryColor ? uni.primaryColor : 'linear-gradient(to bottom right, #3b82f6, #1d4ed8)' }}
                        >
                          {uni.name.charAt(0)}
                        </div>
                      </div>
                    )}
                    <div className="flex-1 mt-8">
                      <h3 className="font-bold text-lg leading-tight mb-1 transition-colors line-clamp-2" style={{ color: uni.primaryColor }}>
                        {uni.name}
                      </h3>
                      {uni.location && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" /> 
                          <span className="truncate">{uni.location}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {uni.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 flex-1">
                      {uni.description}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <span 
                      className="text-xs font-medium"
                      style={{ color: uni.primaryColor || '#3b82f6' }}
                    >
                      View Campus
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {!loading && filteredUniversities.length === 0 && (
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

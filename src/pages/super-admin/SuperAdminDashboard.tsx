import React, { useState, Fragment } from 'react';
import { 
  Building2, 
  Users, 
  Ticket, 
  TrendingUp, 
  Plus, 
  MoreVertical,
  Activity,
  Globe,
  Settings,
  Bell,
  Search,
  Moon,
  Sun,
  DollarSign
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import OnboardTenantModal from '../../components/ui/OnboardTenantModal';
import SidebarLayout from '../../components/ui/SidebarLayout';

// Mock data for the revenue chart
const revenueData = [
  { name: 'Jan', total: 12000 },
  { name: 'Feb', total: 19000 },
  { name: 'Mar', total: 15000 },
  { name: 'Apr', total: 28000 },
  { name: 'May', total: 22000 },
  { name: 'Jun', total: 35000 },
  { name: 'Jul', total: 42000 },
];

// Mock data for recent universities
const recentUniversities = [
  { id: 1, name: 'Stanford University', domain: 'stanford.eventsphere.com', status: 'Active', students: '17k' },
  { id: 2, name: 'MIT', domain: 'mit.eventsphere.com', status: 'Active', students: '11k' },
  { id: 3, name: 'Harvard University', domain: 'harvard.eventsphere.com', status: 'Onboarding', students: '23k' },
  { id: 4, name: 'Berkeley', domain: 'berkeley.eventsphere.com', status: 'Active', students: '42k' },
];

export default function SuperAdminDashboard() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Glassmorphism base classes
  const glassCard = "bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 shadow-xl rounded-3xl p-6 transition-all duration-300";

  return (
    <Fragment>
      <SidebarLayout>
        <div className={`transition-colors duration-500 ${isDarkMode ? 'dark text-slate-50' : 'text-slate-900'}`}>
        
        {/* Decorative Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/20 dark:bg-blue-600/20 blur-[120px]" />
          <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full bg-purple-500/20 dark:bg-purple-600/20 blur-[120px]" />
        </div>

        <div className="relative z-10 py-4">
          
          {/* Top Header Section */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Super Admin Portal</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Manage global platform analytics and tenants.</p>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/super-admin/payouts')}
                className="hidden md:flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Manage Payouts
              </button>
              
              <button onClick={toggleDarkMode} className="p-2.5 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 transition-colors">
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </header>

        {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            
          {/* Stat Card 1: Total Universities */}
          <div className={`${glassCard} flex flex-col justify-between group hover:-translate-y-1`}>
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="flex items-center text-sm font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3 mr-1" /> +12%
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-4xl font-bold tracking-tight">142</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Active Universities</p>
            </div>
          </div>

          {/* Stat Card 2: Total Events */}
          <div className={`${glassCard} flex flex-col justify-between group hover:-translate-y-1`}>
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">
                <Ticket className="w-6 h-6" />
              </div>
              <span className="flex items-center text-sm font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3 mr-1" /> +24%
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-4xl font-bold tracking-tight">8,439</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Events Hosted (YTD)</p>
            </div>
          </div>

          {/* Stat Card 3: Total Users */}
          <div className={`${glassCard} flex flex-col justify-between group hover:-translate-y-1`}>
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400">
                <Users className="w-6 h-6" />
              </div>
              <span className="flex items-center text-sm font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3 mr-1" /> +18%
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-4xl font-bold tracking-tight">1.2M</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Registered Attendees</p>
            </div>
          </div>

          {/* Quick Action Card */}
          <div 
            onClick={() => setIsOnboardModalOpen(true)}
            className={`${glassCard} bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-600 dark:to-purple-700 text-white border-none flex flex-col justify-center items-center text-center cursor-pointer hover:shadow-2xl hover:shadow-blue-500/20 transition-all group`}
          >
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold">Onboard Tenant</h3>
            <p className="text-sm text-white/80 mt-1">Add a new university</p>
          </div>

          {/* Main Chart: Global Revenue */}
          <div className={`${glassCard} md:col-span-2 lg:col-span-2 min-h-[400px] flex flex-col`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Global Platform Revenue</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Aggregated ticket sales across all tenants</p>
              </div>
              <select className="bg-slate-100 dark:bg-slate-800 border-none text-sm rounded-lg px-3 py-2 outline-none cursor-pointer">
                <option>This Year</option>
                <option>Last Year</option>
                <option>All Time</option>
              </select>
            </div>
            <div className="flex-1 w-full h-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    itemStyle={{ color: isDarkMode ? '#f8fafc' : '#0f172a', fontWeight: 600 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tenant Onboarding Table */}
          <div className={`${glassCard} md:col-span-2 lg:col-span-2 flex flex-col`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Tenant Onboarding</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage and approve new universities</p>
              </div>
              <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                View All
              </button>
            </div>
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
                    <th className="pb-3 font-medium">University Name</th>
                    <th className="pb-3 font-medium">Domain</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {recentUniversities.map((uni) => (
                    <tr key={uni.id} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 font-semibold flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                          {uni.name.charAt(0)}
                        </div>
                        {uni.name}
                      </td>
                      <td className="py-4 text-slate-500 dark:text-slate-400">{uni.domain}</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          uni.status === 'Active' 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' 
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                        }`}>
                          {uni.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        {uni.status === 'Onboarding' ? (
                          <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm">
                            Approve
                          </button>
                        ) : (
                          <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                            <Settings className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

            {/* System Status */}
            <div className={`${glassCard} md:col-span-3 lg:col-span-4 flex items-center justify-between py-4`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">All Systems operational</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Payment gateways, email delivery, and ticketing are fully functional.</p>
                </div>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                View Status Page
              </button>
            </div>
          </div>
        </div>
        </div>
      </SidebarLayout>

      <OnboardTenantModal 
        isOpen={isOnboardModalOpen} 
        onClose={() => setIsOnboardModalOpen(false)} 
      />
    </Fragment>
  );
}

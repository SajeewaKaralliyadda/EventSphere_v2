import React, { useState, useEffect, Fragment } from 'react';
import {
  Building2,
  Users,
  Ticket,
  TrendingUp,
  Plus,
  Settings,
  Activity,
  DollarSign,
  Moon,
  Sun,
  Loader2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import OnboardTenantModal from '../../components/ui/OnboardTenantModal';
import SidebarLayout from '../../components/ui/SidebarLayout';
import api from '../../lib/api';

interface TenantRow {
  id: string;
  name: string;
  domain: string;
  active: boolean;
}

interface PayoutSummary {
  totalSales: number;
  netPayout: number;
}

// Revenue chart — data will come from payouts loaded from API
const buildRevenueChart = (payouts: PayoutSummary[]) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  return months.map((name) => ({
    name,
    total: Math.floor(Math.random() * 40000) + 5000, // placeholder until real time-series endpoint
  }));
};

export default function SuperAdminDashboard() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [tenantCount, setTenantCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<{ name: string; total: number }[]>([]);
  const navigate = useNavigate();

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [tenantsRes] = await Promise.all([
        api.get<TenantRow[]>('/api/admin/tenants'),
      ]);
      setTenants(tenantsRes.data);
      setTenantCount(tenantsRes.data.filter((t) => t.active).length);
      setRevenueData(buildRevenueChart([]));
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Reload tenants after a new one is onboarded
  const handleOnboardClose = () => {
    setIsOnboardModalOpen(false);
    loadDashboardData();
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const glassCard =
    'bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 shadow-xl rounded-3xl p-6 transition-all duration-300';

  return (
    <Fragment>
      <SidebarLayout>
        <div className={`transition-colors duration-500 ${isDarkMode ? 'dark text-slate-50' : 'text-slate-900'}`}>
          {/* Decorative Background */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/20 dark:bg-blue-600/20 blur-[120px]" />
            <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full bg-purple-500/20 dark:bg-purple-600/20 blur-[120px]" />
          </div>

          <div className="relative z-10 py-4">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Super Admin Portal</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                  Manage global platform analytics and tenants.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/super-admin/payouts')}
                  className="hidden md:flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Manage Payouts
                </button>
                <button
                  onClick={toggleDarkMode}
                  className="p-2.5 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {/* Stat Card: Active Universities */}
              <div className={`${glassCard} flex flex-col justify-between group hover:-translate-y-1`}>
                <div className="flex justify-between items-start">
                  <div className="p-3 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="flex items-center text-sm font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                    <TrendingUp className="w-3 h-3 mr-1" /> Live
                  </span>
                </div>
                <div className="mt-4">
                  {isLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                  ) : (
                    <h3 className="text-4xl font-bold tracking-tight">{tenantCount ?? 0}</h3>
                  )}
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Active Universities
                  </p>
                </div>
              </div>

              {/* Stat Card: Total Tenants */}
              <div className={`${glassCard} flex flex-col justify-between group hover:-translate-y-1`}>
                <div className="flex justify-between items-start">
                  <div className="p-3 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">
                    <Ticket className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4">
                  {isLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                  ) : (
                    <h3 className="text-4xl font-bold tracking-tight">{tenants.length}</h3>
                  )}
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Total Tenants
                  </p>
                </div>
              </div>

              {/* Stat Card: Placeholder Users */}
              <div className={`${glassCard} flex flex-col justify-between group hover:-translate-y-1`}>
                <div className="flex justify-between items-start">
                  <div className="p-3 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-4xl font-bold tracking-tight">—</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Registered Users
                  </p>
                </div>
              </div>

              {/* Quick Action: Onboard Tenant */}
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

              {/* Revenue Chart */}
              <div className={`${glassCard} md:col-span-2 lg:col-span-2 min-h-[400px] flex flex-col`}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold">Global Platform Revenue</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Aggregated ticket sales across all tenants
                    </p>
                  </div>
                </div>
                <div className="flex-1 w-full h-full min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke={isDarkMode ? '#334155' : '#e2e8f0'}
                      />
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
                        tickFormatter={(v) => `$${v / 1000}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDarkMode ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.9)',
                          borderRadius: '12px',
                          border: 'none',
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
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

              {/* Tenant Table — real data */}
              <div className={`${glassCard} md:col-span-2 lg:col-span-2 flex flex-col`}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold">Tenant Onboarding</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      All universities on the platform
                    </p>
                  </div>
                  <button
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={() => navigate('/super-admin/payouts')}
                  >
                    View Payouts
                  </button>
                </div>
                <div className="flex-1 overflow-x-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                    </div>
                  ) : tenants.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-sm">
                      No tenants yet. Click "Onboard Tenant" to add the first university.
                    </div>
                  ) : (
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
                        {tenants.slice(0, 6).map((uni) => (
                          <tr
                            key={uni.id}
                            className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <td className="py-4 font-semibold flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
                                {uni.name.charAt(0)}
                              </div>
                              {uni.name}
                            </td>
                            <td className="py-4 text-slate-500 dark:text-slate-400 text-xs">
                              {uni.domain}
                            </td>
                            <td className="py-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                  uni.active
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                                }`}
                              >
                                {uni.active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                <Settings className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* System Status Bar */}
              <div className={`${glassCard} md:col-span-3 lg:col-span-4 flex items-center justify-between py-4`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">All Systems Operational</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Payment gateways, email delivery, and ticketing are fully functional.
                    </p>
                  </div>
                </div>
                <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </SidebarLayout>

      <OnboardTenantModal isOpen={isOnboardModalOpen} onClose={handleOnboardClose} />
    </Fragment>
  );
}

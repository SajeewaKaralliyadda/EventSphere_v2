import React, { useState } from 'react';
import GlobalNavbar from './GlobalNavbar';
import { LayoutDashboard, Calendar, Users, Settings, Ticket, BarChart3, ChevronLeft, ChevronRight, Tag, ListChecks, UserPlus, Palette, ShieldAlert, Megaphone, DollarSign, Mail, Building2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useTenant } from '../../contexts/TenantContext';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const { currentTenant } = useTenant();

  // Define navigation links based on role
  const getNavLinks = () => {
    if (user?.role === 'TENANT_ADMIN') {
      return [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/tenant-admin/dashboard' },
        { name: 'Approvals', icon: Users, path: '/tenant-admin/approvals' },
        { name: 'Disputes', icon: ShieldAlert, path: '/tenant-admin/disputes' },
        { name: 'Portal Customizer', icon: Palette, path: '/tenant-admin/customize' },
        { name: 'Settings', icon: Settings, path: '/tenant-admin/settings' },
      ];
    }
    if (user?.role === 'SUPER_ADMIN') {
      return [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/super-admin/dashboard' },
        { name: 'Payouts', icon: DollarSign, path: '/super-admin/payouts' },
        { name: 'Announcements', icon: Megaphone, path: '/super-admin/announcements' },
        { name: 'Email Campaigns', icon: Mail, path: '/super-admin/emails' },
        { name: 'Partnership Requests', icon: Building2, path: '/super-admin/partnerships' },
        { name: 'Contact Messages', icon: Mail, path: '/super-admin/contact' },
        { name: 'Settings', icon: Settings, path: '/settings' },
      ];
    }
    if (user?.role === 'GATE_SCANNER') {
      return [
        { name: 'Scanner', icon: Ticket, path: '/organizer/scanner' },
        { name: 'Settings', icon: Settings, path: '/settings' },
      ];
    }
    
    if (
      user?.role === 'ORGANIZER' ||
      user?.role === 'CO_ORGANIZER'
    ) {
      return [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/organizer/dashboard' },
        { name: 'Create Event', icon: Calendar, path: '/organizer/create-event' },
        { name: 'Reports', icon: BarChart3, path: '/organizer/reports' },
        { name: 'Refunds', icon: Ticket, path: '/organizer/refunds' },
        { name: 'Promo Codes', icon: Tag, path: '/organizer/promo' },
        { name: 'Guest List', icon: ListChecks, path: '/organizer/guests' },
        { name: 'Team', icon: UserPlus, path: '/organizer/team' },
        { name: 'Scanner', icon: Ticket, path: '/organizer/scanner' },
        { name: 'Settings', icon: Settings, path: '/settings' },
      ];
    }
    if (user?.role === 'ATTENDEE') {
      return [
        { name: 'My Wallet', icon: Ticket, path: '/attendee/wallet' },
        { name: 'Calendar', icon: Calendar, path: '/attendee/calendar' },
        { name: 'Wishlist', icon: Users, path: '/attendee/wishlist' },
        { name: 'Settings', icon: Settings, path: '/settings' },
      ];
    }
    return [];
  };

  const navLinks = getNavLinks();
  const primaryColor = currentTenant?.primaryColor || '#3b82f6';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-500">
      <GlobalNavbar onMenuClick={() => setMobileOpen(!mobileOpen)} />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside 
          className={cn(
            "fixed lg:static inset-y-0 left-0 z-30 flex flex-col bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out lg:translate-x-0 mt-16 lg:mt-0",
            collapsed ? "w-20" : "w-64",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                    isActive 
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  {isActive && (
                    <div 
                      className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full" 
                      style={{ backgroundColor: primaryColor }}
                    />
                  )}
                  <link.icon 
                    className={cn("w-5 h-5 flex-shrink-0", collapsed ? "mx-auto" : "mr-3")} 
                    style={isActive ? { color: primaryColor } : {}} 
                  />
                  {!collapsed && <span>{link.name}</span>}
                </Link>
              );
            })}
          </div>
          
          {/* Collapse Toggle (Desktop only) */}
          <div className="hidden lg:flex p-4 border-t border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center justify-center w-full p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
              {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {mobileOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-20 lg:hidden mt-16"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

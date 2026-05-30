import React, { useState, useEffect } from 'react';
import { Search, Moon, Sun, LogOut, Settings, User as UserIcon, Menu, AlertCircle, LayoutDashboard } from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';
import { getActiveAnnouncements, PublicAnnouncementResponse } from '../../services/publicService';
import { X } from 'lucide-react';
import logo from '../../assets/logo.png';

interface GlobalNavbarProps {
  onMenuClick?: () => void;
}

export default function GlobalNavbar({ onMenuClick }: GlobalNavbarProps) {
  const { currentTenant } = useTenant();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [announcement, setAnnouncement] = useState<PublicAnnouncementResponse | null>(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    
    const fetchAnnouncement = async () => {
      try {
        const data = await getActiveAnnouncements();
        if (data && data.length > 0) {
          const latest = data[0];
          const dismissed = localStorage.getItem('dismissed_announcement');
          if (dismissed !== latest.id) {
            setAnnouncement(latest);
          }
        }
      } catch (e) {
        // silently fail
      }
    };

    const handleAnnouncementUpdated = () => {
      const stored = localStorage.getItem('globalAnnouncement');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const dismissed = localStorage.getItem('dismissed_announcement');
          if (dismissed !== parsed.id) {
             setAnnouncement(parsed);
          }
        } catch (e) { }
      } else {
        fetchAnnouncement();
      }
    };

    fetchAnnouncement();
    window.addEventListener('announcementUpdated', handleAnnouncementUpdated);
    window.addEventListener('storage', handleAnnouncementUpdated);

    return () => {
      window.removeEventListener('announcementUpdated', handleAnnouncementUpdated);
      window.removeEventListener('storage', handleAnnouncementUpdated);
    };
  }, []);

  const dismissAnnouncement = () => {
    if (announcement) {
      localStorage.setItem('dismissed_announcement', announcement.id);
      setAnnouncement(null);
    }
  };

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove('dark');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      setIsDark(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardRoute = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return '/super-admin';
      case 'TENANT_ADMIN': return '/tenant-admin';
      case 'ORGANIZER': return '/organizer';
      case 'ATTENDEE': return '/attendee';
      default: return '/';
    }
  };

  const NavLinks = () => (
    <div className="hidden lg:flex items-center gap-1 px-4">
      <Link to="/events" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
        Events
      </Link>
      <Link to="/universities" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
        Universities
      </Link>
      <Link to="/help" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
        Help
      </Link>
    </div>
  );

  return (
    <>
      {announcement && (
        <div className={`w-full py-2 px-4 text-center text-sm font-medium flex items-center justify-center gap-2 relative ${
          announcement.bannerColor === 'red' ? 'bg-red-600 text-white' :
          announcement.bannerColor === 'yellow' ? 'bg-yellow-500 text-yellow-950' :
          'bg-blue-600 text-white'
        }`}>
          <div className="flex items-center justify-center gap-2 max-w-4xl mx-auto flex-1">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="truncate">{announcement.message}</span>
          </div>
          <button 
            onClick={dismissAnnouncement}
            className="absolute right-4 p-1 hover:bg-black/10 rounded-full transition-colors focus:outline-none"
            aria-label="Dismiss announcement"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <header className="sticky top-0 z-40 w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="flex items-center justify-between px-4 h-16">
          
          {/* Left Side: Logo */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {onMenuClick && (
              <button onClick={onMenuClick} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden">
                <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
            )}
            
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              {currentTenant ? (
                currentTenant.logoUrl ? (
                  <img src={currentTenant.logoUrl} alt="Logo" className="w-8 h-8 rounded-md object-cover" referrerPolicy="no-referrer" />
                ) : currentTenant.name === 'EventSphere' ? (
                  <img src={logo} alt="EventSphere Logo" className="w-8 h-8 object-contain" />
                ) : (
                  <div 
                    className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold shadow-sm"
                    style={{ backgroundColor: currentTenant.primaryColor || '#3b82f6' }}
                  >
                    {currentTenant.name.charAt(0)}
                  </div>
                )
              ) : (
                <img src={logo} alt="EventSphere Logo" className="w-8 h-8 object-contain" />
              )}
              <span className="font-bold text-lg hidden sm:block text-slate-900 dark:text-white">
                {currentTenant?.name || 'EventSphere'}
              </span>
            </Link>
          </div>

          {/* Center: NavLinks (if Authenticated) or Empty */}
          <div className="flex-1 flex justify-center">
            {user && <NavLinks />}
          </div>

          {/* Right Side */}
          <div className="flex items-center justify-end gap-2 sm:gap-4 flex-shrink-0">
            {!user && <NavLinks />}

            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <>
                <NotificationDropdown />
                
                <div className="relative ml-2">
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm shadow-md">
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </div>
                  </button>

                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
                      <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-xl z-50 overflow-hidden py-2">
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">{user.role.replace('_', ' ')}</p>
                        </div>
                        <div className="py-1">
                          <Link to={getDashboardRoute(user.role)} onClick={() => setDropdownOpen(false)} className="w-full flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <LayoutDashboard className="w-4 h-4 mr-3" /> Dashboard
                          </Link>
                          <Link to="/settings" onClick={() => setDropdownOpen(false)} className="w-full flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <Settings className="w-4 h-4 mr-3" /> Settings
                          </Link>
                        </div>
                        <div className="border-t border-slate-100 dark:border-slate-800 py-1">
                          <button 
                            onClick={handleLogout}
                            className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          >
                            <LogOut className="w-4 h-4 mr-3" /> Sign out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <button 
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Log in
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                >
                  Sign up
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

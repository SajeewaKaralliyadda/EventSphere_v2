import React, { useState, useEffect } from 'react';
import { Search, Moon, Sun, LogOut, Settings, User as UserIcon, Menu, AlertCircle } from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';

interface GlobalNavbarProps {
  onMenuClick?: () => void;
}

export default function GlobalNavbar({ onMenuClick }: GlobalNavbarProps) {
  const { currentTenant } = useTenant();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [announcement, setAnnouncement] = useState<{message: string, color: string, expiryDate: string} | null>(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    
    const checkAnnouncement = () => {
      const stored = localStorage.getItem('globalAnnouncement');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (new Date(parsed.expiryDate) >= new Date()) {
            setAnnouncement(parsed);
          } else {
            localStorage.removeItem('globalAnnouncement');
            setAnnouncement(null);
          }
        } catch (e) {
          // ignore
        }
      } else {
        setAnnouncement(null);
      }
    };

    checkAnnouncement();
    window.addEventListener('announcementUpdated', checkAnnouncement);
    return () => window.removeEventListener('announcementUpdated', checkAnnouncement);
  }, []);

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

  return (
    <>
      {announcement && (
        <div className={`w-full py-2 px-4 text-center text-sm font-medium flex items-center justify-center gap-2 ${
          announcement.color === 'red' ? 'bg-red-600 text-white' :
          announcement.color === 'yellow' ? 'bg-yellow-500 text-yellow-950' :
          'bg-blue-600 text-white'
        }`}>
          <AlertCircle className="w-4 h-4" />
          {announcement.message}
        </div>
      )}
      <header className="sticky top-0 z-40 w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <button onClick={onMenuClick} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden">
              <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
          )}
          
          {/* Tenant Branding */}
          <div className="flex items-center gap-3">
            {currentTenant?.logoUrl ? (
              <img src={currentTenant.logoUrl} alt="Logo" className="w-8 h-8 rounded-md object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div 
                className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold shadow-sm"
                style={{ backgroundColor: currentTenant?.primaryColor || '#3b82f6' }}
              >
                {currentTenant?.name?.charAt(0) || 'E'}
              </div>
            )}
            <span className="font-bold text-lg hidden sm:block text-slate-900 dark:text-white">
              {currentTenant?.name || 'EventSphere'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search Bar */}
          <div className="hidden md:flex items-center px-3 py-1.5 rounded-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none outline-none text-sm w-40 lg:w-64 placeholder:text-slate-400 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="hidden sm:block p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Public Nav Links */}
          <div className="hidden lg:flex items-center gap-1 mr-2 px-4 border-r border-slate-200 dark:border-slate-800">
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

          {/* Notifications */}
          {user && <NotificationDropdown />}

          {/* User Dropdown or Auth Links */}
          {user ? (
            <div className="relative">
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
                      <Link to="/settings" className="w-full flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <UserIcon className="w-4 h-4 mr-3" /> Profile
                      </Link>
                      <Link to="/settings" className="w-full flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
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
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <button 
                onClick={() => navigate('/login')}
                className="hidden sm:block px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
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

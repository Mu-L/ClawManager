import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import LanguageSwitcher from './LanguageSwitcher';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useI18n();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin', label: t('nav.adminDashboard'), icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/admin/users', label: t('nav.users'), icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { path: '/admin/instances', label: t('nav.instances'), icon: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01' },
    { path: '/admin/settings', label: t('nav.settings'), icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ];

  return (
    <div className="app-shell">
      {/* Header Navigation */}
      <header className="app-topbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Home Link */}
            <div className="flex items-center">
              <Link 
                to="/" 
                className="flex items-center text-[#171212] transition-colors hover:text-[#dc2626]"
              >
                <img
                  src="/lobster_transparent.png"
                  alt="ClawManager logo"
                  className="mr-2 h-10 w-10 object-contain"
                />
                <span className="font-bold text-xl">{t('app.name')}</span>
              </Link>

              {/* Admin Navigation */}
              <nav className="hidden md:flex ml-8 gap-1.5">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`app-nav-link ${
                      isActive(item.path)
                        ? 'app-nav-link-active'
                        : ''
                    }`}
                  >
                    <svg 
                      className="h-5 w-5 mr-1.5" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d={item.icon} 
                      />
                    </svg>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />

              {/* Back to User Dashboard */}
              <Link
                to="/dashboard"
                className="flex items-center text-sm font-medium text-[#696363] hover:text-[#171212]"
              >
                <svg 
                  className="h-5 w-5 mr-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                  />
                </svg>
                {t('nav.backToUserDashboard')}
              </Link>

              {/* User Info */}
              <div className="flex items-center text-sm text-gray-600">
                <span className="mr-2">{user?.username}</span>
                <span className="rounded-full border border-[#f3d5ca] bg-[#fff3ec] px-2.5 py-1 text-xs font-medium text-red-600">
                  {t('common.admin')}
                </span>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="text-[#696363] transition-colors hover:text-[#dc2626]"
                title={t('common.logout')}
              >
                <svg 
                  className="h-5 w-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="border-t border-[#eee5df] md:hidden">
          <div className="px-2 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`app-nav-link text-base ${
                  isActive(item.path)
                    ? 'app-nav-link-active'
                    : ''
                }`}
              >
                <svg 
                  className="h-5 w-5 mr-3" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d={item.icon} 
                  />
                </svg>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Page Header */}
      <div className="app-subheader">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            {location.pathname !== '/admin' && (
              <button
                onClick={() => navigate(-1)}
                className="mr-4 text-[#9c938e] hover:text-[#171212]"
              >
                <svg 
                  className="h-5 w-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                  />
                </svg>
              </button>
            )}
            <h1 className="text-2xl font-bold text-[#171212]">{title}</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;

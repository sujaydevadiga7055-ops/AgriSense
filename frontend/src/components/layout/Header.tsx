import React from 'react';
import { Menu, User, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BackendStatusAlert } from '../common/BackendStatusAlert';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  title = 'Agricultural Intelligence Dashboard',
  subtitle,
}) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile toggle */}
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-emerald-950 leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 font-medium hidden sm:block">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Backend health status badge */}
        <div className="hidden lg:block">
          <BackendStatusAlert />
        </div>

        {/* User profile link */}
        <Link
          to="/app/profile"
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors border border-slate-200/60"
        >
          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
            {user?.full_name?.charAt(0).toUpperCase() || 'F'}
          </div>
          <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
            {user?.full_name?.split(' ')[0] || 'Profile'}
          </span>
        </Link>
      </div>
    </header>
  );
};

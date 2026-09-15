import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  History,
  ShieldAlert,
  Menu,
  X,
  LogIn,
  SlidersHorizontal,
  Sparkles,
  Calendar
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout, switchUserRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const handleNav = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <button
            id="nav-brand-logo"
            type="button"
            onClick={() => handleNav(isAuthenticated ? 'dashboard' : 'landing')}
            className="flex items-center gap-2.5 group text-left focus:outline-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-zinc-900 dark:text-white">
                  Email<span className="text-blue-600 dark:text-blue-400">Verifier</span>
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                  Pro
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 -mt-0.5 font-medium hidden sm:block">
                AI Forensics & Geo-Intelligence
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
            {isAuthenticated ? (
              <>
                <button
                  id="nav-dashboard-link"
                  type="button"
                  onClick={() => handleNav('dashboard')}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    currentView === 'dashboard'
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300'
                      : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>

                <button
                  id="nav-history-link"
                  type="button"
                  onClick={() => handleNav('history')}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    currentView === 'history'
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300'
                      : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>History</span>
                </button>

                {user?.role === 'admin' && (
                  <button
                    id="nav-admin-link"
                    type="button"
                    onClick={() => handleNav('admin')}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                      currentView === 'admin'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                        : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Admin Panel</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 uppercase font-bold">
                      Read-only
                    </span>
                  </button>
                )}
              </>
            ) : (
              <button
                id="nav-landing-link"
                type="button"
                onClick={() => handleNav('landing')}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  currentView === 'landing'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300'
                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <span>Overview</span>
              </button>
            )}

            {/* Book Appointment Nav Button */}
            <button
              id="nav-appointments-link"
              type="button"
              onClick={() => handleNav('appointments')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentView === 'appointments'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>Book Appointment</span>
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5">
            
            {/* Theme Toggle Switch */}
            <button
              id="theme-toggle-btn"
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="relative p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400 animate-in spin-in-90 duration-200" />
              ) : (
                <Moon className="w-5 h-5 text-zinc-700 animate-in spin-in-90 duration-200" />
              )}
            </button>

            {/* User Profile / Auth State */}
            {isAuthenticated ? (
              <div className="relative flex items-center gap-2">
                
                {/* Role Switcher Demo Tooltip Pill */}
                <div className="hidden lg:flex items-center">
                  <button
                    type="button"
                    onClick={() => switchUserRole(user?.role === 'admin' ? 'user' : 'admin')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-blue-500 hover:text-blue-600 transition-colors"
                    title="Click to toggle between Admin and User role"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Role: <strong className="text-zinc-900 dark:text-zinc-200 uppercase">{user?.role}</strong></span>
                  </button>
                </div>

                <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-zinc-200 dark:border-zinc-800">
                  <div className="hidden sm:block text-right">
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[120px]">
                      {user?.name}
                    </p>
                    <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 capitalize">
                      {user?.role}
                    </span>
                  </div>

                  <button
                    id="user-logout-btn"
                    type="button"
                    onClick={logout}
                    aria-label="Logout"
                    title="Logout from session"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition-all focus:outline-hidden"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                id="nav-login-btn"
                type="button"
                onClick={() => handleNav('auth')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md shadow-blue-500/20 active:scale-95 transition-all focus:outline-hidden focus:ring-2 focus:ring-blue-400"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 focus:outline-hidden"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 px-4 pt-3 pb-5 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {isAuthenticated ? (
            <>
              <div className="py-2 px-3 mb-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
                <div>
                  <p className="font-bold text-zinc-900 dark:text-white">{user?.name}</p>
                  <p className="text-[11px]">{user?.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => switchUserRole(user?.role === 'admin' ? 'user' : 'admin')}
                  className="px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-800 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400"
                >
                  Role: {user?.role} (switch)
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleNav('dashboard')}
                className={`w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-semibold text-left ${
                  currentView === 'dashboard'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                    : 'text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => handleNav('history')}
                className={`w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-semibold text-left ${
                  currentView === 'history'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                    : 'text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Verification History</span>
              </button>

              {user?.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => handleNav('admin')}
                  className={`w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-semibold text-left ${
                    currentView === 'admin'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-emerald-500" />
                  <span>Admin User Logs</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleNav('appointments')}
                className={`w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-semibold text-left ${
                  currentView === 'appointments'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                    : 'text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>Book Appointment</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleNav('landing')}
                className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-semibold text-zinc-700 dark:text-zinc-300"
              >
                <span>Overview & Demo</span>
              </button>
              <button
                type="button"
                onClick={() => handleNav('appointments')}
                className={`w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-semibold text-left ${
                  currentView === 'appointments'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                    : 'text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>Book Appointment</span>
              </button>
              <button
                type="button"
                onClick={() => handleNav('auth')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Register</span>
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { SkipToContent } from './components/SkipToContent';
import { BackToTop } from './components/BackToTop';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { AdminPage } from './pages/AdminPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { Shield, Lock, Heart, Github, Calendar } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<string>('landing');

  // Handle navigation
  const handleNavigate = (view: string) => {
    // If navigating to protected view while not authenticated, route to auth first
    if ((view === 'dashboard' || view === 'history' || view === 'admin') && !isAuthenticated) {
      setCurrentView('auth');
    } else {
      setCurrentView(view);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <SkipToContent targetId="main-app-content" />

      {/* Fixed Navigation Bar */}
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      {/* Main Container */}
      <main id="main-app-content" className="flex-1 pt-20 pb-12">
        {currentView === 'landing' && (
          <LandingPage
            onGetStarted={() => handleNavigate('auth')}
            onNavigateToDashboard={() => handleNavigate('dashboard')}
            onBookAppointment={() => handleNavigate('appointments')}
          />
        )}

        {currentView === 'auth' && (
          <AuthPage
            initialMode="login"
            onSuccess={() => handleNavigate('dashboard')}
          />
        )}

        {currentView === 'dashboard' && (
          isAuthenticated ? (
            <DashboardPage onNavigate={handleNavigate} />
          ) : (
            <AuthPage initialMode="login" onSuccess={() => handleNavigate('dashboard')} />
          )
        )}

        {currentView === 'history' && (
          isAuthenticated ? (
            <HistoryPage onNavigate={handleNavigate} />
          ) : (
            <AuthPage initialMode="login" onSuccess={() => handleNavigate('history')} />
          )
        )}

        {currentView === 'admin' && (
          isAuthenticated ? (
            <AdminPage onNavigate={handleNavigate} />
          ) : (
            <AuthPage initialMode="login" onSuccess={() => handleNavigate('admin')} />
          )
        )}

        {currentView === 'appointments' && (
          <AppointmentsPage onNavigate={handleNavigate} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xs py-8 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center text-white">
              <Shield className="w-3 h-3" />
            </div>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">EmailVerifier Pro</span>
            <span>— Advanced Phishing & Mail Server Diagnostics</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button
              type="button"
              onClick={() => handleNavigate('landing')}
              className="hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('dashboard')}
              className="hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Console
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('appointments')}
              className="hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-colors flex items-center gap-1"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>Book Appointment</span>
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('history')}
              className="hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Audit History
            </button>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <span className="inline-flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-500" />
              <span>Zero Mail Retention</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Floating Back to Top Button */}
      <BackToTop />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

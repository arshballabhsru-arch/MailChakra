import React from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { AppointmentBookingForm } from '../components/AppointmentBookingForm';
import { useAuth } from '../context/AuthContext';
import { Calendar, Shield, Database, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import { SUPABASE_PROJECT_ID } from '../lib/supabase';

interface AppointmentsPageProps {
  onNavigate: (view: string) => void;
}

export const AppointmentsPage: React.FC<AppointmentsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <Breadcrumbs
        items={[
          { label: 'Overview', href: '#', onClick: () => onNavigate('landing') },
          { label: 'Appointments & Consultations', current: true }
        ]}
      />

      {/* Hero Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-blue-900/40 via-zinc-900 to-emerald-950/40 border border-zinc-800 text-white shadow-lg relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Supabase Backend Integration Active</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Schedule a Security Audit & Consultation
          </h1>

          <p className="text-sm text-zinc-300 leading-relaxed">
            Reserve time with our email security analysts to review active phishing threats, verify SPF/DKIM/DMARC server policies, or audit suspicious wire transfer requests.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Project ID: <code className="text-zinc-200 font-mono">{SUPABASE_PROJECT_ID}</code></span>
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>End-to-end encrypted storage</span>
            </span>
          </div>
        </div>
      </div>

      {/* Booking Form Component */}
      <AppointmentBookingForm
        defaultEmail={user?.email || ''}
        defaultName={user?.name || ''}
      />
    </div>
  );
};

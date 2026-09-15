import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Building,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Database,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Inbox
} from 'lucide-react';
import { AppointmentBooking } from '../types';
import {
  SUPABASE_PROJECT_ID,
  SUPABASE_URL,
  APPOINTMENTS_TABLE_SQL,
  saveAppointmentToSupabase,
  testSupabaseConnection,
  fetchAppointments,
  getLocalAppointments
} from '../lib/supabase';

interface AppointmentBookingFormProps {
  onSuccess?: (booking: AppointmentBooking) => void;
  defaultEmail?: string;
  defaultName?: string;
}

export const AppointmentBookingForm: React.FC<AppointmentBookingFormProps> = ({
  onSuccess,
  defaultEmail = '',
  defaultName = ''
}) => {
  // Form input states
  const [fullName, setFullName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [serviceType, setServiceType] = useState('Enterprise Email Security Audit');
  const [appointmentDate, setAppointmentDate] = useState(() => {
    // Tomorrow as default
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [appointmentTime, setAppointmentTime] = useState('10:00 AM');
  const [notes, setNotes] = useState('');

  // UI & Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    source?: 'supabase' | 'local_fallback';
    message?: string;
    error?: string;
    requiresTableCreation?: boolean;
  } | null>(null);

  // Supabase connection status state
  const [dbStatus, setDbStatus] = useState<{
    checked: boolean;
    connected: boolean;
    tableExists: boolean;
    message: string;
    checking: boolean;
  }>({
    checked: false,
    connected: false,
    tableExists: false,
    message: 'Testing connection...',
    checking: false
  });

  // SQL instructions toggle & copy state
  const [showSqlGuide, setShowSqlGuide] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Recent appointments modal/list toggle
  const [activeView, setActiveView] = useState<'form' | 'list'>('form');
  const [recentAppointments, setRecentAppointments] = useState<AppointmentBooking[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);

  // Available Time Slots
  const timeSlots = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '01:00 PM',
    '02:00 PM',
    '03:30 PM',
    '05:00 PM'
  ];

  // Available Services
  const services = [
    {
      id: 'audit',
      title: 'Enterprise Email Security Audit',
      desc: 'Complete DNS MX, SPF, DKIM, and DMARC alignment verification for your domain.'
    },
    {
      id: 'forensics',
      title: 'Phishing Incident Forensics & Triage',
      desc: 'Deep header autopsy, MTA hop tracing, and malicious payload analysis.'
    },
    {
      id: 'bec',
      title: 'BEC & Executive Wire Fraud Briefing',
      desc: 'Threat assessment on targeted executive impersonation and supplier spoofing.'
    },
    {
      id: 'consultation',
      title: 'General Cybersecurity Discovery Call',
      desc: '1-on-1 discovery with an email threat intelligence and forensics specialist.'
    }
  ];

  // Probe Supabase connection on mount
  useEffect(() => {
    checkConnection();
    loadAppointments();
  }, []);

  const checkConnection = async () => {
    setDbStatus(prev => ({ ...prev, checking: true }));
    const status = await testSupabaseConnection('appointments');
    setDbStatus({
      checked: true,
      connected: status.connected,
      tableExists: status.tableExists,
      message: status.message,
      checking: false
    });
  };

  const loadAppointments = async () => {
    setIsLoadingAppointments(true);
    const res = await fetchAppointments('appointments');
    setRecentAppointments(res.appointments);
    setIsLoadingAppointments(false);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(APPOINTMENTS_TABLE_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionResult(null);

    if (!fullName.trim() || !email.trim() || !appointmentDate || !appointmentTime) {
      setSubmissionResult({
        success: false,
        error: 'Please fill in all required fields (Name, Email, Date, and Time).'
      });
      return;
    }

    setIsSubmitting(true);

    const bookingPayload: AppointmentBooking = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      company: company.trim() || undefined,
      serviceType,
      appointmentDate,
      appointmentTime,
      notes: notes.trim() || undefined,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      const result = await saveAppointmentToSupabase(bookingPayload, 'appointments');

      if (result.success && result.source === 'supabase') {
        setSubmissionResult({
          success: true,
          source: 'supabase',
          message: `Appointment successfully confirmed and saved in Supabase project "${SUPABASE_PROJECT_ID}"! Our team will reach out via ${email.trim()}.`
        });
        // Clear form
        setNotes('');
        loadAppointments();
        if (onSuccess) onSuccess(bookingPayload);
      } else if (result.requiresTableCreation) {
        // Table hasn't been created yet, but booking was saved to localStorage safely
        setSubmissionResult({
          success: true,
          source: 'local_fallback',
          requiresTableCreation: true,
          message: `Your booking was recorded! However, the 'appointments' table has not been created in Supabase yet. Please execute the SQL snippet below in your Supabase SQL Editor.`
        });
        setShowSqlGuide(true);
        loadAppointments();
        if (onSuccess) onSuccess(bookingPayload);
      } else {
        setSubmissionResult({
          success: false,
          error: result.error || 'Unable to store appointment in Supabase table.'
        });
      }
    } catch (err: any) {
      setSubmissionResult({
        success: false,
        error: err?.message || 'Unexpected failure while submitting appointment.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Supabase Connection Status Banner */}
      <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              dbStatus.tableExists
                ? 'bg-emerald-500 animate-pulse'
                : dbStatus.connected
                  ? 'bg-amber-500'
                  : 'bg-zinc-400'
            }`} />
            
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-emerald-500" />
                <span>Supabase Backend:</span>
              </span>
              <code className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[11px]">
                {SUPABASE_PROJECT_ID}
              </code>
              <span className="text-zinc-400">•</span>
              <span className={dbStatus.tableExists ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-amber-600 dark:text-amber-400'}>
                {dbStatus.checking
                  ? 'Checking database connection...'
                  : dbStatus.tableExists
                    ? "Table 'appointments' connected & ready"
                    : dbStatus.connected
                      ? "Connected, awaiting table 'appointments' creation"
                      : "Connecting..."}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSqlGuide(!showSqlGuide)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1"
            >
              <span>{showSqlGuide ? 'Hide SQL' : 'View SQL Schema'}</span>
              {showSqlGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <button
              type="button"
              onClick={checkConnection}
              disabled={dbStatus.checking}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors flex items-center gap-1"
              title="Test connection to Supabase"
            >
              <RefreshCw className={`w-3 h-3 ${dbStatus.checking ? 'animate-spin' : ''}`} />
              <span>Test Connection</span>
            </button>
          </div>
        </div>

        {/* Collapsible SQL Guide */}
        {showSqlGuide && (
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2 animate-in fade-in-50">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                To create the table in your Supabase backend, open your{' '}
                <a
                  href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 dark:text-blue-400 font-semibold underline inline-flex items-center gap-0.5"
                >
                  Supabase SQL Editor <ExternalLink className="w-3 h-3" />
                </a>{' '}
                and run this query:
              </p>

              <button
                type="button"
                onClick={handleCopySql}
                className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 flex items-center gap-1"
              >
                {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL'}</span>
              </button>
            </div>

            <pre className="p-3 rounded-xl bg-zinc-950 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-48 border border-zinc-800">
              {APPOINTMENTS_TABLE_SQL}
            </pre>
          </div>
        )}
      </div>

      {/* Main Container Header & Navigation */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                Book Security Consultation & Audit
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Schedule a dedicated session with our email forensics & MTA threat engineers. All bookings sync to Supabase.
            </p>
          </div>

          {/* Toggle between Form and Booking Logs */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 shrink-0">
            <button
              type="button"
              onClick={() => setActiveView('form')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeView === 'form'
                  ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Appointment Form
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveView('list');
                loadAppointments();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeView === 'list'
                  ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <span>Bookings Log</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                {recentAppointments.length}
              </span>
            </button>
          </div>
        </div>

        {/* View 1: Appointment Booking Form */}
        {activeView === 'form' && (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Feedback Notifications */}
            {submissionResult && (
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm border transition-all ${
                  submissionResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {submissionResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-bold">
                      {submissionResult.success ? 'Booking Request Submitted!' : 'Submission Failed'}
                    </p>
                    <p className="text-xs opacity-90 leading-relaxed">
                      {submissionResult.message || submissionResult.error}
                    </p>
                    {submissionResult.requiresTableCreation && (
                      <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowSqlGuide(true)}
                          className="font-bold underline text-xs text-emerald-800 dark:text-emerald-300"
                        >
                          View SQL script to create table in Supabase
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Service Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2.5">
                Select Service Package <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map(srv => {
                  const isSelected = serviceType === srv.title;
                  return (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => setServiceType(srv.title)}
                      className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                        isSelected
                          ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                          : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-sm text-zinc-900 dark:text-white">
                          {srv.title}
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-normal">
                        {srv.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contact Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Work / Personal Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="jane@company.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Phone / WhatsApp <span className="text-zinc-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+1 (555) 234-5678"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Company / Organization <span className="text-zinc-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    placeholder="Acme Cybersecurity Corp"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Date & Time Slot Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Preferred Appointment Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={appointmentDate}
                    onChange={e => setAppointmentDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Preferred Time Slot <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {timeSlots.map(slot => {
                    const isSelected = appointmentTime === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setAppointmentTime(slot)}
                        className={`py-2 px-2 text-center text-xs font-semibold rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Notes / Threat Summary */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Investigation Notes / Domain Scope <span className="text-zinc-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Mention specific suspicious sender domains, wire transfer threats, or DNS concerns you would like us to audit..."
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Encrypted transit • Direct Supabase persistence</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md shadow-blue-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving to Supabase...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    <span>Confirm & Book Appointment</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* View 2: Bookings Log / Submissions */}
        {activeView === 'list' && (
          <div className="p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Recorded Appointments
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Data retrieved from Supabase table & local queue.
                </p>
              </div>

              <button
                type="button"
                onClick={loadAppointments}
                disabled={isLoadingAppointments}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAppointments ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {recentAppointments.length === 0 ? (
              <div className="p-10 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                <Inbox className="w-8 h-8 text-zinc-400 mx-auto mb-2 opacity-60" />
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  No appointments recorded yet
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                  Fill in the appointment booking form to schedule a consultation. Details will be saved directly into your Supabase backend.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveView('form')}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Book New Appointment
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAppointments.map((appt, idx) => (
                  <div
                    key={appt.id || idx}
                    className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-zinc-900 dark:text-white">
                          {appt.fullName}
                        </span>
                        {appt.company && (
                          <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-200/80 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                            {appt.company}
                          </span>
                        )}
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                          {appt.status || 'pending'}
                        </span>
                      </div>

                      <div className="text-xs text-zinc-600 dark:text-zinc-400 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-zinc-400" />
                          {appt.email}
                        </span>
                        {appt.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-zinc-400" />
                            {appt.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400">
                          <Sparkles className="w-3 h-3" />
                          {appt.serviceType}
                        </span>
                      </div>

                      {appt.notes && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 italic pt-1 line-clamp-2">
                          "{appt.notes}"
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 text-right sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-200 dark:border-zinc-700/60">
                      <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center sm:justify-end gap-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        <span>{appt.appointmentDate}</span>
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center sm:justify-end gap-1">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        <span>{appt.appointmentTime}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

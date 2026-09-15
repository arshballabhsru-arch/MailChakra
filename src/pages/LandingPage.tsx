import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Mail,
  Zap,
  Lock,
  ArrowRight,
  Shield,
  Server,
  Layers,
  Sparkles,
  Globe,
  Fingerprint,
  Calendar,
  Database
} from 'lucide-react';
import { VerdictBadge } from '../components/VerdictBadge';
import { AppointmentBookingForm } from '../components/AppointmentBookingForm';

interface LandingPageProps {
  onGetStarted: () => void;
  onNavigateToDashboard: () => void;
  onBookAppointment?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onNavigateToDashboard,
  onBookAppointment
}) => {
  const { isAuthenticated } = useAuth();
  const [quickEmail, setQuickEmail] = useState('');
  const [quickResult, setQuickResult] = useState<any | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const sampleQuickCheck = async (emailToTest: string) => {
    setQuickEmail(emailToTest);
    setIsVerifying(true);
    setQuickResult(null);

    try {
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToTest })
      });
      const data = await response.json();
      setQuickResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Section */}
      <section className="pt-10 sm:pt-16 lg:pt-20 text-center max-w-4xl mx-auto px-4">
        
        {/* Subtle Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-6">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>AI Threat Detection • GeoLocation • Forensic Intelligence</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-[1.15]">
          AI-Powered Email Threat Detection,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-emerald-500 to-teal-400">
            GeoLocation & Forensics
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl mx-auto font-normal">
          Enterprise-grade intelligence for email investigations. Trace MTA relay hops across interactive global maps, audit cryptographic SPF/DKIM/DMARC alignment, map attacks to MITRE ATT&CK, and detect phishing and BEC threats with Gemini AI.
        </p>

        {/* Primary Call To Action */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            id="hero-cta-get-started"
            type="button"
            onClick={isAuthenticated ? onNavigateToDashboard : onGetStarted}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl text-base font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-95 transition-all focus:outline-hidden focus:ring-2 focus:ring-blue-400"
          >
            <span>{isAuthenticated ? 'Open Intelligence Console' : 'Launch Forensic Platform'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (onBookAppointment) {
                onBookAppointment();
              } else {
                document.getElementById('book-appointment-section')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold text-zinc-900 dark:text-white bg-blue-50 hover:bg-blue-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-blue-200 dark:border-zinc-700 transition-all focus:outline-hidden"
          >
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Book Security Audit</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const demoSection = document.getElementById('interactive-preview-widget');
              demoSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors focus:outline-hidden"
          >
            <span>Run Live Probe</span>
          </button>
        </div>


        {/* Trust Stats Bar */}
        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">AI Semantics</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Gemini Phishing & BEC Autopsy</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">Geo Tracer</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Physical MTA Hop Mapping</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">SPF / DKIM</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Cryptographic DMARC Audit</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400">MITRE ATT&CK</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Adversary Tactics Matrix</div>
          </div>
        </div>
      </section>

      {/* Interactive Quick Preview Widget */}
      <section
        id="interactive-preview-widget"
        className="max-w-3xl mx-auto px-4"
      >
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white">
              Instant Email & Geo-Location Probe
            </h2>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-5">
            Test our verification and geolocation engine right now. Enter an address or test with pre-loaded threat vectors:
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (quickEmail) sampleQuickCheck(quickEmail);
            }}
            className="flex flex-col sm:flex-row gap-2.5"
          >
            <div className="relative flex-1">
              <Mail className="w-5 h-5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="e.g. security-team@google.com"
                value={quickEmail}
                onChange={(e) => setQuickEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder-zinc-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying || !quickEmail}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Probing...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Test Address</span>
                </>
              )}
            </button>
          </form>

          {/* Preset Buttons */}
          <div className="mt-4 flex items-center gap-2 flex-wrap text-xs text-zinc-500 dark:text-zinc-400">
            <span>Quick Samples:</span>
            <button
              type="button"
              onClick={() => sampleQuickCheck('contact@google.com')}
              className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium transition-colors"
            >
              Legitimate (Google)
            </button>
            <button
              type="button"
              onClick={() => sampleQuickCheck('anonymous123@guerrillamail.com')}
              className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium transition-colors"
            >
              Disposable (GuerrillaMail)
            </button>
            <button
              type="button"
              onClick={() => sampleQuickCheck('security-check@paypal-dispute-resolution.cc')}
              className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium transition-colors"
            >
              Blocklist Phish (PayPal Mimic)
            </button>
          </div>

          {/* Quick Result Preview Box */}
          {quickResult && (
            <div className="mt-6 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                  {quickResult.email}
                </span>
                <VerdictBadge verdict={quickResult.verdict} size="sm" />
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">
                {quickResult.summary}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 pt-2.5 gap-2">
                <span>DNS: {quickResult.details.dnsStatus}</span>
                {quickResult.details.mxGeo && (
                  <span className="text-blue-600 dark:text-blue-400 font-mono">
                    MX Location: {quickResult.details.mxGeo.flagEmoji} {quickResult.details.mxGeo.country} ({quickResult.details.mxGeo.city})
                  </span>
                )}
                <button
                  type="button"
                  onClick={isAuthenticated ? onNavigateToDashboard : onGetStarted}
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>Open Full Forensics</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Feature Pillar Cards */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            The Three Pillars of Email Forensic Intelligence
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            A comprehensive cybersecurity suite uniting AI cognitive reasoning, physical geographic route tracing, and cryptographic protocol validation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:border-blue-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              AI Threat & Phishing Detection
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Powered by Google Gemini 2.5 Flash. Decodes complex social engineering coercion, Business Email Compromise (BEC) wire transfers, credential harvesting landing pages, and deceptive invoice traps.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:border-emerald-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              MTA GeoLocation & Route Tracer
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Sequentially parses RFC 822 `Received:` headers to map every mail transfer agent across global coordinates. Identifies Tor exit nodes, bulletproof hosting providers, and suspicious inter-continental routing detours.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:border-purple-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
              <Fingerprint className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              Forensic Autopsy & MITRE ATT&CK
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Inspects cryptographic SPF, DKIM, and DMARC alignment. Analyzes Return-Path spoofing, audits weaponized attachments, generates SHA-256 chain-of-custody hashes, and tags observed techniques to MITRE ATT&CK.
            </p>
          </div>

        </div>
      </section>

      {/* Appointment Booking Form Section */}
      <section id="book-appointment-section" className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            <span>Consultation & Incident Response</span>
          </div>
          <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Schedule an Email Threat Audit
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto">
            Book an appointment with our cybersecurity specialists. All submissions are saved directly to your Supabase backend.
          </p>
        </div>

        <AppointmentBookingForm />
      </section>

      {/* Security & Reliability Banner */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="rounded-3xl p-8 sm:p-10 bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-2xl font-extrabold tracking-tight">
              Investigate Threats With Forensic Precision
            </h3>
            <p className="text-blue-100 text-sm max-w-md">
              Sign in to unlock interactive world map routing, deep header inspection, and digital chain-of-custody reports.
            </p>
          </div>

          <button
            type="button"
            onClick={isAuthenticated ? onNavigateToDashboard : onGetStarted}
            className="shrink-0 px-6 py-3.5 rounded-xl font-bold bg-white text-zinc-900 hover:bg-zinc-100 shadow-md active:scale-95 transition-all text-sm"
          >
            {isAuthenticated ? 'Go to Console' : 'Start Investigating'}
          </button>
        </div>
      </section>

    </div>
  );
};

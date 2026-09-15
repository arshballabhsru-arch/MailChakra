import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ResultCard } from '../components/ResultCard';
import { IpGeoScanner } from '../components/IpGeoScanner';
import { VerificationResult } from '../types';
import {
  Mail,
  FileText,
  Search,
  Clipboard,
  Trash2,
  Sparkles,
  AlertCircle,
  HelpCircle,
  CheckCircle,
  ShieldCheck,
  Zap,
  Info,
  Globe,
  Fingerprint,
  Calendar
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (view: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, saveVerification } = useAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'address' | 'content' | 'ip'>('address');

  // Input states
  const [emailInput, setEmailInput] = useState('');
  const [contentInput, setContentInput] = useState('');
  const [senderEmailInput, setSenderEmailInput] = useState('');

  // Processing & result states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<VerificationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Address Presets
  const addressPresets = [
    { label: 'Legitimate (Google)', email: 'security@google.com', desc: 'Valid MX, established domain' },
    { label: 'Disposable (GuerrillaMail)', email: 'temp_user9921@guerrillamail.com', desc: 'Anonymous burner mailbox' },
    { label: 'Threat Blocklist (PayPal Mimic)', email: 'dispute-service@paypal-dispute-resolution.cc', desc: 'Known credential phishing mimic' },
    { label: 'Typosquat (Micros0ft)', email: 'support@micros0ft.com', desc: 'Zero instead of "o" impersonation' },
    { label: 'Nonexistent Domain', email: 'office@fake-unregistered-domain-999xyz.net', desc: 'No DNS / MX records found' }
  ];

  // Content Presets with Full RFC 822 Forensics & Geo-Hop Routes
  const contentPresets = [
    {
      label: 'CEO BEC Wire Fraud (Seychelles VPS -> Russia)',
      sender: 'CEO Robert Vance <robert.vance@acme-global.org>',
      content: `Received: from mail-relay.acme-corp.com (10.0.0.1) by mx.google.com with ESMTPS; Mon, 12 Oct 2026 14:24:12 -0400
Received: from vps-982.offshore-bulletproof.ch (45.154.255.10) by mail-relay.acme-corp.com with ESMTPS; Mon, 12 Oct 2026 14:24:05 -0400
Received: from client-pc.tor-exit.net (185.220.101.5) by vps-982.offshore-bulletproof.ch with ESMTPA; Mon, 12 Oct 2026 14:23:48 -0400
Authentication-Results: mx.google.com; spf=fail (sender IP 45.154.255.10 not authorized for domain acme-global.org); dkim=none; dmarc=fail
From: "Robert Vance (CEO)" <robert.vance@acme-global.org>
Return-Path: <compromised-spoof@finance-wire-portal.top>
Reply-To: <ceo.emergency.wire@gmail.com>
Message-ID: <CAD499281.2026@acme-global.org>
X-Mailer: PHPMailer 6.1.4 (Custom Exploit Script)
Subject: URGENT: Wire Transfer Approval Required for Acquisition

Hi Finance Team,
I am currently boarding an international transatlantic flight and will have no telephone reception for the next 10 hours.
We have a critical contractual acquisition closing today.

Kindly wire $64,200 immediately to our foreign escrow account:
Beneficiary: Global Escrow Holdings Ltd
IBAN: US89012345678901234
SWIFT: CHASEUS33
Reference: Project Alpha Close

Do NOT attempt to phone me to verify, as my phone is strictly in airplane mode. Treat this with top executive confidentiality and dispatch wire receipt immediately.

Regards,
Robert Vance
Chief Executive Officer, Acme Global`
    },
    {
      label: 'PayPal Phishing with Malicious Attachment & Tor Origin',
      sender: 'PayPal Security <service@paypal-notifications.com>',
      content: `Received: from mail-in.gateway.net (172.16.0.4) by mx.mailhost.com with ESMTPS; Tue, 13 Oct 2026 09:12:01 -0500
Received: from mail-relay.petersburg-node.ru (194.26.29.112) by mail-in.gateway.net with ESMTPS; Tue, 13 Oct 2026 09:11:42 -0500
Received: from tor-relay.frankfurt.de (185.220.101.5) by mail-relay.petersburg-node.ru with SMTP; Tue, 13 Oct 2026 09:11:15 -0500
Authentication-Results: mx.mailhost.com; spf=fail; dkim=fail (signature did not verify); dmarc=fail
From: "PayPal Account Resolution" <service@paypal-notifications.com>
Return-Path: <harvest@login-auth-verify.xyz>
Subject: Account Suspended within 24 Hours - Unauthorized Moscow Access Detected
Content-Type: multipart/mixed; boundary="----=_Part_001_8921"

------=_Part_001_8921
Content-Type: text/plain; charset=UTF-8

Dear Customer,
We detected unauthorized login attempts to your PayPal wallet from an unrecognized terminal in Moscow, Russian Federation.
To protect your funds, your debit access is temporarily restricted.

You MUST confirm your identity within 24 hours or your balance will be permanently frozen.
Click the secure link below to confirm credentials:
http://192.168.1.104/secure-paypal-verify/login.html

Alternatively, view the dispute notice attached to this email.

------=_Part_001_8921
Content-Type: application/x-vbs; name="PayPal_Security_Report.vbs"
Content-Disposition: attachment; filename="PayPal_Security_Report.vbs"

' Encrypted VBS payload script
------=_Part_001_8921--`
    },
    {
      label: 'Corporate Gift Card Urgent Solicitation',
      sender: 'David Chen <david.chen@target-executives.com>',
      content: `Received: from massmail-srv.datacenter-cloud.de (85.214.132.117) by mx.company.com with ESMTPS; Wed, 14 Oct 2026 11:05:00 -0400
Authentication-Results: mx.company.com; spf=softfail; dkim=none
From: "David Chen (VP)" <david.chen@target-executives.com>
Reply-To: <exec.secret.tasks@gmail.com>
Subject: Quick confidential favor right now

Are you at your desk right now? I need you to run a quick confidential task for our client appreciation event today.
Please go to the nearest store and purchase 5 Apple Gift Cards ($100 each).
Scratch the back and send me the clear pictures of the PIN codes right away.
I will reimburse you via corporate expense report this afternoon.

Thanks kindly,
David Chen`
    },
    {
      label: 'Legitimate Google Workspace Mail (Pass SPF/DKIM/DMARC)',
      sender: 'Sarah Jenkins <sarah@workspace-corp.com>',
      content: `Received: from mail-pj1-f41.google.com (209.85.216.41) by mx.enterprise.com with ESMTPS id abc12345; Thu, 15 Oct 2026 10:15:30 -0700
Authentication-Results: mx.enterprise.com; spf=pass (google.com: domain of sarah@workspace-corp.com designates 209.85.216.41 as permitted sender); dkim=pass header.i=@workspace-corp.com; dmarc=pass
From: "Sarah Jenkins" <sarah@workspace-corp.com>
Return-Path: <sarah@workspace-corp.com>
Message-ID: <CANx892910_jenk@workspace-corp.com>
Subject: Sprint Planning & Q3 Architecture Sync

Hi everyone,
Here is the agenda for our bi-weekly sprint planning:
1. Review Q3 email security microservice benchmarks
2. Discuss pull request #142 regarding DNS MX verification and GeoLocation tracing
3. QA testing schedule for release v2.4

The Google Meet link is on our team calendar. Feel free to add any items to the shared Notion workspace.

Best,
Sarah Jenkins`
    }
  ];

  // Handle Verify Email Address
  const handleVerifyEmail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!emailInput.trim()) {
      setErrorMessage('Please enter an email address to verify.');
      return;
    }

    setErrorMessage(null);
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.trim() })
      });

      if (!response.ok) {
        throw new Error('Verification service error');
      }

      const data = await response.json();

      // Store into AuthContext history
      const saved = saveVerification({
        type: 'address',
        target: data.email,
        rawInput: emailInput,
        verdict: data.verdict,
        confidenceScore: data.confidenceScore,
        summary: data.summary,
        details: data.details
      });

      setCurrentResult(saved);
    } catch (err: any) {
      setErrorMessage('Unable to connect to verification API. Please check server status.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle Analyze Full Email Content
  const handleAnalyzeContent = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!contentInput.trim()) {
      setErrorMessage('Please paste the email content to analyze.');
      return;
    }

    setErrorMessage(null);
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/analyze-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: contentInput.trim(),
          senderEmail: senderEmailInput.trim() || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Analysis service error');
      }

      const data = await response.json();

      // Store into AuthContext history
      const saved = saveVerification({
        type: 'content',
        target: data.target,
        rawInput: contentInput,
        verdict: data.verdict,
        confidenceScore: data.confidenceScore,
        summary: data.summary,
        details: data.details
      });

      setCurrentResult(saved);
    } catch (err: any) {
      setErrorMessage('Failed to analyze email content. Please try again.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Clipboard Paste helper
  const handlePasteAddress = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setEmailInput(text.trim());
    } catch (e) {
      console.warn('Clipboard read denied');
    }
  };

  const handlePasteContent = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setContentInput(text.trim());
    } catch (e) {
      console.warn('Clipboard read denied');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Breadcrumb Navigation */}
      <Breadcrumbs items={[{ label: 'Dashboard', current: true }]} onNavigate={onNavigate} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Security Verification Console
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Logged in as <strong className="text-zinc-800 dark:text-zinc-200">{user?.name}</strong> ({user?.email}) • Role: <span className="uppercase font-bold text-blue-600 dark:text-blue-400">{user?.role}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={() => onNavigate('appointments')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-xs transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Consultation</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('history')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
          >
            <span>View Past Scans</span>
          </button>
        </div>
      </div>

      {/* Mode Selection Tabs (Check Email Address vs Forensic Email Threat Inspector vs IP & MTA Geo-Threat Scanner) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 max-w-3xl mx-auto">
        <button
          id="tab-check-email-address"
          type="button"
          onClick={() => {
            setActiveTab('address');
            setErrorMessage(null);
          }}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'address'
              ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Email & MX Verifier</span>
        </button>

        <button
          id="tab-analyze-full-email-content"
          type="button"
          onClick={() => {
            setActiveTab('content');
            setErrorMessage(null);
          }}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'content'
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Fingerprint className="w-4 h-4" />
          <span>Forensic Threat Inspector</span>
        </button>

        <button
          id="tab-ip-geo-scanner"
          type="button"
          onClick={() => {
            setActiveTab('ip');
            setErrorMessage(null);
          }}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'ip'
              ? 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>IP & MTA Geo Scanner</span>
        </button>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-3 animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: Check Email Address View */}
      {activeTab === 'address' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Validate Single Email Address</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Evaluates RFC 5322 syntax, performs real DNS MX record lookups, scans disposable burner lists, and queries threat blocklists.
            </p>
          </div>

          <form onSubmit={handleVerifyEmail} className="space-y-4">
            <div className="relative">
              <input
                id="dashboard-email-input"
                type="email"
                required
                placeholder="e.g. security-team@microsoft.com, or user@disposable-inbox.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full pl-4 pr-24 py-4 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder-zinc-400 text-sm sm:text-base font-medium shadow-inner focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePasteAddress}
                  title="Paste from clipboard"
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Clipboard className="w-4 h-4" />
                </button>
                {emailInput && (
                  <button
                    type="button"
                    onClick={() => setEmailInput('')}
                    title="Clear input"
                    className="p-2 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-500" />
                <span>Checks live DNS mail exchangers & threat blocklists</span>
              </div>

              <button
                id="btn-verify-email-submit"
                type="submit"
                disabled={isAnalyzing || !emailInput.trim()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 transition-all focus:outline-hidden"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Resolving DNS & Threat Feeds...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Verify Address</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Presets */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2.5">
              Quick Test Presets (Click to Inspect)
            </div>
            <div className="flex flex-wrap gap-2">
              {addressPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setEmailInput(preset.email);
                    setEmailInput(preset.email);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <span className="font-bold">{preset.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Analyze Full Email Content View */}
      {activeTab === 'content' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Analyze Full Email Content & Headers</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Scans full email body and raw RFC headers for coercive urgency, deceptive hyperlinks, spoofed Return-Paths, and financial extortion traps.
            </p>
          </div>

          <form onSubmit={handleAnalyzeContent} className="space-y-4">
            {/* Optional Sender Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                Sender Email (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. support@service.com (or leave blank to auto-detect from headers)"
                value={senderEmailInput}
                onChange={(e) => setSenderEmailInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder-zinc-400 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Content Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Full Email Text & Headers
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePasteContent}
                    className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                    <span>Paste Email</span>
                  </button>
                  {contentInput && (
                    <button
                      type="button"
                      onClick={() => setContentInput('')}
                      className="inline-flex items-center gap-1 text-xs text-rose-500 hover:underline"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>
              </div>

              <textarea
                id="dashboard-content-textarea"
                rows={9}
                required
                placeholder={`Paste entire email including headers or body text here. For example:\n\nFrom: "CEO John" <john@company.com>\nSubject: Urgent: Wire Transfer Required\n\nKindly send $50,000 wire immediately...`}
                value={contentInput}
                onChange={(e) => setContentInput(e.target.value)}
                className="w-full p-4 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder-zinc-400 text-xs sm:text-sm font-mono shadow-inner focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Deep phishing heuristics & Gemini semantic threat detection</span>
              </div>

              <button
                id="btn-analyze-content-submit"
                type="submit"
                disabled={isAnalyzing || !contentInput.trim()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50 transition-all focus:outline-hidden"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Phishing Indicators...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Analyze Content</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Presets */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2.5">
              Phishing Attack Scenarios (1-Click Test)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {contentPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setContentInput(preset.content);
                    setSenderEmailInput(preset.sender);
                  }}
                  className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-left hover:border-emerald-500 transition-colors"
                >
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {preset.label}
                  </div>
                  <div className="text-[11px] text-zinc-500 truncate mt-0.5">
                    {preset.sender}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: IP GeoLocation & Mail Server Threat Scanner */}
      {activeTab === 'ip' && (
        <IpGeoScanner />
      )}

      {/* Current Result Display */}
      {currentResult && (
        <div className="space-y-3 animate-in fade-in-50 duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Verification Verdict & Threat Diagnostics</span>
            </h3>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              ✓ Saved to audit history
            </span>
          </div>

          <ResultCard result={currentResult} />
        </div>
      )}

    </div>
  );
};

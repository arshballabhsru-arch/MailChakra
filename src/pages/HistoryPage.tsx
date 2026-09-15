import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ResultCard } from '../components/ResultCard';
import { VerdictBadge } from '../components/VerdictBadge';
import { CopyButton } from '../components/CopyButton';
import {
  History,
  Search,
  Filter,
  Trash2,
  Mail,
  FileText,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { VerificationResult, Verdict } from '../types';

interface HistoryPageProps {
  onNavigate: (view: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigate }) => {
  const { getUserVerifications, clearUserHistory, user } = useAuth();
  const verifications = getUserVerifications();

  const [searchQuery, setSearchQuery] = useState('');
  const [verdictFilter, setVerdictFilter] = useState<'all' | Verdict>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'address' | 'content'>('all');
  const [selectedRecord, setSelectedRecord] = useState<VerificationResult | null>(null);

  // Filter items
  const filtered = verifications.filter((item) => {
    const matchesSearch =
      item.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVerdict = verdictFilter === 'all' || item.verdict === verdictFilter;
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    return matchesSearch && matchesVerdict && matchesType;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: 'dashboard' },
          { label: 'Verification History', current: true }
        ]}
        onNavigate={onNavigate}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <History className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            <span>Audit History & Verification Logs</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Review your previously submitted email addresses, phishing reports, and verdict findings.
          </p>
        </div>

        {verifications.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to clear your local verification history?')) {
                clearUserHistory();
                setSelectedRecord(null);
              }
            }}
            className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear My History</span>
          </button>
        )}
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search verified targets or summary..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          {/* Verdict Filter */}
          <div className="flex items-center rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1 text-xs font-medium">
            {(['all', 'safe', 'suspicious', 'unsafe'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVerdictFilter(v)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                  verdictFilter === v
                    ? 'bg-white dark:bg-zinc-900 font-bold text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex items-center rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                typeFilter === 'all'
                  ? 'bg-white dark:bg-zinc-900 font-bold text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              All Types
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('address')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                typeFilter === 'address'
                  ? 'bg-white dark:bg-zinc-900 font-bold text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              Address
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('content')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                typeFilter === 'content'
                  ? 'bg-white dark:bg-zinc-900 font-bold text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              Content
            </button>
          </div>
        </div>
      </div>

      {/* Selected Result Inspector (if any selected) */}
      {selectedRecord && (
        <div className="space-y-2 animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Selected Inspection Detail
            </h2>
            <button
              type="button"
              onClick={() => setSelectedRecord(null)}
              className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 underline"
            >
              Close Detail View
            </button>
          </div>
          <ResultCard result={selectedRecord} />
        </div>
      )}

      {/* History List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 mx-auto flex items-center justify-center">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            No verification records match your filter
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            Try resetting your filters or submit a new email verification from the dashboard.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <span>Run New Verification</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-1">
            Showing {filtered.length} of {verifications.length} verified item(s)
          </div>

          <div className="space-y-2.5">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedRecord(item)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  selectedRecord?.id === item.id
                    ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 shadow-sm ring-2 ring-blue-500/20'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xs'
                }`}
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {item.type === 'address' ? (
                        <>
                          <Mail className="w-3 h-3 text-blue-500" />
                          <span>Address</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-3 h-3 text-emerald-500" />
                          <span>Content</span>
                        </>
                      )}
                    </span>

                    <VerdictBadge verdict={item.verdict} size="sm" />

                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                    {item.target}
                  </h4>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                    {item.summary}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                      {item.confidenceScore}%
                    </span>
                    <span className="text-[10px] text-zinc-400 block -mt-0.5">Confidence</span>
                  </div>

                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

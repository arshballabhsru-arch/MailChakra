import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { VerdictBadge } from '../components/VerdictBadge';
import { ResultCard } from '../components/ResultCard';
import {
  ShieldAlert,
  Users,
  ShieldCheck,
  Search,
  Lock,
  Mail,
  FileText,
  Calendar,
  Activity,
  AlertTriangle,
  ChevronRight,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { User, VerificationResult } from '../types';

interface AdminPageProps {
  onNavigate: (view: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const { user, allUsers, verifications, switchUserRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(allUsers[0] || null);
  const [inspectedCheck, setInspectedCheck] = useState<VerificationResult | null>(null);

  // Access check
  if (user?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-14 h-14 rounded-3xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white">
          Admin Role Required
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          The Admin Monitoring Console is strictly restricted to accounts with the <strong className="text-zinc-800 dark:text-zinc-200">admin</strong> privilege. Your current account ({user?.email}) has role <strong className="uppercase text-amber-600">{user?.role || 'guest'}</strong>.
        </p>

        <div className="pt-2 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => switchUserRole('admin')}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
          >
            Switch to Admin Role (arshbsrivastava@gmail.com)
          </button>
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Aggregate stats
  const totalUsers = allUsers.length;
  const totalChecks = verifications.length;
  const safeCount = verifications.filter((v) => v.verdict === 'safe').length;
  const suspiciousCount = verifications.filter((v) => v.verdict === 'suspicious').length;
  const unsafeCount = verifications.filter((v) => v.verdict === 'unsafe').length;

  // Filter users by search
  const filteredUsers = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Checks for selected user
  const selectedUserChecks = selectedUser
    ? verifications.filter((v) => v.userId === selectedUser.id || v.userEmail === selectedUser.email)
    : [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: 'dashboard' },
          { label: 'Admin Monitoring Panel', current: true }
        ]}
        onNavigate={onNavigate}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <ShieldAlert className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              <span>Admin Monitoring Console</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              Read-Only
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Auditing registered users and inspection activity across all tenant accounts.
          </p>
        </div>

        <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('appointments')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Supabase Bookings</span>
          </button>
          <span>Active Admin: <strong className="text-zinc-900 dark:text-white">{user.email}</strong></span>
        </div>
      </div>

      {/* Aggregate Metric Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-500" />
            <span>Total Users</span>
          </div>
          <div className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-1">
            {totalUsers}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-500" />
            <span>Checks Run</span>
          </div>
          <div className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-1">
            {totalChecks}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50">
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Safe</span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">
            {safeCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
          <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Suspicious</span>
          </div>
          <div className="text-2xl font-extrabold text-amber-700 dark:text-amber-300 mt-1">
            {suspiciousCount}
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50">
          <div className="text-xs font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Unsafe (Phish)</span>
          </div>
          <div className="text-2xl font-extrabold text-rose-700 dark:text-rose-300 mt-1">
            {unsafeCount}
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Users Directory (Left) + Selected User's Audit Log (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Users List (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span>Registered Accounts ({filteredUsers.length})</span>
            </h2>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* User List Rows */}
          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {filteredUsers.map((u) => {
              const checkCount = verifications.filter(
                (v) => v.userId === u.id || v.userEmail === u.email
              ).length;
              const isSelected = selectedUser?.id === u.id;

              return (
                <div
                  key={u.id}
                  onClick={() => {
                    setSelectedUser(u);
                    setInspectedCheck(null);
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs ring-1 ring-emerald-500/30'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {u.name.substring(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                          {u.name}
                        </span>
                        <span
                          className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                            u.role === 'admin'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                          }`}
                        >
                          {u.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 truncate">
                        {u.email}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-200 block">
                      {checkCount} checks
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: User's Verification Submissions & Verdicts Log (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {selectedUser ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
              
              {/* Selected User Header */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                      {selectedUser.name}
                    </h3>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      ({selectedUser.email})
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    User ID: <code className="font-mono">{selectedUser.id}</code> • Registered {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  {selectedUserChecks.length} Total Submissions
                </div>
              </div>

              {/* Inspect Specific Check Details */}
              {inspectedCheck && (
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2 animate-in fade-in-50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Full Diagnostic Breakdown</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setInspectedCheck(null)}
                      className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 underline"
                    >
                      Hide
                    </button>
                  </div>
                  <ResultCard result={inspectedCheck} />
                </div>
              )}

              {/* Submissions Table / List */}
              {selectedUserChecks.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs text-zinc-500">
                  No email checks recorded yet for this user.
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Submission Activity Log & Verdicts
                  </div>

                  <div className="space-y-2">
                    {selectedUserChecks.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <VerdictBadge verdict={item.verdict} size="sm" />
                            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 capitalize">
                              {item.type} check
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div className="font-bold text-xs text-zinc-900 dark:text-white truncate">
                            {item.target}
                          </div>
                          <div className="text-[11px] text-zinc-500 truncate">
                            {item.summary}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setInspectedCheck(item)}
                            className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:border-blue-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center text-zinc-500 text-sm">
              Select a user from the left directory to view their audit activity log.
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

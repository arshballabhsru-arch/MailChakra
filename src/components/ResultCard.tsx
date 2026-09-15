import React, { useState } from 'react';
import { VerificationResult } from '../types';
import { VerdictBadge } from './VerdictBadge';
import { CopyButton } from './CopyButton';
import { GeoMap } from './GeoMap';
import { ForensicDossier } from './ForensicDossier';
import {
  ChevronDown,
  ChevronUp,
  Server,
  AlertOctagon,
  Mail,
  FileText,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  Clock,
  Info,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Globe,
  Fingerprint
} from 'lucide-react';

interface ResultCardProps {
  result: VerificationResult;
  onInspectAgain?: (item: VerificationResult) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const [expanded, setExpanded] = useState(true);
  const [showRaw, setShowRaw] = useState(false);

  const formattedReport = `EMAIL SECURITY VERIFICATION REPORT
=====================================
Target: ${result.target}
Type: ${result.type === 'address' ? 'Email Address Validation' : 'Full Email Content Analysis'}
Verdict: ${result.verdict.toUpperCase()} (Confidence: ${result.confidenceScore}%)
Timestamp: ${new Date(result.timestamp).toLocaleString()}

EXECUTIVE SUMMARY:
${result.summary}

RECOMMENDATION:
${result.details.recommendation}

KEY RISK TRIGGERS (${result.details.triggers?.length || 0}):
${result.details.triggers?.map((t, idx) => `[${idx + 1}] [${t.severity.toUpperCase()}] ${t.title} - ${t.description}`).join('\n') || 'None'}

TECHNICAL REASONING:
${result.details.reasoning?.map(r => `• ${r}`).join('\n') || 'None'}
`;

  return (
    <div
      id={`result-card-${result.id}`}
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden"
    >
      {/* Top Banner Header */}
      <div className="p-5 sm:p-6 border-b border-zinc-100 dark:border-zinc-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                {result.type === 'address' ? (
                  <>
                    <Mail className="w-3.5 h-3.5 text-blue-500" />
                    <span>Address Validation</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Content & Phishing Scan</span>
                  </>
                )}
              </span>

              <VerdictBadge verdict={result.verdict} size="md" />

              {/* GeoLocation Intelligence Badge */}
              {(result.details.geoData || result.details.mxGeo) && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900 font-medium">
                  <Globe className="w-3 h-3 text-blue-500 shrink-0" />
                  <span>
                    {(result.details.geoData || result.details.mxGeo)?.flagEmoji}{' '}
                    {(result.details.geoData || result.details.mxGeo)?.country}
                  </span>
                  <span className="text-[10px] opacity-75 font-mono">
                    ({(result.details.geoData || result.details.mxGeo)?.ip})
                  </span>
                </span>
              )}

              <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight break-all">
              {result.target}
            </h3>
          </div>

          {/* Confidence Score & Action Controls */}
          <div className="flex items-center gap-3 self-start sm:self-center">
            <div className="text-right">
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Confidence
              </div>
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                  {result.confidenceScore}%
                </span>
                <div className="w-12 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      result.verdict === 'safe'
                        ? 'bg-emerald-500'
                        : result.verdict === 'suspicious'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${result.confidenceScore}%` }}
                  />
                </div>
              </div>
            </div>

            <CopyButton textToCopy={formattedReport} label="Copy Report" />
          </div>
        </div>

        {/* Executive Summary */}
        <div className="mt-4 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200/70 dark:border-zinc-800/70 text-sm text-zinc-700 dark:text-zinc-300">
          <p className="leading-relaxed">
            <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">Summary: </strong>
            {result.summary}
          </p>
          {result.details.recommendation && (
            <p className="mt-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              <strong className="text-blue-600 dark:text-blue-400">Recommendation: </strong>
              {result.details.recommendation}
            </p>
          )}
        </div>
      </div>

      {/* Expandable Section */}
      <div className="px-5 sm:px-6 py-3 bg-zinc-50/50 dark:bg-zinc-950/30 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-hidden"
        >
          <span>{expanded ? 'Hide Detailed Reasoning & Technical Checks' : 'Show Detailed Reasoning & Technical Checks'}</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={() => setShowRaw(!showRaw)}
          className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 underline"
        >
          {showRaw ? 'Hide Raw Input' : 'View Raw Input'}
        </button>
      </div>

      {showRaw && (
        <div className="p-4 bg-zinc-900 text-zinc-200 text-xs font-mono border-b border-zinc-800 overflow-x-auto max-h-48">
          <pre className="whitespace-pre-wrap">{result.rawInput}</pre>
        </div>
      )}

      {expanded && (
        <div className="p-5 sm:p-6 space-y-6">
          
          {/* Quick Technical Check Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
              Diagnostic Audit Breakdown
            </h4>

            {result.type === 'address' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                
                {/* Format Check */}
                <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex items-start gap-2.5">
                  {result.details.formatValid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold text-zinc-900 dark:text-zinc-100">RFC 5322 Syntax</div>
                    <div className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                      {result.details.formatValid ? 'Valid mail structure' : 'Invalid email format'}
                    </div>
                  </div>
                </div>

                {/* MX Records Check */}
                <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex items-start gap-2.5">
                  {result.details.mxRecordsFound ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold text-zinc-900 dark:text-zinc-100">Mail Server (MX)</div>
                    <div className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                      {result.details.mxRecordsFound
                        ? `${result.details.mxHosts?.length || 1} record(s) active`
                        : 'No MX configured'}
                    </div>
                  </div>
                </div>

                {/* Disposable Domain */}
                <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex items-start gap-2.5">
                  {!result.details.isDisposable ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold text-zinc-900 dark:text-zinc-100">Disposable Inbox</div>
                    <div className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                      {result.details.isDisposable ? 'Disposable burner domain' : 'Permanent domain'}
                    </div>
                  </div>
                </div>

                {/* Threat Blocklist */}
                <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex items-start gap-2.5">
                  {!result.details.isBlocklisted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold text-zinc-900 dark:text-zinc-100">Threat Blocklist</div>
                    <div className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                      {result.details.isBlocklisted ? 'Listed in threat feeds' : 'Clean threat status'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                
                {/* Sender Identity Mismatch */}
                <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex items-start gap-2.5">
                  {!result.details.mismatchedSender ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold text-zinc-900 dark:text-zinc-100">Header Integrity</div>
                    <div className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                      {result.details.mismatchedSender ? 'Return-Path spoofing' : 'Consistent sender headers'}
                    </div>
                  </div>
                </div>

                {/* Urgency & Threats */}
                <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex items-start gap-2.5">
                  {result.details.urgencyLevel === 'none' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : result.details.urgencyLevel === 'moderate' ? (
                    <HelpCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold text-zinc-900 dark:text-zinc-100">Urgency Baiting</div>
                    <div className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                      {result.details.urgencyLevel === 'critical' ? 'High threat coercion' : result.details.urgencyLevel === 'moderate' ? 'Moderate pressure' : 'Standard tone'}
                    </div>
                  </div>
                </div>

                {/* Financial Requests */}
                <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex items-start gap-2.5">
                  {!result.details.financialRequestsDetected ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold text-zinc-900 dark:text-zinc-100">Financial / Password Bait</div>
                    <div className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                      {result.details.financialRequestsDetected ? 'Wire/Card/Password solicitation' : 'No credential requests'}
                    </div>
                  </div>
                </div>

                {/* Deceptive Links */}
                <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex items-start gap-2.5">
                  {(result.details.suspiciousLinksCount || 0) === 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold text-zinc-900 dark:text-zinc-100">Link Analysis</div>
                    <div className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                      {(result.details.suspiciousLinksCount || 0) > 0 ? `${result.details.suspiciousLinksCount} suspicious destination(s)` : 'Safe destination links'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Trigger Breakdown */}
          {result.details.triggers && result.details.triggers.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3 flex items-center justify-between">
                <span>Triggered Risk Indicators ({result.details.triggers.length})</span>
                <span className="text-[11px] text-zinc-400 font-normal">Prioritized by severity</span>
              </h4>

              <div className="space-y-2.5">
                {result.details.triggers.map((trigger, idx) => (
                  <div
                    key={trigger.id || idx}
                    className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-start gap-3"
                  >
                    <div className="mt-0.5">
                      {trigger.severity === 'high' ? (
                        <ShieldAlert className="w-4 h-4 text-rose-500" />
                      ) : trigger.severity === 'medium' ? (
                        <AlertOctagon className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Info className="w-4 h-4 text-blue-500" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {trigger.title}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            trigger.severity === 'high'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                              : trigger.severity === 'medium'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                          }`}
                        >
                          {trigger.severity} Risk
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-normal">
                        {trigger.description}
                      </p>
                      {trigger.evidence && (
                        <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded inline-block">
                          Evidence: {trigger.evidence}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Reasoning Points */}
          {result.details.reasoning && result.details.reasoning.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                Evaluative Assessment Points
              </h4>
              <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300 pl-2">
                {result.details.reasoning.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Geographic MTA Route & Origin Map */}
          {(result.details.forensicIntel?.geoRouteAnalysis || result.details.mxGeo || result.details.geoData) && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-500" />
                  <span>Geographic Mail Infrastructure & Relay Routing</span>
                </span>
                <span className="text-[11px] font-normal text-zinc-400">
                  {result.details.forensicIntel?.geoRouteAnalysis.originGeo?.country || result.details.mxGeo?.country || 'Global Node'}
                </span>
              </h4>

              <GeoMap
                originGeo={result.details.forensicIntel?.geoRouteAnalysis.originGeo || result.details.geoData}
                destinationGeo={result.details.mxGeo}
                hops={result.details.forensicIntel?.geoRouteAnalysis.hops || []}
              />
            </div>
          )}

          {/* Forensic Intelligence Dossier */}
          {result.details.forensicIntel && (
            <ForensicDossier
              forensicIntel={result.details.forensicIntel}
              rawInput={result.rawInput}
              target={result.target}
            />
          )}

          {/* Extracted Links Inspection (if any) */}
          {result.details.extractedLinks && result.details.extractedLinks.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                Scanned Hyperlink Destinations ({result.details.extractedLinks.length})
              </h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 text-xs">
                {result.details.extractedLinks.map((link, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg border font-mono text-[11px] flex items-center justify-between gap-2 ${
                      link.suspicious
                        ? 'border-rose-200 bg-rose-50/50 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300'
                        : 'border-zinc-200 bg-zinc-50/50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-400'
                    }`}
                  >
                    <span className="truncate">{link.url}</span>
                    <span className="shrink-0 font-sans text-[10px] font-semibold px-2 py-0.5 rounded uppercase">
                      {link.suspicious ? 'Suspicious' : 'Clean'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

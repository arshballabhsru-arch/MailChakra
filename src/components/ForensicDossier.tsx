import React, { useState } from 'react';
import { ForensicIntelligence, MailHop, MitreTechnique } from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck,
  Fingerprint,
  Download,
  Printer,
  ChevronDown,
  ChevronRight,
  Clock,
  Layers,
  FileCode,
  Terminal,
  Paperclip,
  Key,
  Radio,
  ExternalLink
} from 'lucide-react';

interface ForensicDossierProps {
  forensicIntel: ForensicIntelligence;
  rawInput?: string;
  target?: string;
}

export const ForensicDossier: React.FC<ForensicDossierProps> = ({
  forensicIntel,
  rawInput = '',
  target = ''
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'hops' | 'headers' | 'mitre' | 'custody'>('overview');
  const [expandedHop, setExpandedHop] = useState<number | null>(1);

  // Authentication status color helper
  const getAuthBadge = (status: string) => {
    switch (status) {
      case 'PASS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            PASS
          </span>
        );
      case 'FAIL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5" />
            FAIL
          </span>
        );
      case 'SOFTFAIL':
      case 'QUARANTINE_POLICY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
            NONE
          </span>
        );
    }
  };

  // Export Forensic Dossier JSON
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(forensicIntel, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `forensic-dossier-${forensicIntel.chainOfCustody.sha256.slice(0, 8)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Print report
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-lg transition-colors space-y-6">
      
      {/* Dossier Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
              <Fingerprint className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                  Forensic Threat Intelligence Dossier
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  RFC 5322 & MTA Chain
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Cryptographic authentication alignment, hop timeline, and MITRE ATT&CK mapping
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 transition-colors"
            title="Download full forensic dossier as JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 shadow-xs transition-colors"
            title="Print or save as PDF forensic report"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Primary Threat Classification Banner */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        forensicIntel.threatClassification.primaryThreat.includes('Clean')
          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
          : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200'
      }`}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-white/80 dark:bg-zinc-900/80 shadow-xs shrink-0 mt-0.5">
            {forensicIntel.threatClassification.primaryThreat.includes('Clean') ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Primary Threat Classification:
              </span>
              <span className="text-sm font-extrabold">
                {forensicIntel.threatClassification.primaryThreat}
              </span>
            </div>
            <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-1">
              {forensicIntel.threatClassification.attackVectorSummary}
            </p>
          </div>
        </div>

        <div className="sm:text-right shrink-0">
          <span className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 block">
            Threat Confidence
          </span>
          <span className="text-lg font-mono font-extrabold">
            {forensicIntel.threatClassification.confidenceLevel}%
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 font-bold'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          Authentication & Spoofing
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('hops')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'hops'
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 font-bold'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <span>MTA Hop Timeline</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-200 dark:bg-zinc-800">
            {forensicIntel.geoRouteAnalysis.hops.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('mitre')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'mitre'
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 font-bold'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <span>MITRE ATT&CK Matrix</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
            {forensicIntel.threatClassification.mitreTechniques.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('headers')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'headers'
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 font-bold'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          Header Discrepancy Matrix
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('custody')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'custody'
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 font-bold'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          Digital Chain of Custody
        </button>
      </div>

      {/* Tab 1: Authentication & Spoofing */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* SPF / DKIM / DMARC Trio */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
              Cryptographic Email Authentication Alignment
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              
              {/* SPF */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    SPF (Sender Policy)
                  </span>
                  {getAuthBadge(forensicIntel.authAlignment.spf)}
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {forensicIntel.authAlignment.spfDetails}
                </p>
              </div>

              {/* DKIM */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    DKIM (Cryptographic Sig)
                  </span>
                  {getAuthBadge(forensicIntel.authAlignment.dkim)}
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {forensicIntel.authAlignment.dkimDetails}
                </p>
              </div>

              {/* DMARC */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    DMARC Alignment
                  </span>
                  {getAuthBadge(forensicIntel.authAlignment.dmarc)}
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {forensicIntel.authAlignment.dmarcDetails}
                </p>
              </div>

            </div>
          </div>

          {/* Attachments Scanner */}
          {forensicIntel.attachmentAudit && forensicIntel.attachmentAudit.detectedAttachments.length > 0 && (
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-blue-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                    MIME Attachment Forensic Audit ({forensicIntel.attachmentAudit.detectedAttachments.length})
                  </h4>
                </div>
                {forensicIntel.attachmentAudit.hasDangerousAttachments ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                    WEAPONIZED FILE DETECTED
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    BENIGN FILETYPES
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {forensicIntel.attachmentAudit.detectedAttachments.map((att, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                      att.riskLevel === 'critical'
                        ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-900 text-rose-900 dark:text-rose-200'
                        : att.riskLevel === 'suspicious'
                        ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-900 text-amber-900 dark:text-amber-200'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <div>
                      <span className="font-mono font-bold block">{att.filename}</span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{att.reason}</span>
                    </div>
                    <span className={`uppercase font-bold text-[10px] px-2 py-0.5 rounded ${
                      att.riskLevel === 'critical' ? 'bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-200' : 'bg-zinc-200 dark:bg-zinc-800'
                    }`}>
                      .{att.extension} ({att.riskLevel})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Geo-Route Anomalies list */}
          {forensicIntel.geoRouteAnalysis.geoAnomalies.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 space-y-2">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4" />
                <span>Geographic Transit Anomalies Identified</span>
              </div>
              <ul className="list-disc pl-5 text-xs text-rose-800 dark:text-rose-300 space-y-1">
                {forensicIntel.geoRouteAnalysis.geoAnomalies.map((anom, idx) => (
                  <li key={idx}>{anom}</li>
                ))}
              </ul>
            </div>
          )}

        </div>
      )}

      {/* Tab 2: MTA Hop Timeline */}
      {activeTab === 'hops' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>Chronological Mail Transport Agent (MTA) Relay Trace</span>
            <span>Total Relays: {forensicIntel.geoRouteAnalysis.hops.length}</span>
          </div>

          <div className="relative border-l-2 border-zinc-200 dark:border-zinc-800 ml-4 space-y-6">
            {forensicIntel.geoRouteAnalysis.hops.map((hop) => {
              const isOrigin = hop.hopNumber === 1;
              const isHighRisk = (hop.geo?.threatScore || 0) > 70 || hop.geo?.isTor;

              return (
                <div key={hop.hopNumber} className="relative pl-6">
                  {/* Timeline marker */}
                  <div className={`absolute -left-2.5 top-0 w-5 h-5 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[9px] font-mono font-bold text-white shadow-xs ${
                    isOrigin
                      ? 'bg-amber-500'
                      : isHighRisk
                      ? 'bg-rose-600'
                      : 'bg-blue-600'
                  }`}>
                    {hop.hopNumber}
                  </div>

                  <div className={`p-4 rounded-xl border text-xs ${
                    isHighRisk
                      ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
                      : 'bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-zinc-900 dark:text-white">
                            Hop #{hop.hopNumber}: {isOrigin ? 'Initial Origin Client MTA' : 'Transit Relay MTA'}
                          </span>
                          {hop.geo?.flagEmoji && (
                            <span className="text-base" title={hop.geo.country}>{hop.geo.flagEmoji}</span>
                          )}
                        </div>
                        <p className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                          From: {hop.fromServer} → By: {hop.byServer}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold">
                          {hop.ip}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {hop.protocol || 'ESMTPS'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div>
                        <span className="text-zinc-500 block">Geo Location:</span>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                          {hop.geo?.city}, {hop.geo?.country}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Autonomous System (ASN):</span>
                        <span className="font-mono text-zinc-900 dark:text-zinc-200 truncate block" title={hop.geo?.asn}>
                          {hop.geo?.asn || 'AS-Local'}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Transit Delay:</span>
                        <span className="font-mono text-zinc-900 dark:text-zinc-200">
                          {hop.delaySec !== undefined ? `+${hop.delaySec}s` : '0s'}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Timestamp:</span>
                        <span className="font-mono text-zinc-900 dark:text-zinc-200 truncate block">
                          {hop.timestamp ? new Date(hop.timestamp).toLocaleTimeString() : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {hop.anomalyReason && (
                      <div className="mt-2 text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1.5 text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{hop.anomalyReason}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: MITRE ATT&CK Matrix */}
      {activeTab === 'mitre' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>Adversary Tactics & Techniques (Enterprise Matrix)</span>
            <span>Mapped Techniques: {forensicIntel.threatClassification.mitreTechniques.length}</span>
          </div>

          {forensicIntel.threatClassification.mitreTechniques.length === 0 ? (
            <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 text-zinc-500">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
              <p className="font-semibold text-sm">No MITRE ATT&CK Attack Techniques Detected</p>
              <p className="text-xs mt-1">This email exhibits normal non-adversarial characteristics.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {forensicIntel.threatClassification.mitreTechniques.map((tech) => (
                <div
                  key={tech.id}
                  className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {tech.id}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      Tactic: {tech.tactic}
                    </span>
                  </div>
                  <h5 className="font-bold text-sm text-zinc-900 dark:text-white">
                    {tech.name}
                  </h5>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {tech.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Header Discrepancy Matrix */}
      {activeTab === 'headers' && (
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            RFC 5322 vs RFC 5321 Header Comparison
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <thead className="bg-zinc-100 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 font-bold">
                <tr>
                  <th className="py-2.5 px-3">Header Field</th>
                  <th className="py-2.5 px-3">Extracted Domain / Identity</th>
                  <th className="py-2.5 px-3">Integrity Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-zinc-600 dark:text-zinc-400">From: (RFC 5322)</td>
                  <td className="py-2.5 px-3 text-zinc-900 dark:text-zinc-200">
                    {forensicIntel.headerIntegrity.fromDomain || 'None'}
                  </td>
                  <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-bold">
                    Primary Display
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-zinc-600 dark:text-zinc-400">Return-Path: (RFC 5321)</td>
                  <td className="py-2.5 px-3 text-zinc-900 dark:text-zinc-200">
                    {forensicIntel.headerIntegrity.returnPathDomain || 'None'}
                  </td>
                  <td className="py-2.5 px-3 font-bold">
                    {forensicIntel.headerIntegrity.fromDomain &&
                    forensicIntel.headerIntegrity.returnPathDomain &&
                    forensicIntel.headerIntegrity.fromDomain !== forensicIntel.headerIntegrity.returnPathDomain ? (
                      <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Mismatch (Spoof Risk)
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Aligned
                      </span>
                    )}
                  </td>
                </tr>
                {forensicIntel.headerIntegrity.replyToDomain && (
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-zinc-600 dark:text-zinc-400">Reply-To:</td>
                    <td className="py-2.5 px-3 text-zinc-900 dark:text-zinc-200">
                      {forensicIntel.headerIntegrity.replyToDomain}
                    </td>
                    <td className="py-2.5 px-3 font-bold">
                      {forensicIntel.headerIntegrity.replyToDomain !== forensicIntel.headerIntegrity.fromDomain ? (
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Divergent Route
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400">Aligned</span>
                      )}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-zinc-600 dark:text-zinc-400">Message-ID:</td>
                  <td className="py-2.5 px-3 text-zinc-900 dark:text-zinc-200">
                    {forensicIntel.headerIntegrity.messageIdDomain || 'Present'}
                  </td>
                  <td className="py-2.5 px-3 font-bold">
                    {forensicIntel.headerIntegrity.messageIdValid ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> RFC 5322 Valid
                      </span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Missing / Invalid
                      </span>
                    )}
                  </td>
                </tr>
                {forensicIntel.headerIntegrity.xMailer && (
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-zinc-600 dark:text-zinc-400">X-Mailer / MUA:</td>
                    <td className="py-2.5 px-3 text-zinc-900 dark:text-zinc-200" colSpan={2}>
                      {forensicIntel.headerIntegrity.xMailer}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {forensicIntel.headerIntegrity.suspiciousHeadersFound.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
              <strong className="block mb-1">Header Anomalies Detected:</strong>
              <ul className="list-disc pl-5 space-y-1">
                {forensicIntel.headerIntegrity.suspiciousHeadersFound.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Digital Chain of Custody */}
      {activeTab === 'custody' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Cryptographic Integrity Hashes (Chain of Custody)
            </h4>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-zinc-500 block mb-0.5">SHA-256 Digest:</span>
                <span className="font-mono text-zinc-800 dark:text-zinc-200 break-all p-2 rounded bg-zinc-200/60 dark:bg-zinc-800/80 block select-all">
                  {forensicIntel.chainOfCustody.sha256}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block mb-0.5">MD5 Digest:</span>
                <span className="font-mono text-zinc-800 dark:text-zinc-200 break-all p-2 rounded bg-zinc-200/60 dark:bg-zinc-800/80 block select-all">
                  {forensicIntel.chainOfCustody.md5}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="text-zinc-500 block">Inspection Timestamp:</span>
                  <span className="font-mono text-zinc-800 dark:text-zinc-200">
                    {new Date(forensicIntel.chainOfCustody.inspectedAt).toUTCString()}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Lines Examined:</span>
                  <span className="font-mono text-zinc-800 dark:text-zinc-200">
                    {forensicIntel.chainOfCustody.headerLinesCount} lines
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

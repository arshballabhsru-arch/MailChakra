import React, { useState } from 'react';
import { GeoLocationData } from '../types';
import { GeoMap } from './GeoMap';
import {
  Search,
  Globe,
  Radio,
  Server,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  RotateCw,
  Sparkles,
  MapPin
} from 'lucide-react';

export const IpGeoScanner: React.FC = () => {
  const [ipInput, setIpInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeoLocationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleIps = [
    { label: 'Tor Exit Relay', ip: '185.220.101.5', desc: 'Frankfurt, Germany (Tor Anonymizer)' },
    { label: 'Offshore Bulletproof', ip: '45.154.255.10', desc: 'Victoria, Seychelles (High Risk Host)' },
    { label: 'Moscow Datacenter', ip: '194.26.29.112', desc: 'Moscow, Russia (Petersburg Net)' },
    { label: 'Google Mail MTA', ip: '142.250.190.46', desc: 'Mountain View, CA (AS15169 Google LLC)' },
    { label: 'Microsoft Exchange', ip: '52.96.166.146', desc: 'Ashburn, VA (AS8075 Microsoft)' }
  ];

  const handleLookup = async (targetIp?: string) => {
    const query = (targetIp || ipInput).trim();
    if (!query) {
      setError('Please enter an IPv4 address to scan');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/lookup-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: query })
      });
      if (!res.ok) {
        throw new Error('Failed to resolve IP location');
      }
      const data = await res.json();
      setResult(data.geo);
      if (targetIp) setIpInput(targetIp);
    } catch (err: any) {
      setError(err.message || 'Lookup failed. Please verify the IP address format.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">
            IP GeoLocation & Mail Server Threat Scanner
          </h3>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-3xl mb-5">
          Audit any mail transfer server, client submission IP, or suspicious relay address. Uncover physical geographic coordinates, Autonomous System Numbers (ASN), Reverse DNS PTR records, and Tor/VPN exit status.
        </p>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLookup();
          }}
          className="flex flex-col sm:flex-row items-stretch gap-2.5"
        >
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              placeholder="e.g. 185.220.101.5 or 142.250.190.46"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950/80 text-zinc-900 dark:text-white font-mono text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all disabled:opacity-50 shrink-0"
          >
            {loading ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Geolocating...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Trace GeoLocation</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <p className="mt-2 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </p>
        )}

        {/* Preset Pills */}
        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-2">
            Forensic Test Vectors:
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleIps.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLookup(s.ip)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/60 dark:hover:text-blue-300 border border-zinc-200 dark:border-zinc-700 transition-colors"
              >
                <span>{s.label}</span>
                <span className="font-mono text-[10px] text-zinc-400">({s.ip})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results View */}
      {result && (
        <div className="space-y-6">
          <GeoMap
            originGeo={result}
            interactive={true}
          />
        </div>
      )}

    </div>
  );
};

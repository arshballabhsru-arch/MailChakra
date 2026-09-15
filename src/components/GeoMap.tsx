import React, { useState } from 'react';
import { GeoLocationData, MailHop } from '../types';
import {
  MapPin,
  Globe,
  ShieldAlert,
  ShieldCheck,
  Server,
  Zap,
  Radio,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Navigation
} from 'lucide-react';

interface GeoMapProps {
  originGeo?: GeoLocationData;
  destinationGeo?: GeoLocationData;
  hops?: MailHop[];
  className?: string;
  interactive?: boolean;
}

// Simplified World Map SVG Landmass Paths (Equirectangular Projection)
// Bounds: Longitude -180 to 180 (x: 0 to 1000), Latitude 85 to -85 (y: 0 to 500)
export const GeoMap: React.FC<GeoMapProps> = ({
  originGeo,
  destinationGeo,
  hops = [],
  className = '',
  interactive = true
}) => {
  const [selectedNode, setSelectedNode] = useState<GeoLocationData | null>(originGeo || (hops.length > 0 && hops[0].geo ? hops[0].geo : null));
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Convert latitude and longitude to SVG canvas coordinates (1000 x 500)
  const coordsToSvg = (lat: number, lng: number) => {
    // Equirectangular projection
    const x = ((lng + 180) / 360) * 1000;
    // Clamp latitude between -80 and 80 for visually pleasing aspect ratio
    const clampedLat = Math.max(-80, Math.min(80, lat));
    const y = ((85 - clampedLat) / 170) * 500;
    return { x: Math.max(20, Math.min(980, x)), y: Math.max(20, Math.min(480, y)) };
  };

  // Collect all valid mapped points
  const points: { id: string; label: string; hopNum?: number; geo: GeoLocationData; isOrigin?: boolean; isDest?: boolean; svg: { x: number; y: number } }[] = [];

  if (originGeo && typeof originGeo.latitude === 'number' && typeof originGeo.longitude === 'number') {
    points.push({
      id: 'origin',
      label: 'Sending Origin',
      isOrigin: true,
      geo: originGeo,
      svg: coordsToSvg(originGeo.latitude, originGeo.longitude)
    });
  }

  // Intermediate hops
  hops.forEach((hop) => {
    if (hop.geo && typeof hop.geo.latitude === 'number' && typeof hop.geo.longitude === 'number') {
      const exists = points.some(p => Math.abs(p.geo.latitude - hop.geo!.latitude) < 0.5 && Math.abs(p.geo.longitude - hop.geo!.longitude) < 0.5);
      if (!exists) {
        points.push({
          id: `hop-${hop.hopNumber}`,
          label: `MTA Hop #${hop.hopNumber}`,
          hopNum: hop.hopNumber,
          geo: hop.geo,
          svg: coordsToSvg(hop.geo.latitude, hop.geo.longitude)
        });
      }
    }
  });

  if (destinationGeo && typeof destinationGeo.latitude === 'number' && typeof destinationGeo.longitude === 'number') {
    const exists = points.some(p => Math.abs(p.geo.latitude - destinationGeo.latitude) < 0.5 && Math.abs(p.geo.longitude - destinationGeo.longitude) < 0.5);
    if (!exists) {
      points.push({
        id: 'dest',
        label: 'Destination MX',
        isDest: true,
        geo: destinationGeo,
        svg: coordsToSvg(destinationGeo.latitude, destinationGeo.longitude)
      });
    }
  }

  // Draw curved paths between chronological points
  const pathElements = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i].svg;
    const p2 = points[i + 1].svg;
    const midX = (p1.x + p2.x) / 2;
    // Curve upwards
    const midY = Math.min(p1.y, p2.y) - Math.abs(p1.x - p2.x) * 0.18;
    const d = `M ${p1.x} ${p1.y} Q ${midX} ${midY} ${p2.x} ${p2.y}`;
    pathElements.push(
      <g key={`path-${i}`}>
        {/* Glow track */}
        <path
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-blue-500/20 dark:text-blue-400/25"
        />
        {/* Animated dashed line */}
        <path
          d={d}
          fill="none"
          stroke="url(#routeGradient)"
          strokeWidth="2"
          strokeDasharray="6 4"
          className="animate-[dash_15s_linear_infinite]"
        />
      </g>
    );
  }

  return (
    <div className={`relative bg-zinc-900 text-zinc-100 rounded-2xl overflow-hidden border border-zinc-800 shadow-xl ${className}`}>
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-950/80 border-b border-zinc-800 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-bold tracking-wider uppercase text-zinc-200">
            Geographic MTA Route Tracer & Origin Mapping
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 font-mono border border-emerald-800/60">
            {points.length} Node{points.length !== 1 ? 's' : ''} Mapped
          </span>
        </div>

        {interactive && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2))}
              className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.75))}
              className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* SVG Canvas Map Area */}
      <div className="relative w-full h-64 sm:h-80 overflow-hidden bg-[#0a0f18] flex items-center justify-center select-none">
        
        {/* Subtle Map Grid Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* Stylized World Continents Background (Equirectangular Shapes) */}
          <g className="fill-zinc-800/40 stroke-zinc-700/30 stroke-[0.5]">
            {/* North America */}
            <path d="M 80 80 Q 150 60 260 70 Q 280 120 220 180 Q 180 230 200 270 L 160 250 Q 110 200 80 140 Z" />
            <path d="M 230 40 Q 320 30 350 70 Q 300 110 230 90 Z" /> {/* Greenland */}
            {/* South America */}
            <path d="M 220 280 Q 310 290 330 340 Q 280 430 240 470 Q 220 400 210 320 Z" />
            {/* Europe */}
            <path d="M 450 70 Q 550 60 560 120 Q 520 160 460 150 Q 420 110 450 70 Z" />
            <path d="M 420 90 Q 445 80 440 120 Q 410 110 420 90 Z" /> {/* UK */}
            {/* Africa */}
            <path d="M 440 170 Q 560 170 570 250 Q 530 380 480 400 Q 420 330 430 220 Z" />
            {/* Asia */}
            <path d="M 570 70 Q 750 50 880 100 Q 890 200 780 250 Q 670 240 600 200 Q 560 140 570 70 Z" />
            {/* Japan / Islands */}
            <path d="M 890 130 Q 910 150 900 190 Q 880 160 890 130 Z" />
            {/* Australia */}
            <path d="M 760 320 Q 880 310 880 380 Q 820 440 760 400 Z" />
          </g>

          {/* Longitude & Latitude Reference Lines */}
          <g className="stroke-zinc-800/40 stroke-dasharray-[2,4] stroke-[0.5]">
            <line x1="0" y1="250" x2="1000" y2="250" /> {/* Equator */}
            <line x1="500" y1="0" x2="500" y2="500" /> {/* Prime Meridian */}
          </g>

          {/* Drawn Transit Routes */}
          {pathElements}

          {/* Node Pins */}
          {points.map((pt, idx) => {
            const isHighRisk = (pt.geo.threatScore || 0) > 75 || pt.geo.isTor;
            const isSelected = selectedNode?.ip === pt.geo.ip;
            const pinColor = pt.isOrigin
              ? isHighRisk ? '#ef4444' : '#f59e0b'
              : pt.isDest
              ? '#10b981'
              : '#3b82f6';

            return (
              <g
                key={pt.id}
                className="cursor-pointer group"
                onClick={() => setSelectedNode(pt.geo)}
              >
                {/* Pulsing Outer Halo */}
                <circle
                  cx={pt.svg.x}
                  cy={pt.svg.y}
                  r={isSelected ? 16 : 10}
                  fill={pinColor}
                  fillOpacity="0.2"
                  className="animate-ping"
                  style={{ animationDuration: isHighRisk ? '1.5s' : '3s' }}
                />

                {/* Inner Glow Circle */}
                <circle
                  cx={pt.svg.x}
                  cy={pt.svg.y}
                  r={isSelected ? 8 : 6}
                  fill={pinColor}
                  stroke="#ffffff"
                  strokeWidth="2"
                  filter="url(#glow)"
                />

                {/* Number Badge or Icon */}
                <text
                  x={pt.svg.x}
                  y={pt.svg.y - 12}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="bold"
                  className="pointer-events-none drop-shadow-md font-mono"
                >
                  {pt.hopNum ? `#${pt.hopNum}` : pt.isOrigin ? 'ORIGIN' : 'MX'}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend Overlay */}
        <div className="absolute bottom-2 left-2 flex items-center gap-3 bg-zinc-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-800/80 text-[10px] text-zinc-300">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Origin Client</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Transit Relay</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Destination MX</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>High Risk / Tor</span>
          </div>
        </div>
      </div>

      {/* Selected Node Forensic Inspection Panel */}
      {selectedNode && (
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800/70">
            <div className="flex items-center gap-2">
              <span className="text-xl" title={selectedNode.country}>{selectedNode.flagEmoji}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-sm">
                    {selectedNode.city}, {selectedNode.country}
                  </span>
                  <span className="font-mono text-[11px] text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-900/50">
                    {selectedNode.ip}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Coordinates: {selectedNode.latitude.toFixed(3)}°N, {selectedNode.longitude.toFixed(3)}°E
                </p>
              </div>
            </div>

            {/* Threat Gauge */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-zinc-400">IP Threat Score</p>
                <p className={`font-mono font-bold text-sm ${
                  (selectedNode.threatScore || 0) > 70
                    ? 'text-rose-400'
                    : (selectedNode.threatScore || 0) > 30
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}>
                  {selectedNode.threatScore || 10}/100
                </p>
              </div>
              <div className={`p-1.5 rounded-lg ${
                (selectedNode.threatScore || 0) > 70
                  ? 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
                  : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
              }`}>
                {(selectedNode.threatScore || 0) > 70 ? (
                  <ShieldAlert className="w-4 h-4" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
              </div>
            </div>
          </div>

          {/* Node Metadata Matrix */}
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
            <div>
              <span className="text-zinc-500 block">Autonomous System</span>
              <span className="font-mono text-zinc-200 truncate block" title={selectedNode.asn}>
                {selectedNode.asn || 'AS-Private'}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block">ISP / Hosting</span>
              <span className="text-zinc-200 truncate block" title={selectedNode.isp}>
                {selectedNode.isp || 'Commercial Provider'}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block">Reverse DNS (PTR)</span>
              <span className="font-mono text-zinc-300 truncate block" title={selectedNode.reverseDns}>
                {selectedNode.reverseDns || 'No PTR Record'}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block">Network Type</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {selectedNode.isTor && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                    TOR EXIT
                  </span>
                )}
                {selectedNode.isVpnOrProxy && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                    VPN/PROXY
                  </span>
                )}
                {selectedNode.isDatacenter && !selectedNode.isTor && !selectedNode.isVpnOrProxy && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300">
                    DATACENTER
                  </span>
                )}
                {!selectedNode.isTor && !selectedNode.isVpnOrProxy && !selectedNode.isDatacenter && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    RESIDENTIAL/BUSINESS
                  </span>
                )}
              </div>
            </div>
          </div>

          {selectedNode.anomalyFlag && (
            <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-300 text-[11px] flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-rose-400" />
              <span><strong>Forensic Anomaly:</strong> {selectedNode.anomalyFlag}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

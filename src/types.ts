export type Role = 'user' | 'admin';

export type Verdict = 'safe' | 'suspicious' | 'unsafe';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  avatar?: string;
}

export interface TriggerItem {
  id: string;
  title: string;
  category: 'urgency' | 'link' | 'domain' | 'financial' | 'grammar' | 'disposable' | 'blocklist' | 'mx' | 'security' | 'geolocation' | 'forensic';
  severity: 'low' | 'medium' | 'high';
  description: string;
  evidence?: string;
}

export interface GeoLocationData {
  ip: string;
  country: string;
  countryCode: string; // e.g. US, RU, CN, DE, NL, SC
  flagEmoji: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  isp: string;
  asn: string; // Autonomous System Number e.g. AS15169 Google LLC
  reverseDns?: string;
  timezone?: string;
  isVpnOrProxy?: boolean;
  isTor?: boolean;
  isDatacenter?: boolean;
  threatScore?: number; // 0 (benign) to 100 (critical risk)
  anomalyFlag?: string;
}

export interface MailHop {
  hopNumber: number;
  fromServer: string;
  byServer: string;
  ip: string;
  geo?: GeoLocationData;
  timestamp?: string;
  delaySec?: number;
  protocol?: string;
  suspicious?: boolean;
  anomalyReason?: string;
}

export interface MitreTechnique {
  id: string; // e.g. T1566.001
  name: string; // e.g. Spearphishing Link
  tactic: string; // e.g. Initial Access
  description: string;
}

export interface ForensicIntelligence {
  authAlignment: {
    spf: 'PASS' | 'FAIL' | 'SOFTFAIL' | 'NEUTRAL' | 'NONE';
    spfDetails: string;
    dkim: 'PASS' | 'FAIL' | 'INVALID' | 'NONE';
    dkimDetails: string;
    dmarc: 'PASS' | 'FAIL' | 'REJECT_POLICY' | 'QUARANTINE_POLICY' | 'NONE';
    dmarcDetails: string;
  };
  headerIntegrity: {
    fromDomain: string;
    returnPathDomain: string;
    replyToDomain?: string;
    messageIdValid: boolean;
    messageIdDomain?: string;
    xMailer?: string;
    clientUserAgent?: string;
    suspiciousHeadersFound: string[];
    forgedHopsDetected: boolean;
  };
  threatClassification: {
    primaryThreat: 'Clean / Non-Threatening' | 'Business Email Compromise (BEC)' | 'Credential Harvesting Phishing' | 'Spear Phishing' | 'Quishing / QR Phishing' | 'Advance Fee Fraud (419)' | 'Malware / Ransomware Delivery' | 'Brand Spoofing & Impersonation';
    mitreTechniques: MitreTechnique[];
    confidenceLevel: number;
    attackVectorSummary: string;
  };
  attachmentAudit?: {
    detectedAttachments: { filename: string; extension: string; riskLevel: 'safe' | 'suspicious' | 'critical'; reason: string }[];
    hasDangerousAttachments: boolean;
  };
  geoRouteAnalysis: {
    originGeo?: GeoLocationData;
    hops: MailHop[];
    geoAnomalies: string[];
    routeDistanceKm?: number;
    senderToOriginMismatch?: boolean;
  };
  chainOfCustody: {
    sha256: string;
    md5: string;
    headerLinesCount: number;
    inspectedAt: string;
  };
}

export interface VerificationResult {
  id: string;
  userId: string;
  userEmail: string;
  timestamp: string;
  type: 'address' | 'content' | 'ip';
  target: string; // The email address, subject line, or IP address
  rawInput: string;
  verdict: Verdict;
  confidenceScore: number; // 0 to 100
  summary: string;
  details: {
    // For address & domain checks
    formatValid?: boolean;
    domain?: string;
    mxRecordsFound?: boolean;
    mxHosts?: string[];
    mxIp?: string;
    mxGeo?: GeoLocationData;
    isDisposable?: boolean;
    disposableProvider?: string;
    isBlocklisted?: boolean;
    blocklistSource?: string;
    isFreeMail?: boolean;
    isTyposquat?: boolean;
    typosquatTarget?: string;
    dnsStatus?: string;
    
    // For full content & forensic checks
    subject?: string;
    detectedSender?: string;
    mismatchedSender?: boolean;
    suspiciousLinksCount?: number;
    extractedLinks?: { url: string; suspicious: boolean; reason?: string }[];
    financialRequestsDetected?: boolean;
    urgencyLevel?: 'none' | 'moderate' | 'critical';
    grammarAnomaliesDetected?: boolean;

    // GeoLocation & Forensic Intelligence
    geoData?: GeoLocationData;
    forensicIntel?: ForensicIntelligence;
    
    // Common
    triggers: TriggerItem[];
    reasoning: string[];
    recommendation: string;
  };
}

export type Theme = 'light' | 'dark';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface AppointmentBooking {
  id?: string;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  serviceType: string;
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
  createdAt?: string;
}

export interface SupabaseAppointmentRecord {
  id?: string;
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  service_type: string;
  appointment_date: string;
  appointment_time: string;
  notes?: string;
  status?: string;
  created_at?: string;
}


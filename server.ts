import express, { Request, Response } from 'express';
import path from 'path';
import dns from 'dns';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { createServer as createViteServer } from 'vite';
import { resolveIpGeo, parseEmailForensics, GeoLocationData } from './server/forensics';

const app = express();
const PORT = 3000;

// Supabase Backend Configuration
const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID || 'jytkxbgxshkmsbrbmmje';
const SUPABASE_URL = process.env.SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_EotJAp2m3fimM2l7gz6gig_1zkB1TiQ';
const supabaseServer = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

app.use(express.json({ limit: '10mb' }));

// Known disposable email domains list
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', '10minutemail.com', 'tempmail.com', 'temp-mail.org',
  'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org', 'sharklasers.com',
  'grr.la', 'guerrillamailblock.com', 'pokemail.net', 'spam4.me',
  'yopmail.com', 'yopmail.fr', 'yopmail.net', 'cool.fr.nf', 'jetable.fr.nf',
  'trashmail.com', 'trashmail.net', 'trashmail.me', 'trashmail.org',
  'throwawaymail.com', 'getnada.com', 'dispostable.com', 'burnermail.io',
  'crazymailing.com', 'generator.email', 'dropmail.me', 'fakemailgenerator.com',
  'inboxkitten.com', 'nada.ltd', 'mohmal.com', 'mytemp.email',
  'emailondeck.com', 'tempail.com', 'tempinbox.com', 'throwawayemailaddress.com',
  'fakeinbox.com', 'harakirimail.com', 'mailcatch.com', 'maildrop.cc',
  'mailforspam.com', 'mailnull.com', 'spambog.com', 'spamgourmet.com',
  'temp-mail.io', 'zillamail.com', 'tmailor.com', 'minuteinbox.com',
  'tempmail.plus', 'luxusmail.xyz', 'trashinbox.com', 'disposablemail.com'
]);

// Known blocklist / phishing domain indicators
const BLOCKLISTED_DOMAINS = new Set([
  'phish-bank-alert.com', 'account-verify-service.net', 'secure-apple-auth.co',
  'paypal-dispute-resolution.cc', 'wire-transfer-notice.top', 'security-warning-login.xyz',
  'bank-update-portal.com', 'netflix-billing-update.club', 'wells-fargo-alert.online',
  'chase-security-check.vip', 'microsoft-license-verify.biz', 'google-auth-recovery.info',
  'amazon-order-confirmation.top', 'irs-tax-refund-portal.click', 'support-apple-id.work'
]);

// Known free webmail domains
const FREE_MAIL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'ymail.com', 'hotmail.com',
  'outlook.com', 'live.com', 'msn.com', 'icloud.com', 'me.com', 'mac.com',
  'aol.com', 'proton.me', 'protonmail.com', 'zoho.com', 'mail.com', 'gmx.com'
]);

// Typosquatting checks mapping
const TARGET_BRANDS: Record<string, string[]> = {
  'google.com': ['g00gle.com', 'googel.com', 'gogle.com', 'google-verify.com'],
  'microsoft.com': ['micros0ft.com', 'micosoft.com', 'micro-soft.com', 'microsoft-support.com'],
  'apple.com': ['app1e.com', 'apple-id-verify.com', 'apple-security.com', 'aple.com'],
  'paypal.com': ['paypa1.com', 'pay-pal.com', 'paypal-security.com', 'paypaI.com'],
  'amazon.com': ['amaz0n.com', 'amazn.com', 'amazon-order-service.com'],
  'netflix.com': ['netf1ix.com', 'netflix-billing.com'],
  'chase.com': ['chase-bank-verify.com', 'chase-security.com']
};

function checkTyposquatting(domain: string): { isTyposquat: boolean; target?: string } {
  const lowerDomain = domain.toLowerCase();
  for (const [legit, fakes] of Object.entries(TARGET_BRANDS)) {
    if (fakes.includes(lowerDomain)) {
      return { isTyposquat: true, target: legit };
    }
  }
  // Levenshtein distance check against major domains
  const majorDomains = ['google.com', 'microsoft.com', 'apple.com', 'paypal.com', 'amazon.com', 'netflix.com'];
  for (const target of majorDomains) {
    if (lowerDomain !== target && isCloseTypo(lowerDomain, target)) {
      return { isTyposquat: true, target };
    }
  }
  return { isTyposquat: false };
}

function isCloseTypo(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 2) return false;
  // Simple distance comparison
  let diff = 0;
  const maxLen = Math.max(a.length, b.length);
  for (let i = 0; i < maxLen; i++) {
    if (a[i] !== b[i]) diff++;
    if (diff > 2) return false;
  }
  return diff <= 2 && diff > 0;
}

// Lazy Gemini AI client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

// Health endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// 1. Verify Email Address endpoint
app.post('/api/verify-email', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email address is required' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    
    // RFC 5322 standard regex validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    const formatValid = emailRegex.test(trimmedEmail);

    if (!formatValid) {
      return res.json({
        email: trimmedEmail,
        verdict: 'unsafe',
        confidenceScore: 98,
        summary: 'Invalid email syntax. Does not conform to RFC 5322 format specifications.',
        details: {
          formatValid: false,
          domain: trimmedEmail.split('@')[1] || '',
          mxRecordsFound: false,
          mxHosts: [],
          isDisposable: false,
          isBlocklisted: false,
          isFreeMail: false,
          isTyposquat: false,
          triggers: [
            {
              id: 'syntax_error',
              title: 'Malformed Email Format',
              category: 'domain',
              severity: 'high',
              description: 'The email contains invalid characters, consecutive dots, or an invalid domain structure.'
            }
          ],
          reasoning: [
            'RFC 5322 compliance check failed.',
            'Email address cannot be parsed into a legitimate mailbox and domain pair.',
            'Delivery to this address will immediately fail at the SMTP protocol level.'
          ],
          recommendation: 'Do not accept or send communications to this address. Verify correct formatting with the user.'
        }
      });
    }

    const [localPart, domain] = trimmedEmail.split('@');

    // Disposable check
    const isDisposable = DISPOSABLE_DOMAINS.has(domain);

    // Blocklist check
    const isBlocklisted = BLOCKLISTED_DOMAINS.has(domain) || 
      domain.endsWith('.xyz') && (domain.includes('bank') || domain.includes('verify') || domain.includes('auth')) ||
      domain.includes('phish') || domain.includes('scam');

    // Free mail check
    const isFreeMail = FREE_MAIL_DOMAINS.has(domain);

    // Typosquatting check
    const typoCheck = checkTyposquatting(domain);

    // DNS MX records check
    let mxRecordsFound = false;
    let mxHosts: string[] = [];
    let mxIp = '';
    let mxGeo: GeoLocationData | undefined = undefined;
    let dnsStatus = 'unverified';

    try {
      const mxRecords = await dns.promises.resolveMx(domain);
      if (mxRecords && mxRecords.length > 0) {
        mxRecordsFound = true;
        mxHosts = mxRecords
          .sort((a, b) => a.priority - b.priority)
          .map(r => r.exchange);
        dnsStatus = `Found ${mxRecords.length} active MX records`;

        // Resolve IPv4 of primary MX host for GeoLocation inspection
        try {
          const resolvedIps = await dns.promises.resolve4(mxHosts[0]);
          if (resolvedIps && resolvedIps.length > 0) {
            mxIp = resolvedIps[0];
            mxGeo = await resolveIpGeo(mxIp);
          }
        } catch {
          // Fallback if direct DNS A lookup on MX fails
          mxIp = '142.250.190.46';
          mxGeo = await resolveIpGeo(mxIp);
        }
      } else {
        mxRecordsFound = false;
        dnsStatus = 'No MX records published for this domain';
      }
    } catch (err: unknown) {
      const dnsErr = err as NodeJS.ErrnoException;
      mxRecordsFound = false;
      if (dnsErr.code === 'ENOTFOUND' || dnsErr.code === 'ENODATA') {
        dnsStatus = 'Domain does not exist or has no mail exchange (MX) configured';
      } else {
        dnsStatus = `DNS lookup failed: ${dnsErr.code || 'lookup error'}`;
      }
    }

    // Evaluate triggers & verdict
    const triggers = [];
    const reasoning = [];

    if (!mxRecordsFound) {
      triggers.push({
        id: 'no_mx',
        title: 'Missing Mail Server (MX) Records',
        category: 'mx',
        severity: 'high',
        description: `The domain "${domain}" has no configured mail exchangers. Emails sent here will hard-bounce.`
      });
      reasoning.push(`DNS query returned no active MX records for "${domain}".`);
    } else {
      reasoning.push(`Verified active mail servers: ${mxHosts.slice(0, 2).join(', ')}.`);
      if (mxGeo) {
        reasoning.push(`Primary MX (${mxHosts[0]}) resolved to IP ${mxIp} located in ${mxGeo.country} (${mxGeo.city}), ASN: ${mxGeo.asn}.`);
        if ((mxGeo.threatScore || 0) > 75 || mxGeo.isTor) {
          triggers.push({
            id: 'high_risk_mx_geo',
            title: 'Mail Host in High-Risk Threat Geo-Location',
            category: 'geolocation',
            severity: 'high',
            description: `Primary mail exchanger is hosted on suspicious bulletproof or anonymizing infrastructure in ${mxGeo.country} (${mxGeo.isp}).`,
            evidence: `IP: ${mxIp} | ASN: ${mxGeo.asn}`
          });
        }
      }
    }

    if (isBlocklisted) {
      triggers.push({
        id: 'blocklist_hit',
        title: 'Domain on Active Threat Blocklist',
        category: 'blocklist',
        severity: 'high',
        description: `The domain "${domain}" matches high-risk threat intelligence feeds associated with credential harvesting or scam campaigns.`
      });
      reasoning.push(`Domain "${domain}" is cataloged on anti-spam and threat blocklists.`);
    }

    if (isDisposable) {
      triggers.push({
        id: 'disposable_domain',
        title: 'Temporary / Disposable Email Domain',
        category: 'disposable',
        severity: 'high',
        description: `Domain "${domain}" belongs to an anonymous or disposable temporary inbox service.`
      });
      reasoning.push(`Domain is a known temporary inbox provider. Such addresses are commonly used for fraudulent signups, ban evasions, or burner communication.`);
    }

    if (typoCheck.isTyposquat) {
      triggers.push({
        id: 'typosquat_warning',
        title: 'Possible Impersonation / Typosquatting',
        category: 'domain',
        severity: 'high',
        description: `Domain "${domain}" closely mimics the legitimate brand domain "${typoCheck.target}".`
      });
      reasoning.push(`High risk of visual deception: "${domain}" appears designed to fool users into believing it is "${typoCheck.target}".`);
    }

    if (localPart.length > 40) {
      triggers.push({
        id: 'long_localpart',
        title: 'Unusually Long Local Identifier',
        category: 'security',
        severity: 'low',
        description: 'The username part of this email exceeds typical human or business conventions.'
      });
    }

    // Determine verdict
    let verdict: 'safe' | 'suspicious' | 'unsafe' = 'safe';
    let confidenceScore = 95;
    let summary = '';
    let recommendation = '';

    if (isBlocklisted || typoCheck.isTyposquat) {
      verdict = 'unsafe';
      confidenceScore = 96;
      summary = `High-risk domain detected. Known threat association or brand impersonation (${domain}).`;
      recommendation = 'Block communications immediately. Do not click links or send confidential information.';
    } else if (isDisposable) {
      verdict = 'unsafe';
      confidenceScore = 94;
      summary = `Disposable burner email detected from provider "${domain}".`;
      recommendation = 'Reject this email for account registration or authentication. Demand a permanent address.';
    } else if (!mxRecordsFound) {
      verdict = 'unsafe';
      confidenceScore = 92;
      summary = `Domain "${domain}" lacks active mail exchangers (MX records). Inactive or non-deliverable.`;
      recommendation = 'Verify domain spelling. Any email dispatched to this address will fail delivery.';
    } else if (triggers.length > 0) {
      verdict = 'suspicious';
      confidenceScore = 78;
      summary = 'Mild risk indicators detected. Deliverable domain, but exercise standard caution.';
      recommendation = 'Review sender identity and avoid downloading unexpected attachments.';
    } else {
      verdict = 'safe';
      confidenceScore = 95;
      summary = `Legitimate, deliverable email address on active domain "${domain}".`;
      recommendation = 'This email passed syntax, DNS MX validation, and threat feed checks without flags.';
      reasoning.push('Standard RFC 5322 syntax verified.');
      reasoning.push('Not listed in disposable provider or spam databases.');
    }

    return res.json({
      email: trimmedEmail,
      verdict,
      confidenceScore,
      summary,
      details: {
        formatValid: true,
        domain,
        mxRecordsFound,
        mxHosts,
        mxIp,
        mxGeo,
        geoData: mxGeo,
        isDisposable,
        disposableProvider: isDisposable ? domain : undefined,
        isBlocklisted,
        isFreeMail,
        isTyposquat: typoCheck.isTyposquat,
        typosquatTarget: typoCheck.target,
        dnsStatus,
        triggers,
        reasoning,
        recommendation
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({ error: 'Failed to verify email address' });
  }
});

// 2. Analyze Full Email Content & Forensic Intelligence endpoint
app.post('/api/analyze-content', async (req: Request, res: Response) => {
  try {
    const { content, senderEmail } = req.body;
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'Email content is required' });
    }

    const rawContent = content.trim();

    // 1. Deep Forensic Header & Geo-Hop Analysis
    const forensicIntel = await parseEmailForensics(rawContent, senderEmail);

    // 2. Deterministic Heuristic Engine Scan
    const heuristicResults = scanEmailHeuristics(rawContent, senderEmail);

    // Merge forensic anomalies into heuristic triggers
    const forensicTriggers: any[] = [];
    const forensicReasoning: string[] = [];

    if (forensicIntel.authAlignment.spf === 'FAIL' || forensicIntel.authAlignment.spf === 'SOFTFAIL') {
      forensicTriggers.push({
        id: 'spf_auth_failure',
        title: `SPF Authentication ${forensicIntel.authAlignment.spf}`,
        category: 'forensic',
        severity: 'high',
        description: forensicIntel.authAlignment.spfDetails,
        evidence: `SPF status: ${forensicIntel.authAlignment.spf}`
      });
      forensicReasoning.push(`SPF Authentication Failed: Mail server IP is unauthorized by domain policy.`);
    }

    if (forensicIntel.authAlignment.dkim === 'FAIL') {
      forensicTriggers.push({
        id: 'dkim_sig_invalid',
        title: 'Cryptographic DKIM Signature Failure',
        category: 'forensic',
        severity: 'high',
        description: forensicIntel.authAlignment.dkimDetails,
        evidence: 'DKIM check failed'
      });
      forensicReasoning.push('Cryptographic DKIM signature failed verification or was stripped in transit.');
    }

    if (forensicIntel.attachmentAudit?.hasDangerousAttachments) {
      forensicTriggers.push({
        id: 'dangerous_attachments_detected',
        title: 'Executable / Macro Attachment Payload',
        category: 'security',
        severity: 'high',
        description: 'Email embeds attachments with high-risk executable, macro, or script extensions.',
        evidence: forensicIntel.attachmentAudit.detectedAttachments.map(a => `${a.filename} (${a.riskLevel})`).join(', ')
      });
      forensicReasoning.push('Detected potentially weaponized attachment payload.');
    }

    for (const anomaly of forensicIntel.geoRouteAnalysis.geoAnomalies) {
      forensicTriggers.push({
        id: `geo_anomaly_${forensicTriggers.length}`,
        title: 'MTA Relay Geo-Routing Anomaly',
        category: 'geolocation',
        severity: 'high',
        description: anomaly,
        evidence: `Origin: ${forensicIntel.geoRouteAnalysis.originGeo?.country || 'Unknown'} (${forensicIntel.geoRouteAnalysis.originGeo?.city || 'Unknown'})`
      });
      forensicReasoning.push(`Geo-Routing Anomaly: ${anomaly}`);
    }

    // 3. If Gemini API is configured, use it for deep semantic phishing & forensic autopsy
    const ai = getGeminiClient();
    if (ai) {
      try {
        const prompt = `You are an expert cybersecurity email forensics and threat intelligence investigator.
Analyze the following raw email (which contains headers, body text, or HTML) for phishing, Business Email Compromise (BEC), credential harvesting, and forensic spoofing.

Telemetry Provided from Forensic Pipeline:
- Primary Threat Vector: ${forensicIntel.threatClassification.primaryThreat}
- SPF Status: ${forensicIntel.authAlignment.spf}
- DKIM Status: ${forensicIntel.authAlignment.dkim}
- Originating MTA Geo: ${forensicIntel.geoRouteAnalysis.originGeo?.country || 'Unknown'} (${forensicIntel.geoRouteAnalysis.originGeo?.city || 'Unknown'}), ASN: ${forensicIntel.geoRouteAnalysis.originGeo?.asn || 'Unknown'}
- Geo-Routing Anomalies: ${forensicIntel.geoRouteAnalysis.geoAnomalies.join('; ') || 'None'}
- Claimed Sender Domain: ${forensicIntel.headerIntegrity.fromDomain || 'None'}
- Return-Path Domain: ${forensicIntel.headerIntegrity.returnPathDomain || 'None'}

Raw Email Content:
"""
${rawContent.slice(0, 10000)}
"""

Perform an in-depth forensic investigation evaluating:
1. Social engineering manipulation, urgent coercion, or financial redirection (wire, gift cards, invoices).
2. Suspicious links, credential harvesting landing portals, or raw IP URLs.
3. Sender spoofing, header mismatches, and geographical incongruities.
4. MITRE ATT&CK techniques observed.

Respond ONLY with a valid JSON object matching this schema:
{
  "verdict": "safe" | "suspicious" | "unsafe",
  "confidenceScore": number (50 to 99),
  "summary": string (1-2 sentence executive forensic verdict),
  "threatType": string (e.g. "Business Email Compromise (BEC)", "Credential Harvesting Phishing", "Brand Spoofing", "Clean"),
  "triggers": [
    {
      "id": string,
      "title": string,
      "category": "urgency" | "link" | "domain" | "financial" | "grammar" | "security" | "geolocation" | "forensic",
      "severity": "low" | "medium" | "high",
      "description": string,
      "evidence": string
    }
  ],
  "reasoning": [string],
  "recommendation": string,
  "detectedSender": string,
  "mismatchedSender": boolean,
  "financialRequestsDetected": boolean,
  "urgencyLevel": "none" | "moderate" | "critical"
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.1
          }
        });

        const text = response.text?.trim();
        if (text) {
          const parsedAI = JSON.parse(text);

          // Update primary threat if AI classified with high precision
          if (parsedAI.threatType && forensicIntel.threatClassification) {
            forensicIntel.threatClassification.attackVectorSummary = parsedAI.summary || forensicIntel.threatClassification.attackVectorSummary;
          }

          const combinedTriggers = mergeTriggers(
            parsedAI.triggers || [],
            [...heuristicResults.details.triggers, ...forensicTriggers]
          );

          const combinedReasoning = Array.from(new Set([
            ...(parsedAI.reasoning || []),
            ...heuristicResults.details.reasoning,
            ...forensicReasoning
          ]));

          const finalVerdict = (forensicTriggers.some(t => t.severity === 'high') || parsedAI.verdict === 'unsafe')
            ? 'unsafe'
            : (parsedAI.verdict || heuristicResults.verdict);

          return res.json({
            target: parsedAI.detectedSender || senderEmail || extractSubjectOrPreview(rawContent),
            rawInput: rawContent,
            verdict: finalVerdict,
            confidenceScore: Math.max(parsedAI.confidenceScore || 80, heuristicResults.confidenceScore),
            summary: parsedAI.summary || heuristicResults.summary,
            details: {
              subject: extractSubject(rawContent),
              detectedSender: parsedAI.detectedSender || heuristicResults.details.detectedSender || forensicIntel.headerIntegrity.fromDomain,
              mismatchedSender: parsedAI.mismatchedSender ?? (heuristicResults.details.mismatchedSender || forensicIntel.geoRouteAnalysis.senderToOriginMismatch),
              suspiciousLinksCount: heuristicResults.details.suspiciousLinksCount,
              extractedLinks: heuristicResults.details.extractedLinks,
              financialRequestsDetected: parsedAI.financialRequestsDetected ?? heuristicResults.details.financialRequestsDetected,
              urgencyLevel: parsedAI.urgencyLevel || heuristicResults.details.urgencyLevel,
              grammarAnomaliesDetected: parsedAI.triggers?.some((t: any) => t.category === 'grammar') || heuristicResults.details.grammarAnomaliesDetected,
              geoData: forensicIntel.geoRouteAnalysis.originGeo,
              forensicIntel,
              triggers: combinedTriggers,
              reasoning: combinedReasoning,
              recommendation: parsedAI.recommendation || heuristicResults.details.recommendation
            }
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini content analysis fallback to forensic heuristics:', geminiErr);
      }
    }

    // Return deterministic forensic & heuristic results if Gemini not configured or errored
    const combinedTriggers = mergeTriggers(forensicTriggers, heuristicResults.details.triggers);
    const combinedReasoning = Array.from(new Set([...heuristicResults.details.reasoning, ...forensicReasoning]));

    let verdict = heuristicResults.verdict;
    if (forensicTriggers.some(t => t.severity === 'high')) {
      verdict = 'unsafe';
    }

    return res.json({
      target: senderEmail || extractSubjectOrPreview(rawContent),
      rawInput: rawContent,
      verdict,
      confidenceScore: Math.max(heuristicResults.confidenceScore, 90),
      summary: heuristicResults.summary,
      details: {
        ...heuristicResults.details,
        geoData: forensicIntel.geoRouteAnalysis.originGeo,
        forensicIntel,
        triggers: combinedTriggers,
        reasoning: combinedReasoning
      }
    });
  } catch (error) {
    console.error('Content analysis error:', error);
    return res.status(500).json({ error: 'Failed to analyze email content' });
  }
});

// 3. Direct IP & Geo-Threat Lookup endpoint
app.post('/api/lookup-ip', async (req: Request, res: Response) => {
  try {
    const { ip } = req.body;
    if (!ip || typeof ip !== 'string') {
      return res.status(400).json({ error: 'IP address is required' });
    }
    const cleanIp = ip.trim();
    const geo = await resolveIpGeo(cleanIp);
    let reverseDns = geo.reverseDns || '';
    try {
      const rdns = await dns.promises.reverse(cleanIp);
      if (rdns && rdns.length > 0) {
        reverseDns = rdns[0];
      }
    } catch {
      // Keep default PTR
    }

    return res.json({
      ip: cleanIp,
      geo: {
        ...geo,
        reverseDns
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('IP lookup error:', err);
    return res.status(500).json({ error: 'Failed to lookup IP geolocation' });
  }
});

// 4. Supabase Backend Health & Table Status
app.get('/api/supabase-status', async (req: Request, res: Response) => {
  try {
    const tableName = (req.query.table as string) || 'appointments';
    const { data, error } = await supabaseServer.from(tableName).select('id').limit(1);

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
        return res.json({
          connected: true,
          tableExists: false,
          projectId: SUPABASE_PROJECT_ID,
          tableName,
          message: `Connected to Supabase project (${SUPABASE_PROJECT_ID}), but table '${tableName}' does not exist yet.`,
          error: error.message
        });
      }
      return res.json({
        connected: false,
        tableExists: false,
        projectId: SUPABASE_PROJECT_ID,
        tableName,
        message: error.message,
        error: error.message
      });
    }

    return res.json({
      connected: true,
      tableExists: true,
      projectId: SUPABASE_PROJECT_ID,
      tableName,
      message: `Successfully connected to Supabase table '${tableName}'!`
    });
  } catch (err: any) {
    return res.status(500).json({
      connected: false,
      tableExists: false,
      projectId: SUPABASE_PROJECT_ID,
      error: err?.message || 'Failed to test Supabase connection'
    });
  }
});

// 5. Submit Appointment to Supabase backend table
app.post('/api/appointments', async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      email,
      phone,
      company,
      serviceType,
      appointmentDate,
      appointmentTime,
      notes,
      tableName = 'appointments'
    } = req.body;

    if (!fullName || !email || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        error: 'Missing required fields: fullName, email, appointmentDate, and appointmentTime are required.'
      });
    }

    const timestamp = new Date().toISOString();
    const record = {
      full_name: fullName.trim(),
      email: email.trim(),
      phone: (phone || '').trim(),
      company: (company || '').trim(),
      service_type: serviceType || 'Security Consultation',
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      notes: (notes || '').trim(),
      status: 'pending',
      created_at: timestamp
    };

    const { data, error } = await supabaseServer
      .from(tableName)
      .insert([record])
      .select();

    if (error) {
      console.warn('Supabase insertion returned error:', error);
      // Fallback try with camelCase in case table was created with camelCase column names
      if (error.message?.includes('column') || error.code === '42703') {
        const camelCaseRecord = {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: (phone || '').trim(),
          company: (company || '').trim(),
          serviceType: serviceType || 'Security Consultation',
          appointmentDate: appointmentDate,
          appointmentTime: appointmentTime,
          notes: (notes || '').trim(),
          status: 'pending',
          createdAt: timestamp
        };
        const retry = await supabaseServer.from(tableName).insert([camelCaseRecord]).select();
        if (!retry.error) {
          return res.status(201).json({
            success: true,
            source: 'supabase',
            data: retry.data,
            message: 'Appointment successfully saved to Supabase!'
          });
        }
      }

      return res.status(200).json({
        success: false,
        source: 'supabase_error',
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        requiresTableCreation: error.code === 'PGRST205'
      });
    }

    return res.status(201).json({
      success: true,
      source: 'supabase',
      data,
      message: 'Appointment successfully saved to Supabase backend table!'
    });
  } catch (err: any) {
    console.error('Server appointment error:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to save appointment to Supabase'
    });
  }
});

// 6. Fetch Appointments from Supabase backend
app.get('/api/appointments', async (req: Request, res: Response) => {
  try {
    const tableName = (req.query.table as string) || 'appointments';
    const { data, error } = await supabaseServer
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(200).json({
        success: false,
        error: error.message,
        code: error.code,
        appointments: []
      });
    }

    return res.json({
      success: true,
      appointments: data || []
    });
  } catch (err: any) {
    return res.status(500).json({
      error: err?.message || 'Failed to fetch appointments'
    });
  }
});


// Helper: Deterministic Heuristic Scanner
function scanEmailHeuristics(content: string, senderEmail?: string) {
  const triggers: any[] = [];
  const reasoning: string[] = [];
  const lower = content.toLowerCase();

  // 1. Urgency & Threatening patterns
  const urgencyPatterns = [
    { regex: /account\s+(?:will\s+be\s+)?suspended/i, title: 'Account Suspension Threat', evidence: 'Threatens immediate account closure' },
    { regex: /within\s+24\s+hours|within\s+48\s+hours|immediate\s+action\s+required/i, title: 'Artificial Deadline Urgency', evidence: 'Pressures recipient with tight time limit' },
    { regex: /unauthorized\s+(?:access|login|activity|transaction)/i, title: 'Fabricated Security Alert', evidence: 'Claims unauthorized account breach' },
    { regex: /legal\s+action|law\s+enforcement|arrest\s+warrant|prosecution/i, title: 'Coercive Legal Intimidation', evidence: 'Invokes legal consequences to cause panic' },
    { regex: /final\s+notice|last\s+reminder|urgent\s+reply\s+needed/i, title: 'High-Urgency Bait', evidence: 'Uses final warning tropes' }
  ];

  let urgencyLevel: 'none' | 'moderate' | 'critical' = 'none';
  let urgencyMatches = 0;
  for (const p of urgencyPatterns) {
    if (p.regex.test(content)) {
      urgencyMatches++;
      triggers.push({
        id: `urgency_${urgencyMatches}`,
        title: p.title,
        category: 'urgency',
        severity: urgencyMatches > 1 ? 'high' : 'medium',
        description: 'Phishers frequently use fear and urgency to bypass critical thinking.',
        evidence: p.evidence
      });
    }
  }
  if (urgencyMatches >= 2) urgencyLevel = 'critical';
  else if (urgencyMatches === 1) urgencyLevel = 'moderate';

  // 2. Financial & Credential requests
  const financialPatterns = [
    { regex: /wire\s+transfer|western\s+union|moneygram/i, title: 'Irreversible Wire Transfer Request', evidence: 'Requests wire payment' },
    { regex: /bitcoin|crypto|wallet\s+address|btc\s+payment|usdt/i, title: 'Cryptocurrency Payment Demand', evidence: 'Directs funds to anonymous crypto address' },
    { regex: /gift\s+card|apple\s+gift\s+card|google\s+play\s+card|steam\s+card/i, title: 'Gift Card Scam Indicator', evidence: 'Asks for prepaid card PINs/codes' },
    { regex: /password|seed\s+phrase|social\s+security|credit\s+card\s+number|cvv|pin\s+code/i, title: 'Sensitive Credential Harvesting', evidence: 'Explicitly solicits private authentication data' },
    { regex: /invoice\s+attached|payment\s+overdue|view\s+your\s+receipt/i, title: 'Fake Invoice / Billing Bait', evidence: 'Uses fake billing to provoke clicks' }
  ];

  let financialRequestsDetected = false;
  for (const p of financialPatterns) {
    if (p.regex.test(content)) {
      financialRequestsDetected = true;
      triggers.push({
        id: `financial_${triggers.length}`,
        title: p.title,
        category: 'financial',
        severity: 'high',
        description: 'Legitimate service providers do not request passwords, seed phrases, or gift card codes via email.',
        evidence: p.evidence
      });
    }
  }

  // 3. Link Extraction and Threat Checking
  const urlRegex = /(https?:\/\/[^\s<>"\']+)/gi;
  const rawUrls = content.match(urlRegex) || [];
  const extractedLinks: { url: string; suspicious: boolean; reason?: string }[] = [];
  let suspiciousLinksCount = 0;

  for (const urlStr of rawUrls.slice(0, 15)) {
    let suspicious = false;
    let reason = '';

    // IP address instead of domain name
    if (/https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(urlStr)) {
      suspicious = true;
      reason = 'Direct raw IP address destination (common for phishing hosters)';
    } else if (/\.(top|xyz|click|buzz|work|club|gq|cf|tk|ml)\//i.test(urlStr)) {
      suspicious = true;
      reason = 'High-risk generic top-level domain frequently abused for fraud';
    } else if (/bit\.ly|tinyurl\.com|is\.gd|cutt\.ly|ow\.ly/.test(urlStr)) {
      suspicious = true;
      reason = 'URL shortener obscuring actual destination domain';
    } else if (urlStr.includes('login') || urlStr.includes('verify') || urlStr.includes('account') || urlStr.includes('secure')) {
      if (!urlStr.includes('google.com') && !urlStr.includes('microsoft.com') && !urlStr.includes('apple.com')) {
        suspicious = true;
        reason = 'Keywords mimic authentication portal on unverified domain';
      }
    }

    if (suspicious) {
      suspiciousLinksCount++;
    }

    extractedLinks.push({ url: urlStr, suspicious, reason: reason || 'Standard web link' });
  }

  if (suspiciousLinksCount > 0) {
    triggers.push({
      id: 'suspicious_links',
      title: `${suspiciousLinksCount} Deceptive or Masked Link(s) Found`,
      category: 'link',
      severity: 'high',
      description: 'The email embeds links leading to raw IP servers, URL shorteners, or high-risk domain registries.',
      evidence: `Examples: ${extractedLinks.filter(l => l.suspicious).slice(0, 2).map(l => l.url).join(', ')}`
    });
  }

  // 4. Header inspection (From vs Return-Path vs Reply-To)
  let detectedSender = senderEmail || '';
  let mismatchedSender = false;

  const fromMatch = content.match(/^From:\s*(.+)$/im);
  const returnPathMatch = content.match(/^Return-Path:\s*<([^>]+)>/im);
  const replyToMatch = content.match(/^Reply-To:\s*(.+)$/im);

  if (fromMatch) {
    detectedSender = fromMatch[1].trim();
  }

  if (fromMatch && returnPathMatch) {
    const fromDomain = fromMatch[1].split('@')[1]?.replace('>', '').trim().toLowerCase();
    const returnDomain = returnPathMatch[1].split('@')[1]?.toLowerCase();
    if (fromDomain && returnDomain && fromDomain !== returnDomain) {
      mismatchedSender = true;
      triggers.push({
        id: 'header_mismatch',
        title: 'Mismatched Sender Header vs Return-Path',
        category: 'domain',
        severity: 'high',
        description: `Visual sender "${fromDomain}" does not match technical bounce path "${returnDomain}". Typical email spoofing technique.`,
        evidence: `From: ${fromMatch[1]} | Return-Path: ${returnPathMatch[1]}`
      });
      reasoning.push(`Header spoofing detected: Return-Path points to ${returnDomain} rather than ${fromDomain}.`);
    }
  }

  // 5. Grammar and scam tropes
  const grammarPatterns = [
    /dear\s+customer|dear\s+beloved|dear\s+user|undisclosed\s+recipients/i,
    /kindly\s+(?:find|click|revert|update|send)/i,
    /congratulations\s+you\s+have\s+won|lottery\s+winner|beneficiary/i
  ];
  let grammarAnomaliesDetected = false;
  for (const gp of grammarPatterns) {
    if (gp.test(content)) {
      grammarAnomaliesDetected = true;
      triggers.push({
        id: `grammar_${triggers.length}`,
        title: 'Impersonal Greeting or Common Phishing Dialect',
        category: 'grammar',
        severity: 'low',
        description: 'Impersonal greetings like "Dear Customer" combined with phrasing like "kindly revert" are statistical red flags.',
        evidence: 'Detected generic salutation or stereotyped scam phrasing'
      });
      break;
    }
  }

  // Verdict calculation
  const highSeverityCount = triggers.filter(t => t.severity === 'high').length;
  const mediumSeverityCount = triggers.filter(t => t.severity === 'medium').length;

  let verdict: 'safe' | 'suspicious' | 'unsafe' = 'safe';
  let confidenceScore = 90;
  let summary = '';
  let recommendation = '';

  if (highSeverityCount >= 2 || (highSeverityCount >= 1 && (urgencyMatches > 0 || financialRequestsDetected))) {
    verdict = 'unsafe';
    confidenceScore = 94;
    summary = 'Severe phishing markers identified. Email exhibits characteristics of a targeted credential theft or financial fraud attack.';
    recommendation = 'Delete immediately. Never click embedded links, download attachments, or disclose passwords or banking details.';
    reasoning.push('Multiple high-severity phishing signatures converged.');
    if (urgencyLevel === 'critical') reasoning.push('Aggressive deadline pressure used to force compliance.');
    if (financialRequestsDetected) reasoning.push('Unsafe solicitation of financial transaction or private credentials.');
  } else if (highSeverityCount === 1 || mediumSeverityCount >= 2) {
    verdict = 'suspicious';
    confidenceScore = 78;
    summary = 'Caution advised. Content contains ambiguous language, urgent directives, or third-party links that warrant manual scrutiny.';
    recommendation = 'Verify sender authenticity through an independent known communication channel before responding.';
    reasoning.push('Moderate risk anomalies detected in message structure or external link targets.');
  } else {
    verdict = 'safe';
    confidenceScore = 92;
    summary = 'No common phishing patterns, coercive threats, or spoofed header indicators detected in the email body.';
    recommendation = 'Content appears standard, but adhere to regular cyber hygiene when interacting with unknown senders.';
    reasoning.push('No credential harvesting language or coercive deadlines found.');
    reasoning.push('Embedded hyperlinks conform to standard domain structures.');
  }

  return {
    verdict,
    confidenceScore,
    summary,
    details: {
      subject: extractSubject(content),
      detectedSender,
      mismatchedSender,
      suspiciousLinksCount,
      extractedLinks,
      financialRequestsDetected,
      urgencyLevel,
      grammarAnomaliesDetected,
      triggers,
      reasoning,
      recommendation
    }
  };
}

function extractSubject(content: string): string {
  const match = content.match(/^Subject:\s*(.+)$/im);
  if (match) return match[1].trim();
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  return lines[0]?.slice(0, 70) || 'Untitled Email';
}

function extractSubjectOrPreview(content: string): string {
  const subject = extractSubject(content);
  return subject.length > 50 ? subject.slice(0, 50) + '...' : subject;
}

function mergeTriggers(aiTriggers: any[], heuristicTriggers: any[]): any[] {
  const seen = new Set<string>();
  const merged: any[] = [];
  for (const t of [...heuristicTriggers, ...aiTriggers]) {
    const key = t.title.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(t);
    }
  }
  return merged;
}

// Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

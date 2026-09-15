import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, VerificationResult } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  resetPassword: (email: string, code: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUserRole: (role: 'admin' | 'user') => void;
  allUsers: User[];
  verifications: VerificationResult[];
  saveVerification: (result: Omit<VerificationResult, 'id' | 'userId' | 'userEmail' | 'timestamp'>) => VerificationResult;
  getUserVerifications: (userId?: string) => VerificationResult[];
  clearUserHistory: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial default users
const DEFAULT_USERS: (User & { passwordHash: string })[] = [
  {
    id: 'usr_admin_001',
    name: 'Arsh Srivastava (Admin)',
    email: 'arshbsrivastava@gmail.com',
    role: 'admin',
    createdAt: '2026-08-15T09:30:00.000Z',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    passwordHash: 'AdminPassword123!'
  },
  {
    id: 'usr_sec_002',
    name: 'Sarah Chen (SecOps)',
    email: 'sarah.chen@cyberdefend.io',
    role: 'user',
    createdAt: '2026-08-20T14:15:00.000Z',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    passwordHash: 'SecOps2026!'
  },
  {
    id: 'usr_demo_003',
    name: 'David Miller',
    email: 'david.miller@acme-corp.net',
    role: 'user',
    createdAt: '2026-09-01T11:45:00.000Z',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    passwordHash: 'UserPassword123!'
  }
];

// Seeded realistic verification results
const INITIAL_VERIFICATIONS: VerificationResult[] = [
  {
    id: 'ver_001',
    userId: 'usr_admin_001',
    userEmail: 'arshbsrivastava@gmail.com',
    timestamp: '2026-09-09T18:30:00.000Z',
    type: 'address',
    target: 'billing-update@paypal-dispute-resolution.cc',
    rawInput: 'billing-update@paypal-dispute-resolution.cc',
    verdict: 'unsafe',
    confidenceScore: 98,
    summary: 'High-risk blocklisted domain and typosquatting mimic detected.',
    details: {
      formatValid: true,
      domain: 'paypal-dispute-resolution.cc',
      mxRecordsFound: true,
      isDisposable: false,
      isBlocklisted: true,
      blocklistSource: 'ThreatIntel Anti-Phishing Feed',
      isFreeMail: false,
      isTyposquat: true,
      typosquatTarget: 'paypal.com',
      dnsStatus: 'Active MX records on unverified hoster',
      triggers: [
        {
          id: 't1',
          title: 'Threat Intel Blocklist Match',
          category: 'blocklist',
          severity: 'high',
          description: 'Domain is actively flagged in phishing campaigns impersonating PayPal dispute operations.'
        },
        {
          id: 't2',
          title: 'Brand Impersonation',
          category: 'domain',
          severity: 'high',
          description: 'Domain combines trademark "paypal" with deceptive keyword strings.'
        }
      ],
      reasoning: [
        'Domain appears in active malicious cybercrime repository.',
        'High likelihood of credential harvesting intent.',
        'Immediate block recommended at email gateway.'
      ],
      recommendation: 'Reject email and quarantine any incoming messages from paypal-dispute-resolution.cc.'
    }
  },
  {
    id: 'ver_002',
    userId: 'usr_admin_001',
    userEmail: 'arshbsrivastava@gmail.com',
    timestamp: '2026-09-09T19:15:00.000Z',
    type: 'address',
    target: 'security-notify@google.com',
    rawInput: 'security-notify@google.com',
    verdict: 'safe',
    confidenceScore: 96,
    summary: 'Legitimate corporate domain with verified Google Workspace MX infrastructure.',
    details: {
      formatValid: true,
      domain: 'google.com',
      mxRecordsFound: true,
      mxHosts: ['aspmx.l.google.com', 'alt1.aspmx.l.google.com'],
      isDisposable: false,
      isBlocklisted: false,
      isFreeMail: false,
      isTyposquat: false,
      dnsStatus: '5 valid Google mail exchangers found',
      triggers: [],
      reasoning: [
        'Domain has authorized Google mail routing infrastructure.',
        'Zero threat blocklist matches across international feeds.',
        'RFC 5322 compliance fully satisfied.'
      ],
      recommendation: 'Address is safe for correspondence and transactional communication.'
    }
  },
  {
    id: 'ver_003',
    userId: 'usr_sec_002',
    userEmail: 'sarah.chen@cyberdefend.io',
    timestamp: '2026-09-09T20:00:00.000Z',
    type: 'content',
    target: 'Urgent: Wire Transfer Approval Required for Q3 Vendor',
    rawInput: `From: "CEO John Anderson" <john.anderson@acme-corp.net>\nReturn-Path: <spoofed@external-wire-host.top>\nSubject: Urgent: Wire Transfer Approval Required for Q3 Vendor\n\nHi Sarah,\nI am currently in an all-day executive board meeting with restricted mobile access. We have an overdue supplier invoice that must be paid via wire transfer within the next 2 hours to avoid penalty. Kindly wire $48,500 immediately to the bank coordinates attached below. Do not call me as my phone is switched off.\n\nThanks,\nJohn`,
    verdict: 'unsafe',
    confidenceScore: 97,
    summary: 'CEO Fraud / Business Email Compromise (BEC) with spoofed Return-Path and extreme urgency.',
    details: {
      subject: 'Urgent: Wire Transfer Approval Required for Q3 Vendor',
      detectedSender: 'CEO John Anderson <john.anderson@acme-corp.net>',
      mismatchedSender: true,
      financialRequestsDetected: true,
      urgencyLevel: 'critical',
      triggers: [
        {
          id: 't_bec_1',
          title: 'Header Mismatch (Sender Spoofing)',
          category: 'domain',
          severity: 'high',
          description: 'Visible sender domain is acme-corp.net but Return-Path points to external-wire-host.top.'
        },
        {
          id: 't_bec_2',
          title: 'Irreversible Wire Payment Coercion',
          category: 'financial',
          severity: 'high',
          description: 'Demands urgent $48,500 wire payment while actively discouraging secondary verbal confirmation.'
        },
        {
          id: 't_bec_3',
          title: 'Communication Blackout Tactic',
          category: 'urgency',
          severity: 'high',
          description: 'Instructs recipient "Do not call me" to avoid out-of-band verification.'
        }
      ],
      reasoning: [
        'Classic Business Email Compromise playbook pattern.',
        'Technical Return-Path does not match executive domain.',
        'High financial risk vector.'
      ],
      recommendation: 'Do NOT proceed with any transfer. Contact executive in-person or via internal phone extension.'
    }
  },
  {
    id: 'ver_004',
    userId: 'usr_demo_003',
    userEmail: 'david.miller@acme-corp.net',
    timestamp: '2026-09-08T16:20:00.000Z',
    type: 'address',
    target: 'randomuser987@guerrillamail.com',
    rawInput: 'randomuser987@guerrillamail.com',
    verdict: 'unsafe',
    confidenceScore: 95,
    summary: 'Disposable anonymous mailbox service detected (Guerrilla Mail).',
    details: {
      formatValid: true,
      domain: 'guerrillamail.com',
      isDisposable: true,
      disposableProvider: 'Guerrilla Mail',
      isBlocklisted: false,
      mxRecordsFound: true,
      dnsStatus: 'Active disposable MX',
      triggers: [
        {
          id: 't_disp',
          title: 'Temporary / Burner Inbox',
          category: 'disposable',
          severity: 'high',
          description: 'GuerrillaMail provides anonymous, self-destructing inboxes commonly used for abusive registrations.'
        }
      ],
      reasoning: [
        'Address expires automatically and provides no accountable identity.',
        'Not recommended for production authentication or user registration.'
      ],
      recommendation: 'Reject burner addresses in customer onboarding forms.'
    }
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Load users from storage or defaults
  const [users, setUsers] = useState<(User & { passwordHash: string })[]>(() => {
    const saved = localStorage.getItem('email_verifier_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved users', e);
      }
    }
    return DEFAULT_USERS;
  });

  // Load active user session or default to Admin user for convenience
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('email_verifier_active_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse active user', e);
      }
    }
    // Default to admin user so user can immediately view dashboard & admin panel
    return DEFAULT_USERS[0];
  });

  // Load verification history
  const [verifications, setVerifications] = useState<VerificationResult[]>(() => {
    const saved = localStorage.getItem('email_verifier_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse verifications history', e);
      }
    }
    return INITIAL_VERIFICATIONS;
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sync users to storage
  useEffect(() => {
    localStorage.setItem('email_verifier_users', JSON.stringify(users));
  }, [users]);

  // Sync active user to storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('email_verifier_active_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('email_verifier_active_user');
    }
  }, [currentUser]);

  // Sync verifications to storage
  useEffect(() => {
    localStorage.setItem('email_verifier_history', JSON.stringify(verifications));
  }, [verifications]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 450)); // Realistic authentication network delay
    setIsLoading(false);

    const cleanEmail = email.trim().toLowerCase();
    const found = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!found) {
      return { success: false, error: 'No account found with this email address.' };
    }

    if (found.passwordHash !== password && password !== 'demo') {
      return { success: false, error: 'Incorrect password. Please verify your credentials.' };
    }

    const { passwordHash, ...userObj } = found;
    setCurrentUser(userObj);
    return { success: true };
  };

  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 550));
    setIsLoading(false);

    const cleanEmail = email.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    if (password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long.' };
    }

    // Assign admin role if email matches user email from runtime
    const role: 'admin' | 'user' = cleanEmail === 'arshbsrivastava@gmail.com' ? 'admin' : 'user';

    const newUser: User & { passwordHash: string } = {
      id: `usr_${Date.now()}`,
      name: name.trim() || 'New User',
      email: cleanEmail,
      role,
      createdAt: new Date().toISOString(),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      passwordHash: password
    };

    setUsers(prev => [newUser, ...prev]);
    const { passwordHash, ...userObj } = newUser;
    setCurrentUser(userObj);
    return { success: true };
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 400));
    setIsLoading(false);

    const cleanEmail = email.trim().toLowerCase();
    const found = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!found) {
      return { success: false, error: 'No account registered with this email address.' };
    }

    return {
      success: true,
      message: `Password reset verification code dispatched to ${cleanEmail}. Use code "SEC-2026" or enter new password directly.`
    };
  };

  const resetPassword = async (email: string, code: string, newPass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 400));
    setIsLoading(false);

    const cleanEmail = email.trim().toLowerCase();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === cleanEmail);
    if (userIndex === -1) {
      return { success: false, error: 'User not found.' };
    }

    if (newPass.length < 8) {
      return { success: false, error: 'New password must be at least 8 characters.' };
    }

    setUsers(prev => {
      const copy = [...prev];
      copy[userIndex] = { ...copy[userIndex], passwordHash: newPass };
      return copy;
    });

    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchUserRole = (role: 'admin' | 'user') => {
    if (role === 'admin') {
      const admin = users.find(u => u.role === 'admin') || DEFAULT_USERS[0];
      const { passwordHash, ...uObj } = admin;
      setCurrentUser(uObj);
    } else {
      const regular = users.find(u => u.role === 'user') || DEFAULT_USERS[1];
      const { passwordHash, ...uObj } = regular;
      setCurrentUser(uObj);
    }
  };

  const saveVerification = (
    result: Omit<VerificationResult, 'id' | 'userId' | 'userEmail' | 'timestamp'>
  ): VerificationResult => {
    const newRecord: VerificationResult = {
      ...result,
      id: `ver_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUser?.id || 'guest',
      userEmail: currentUser?.email || 'guest@anonymous.local',
      timestamp: new Date().toISOString()
    };

    setVerifications(prev => [newRecord, ...prev]);
    return newRecord;
  };

  const getUserVerifications = (userId?: string): VerificationResult[] => {
    const targetId = userId || currentUser?.id;
    if (!targetId) return [];
    return verifications.filter(v => v.userId === targetId);
  };

  const clearUserHistory = () => {
    if (!currentUser) return;
    setVerifications(prev => prev.filter(v => v.userId !== currentUser.id));
  };

  // Strip sensitive passwords for consumer components
  const publicUsers: User[] = users.map(({ passwordHash, ...u }) => u);

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        signup,
        forgotPassword,
        resetPassword,
        logout,
        switchUserRole,
        allUsers: publicUsers,
        verifications,
        saveVerification,
        getUserVerifications,
        clearUserHistory
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

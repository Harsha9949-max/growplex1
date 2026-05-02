import { Submission } from '../types';

export const SECURITY_CONFIG = {
  SUBMISSION_COOLDOWN_MS: 30000, // 30 seconds
  DAILY_TASK_LIMIT: 50,
  DUPLICATE_THRESHOLD: 0.95, // Fuzzy match threshold
};

/**
 * Validates if the user is attempting submissions too rapidly.
 */
export const checkSubmissionThrottle = (lastSubmissionTime: number): boolean => {
  const now = Date.now();
  return (now - lastSubmissionTime) < SECURITY_CONFIG.SUBMISSION_COOLDOWN_MS;
};

/**
 * Generates a simple fingerprint for link/text proof to detect duplicates.
 */
export const generateFingerprint = (content: string): string => {
  return content.toLowerCase().replace(/\s+/g, '').slice(0, 100);
};

/**
 * Calculates a fraud risk score (0-100) for a submission.
 */
export const calculateRiskScore = (submission: Submission, userStats: { totalRejections: number, accountAgeDays: number }): number => {
  let score = 0;
  
  // High rejection history
  if (userStats.totalRejections > 5) score += 40;
  
  // New account (less than 24h old) with high reward
  if (userStats.accountAgeDays < 1 && submission.amount > 100) score += 30;
  
  // Very short proof text
  if (submission.proofType === 'text' && (submission.proofText?.length || 0) < 10) score += 20;

  return Math.min(score, 100);
};

/**
 * Mock encryption for onboarding data (KYC).
 * In production, this would use Web Crypto API (AES-GCM).
 */
export const encryptData = async (data: string, secret: string): Promise<string> => {
  // Simple Base64 + Secret Salt for the preview
  const salted = `${secret}:${data}`;
  return btoa(salted);
};

/**
 * Generates a stable device fingerprint for fraud prevention.
 */
export const generateDeviceFingerprint = async (): Promise<string> => {
  const signal = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    new Date().getTimezoneOffset()
  ].join('|');
  
  // Create a simple hash-like string
  let hash = 0;
  for (let i = 0; i < signal.length; i++) {
    hash = ((hash << 5) - hash) + signal.charCodeAt(i);
    hash |= 0;
  }
  return `WP-${Math.abs(hash).toString(16).toUpperCase()}`;
};

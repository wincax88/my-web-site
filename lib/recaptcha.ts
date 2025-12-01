/**
 * Google reCAPTCHA v3 verification utilities
 *
 * Server-side verification of reCAPTCHA tokens
 */

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

// Minimum score threshold (0.0 to 1.0, higher is more likely human)
const MIN_SCORE_THRESHOLD = 0.5;

interface RecaptchaVerifyResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

export interface RecaptchaVerifyResult {
  success: boolean;
  score?: number;
  error?: string;
}

/**
 * Check if reCAPTCHA is configured
 */
export function isRecaptchaConfigured(): boolean {
  return !!RECAPTCHA_SECRET_KEY && RECAPTCHA_SECRET_KEY.length > 0;
}

/**
 * Verify a reCAPTCHA token with Google's API
 *
 * @param token - The reCAPTCHA token from the client
 * @param expectedAction - The expected action name (optional)
 * @returns Verification result
 */
export async function verifyRecaptchaToken(
  token: string,
  expectedAction?: string
): Promise<RecaptchaVerifyResult> {
  // If reCAPTCHA is not configured, skip verification (development mode)
  if (!isRecaptchaConfigured()) {
    console.warn(
      '[reCAPTCHA] Secret key not configured, skipping verification'
    );
    return { success: true, score: 1.0 };
  }

  if (!token) {
    return { success: false, error: '缺少验证码令牌' };
  }

  try {
    const response = await fetch(RECAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: RECAPTCHA_SECRET_KEY!,
        response: token,
      }),
    });

    if (!response.ok) {
      console.error(
        '[reCAPTCHA] Verification request failed:',
        response.status
      );
      return { success: false, error: '验证服务不可用' };
    }

    const data: RecaptchaVerifyResponse = await response.json();

    // Check if verification was successful
    if (!data.success) {
      console.error('[reCAPTCHA] Verification failed:', data['error-codes']);
      return {
        success: false,
        error: '验证码验证失败，请刷新页面重试',
      };
    }

    // Check action matches (if specified)
    if (expectedAction && data.action !== expectedAction) {
      console.error(
        `[reCAPTCHA] Action mismatch: expected ${expectedAction}, got ${data.action}`
      );
      return {
        success: false,
        error: '验证码操作不匹配',
      };
    }

    // Check score threshold
    const score = data.score ?? 0;
    if (score < MIN_SCORE_THRESHOLD) {
      console.warn(`[reCAPTCHA] Low score: ${score}`);
      return {
        success: false,
        score,
        error: '验证未通过，请稍后重试',
      };
    }

    return {
      success: true,
      score,
    };
  } catch (error) {
    console.error('[reCAPTCHA] Verification error:', error);
    return { success: false, error: '验证服务错误' };
  }
}

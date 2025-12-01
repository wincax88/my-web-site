'use client';

import { SessionProvider } from 'next-auth/react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export function Providers({ children }: ProvidersProps) {
  // Wrap with reCAPTCHA provider only if site key is configured
  const content = <SessionProvider>{children}</SessionProvider>;

  if (RECAPTCHA_SITE_KEY) {
    return (
      <GoogleReCaptchaProvider
        reCaptchaKey={RECAPTCHA_SITE_KEY}
        scriptProps={{
          async: true,
          defer: true,
          appendTo: 'head',
        }}
        language="zh-CN"
      >
        {content}
      </GoogleReCaptchaProvider>
    );
  }

  return content;
}

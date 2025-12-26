'use client'; // <-- THIS IS CRITICAL

import { I18nextProvider } from 'react-i18next';
import i18n from '../app/i18n/i18n-client'; // Import the client-only config above
import React from 'react';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // We use the client i18n instance here within a client component
  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}
'use client';

import React, { ReactNode } from 'react';
import { OpenLinkProvider as BaseOpenLinkProvider } from '@openlink/react';
import { OpenLinkConfig } from '@openlink/core';

interface OpenLinkProviderProps {
  children: ReactNode;
  network?: 'mainnet-beta' | 'testnet' | 'devnet';
  appName?: string;
  endpoint?: string;
  autoConnect?: boolean;
  config?: OpenLinkConfig;
}

/**
 * Client-side provider for Next.js App Router
 * Use this in your root layout or client components
 */
export function OpenLinkProvider(props: OpenLinkProviderProps) {
  return <BaseOpenLinkProvider {...props} />;
}


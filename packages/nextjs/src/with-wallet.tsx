import React, { ComponentType } from 'react';
import { OpenLinkProvider } from './client-provider';
import { OpenLinkConfig } from '@openlink/core';

/**
 * Higher-order component to wrap pages with OpenLink provider
 * Useful for Pages Router
 */
export function withWallet<P extends object>(
  Component: ComponentType<P>,
  config?: OpenLinkConfig
) {
  const WrappedComponent = (props: P) => {
    return (
      <OpenLinkProvider {...config}>
        <Component {...props} />
      </OpenLinkProvider>
    );
  };

  WrappedComponent.displayName = `withWallet(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}


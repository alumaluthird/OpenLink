import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { WalletManager } from '@openlink/core';
import { OpenLinkConfig } from '@openlink/core';
import { PublicKey } from '@solana/web3.js';

interface OpenLinkContextValue {
  wallet: WalletManager | null;
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
  walletName: string | null;
  connect: (walletName?: string) => Promise<void>;
  disconnect: () => Promise<void>;
  signMessage: (message?: string) => Promise<any>;
}

const OpenLinkContext = createContext<OpenLinkContextValue | null>(null);

interface OpenLinkProviderProps {
  children: ReactNode;
  network?: 'mainnet-beta' | 'testnet' | 'devnet';
  appName?: string;
  endpoint?: string;
  autoConnect?: boolean;
  config?: OpenLinkConfig;
}

export function OpenLinkProvider({
  children,
  network,
  appName,
  endpoint,
  autoConnect,
  config
}: OpenLinkProviderProps) {
  const [wallet] = useState(() => new WalletManager(config || { network, appName, endpoint, autoConnect }));
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [walletName, setWalletName] = useState<string | null>(null);

  useEffect(() => {
    // Setup event listeners
    const handleConnect = (data: any) => {
      setConnected(true);
      setPublicKey(wallet.publicKey);
      setWalletName(wallet.walletName);
      setConnecting(false);
    };

    const handleDisconnect = () => {
      setConnected(false);
      setPublicKey(null);
      setWalletName(null);
      setDisconnecting(false);
    };

    const handleError = (error: any) => {
      console.error('Wallet error:', error);
      setConnecting(false);
      setDisconnecting(false);
    };

    wallet.on('connect', handleConnect);
    wallet.on('disconnect', handleDisconnect);
    wallet.on('error', handleError);

    // Auto connect if enabled
    if (wallet.getConfig().autoConnect) {
      connect();
    }

    return () => {
      wallet.off('connect', handleConnect);
      wallet.off('disconnect', handleDisconnect);
      wallet.off('error', handleError);
    };
  }, [wallet]);

  const connect = useCallback(async (walletName?: string) => {
    try {
      setConnecting(true);
      await wallet.connect(walletName);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setConnecting(false);
      throw error;
    }
  }, [wallet]);

  const disconnect = useCallback(async () => {
    try {
      setDisconnecting(true);
      await wallet.disconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      setDisconnecting(false);
      throw error;
    }
  }, [wallet]);

  const signMessage = useCallback(async (message?: string) => {
    return await wallet.signMessage(message);
  }, [wallet]);

  const value: OpenLinkContextValue = {
    wallet,
    publicKey,
    connected,
    connecting,
    disconnecting,
    walletName,
    connect,
    disconnect,
    signMessage
  };

  return (
    <OpenLinkContext.Provider value={value}>
      {children}
    </OpenLinkContext.Provider>
  );
}

export function useOpenLink(): OpenLinkContextValue {
  const context = useContext(OpenLinkContext);
  if (!context) {
    throw new Error('useOpenLink must be used within OpenLinkProvider');
  }
  return context;
}

// Alias for convenience
export const useWallet = useOpenLink;


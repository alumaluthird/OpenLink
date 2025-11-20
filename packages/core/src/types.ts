import { PublicKey } from '@solana/web3.js';

export type Network = 'mainnet-beta' | 'testnet' | 'devnet';

export interface OpenLinkConfig {
  network?: Network;
  appName?: string;
  endpoint?: string;
  autoConnect?: boolean;
}

export interface WalletAdapter {
  name: string;
  url: string;
  icon: string;
  publicKey: PublicKey | null;
  connected: boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  signMessage(message: Uint8Array): Promise<Uint8Array>;
}

export interface SignatureData {
  publicKey: string;
  signature: string;
  message: string;
  timestamp: number;
}

export interface VerificationResult {
  valid: boolean;
  publicKey?: string;
  error?: string;
}

export interface UserLinkData {
  publicKey: string;
  userId?: string;
  email?: string;
  metadata?: Record<string, any>;
}

export type WalletEvent = 
  | 'connect'
  | 'disconnect'
  | 'error'
  | 'accountChanged';

export type EventCallback = (data?: any) => void;

export interface EventEmitter {
  on(event: WalletEvent, callback: EventCallback): void;
  off(event: WalletEvent, callback: EventCallback): void;
  emit(event: WalletEvent, data?: any): void;
}


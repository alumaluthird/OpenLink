import { WalletManager, OpenLinkConfig, SignatureData } from '@openlink/core';
import { PublicKey } from '@solana/web3.js';

export class OpenLinkVanilla {
  private walletManager: WalletManager;
  public connecting: boolean = false;

  constructor(config?: OpenLinkConfig) {
    this.walletManager = new WalletManager(config);
    
    // Forward events
    this.walletManager.on('connect', (data) => {
      this.connecting = false;
      this.emit('connect', data);
    });

    this.walletManager.on('disconnect', () => {
      this.connecting = false;
      this.emit('disconnect');
    });

    this.walletManager.on('error', (error) => {
      this.connecting = false;
      this.emit('error', error);
    });
  }

  /**
   * Connect to wallet
   */
  async connect(walletName?: string): Promise<PublicKey | null> {
    this.connecting = true;
    this.emit('connecting');
    
    try {
      const publicKey = await this.walletManager.connect(walletName);
      return publicKey;
    } catch (error) {
      this.connecting = false;
      throw error;
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnect(): Promise<void> {
    await this.walletManager.disconnect();
  }

  /**
   * Sign a message
   */
  async signMessage(message?: string): Promise<SignatureData> {
    return await this.walletManager.signMessage(message);
  }

  /**
   * Get available wallets
   */
  getAvailableWallets() {
    return this.walletManager.getAvailableWallets();
  }

  /**
   * Get public key
   */
  get publicKey(): PublicKey | null {
    return this.walletManager.publicKey;
  }

  /**
   * Check if connected
   */
  get connected(): boolean {
    return this.walletManager.connected;
  }

  /**
   * Get wallet name
   */
  get walletName(): string | null {
    return this.walletManager.walletName;
  }

  // Event system
  private events: Map<string, Set<Function>> = new Map();

  on(event: string, callback: Function): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(callback);
  }

  off(event: string, callback: Function): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  private emit(event: string, data?: any): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}


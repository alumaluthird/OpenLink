import { PublicKey, Connection } from '@solana/web3.js';
import { 
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
  SolletWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { WalletAdapter as BaseWalletAdapter } from '@solana/wallet-adapter-base';
import { OpenLinkConfig, SignatureData, WalletEvent } from './types';
import { OpenLinkEventEmitter } from './event-emitter';
import { generateSignatureMessage, encodeMessage, encodeSignature, getEndpoint } from './utils';

export class WalletManager extends OpenLinkEventEmitter {
  private config: Required<OpenLinkConfig>;
  private connection: Connection;
  private adapter: BaseWalletAdapter | null = null;
  private availableAdapters: BaseWalletAdapter[] = [];

  constructor(config: OpenLinkConfig = {}) {
    super();
    
    this.config = {
      network: config.network || 'mainnet-beta',
      appName: config.appName || 'OpenLink App',
      endpoint: config.endpoint || getEndpoint(config.network || 'mainnet-beta'),
      autoConnect: config.autoConnect ?? false
    };

    this.connection = new Connection(this.config.endpoint, 'confirmed');
    this.initializeAdapters();
  }

  private initializeAdapters(): void {
    this.availableAdapters = [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
      new SolletWalletAdapter()
    ];
  }

  /**
   * Get list of available wallet adapters
   */
  getAvailableWallets(): Array<{ name: string; icon: string; url: string; installed: boolean }> {
    return this.availableAdapters.map(adapter => ({
      name: adapter.name,
      icon: adapter.icon,
      url: adapter.url,
      installed: adapter.readyState === 'Installed'
    }));
  }

  /**
   * Connect to a specific wallet
   */
  async connect(walletName?: string): Promise<PublicKey | null> {
    try {
      // If wallet name is specified, find that adapter
      if (walletName) {
        const targetAdapter = this.availableAdapters.find(
          adapter => adapter.name.toLowerCase() === walletName.toLowerCase()
        );
        
        if (!targetAdapter) {
          throw new Error(`Wallet ${walletName} not found`);
        }
        
        this.adapter = targetAdapter;
      } else {
        // Use first available adapter (usually Phantom)
        this.adapter = this.availableAdapters[0];
      }

      if (!this.adapter) {
        throw new Error('No wallet adapter available');
      }

      // Setup event listeners
      this.adapter.on('connect', () => {
        this.emit('connect', { publicKey: this.adapter?.publicKey?.toString() });
      });

      this.adapter.on('disconnect', () => {
        this.emit('disconnect');
      });

      this.adapter.on('error', (error) => {
        this.emit('error', error);
      });

      // Connect the wallet
      await this.adapter.connect();

      return this.adapter.publicKey;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Disconnect the current wallet
   */
  async disconnect(): Promise<void> {
    if (this.adapter) {
      await this.adapter.disconnect();
      this.adapter = null;
    }
  }

  /**
   * Sign a message with the connected wallet
   */
  async signMessage(message?: string): Promise<SignatureData> {
    if (!this.adapter || !this.adapter.publicKey) {
      throw new Error('Wallet not connected');
    }

    const messageToSign = message || generateSignatureMessage(this.config.appName);
    const encodedMessage = encodeMessage(messageToSign);

    try {
      const signatureBytes = await this.adapter.signMessage!(encodedMessage);
      const signature = encodeSignature(signatureBytes);

      return {
        publicKey: this.adapter.publicKey.toString(),
        signature,
        message: messageToSign,
        timestamp: Date.now()
      };
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Get current public key
   */
  get publicKey(): PublicKey | null {
    return this.adapter?.publicKey || null;
  }

  /**
   * Check if wallet is connected
   */
  get connected(): boolean {
    return this.adapter?.connected || false;
  }

  /**
   * Get current wallet name
   */
  get walletName(): string | null {
    return this.adapter?.name || null;
  }

  /**
   * Get connection
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Get config
   */
  getConfig(): Required<OpenLinkConfig> {
    return this.config;
  }
}


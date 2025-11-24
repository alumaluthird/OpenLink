# @openlink/core

Core SDK for OpenLink - Solana wallet integration and authentication.

## Installation

```bash
npm install @openlink/core
```

## Usage

```typescript
import { OpenLink } from '@openlink/core';

// Initialize
const openlink = new OpenLink({
  network: 'mainnet-beta',
  appName: 'My App'
});

// Connect wallet
await openlink.connect();

// Sign message
const { signature, message, publicKey } = await openlink.signMessage();

// Listen to events
openlink.on('connect', (data) => {
  console.log('Wallet connected:', data.publicKey);
});

openlink.on('disconnect', () => {
  console.log('Wallet disconnected');
});

// Disconnect
await openlink.disconnect();
```

## API Reference

### `OpenLink`

Main class for wallet management.

#### Constructor

```typescript
new OpenLink(config?: OpenLinkConfig)
```

**Config Options:**
- `network`: `'mainnet-beta' | 'testnet' | 'devnet'` (default: `'mainnet-beta'`)
- `appName`: Application name (default: `'OpenLink App'`)
- `endpoint`: Custom RPC endpoint (optional)
- `autoConnect`: Auto-connect on initialization (default: `false`)

#### Methods

**`connect(walletName?: string): Promise<PublicKey | null>`**

Connect to a Solana wallet. If `walletName` is not provided, connects to the first available wallet.

**`disconnect(): Promise<void>`**

Disconnect the current wallet.

**`signMessage(message?: string): Promise<SignatureData>`**

Sign a message with the connected wallet. Returns signature data including public key, signature, and message.

**`getAvailableWallets(): Array<WalletInfo>`**

Get list of available wallet adapters with installation status.

#### Properties

**`publicKey: PublicKey | null`**

Current connected wallet's public key.

**`connected: boolean`**

Whether a wallet is currently connected.

**`walletName: string | null`**

Name of the currently connected wallet.

#### Events

**`connect`**

Emitted when wallet connects successfully.

**`disconnect`**

Emitted when wallet disconnects.

**`error`**

Emitted when an error occurs.

**`accountChanged`**

Emitted when the connected account changes.

## Utility Functions

### `verifySignature(message: string, signature: string, publicKey: string): boolean`

Verify a signed message.

```typescript
import { verifySignature } from '@openlink/core';

const isValid = verifySignature(message, signature, publicKey);
```

### `generateSignatureMessage(appName: string, nonce?: string): string`

Generate a standard message for signing.

### `isValidPublicKey(publicKey: string): boolean`

Validate a Solana public key.

### `truncatePublicKey(publicKey: string, chars?: number): string`

Truncate a public key for display.

## License

MIT


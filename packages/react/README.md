# @openlink/react

React hooks and components for OpenLink - seamlessly integrate Solana wallet authentication into your React applications.

## Installation

```bash
npm install @openlink/react
```

## Quick Start

### 1. Wrap Your App with Provider

```tsx
import { OpenLinkProvider } from '@openlink/react';

function App() {
  return (
    <OpenLinkProvider
      network="mainnet-beta"
      appName="My App"
    >
      <YourApp />
    </OpenLinkProvider>
  );
}
```

### 2. Use the Wallet Hook

```tsx
import { useWallet } from '@openlink/react';

function WalletStatus() {
  const { connect, disconnect, connected, publicKey } = useWallet();

  return (
    <div>
      {connected ? (
        <>
          <p>Connected: {publicKey?.toString()}</p>
          <button onClick={disconnect}>Disconnect</button>
        </>
      ) : (
        <button onClick={() => connect()}>Connect Wallet</button>
      )}
    </div>
  );
}
```

### 3. Use Pre-built Components

```tsx
import { WalletButton } from '@openlink/react';

function App() {
  return (
    <OpenLinkProvider network="mainnet-beta" appName="My App">
      <WalletButton />
    </OpenLinkProvider>
  );
}
```

## Components

### `<OpenLinkProvider>`

Provider component that wraps your app and provides wallet context.

**Props:**
- `network`: `'mainnet-beta' | 'testnet' | 'devnet'`
- `appName`: Your application name
- `endpoint`: Custom RPC endpoint (optional)
- `autoConnect`: Auto-connect on mount (optional)
- `children`: React children

### `<WalletButton>`

Pre-styled wallet connection button.

**Props:**
- `className`: Custom CSS class
- `style`: Inline styles
- `connectText`: Text when disconnected (default: "Connect Wallet")
- `disconnectText`: Text when connected (default: "Disconnect")
- `connectingText`: Text while connecting (default: "Connecting...")
- `onConnect`: Callback after connection
- `onDisconnect`: Callback after disconnection

### `<WalletModal>`

Modal for selecting wallet provider.

**Props:**
- `isOpen`: Control modal visibility
- `onClose`: Close callback
- `title`: Modal title (default: "Connect Wallet")
- `className`: Custom CSS class
- `style`: Inline styles

**Example:**

```tsx
import { useState } from 'react';
import { WalletModal, useWallet } from '@openlink/react';

function MyComponent() {
  const [modalOpen, setModalOpen] = useState(false);
  const { connected } = useWallet();

  return (
    <>
      <button onClick={() => setModalOpen(true)}>
        Select Wallet
      </button>
      <WalletModal 
        isOpen={modalOpen && !connected}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
```

## Hooks

### `useWallet()`

Main hook for wallet interaction.

**Returns:**
- `wallet`: WalletManager instance
- `publicKey`: Current public key
- `connected`: Connection status
- `connecting`: Connection in progress
- `disconnecting`: Disconnection in progress
- `walletName`: Connected wallet name
- `connect(walletName?)`: Connect function
- `disconnect()`: Disconnect function
- `signMessage(message?)`: Sign message function

### `useSignMessage()`

Hook for signing messages.

**Returns:**
- `signMessage(message?)`: Sign message function
- `signing`: Signing in progress
- `error`: Error object if failed
- `signatureData`: Signature result

**Example:**

```tsx
import { useSignMessage } from '@openlink/react';

function SignMessageComponent() {
  const { signMessage, signing, signatureData } = useSignMessage();

  const handleSign = async () => {
    try {
      const data = await signMessage('Hello Solana!');
      console.log('Signature:', data.signature);
    } catch (error) {
      console.error('Failed to sign:', error);
    }
  };

  return (
    <button onClick={handleSign} disabled={signing}>
      {signing ? 'Signing...' : 'Sign Message'}
    </button>
  );
}
```

### `useWalletBalance()`

Hook for fetching wallet balance.

**Returns:**
- `balance`: Balance in SOL
- `loading`: Loading state
- `error`: Error object if failed
- `refresh()`: Manually refresh balance

**Example:**

```tsx
import { useWalletBalance } from '@openlink/react';

function BalanceDisplay() {
  const { balance, loading, refresh } = useWalletBalance();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <p>Balance: {balance?.toFixed(4)} SOL</p>
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
```

## Authentication Example

Here's a complete example integrating with your backend:

```tsx
import { useWallet, useSignMessage } from '@openlink/react';
import { useState } from 'react';

function AuthComponent() {
  const { connected, publicKey } = useWallet();
  const { signMessage } = useSignMessage();
  const [authenticated, setAuthenticated] = useState(false);

  const handleAuth = async () => {
    if (!connected || !publicKey) return;

    try {
      // Sign authentication message
      const { signature, message } = await signMessage();

      // Send to your backend
      const response = await fetch('/api/auth/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicKey: publicKey.toString(),
          signature,
          message
        })
      });

      const data = await response.json();
      if (data.success) {
        setAuthenticated(true);
      }
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  };

  return (
    <div>
      {connected && !authenticated && (
        <button onClick={handleAuth}>Authenticate</button>
      )}
      {authenticated && <p>Authenticated!</p>}
    </div>
  );
}
```

## TypeScript Support

All components and hooks are fully typed.

```tsx
import { useWallet } from '@openlink/react';
import { PublicKey } from '@solana/web3.js';

function TypedComponent() {
  const { publicKey }: { publicKey: PublicKey | null } = useWallet();
  // ...
}
```

## License

MIT


# API Reference

Complete API documentation for all OpenLink packages.

## @openlink/core

Core SDK for Solana wallet integration.

### `WalletManager`

Main class for wallet management.

#### Constructor

```typescript
constructor(config?: OpenLinkConfig)
```

**Parameters:**
- `config.network`: Network to use (`'mainnet-beta' | 'testnet' | 'devnet'`)
- `config.appName`: Application name for signature messages
- `config.endpoint`: Custom RPC endpoint (optional)
- `config.autoConnect`: Auto-connect on initialization (optional)

#### Methods

##### `connect(walletName?: string): Promise<PublicKey | null>`

Connect to a wallet.

**Parameters:**
- `walletName`: Specific wallet to connect to (optional)

**Returns:** Public key of connected wallet

**Throws:** Error if connection fails

##### `disconnect(): Promise<void>`

Disconnect the current wallet.

##### `signMessage(message?: string): Promise<SignatureData>`

Sign a message with the connected wallet.

**Parameters:**
- `message`: Custom message to sign (optional, generates default if not provided)

**Returns:**
```typescript
{
  publicKey: string;
  signature: string;
  message: string;
  timestamp: number;
}
```

##### `getAvailableWallets(): WalletInfo[]`

Get list of available wallet adapters.

**Returns:**
```typescript
Array<{
  name: string;
  icon: string;
  url: string;
  installed: boolean;
}>
```

#### Properties

##### `publicKey: PublicKey | null`

Current wallet's public key.

##### `connected: boolean`

Connection status.

##### `walletName: string | null`

Name of connected wallet.

#### Events

##### `on(event: WalletEvent, callback: EventCallback): void`

Subscribe to events.

**Events:**
- `'connect'`: Wallet connected
- `'disconnect'`: Wallet disconnected
- `'error'`: Error occurred
- `'accountChanged'`: Account changed

### Utility Functions

#### `verifySignature(message: string, signature: string, publicKey: string): boolean`

Verify a wallet signature.

#### `generateSignatureMessage(appName: string, nonce?: string): string`

Generate a standard signature message.

#### `isValidPublicKey(publicKey: string): boolean`

Validate a Solana public key.

#### `truncatePublicKey(publicKey: string, chars?: number): string`

Truncate public key for display.

#### `isMessageTimestampValid(message: string, maxAgeMs?: number): boolean`

Check if message timestamp is valid.

---

## @openlink/react

React hooks and components.

### `OpenLinkProvider`

Context provider for wallet functionality.

```typescript
<OpenLinkProvider
  network="mainnet-beta"
  appName="My App"
  endpoint="https://..."
  autoConnect={false}
>
  {children}
</OpenLinkProvider>
```

### `useWallet()`

Main wallet hook.

**Returns:**
```typescript
{
  wallet: WalletManager | null;
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
  walletName: string | null;
  connect: (walletName?: string) => Promise<void>;
  disconnect: () => Promise<void>;
  signMessage: (message?: string) => Promise<SignatureData>;
}
```

### `useSignMessage()`

Hook for signing messages.

**Returns:**
```typescript
{
  signMessage: (message?: string) => Promise<SignatureData>;
  signing: boolean;
  error: Error | null;
  signatureData: SignatureData | null;
}
```

### `useWalletBalance()`

Hook for fetching wallet balance.

**Returns:**
```typescript
{
  balance: number | null; // in SOL
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}
```

### `<WalletButton>`

Pre-styled wallet button component.

**Props:**
```typescript
{
  className?: string;
  style?: CSSProperties;
  connectText?: string;
  disconnectText?: string;
  connectingText?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
}
```

### `<WalletModal>`

Wallet selection modal component.

**Props:**
```typescript
{
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
  style?: CSSProperties;
}
```

---

## @openlink/nextjs

Next.js integration (App Router and Pages Router).

### Client Components

All React exports are available:
- `OpenLinkProvider`
- `useWallet`
- `useSignMessage`
- `useWalletBalance`
- `WalletButton`
- `WalletModal`

### Server Utilities

#### `verifyWalletSignature(options): Promise<VerifySignatureResult>`

Verify signature in API routes or Server Actions.

**Options:**
```typescript
{
  publicKey: string;
  signature: string;
  message: string;
  checkTimestamp?: boolean;
  maxAgeMs?: number;
}
```

**Returns:**
```typescript
{
  valid: boolean;
  publicKey?: string;
  error?: string;
}
```

---

## @openlink/vanilla

Vanilla JavaScript for any HTML site.

### `OpenLink`

Main class (same API as `WalletManager` from core).

```javascript
const openlink = new OpenLink({
  network: 'mainnet-beta',
  appName: 'My App'
});
```

### `createWalletButton(openlink, options)`

Create a wallet button.

**Options:**
```typescript
{
  container: string | HTMLElement;
  className?: string;
  style?: Partial<CSSStyleDeclaration>;
  connectText?: string;
  disconnectText?: string;
  connectingText?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
}
```

**Returns:** `HTMLButtonElement`

### `createWalletModal(openlink, options)`

Create a wallet selection modal.

**Options:**
```typescript
{
  className?: string;
  title?: string;
  style?: Partial<CSSStyleDeclaration>;
}
```

**Returns:**
```typescript
{
  open: () => void;
  close: () => void;
  element: HTMLDivElement;
}
```

---

## @openlink/server

Server-side authentication and utilities.

### `verifyWalletSignature(options): Promise<VerifySignatureResult>`

Verify a wallet signature.

**Options:**
```typescript
{
  publicKey: string;
  signature: string;
  message: string;
  checkTimestamp?: boolean;
  maxAgeMs?: number;
}
```

### `SessionManager`

Manage user sessions.

```typescript
const sessionManager = new SessionManager(
  store: SessionStore,
  defaultTTL?: number
);
```

**Methods:**
- `createSession(publicKey, options?)`: Create session
- `getSession(sessionId)`: Get session
- `deleteSession(sessionId)`: Delete session
- `refreshSession(sessionId, ttl?)`: Refresh session

### `UserLinkingManager`

Link wallets to user accounts.

```typescript
const userLinking = new UserLinkingManager(store: UserStore);
```

**Methods:**
- `linkOrCreateUser(options)`: Link wallet or create user
- `unlinkWallet(userId)`: Remove wallet from user
- `getUserByPublicKey(publicKey)`: Find user by wallet
- `isWalletLinked(publicKey)`: Check if wallet is linked

### `createWalletAuthMiddleware(options?)`

Express middleware for wallet authentication.

**Options:**
```typescript
{
  headerName?: string;
  checkTimestamp?: boolean;
  maxAgeMs?: number;
  onUnauthorized?: (req, res) => void;
  onError?: (req, res, error) => void;
}
```

---

## @openlink/db

Database migration and integration utilities.

### `createMigration(options): Migration`

Generate database migration.

**Options:**
```typescript
{
  dialect: 'postgres' | 'mysql' | 'sqlite' | 'mongodb' | 'prisma';
  userTable?: string;
  strategy?: 'extend' | 'separate';
  customFields?: Record<string, string>;
}
```

**Returns:**
```typescript
{
  sql?: string;
  rollback?: string;
  mongodb?: string;
  prisma?: string;
  instructions: string;
}
```

### Database Adapters

#### `PrismaAdapter`

```typescript
const adapter = new PrismaAdapter(prismaClient);
```

#### `MongoDBAdapter`

```typescript
const adapter = new MongoDBAdapter(collection);
```

#### `SQLAdapter`

Base class for SQL databases.

```typescript
class MyAdapter extends SQLAdapter {
  async query(sql: string, params: any[]): Promise<any[]> {
    // Implementation
  }
  
  async execute(sql: string, params: any[]): Promise<any> {
    // Implementation
  }
}
```

### CLI

```bash
openlink-db migrate <dialect> [options]
```

**Options:**
- `--table <name>`: Table name
- `--strategy <type>`: Migration strategy
- `--output <dir>`: Output directory

---

## Type Definitions

### Common Types

```typescript
type Network = 'mainnet-beta' | 'testnet' | 'devnet';

interface SignatureData {
  publicKey: string;
  signature: string;
  message: string;
  timestamp: number;
}

interface UserRecord {
  id: string;
  walletPublicKey?: string;
  email?: string;
  walletConnectedAt?: number;
  metadata?: Record<string, any>;
}

interface WalletSession {
  publicKey: string;
  userId?: string;
  createdAt: number;
  expiresAt?: number;
  metadata?: Record<string, any>;
}
```

For complete type definitions, see the TypeScript declaration files in each package.


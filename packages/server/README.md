# @openlink/server

Server-side integration tools for OpenLink - authentication, session management, and user linking.

## Installation

```bash
npm install @openlink/server
```

## Features

- Wallet signature verification
- Session management
- User linking (wallet ↔ existing users)
- Express-compatible middleware
- Challenge-response authentication
- TypeScript support

## Quick Start

### Verify Wallet Signature

```typescript
import { verifyWalletSignature } from '@openlink/server';

const result = await verifyWalletSignature({
  publicKey: '7xKx...abc',
  signature: 'base58signature',
  message: 'Message that was signed',
  checkTimestamp: true,
  maxAgeMs: 300000 // 5 minutes
});

if (result.valid) {
  console.log('Valid signature from:', result.publicKey);
} else {
  console.error('Invalid signature:', result.error);
}
```

### Express Middleware

```typescript
import express from 'express';
import { createWalletAuthMiddleware } from '@openlink/server';

const app = express();

// Protect routes with wallet authentication
app.use('/api/protected', createWalletAuthMiddleware());

app.get('/api/protected/data', (req, res) => {
  // req.walletPublicKey is available
  res.json({ 
    message: 'Protected data',
    wallet: req.walletPublicKey 
  });
});
```

### Session Management

```typescript
import { SessionManager, MemorySessionStore } from '@openlink/server';

const sessionManager = new SessionManager(
  new MemorySessionStore(),
  86400000 // 24 hour TTL
);

// Create session after authentication
const sessionId = await sessionManager.createSession(publicKey, {
  userId: '123',
  metadata: { role: 'admin' }
});

// Get session
const session = await sessionManager.getSession(sessionId);

// Delete session (logout)
await sessionManager.deleteSession(sessionId);
```

### User Linking

```typescript
import { UserLinkingManager, MemoryUserStore } from '@openlink/server';

const userLinking = new UserLinkingManager(new MemoryUserStore());

// Link wallet to existing user
const user = await userLinking.linkOrCreateUser({
  publicKey: '7xKx...abc',
  existingUserId: '123' // Optional: link to existing user
});

// Or create new user with wallet
const newUser = await userLinking.linkOrCreateUser({
  publicKey: '7xKx...abc',
  email: 'user@example.com',
  metadata: { role: 'user' }
});

// Get user by wallet
const user = await userLinking.getUserByPublicKey('7xKx...abc');
```

## API Reference

### Authentication

#### `verifyWalletSignature(options)`

Verify a wallet signature.

**Options:**
- `publicKey`: Wallet public key
- `signature`: Base58 encoded signature
- `message`: Message that was signed
- `checkTimestamp`: Check message timestamp (default: `true`)
- `maxAgeMs`: Maximum message age in milliseconds (default: `300000`)

**Returns:** `VerifySignatureResult`

```typescript
{
  valid: boolean;
  publicKey?: string;
  error?: string;
  timestamp?: number;
}
```

#### `generateNonce()`

Generate a random nonce for challenge-response auth.

```typescript
const nonce = generateNonce();
// Returns: "a7s9d8f7a6s5d"
```

#### `createChallenge(appName, nonce)`

Create a challenge message for signing.

```typescript
const challenge = createChallenge('My App', nonce);
// Returns: "My App wants you to sign in...\nNonce: abc123\nTimestamp: 1234567890"
```

### Middleware

#### `createWalletAuthMiddleware(options?)`

Create authentication middleware that requires valid wallet signature.

**Options:**
- `headerName`: Header to check (default: `'Authorization'`)
- `checkTimestamp`: Validate timestamp (default: `true`)
- `maxAgeMs`: Max message age (default: `300000`)
- `onUnauthorized`: Custom unauthorized handler
- `onError`: Custom error handler

**Usage:**

```typescript
const authMiddleware = createWalletAuthMiddleware({
  maxAgeMs: 600000, // 10 minutes
  onUnauthorized: (req, res) => {
    res.status(401).json({ error: 'Please connect your wallet' });
  }
});

app.use('/api/protected', authMiddleware);
```

#### `createOptionalWalletAuthMiddleware(options?)`

Like `createWalletAuthMiddleware` but doesn't fail if signature is missing.

```typescript
app.use(createOptionalWalletAuthMiddleware());

app.get('/api/data', (req, res) => {
  if (req.walletPublicKey) {
    // User authenticated with wallet
  } else {
    // Anonymous access
  }
});
```

### Session Management

#### `SessionManager`

Manage user sessions.

**Constructor:**

```typescript
new SessionManager(store: SessionStore, defaultTTL?: number)
```

**Methods:**

**`createSession(publicKey, options?)`**

Create a new session.

```typescript
const sessionId = await sessionManager.createSession(publicKey, {
  userId: '123',
  ttl: 86400000, // 24 hours
  metadata: { role: 'admin' }
});
```

**`getSession(sessionId)`**

Retrieve a session.

```typescript
const session = await sessionManager.getSession(sessionId);
```

**`deleteSession(sessionId)`**

Delete a session.

**`refreshSession(sessionId, ttl?)`**

Extend session expiration.

#### `MemorySessionStore`

In-memory session store (for development).

For production, implement `SessionStore` interface with Redis, PostgreSQL, etc.

```typescript
interface SessionStore {
  set(sessionId: string, data: WalletSession): Promise<void>;
  get(sessionId: string): Promise<WalletSession | null>;
  delete(sessionId: string): Promise<void>;
  cleanup(): Promise<void>;
}
```

### User Linking

#### `UserLinkingManager`

Link wallets to existing user accounts.

**Constructor:**

```typescript
new UserLinkingManager(store: UserStore)
```

**Methods:**

**`linkOrCreateUser(options)`**

Link wallet to user or create new user.

```typescript
const user = await userLinking.linkOrCreateUser({
  publicKey: '7xKx...abc',
  existingUserId: '123', // Optional
  email: 'user@example.com', // Optional
  metadata: { plan: 'premium' } // Optional
});
```

**`unlinkWallet(userId)`**

Remove wallet from user.

**`getUserByPublicKey(publicKey)`**

Find user by wallet.

**`isWalletLinked(publicKey)`**

Check if wallet is linked.

#### `MemoryUserStore`

In-memory user store (for development).

For production, implement `UserStore` interface:

```typescript
interface UserStore {
  findByPublicKey(publicKey: string): Promise<UserRecord | null>;
  findByUserId(userId: string): Promise<UserRecord | null>;
  findByEmail(email: string): Promise<UserRecord | null>;
  create(data: Partial<UserRecord>): Promise<UserRecord>;
  update(userId: string, data: Partial<UserRecord>): Promise<UserRecord>;
}
```

## Complete Example: Express API

```typescript
import express from 'express';
import {
  createWalletAuthMiddleware,
  verifyWalletSignature,
  SessionManager,
  MemorySessionStore,
  UserLinkingManager,
  MemoryUserStore
} from '@openlink/server';

const app = express();
app.use(express.json());

const sessionManager = new SessionManager(new MemorySessionStore());
const userLinking = new UserLinkingManager(new MemoryUserStore());

// Authentication endpoint
app.post('/api/auth/wallet', async (req, res) => {
  const { publicKey, signature, message } = req.body;

  const result = await verifyWalletSignature({
    publicKey,
    signature,
    message
  });

  if (!result.valid) {
    return res.status(401).json({ error: result.error });
  }

  // Link or create user
  const user = await userLinking.linkOrCreateUser({
    publicKey: result.publicKey!
  });

  // Create session
  const sessionId = await sessionManager.createSession(result.publicKey!, {
    userId: user.id
  });

  res.json({
    success: true,
    sessionId,
    user
  });
});

// Protected route
app.get('/api/protected/profile', 
  createWalletAuthMiddleware(),
  async (req, res) => {
    const user = await userLinking.getUserByPublicKey(req.walletPublicKey!);
    res.json({ user });
  }
);

app.listen(3000);
```

## Production Considerations

### Use Redis for Sessions

```typescript
import Redis from 'ioredis';
import { SessionStore, WalletSession } from '@openlink/server';

class RedisSessionStore implements SessionStore {
  constructor(private redis: Redis) {}

  async set(sessionId: string, data: WalletSession): Promise<void> {
    const ttl = data.expiresAt ? Math.floor((data.expiresAt - Date.now()) / 1000) : 86400;
    await this.redis.setex(sessionId, ttl, JSON.stringify(data));
  }

  async get(sessionId: string): Promise<WalletSession | null> {
    const data = await this.redis.get(sessionId);
    return data ? JSON.parse(data) : null;
  }

  async delete(sessionId: string): Promise<void> {
    await this.redis.del(sessionId);
  }

  async cleanup(): Promise<void> {
    // Redis handles expiration automatically
  }
}
```

### Use Database for Users

```typescript
import { UserStore, UserRecord } from '@openlink/server';

class PostgresUserStore implements UserStore {
  // Implement with your database library
  async findByPublicKey(publicKey: string): Promise<UserRecord | null> {
    // SELECT * FROM users WHERE wallet_public_key = $1
  }
  // ... other methods
}
```

## License

MIT


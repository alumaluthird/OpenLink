# Core Concepts

This guide explains the fundamental concepts behind OpenLink and how to integrate Web3 wallet authentication into your Web2 application.

## Overview

OpenLink bridges Web2 and Web3 by allowing users to authenticate using their Solana wallet alongside traditional authentication methods. This enables:

- **Hybrid Authentication**: Support both traditional login and wallet-based auth
- **Gradual Migration**: Add Web3 features without breaking existing functionality
- **User Choice**: Let users decide how they want to authenticate
- **NFT/Token Gating**: Enable Web3 features for existing users

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   Client    │ ◄─────► │  OpenLink    │ ◄─────► │   Solana     │
│ (Browser)   │         │   SDK        │         │   Wallet     │
└─────────────┘         └──────────────┘         └──────────────┘
       │                       │
       │                       │
       ▼                       ▼
┌─────────────┐         ┌──────────────┐
│   Backend   │ ◄─────► │   Database   │
│   Server    │         │              │
└─────────────┘         └──────────────┘
```

## Key Components

### 1. Wallet Connection

Users connect their Solana wallet (Phantom, Solflare, etc.) to your application:

```typescript
const { connect, publicKey } = useWallet();
await connect();
console.log('Connected:', publicKey);
```

**What happens:**
1. User clicks "Connect Wallet"
2. Wallet extension opens
3. User approves connection
4. App receives public key

### 2. Message Signing

To authenticate, users sign a cryptographic message:

```typescript
const { signature, message, publicKey } = await signMessage();
```

**What happens:**
1. App generates a message with:
   - App name
   - Random nonce
   - Timestamp
2. User signs message with their private key (in wallet)
3. App receives signature

**Example message:**
```
My App wants you to sign in with your Solana account.

Nonce: a7s9d8f7a6s5d
Timestamp: 1699564800000
```

### 3. Signature Verification

Server verifies the signature to authenticate the user:

```typescript
const result = await verifyWalletSignature({
  publicKey,
  signature,
  message
});

if (result.valid) {
  // User is authenticated
}
```

**What happens:**
1. Server checks message timestamp (prevents replay attacks)
2. Verifies signature using public key
3. Confirms user controls the wallet

### 4. User Linking

Link wallet to existing user account:

```typescript
const user = await userLinking.linkOrCreateUser({
  publicKey: '7xKx...',
  existingUserId: '123' // Optional
});
```

**Strategies:**

**A. Link to existing user:**
```typescript
// User already logged in with email/password
const userId = session.userId;

// Now link their wallet
await linkOrCreateUser({
  publicKey,
  existingUserId: userId
});
```

**B. Create new user from wallet:**
```typescript
// User connects wallet first
await linkOrCreateUser({
  publicKey,
  email: 'user@example.com' // Optional
});
```

**C. Dual authentication:**
```typescript
// User can log in with either:
// 1. Email/password → access granted
// 2. Wallet signature → access granted
// 3. Both → enhanced security
```

## Authentication Flows

### Flow 1: Wallet-First (New Users)

```
1. User clicks "Connect Wallet"
2. User approves connection in wallet
3. User clicks "Sign In"
4. User signs message in wallet
5. Server verifies signature
6. Server creates new user account
7. User is authenticated
```

### Flow 2: Account-First (Existing Users)

```
1. User logs in with email/password
2. User clicks "Connect Wallet"
3. User approves connection
4. User signs message
5. Server verifies and links wallet to account
6. User can now use either authentication method
```

### Flow 3: Hybrid (Both Methods)

```
1. User can log in with email/password OR wallet
2. If using wallet:
   a. Connect wallet
   b. Sign message
   c. Authenticate
3. If using email:
   a. Enter credentials
   b. Authenticate
4. Optionally link both methods
```

## Security Considerations

### 1. Message Timestamps

Messages include timestamps to prevent replay attacks:

```typescript
// Server checks age
verifyWalletSignature({
  publicKey,
  signature,
  message,
  checkTimestamp: true,
  maxAgeMs: 300000 // 5 minutes
});
```

### 2. Nonces

Random nonces prevent message reuse:

```typescript
const nonce = generateNonce();
const message = createChallenge(appName, nonce);
```

### 3. HTTPS Only

Always use HTTPS in production to prevent man-in-the-middle attacks.

### 4. Signature Verification

Never trust client-side verification - always verify on server:

```typescript
// ❌ NEVER do this
if (clientSaysSignatureIsValid) {
  grantAccess();
}

// ✅ Always do this
const result = await verifyWalletSignature({...});
if (result.valid) {
  grantAccess();
}
```

## Database Schema

### Strategy 1: Extend Existing Table

Add wallet fields to users table:

```sql
ALTER TABLE users
  ADD COLUMN wallet_public_key VARCHAR(44) UNIQUE,
  ADD COLUMN wallet_connected_at TIMESTAMP;
```

**Pros:**
- Simple queries
- One-to-one relationship

**Cons:**
- Modifies existing table
- Nullable fields

### Strategy 2: Separate Table

Create dedicated wallet_connections table:

```sql
CREATE TABLE wallet_connections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  wallet_public_key VARCHAR(44) UNIQUE,
  connected_at TIMESTAMP
);
```

**Pros:**
- Clean separation
- Can support multiple wallets per user

**Cons:**
- Requires JOIN queries

## Session Management

### Option 1: Traditional Sessions

```typescript
const sessionId = await sessionManager.createSession(publicKey, {
  userId: user.id,
  ttl: 86400000 // 24 hours
});

// Store sessionId in cookie or local storage
```

### Option 2: JWT Tokens

```typescript
const token = jwt.sign(
  { publicKey, userId },
  secret,
  { expiresIn: '24h' }
);

// Send token to client
```

### Option 3: Signature-Based

```typescript
// Client includes signature with each request
Authorization: Wallet publicKey:signature:message

// Server verifies on each request
```

## Best Practices

### 1. Progressive Enhancement

Don't force users to use wallets:

```typescript
// ✅ Good - wallet is optional
<LoginForm />
<WalletButton optional />

// ❌ Bad - wallet required
<WalletButton required />
```

### 2. Clear Communication

Explain what wallet connection does:

```typescript
<WalletButton>
  Connect Wallet to access NFT features
</WalletButton>
```

### 3. Error Handling

Handle wallet errors gracefully:

```typescript
try {
  await connect();
} catch (error) {
  if (error.code === 4001) {
    // User rejected
    showMessage('Connection cancelled');
  } else {
    showError('Failed to connect wallet');
  }
}
```

### 4. Loading States

Show loading indicators:

```typescript
const { connecting } = useWallet();

<button disabled={connecting}>
  {connecting ? 'Connecting...' : 'Connect Wallet'}
</button>
```

### 5. Wallet Detection

Detect if user has a wallet installed:

```typescript
const wallets = openlink.getAvailableWallets();
const hasWallet = wallets.some(w => w.installed);

if (!hasWallet) {
  showInstallPrompt();
}
```

## Common Patterns

### Pattern 1: Gated Content

```typescript
function PremiumContent() {
  const { connected } = useWallet();
  
  if (!connected) {
    return <ConnectWalletPrompt />;
  }
  
  return <PremiumFeatures />;
}
```

### Pattern 2: Hybrid Auth

```typescript
function LoginPage() {
  return (
    <>
      <EmailLogin />
      <Divider>or</Divider>
      <WalletLogin />
    </>
  );
}
```

### Pattern 3: Account Linking

```typescript
function Settings() {
  const { user } = useAuth();
  
  return (
    <>
      <Email>{user.email}</Email>
      {!user.walletPublicKey ? (
        <LinkWalletButton />
      ) : (
        <WalletLinked publicKey={user.walletPublicKey} />
      )}
    </>
  );
}
```

## Next Steps

- [React Guide](../packages/react/README.md)
- [Server Integration](../packages/server/README.md)
- [Database Migration](../packages/db/README.md)
- [Examples](../examples/README.md)


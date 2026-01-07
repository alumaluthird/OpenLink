# Migration Guide

Guide for migrating existing applications to use OpenLink.

## Overview

This guide covers different migration scenarios:

1. Existing app with email/password auth
2. OAuth-based application
3. Session-based application
4. JWT-based application
5. Legacy application

## Scenario 1: Email/Password Application

### Current State

```typescript
// Current login
async function login(email: string, password: string) {
  const user = await db.users.findOne({ email });
  if (await bcrypt.compare(password, user.passwordHash)) {
    req.session.userId = user.id;
    return { success: true };
  }
}
```

### Migration Steps

**Step 1: Update Database**

```bash
npx openlink-db migrate postgres --table users
psql -d mydb -f migrations/[timestamp]_migration.sql
```

**Step 2: Add Wallet Login Option**

```tsx
function LoginPage() {
  return (
    <div>
      {/* Keep existing login */}
      <EmailPasswordForm />
      
      {/* Add wallet option */}
      <Divider>or</Divider>
      <WalletLogin />
    </div>
  );
}
```

**Step 3: Add Backend Handler**

```typescript
import { verifyWalletSignature, UserLinkingManager } from '@openlink/server';

// New wallet login endpoint
app.post('/api/auth/wallet', async (req, res) => {
  const { publicKey, signature, message } = req.body;

  const result = await verifyWalletSignature({
    publicKey,
    signature,
    message
  });

  if (result.valid) {
    const user = await userLinking.linkOrCreateUser({
      publicKey: result.publicKey
    });

    req.session.userId = user.id;
    res.json({ success: true });
  }
});
```

**Step 4: Add Account Linking**

```tsx
function AccountSettings() {
  const { user } = useAuth();
  const { signMessage } = useSignMessage();

  const linkWallet = async () => {
    const { signature, message, publicKey } = await signMessage();

    await fetch('/api/user/link-wallet', {
      method: 'POST',
      body: JSON.stringify({
        userId: user.id,
        publicKey,
        signature,
        message
      })
    });
  };

  return (
    <div>
      {user.walletPublicKey ? (
        <p>Wallet: {user.walletPublicKey}</p>
      ) : (
        <button onClick={linkWallet}>Link Wallet</button>
      )}
    </div>
  );
}
```

## Scenario 2: OAuth Application

### Current State

```typescript
// OAuth flow
app.get('/auth/google', passport.authenticate('google'));
app.get('/auth/google/callback', 
  passport.authenticate('google'),
  (req, res) => {
    req.session.userId = req.user.id;
    res.redirect('/dashboard');
  }
);
```

### Migration Steps

**Step 1: Keep OAuth Intact**

No changes needed to existing OAuth flow.

**Step 2: Add Wallet as Third Option**

```tsx
function LoginPage() {
  return (
    <div>
      <OAuthButton provider="google">Sign in with Google</OAuthButton>
      <OAuthButton provider="github">Sign in with GitHub</OAuthButton>
      
      {/* Add wallet option */}
      <WalletButton>Sign in with Wallet</WalletButton>
    </div>
  );
}
```

**Step 3: Allow Users to Link All Methods**

```typescript
// Users can link OAuth + Wallet
await userLinking.linkOrCreateUser({
  publicKey,
  existingUserId: req.user.id, // from OAuth session
  email: req.user.email
});
```

## Scenario 3: Session-Based Application

### Current State

```typescript
// Express session
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));

// Auth middleware
function requireAuth(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
```

### Migration Steps

**Step 1: Extend Session**

```typescript
// After wallet authentication
app.post('/api/auth/wallet', async (req, res) => {
  const result = await verifyWalletSignature({...});

  if (result.valid) {
    const user = await userLinking.getUserByPublicKey(result.publicKey);
    
    // Use existing session
    req.session.userId = user.id;
    req.session.walletPublicKey = result.publicKey;
    
    res.json({ success: true });
  }
});
```

**Step 2: Update Middleware**

```typescript
function requireAuth(req, res, next) {
  // Accept either traditional session or wallet session
  if (req.session.userId || req.session.walletPublicKey) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
```

## Scenario 4: JWT Application

### Current State

```typescript
// JWT tokens
const token = jwt.sign(
  { userId: user.id },
  secret,
  { expiresIn: '24h' }
);
```

### Migration Steps

**Step 1: Include Wallet in JWT**

```typescript
app.post('/api/auth/wallet', async (req, res) => {
  const result = await verifyWalletSignature({...});

  if (result.valid) {
    const user = await userLinking.linkOrCreateUser({
      publicKey: result.publicKey
    });

    const token = jwt.sign(
      {
        userId: user.id,
        walletPublicKey: result.publicKey
      },
      secret,
      { expiresIn: '24h' }
    );

    res.json({ token });
  }
});
```

**Step 2: Verify JWT**

```typescript
// Middleware remains the same
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

## Scenario 5: Legacy Application

### Current State

Old application with minimal modern tooling:
- No build process
- jQuery or vanilla JS
- Server-side rendered HTML
- Session cookies

### Migration Steps

**Step 1: Add CDN Script**

```html
<script src="https://unpkg.com/@openlink/vanilla"></script>
```

**Step 2: Add Button**

```html
<div id="wallet-button"></div>

<script>
  const openlink = new OpenLink({
    network: 'mainnet-beta',
    appName: 'My App'
  });

  OpenLink.createWalletButton(openlink, {
    container: '#wallet-button',
    onConnect: handleWalletConnect
  });

  function handleWalletConnect() {
    // Authenticate
    openlink.signMessage().then(data => {
      // Send to server
      $.post('/auth/wallet', data, function(response) {
        if (response.success) {
          window.location.href = '/dashboard';
        }
      });
    });
  }
</script>
```

**Step 3: Add Server Endpoint**

```php
// Example PHP endpoint
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $publicKey = $_POST['publicKey'];
  $signature = $_POST['signature'];
  $message = $_POST['message'];

  // Call Node.js service to verify
  // Or use PHP Solana library
  
  if (verifySignature($message, $signature, $publicKey)) {
    $_SESSION['wallet_public_key'] = $publicKey;
    echo json_encode(['success' => true]);
  }
}
```

## Database Migration Strategies

### Strategy 1: Gradual Migration

Keep both auth systems running:

```sql
-- Users table supports both methods
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  wallet_public_key VARCHAR(44) UNIQUE,
  wallet_connected_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Strategy 2: Wallet-First

Prioritize wallet, email as backup:

```typescript
async function login(emailOrWallet: string, password?: string) {
  // Try wallet first
  const walletUser = await db.users.findOne({
    wallet_public_key: emailOrWallet
  });

  if (walletUser) return walletUser;

  // Fallback to email
  if (password) {
    return await emailPasswordLogin(emailOrWallet, password);
  }
}
```

## Testing Migration

### Test Plan

1. **Existing Users**
   - Can still log in with old method
   - Can link wallet in settings
   - Can then use either method

2. **New Users**
   - Can sign up with wallet
   - Can add email later (optional)

3. **Hybrid Users**
   - Can use both methods
   - Data stays in sync

### Test Script

```typescript
describe('Migration', () => {
  it('existing users can still login', async () => {
    const response = await login('user@example.com', 'password123');
    expect(response.success).toBe(true);
  });

  it('existing users can link wallet', async () => {
    await loginWithEmail();
    const result = await linkWallet(publicKey);
    expect(result.success).toBe(true);
  });

  it('users can login with wallet', async () => {
    const { signature, message } = await signMessage();
    const response = await loginWithWallet(publicKey, signature, message);
    expect(response.success).toBe(true);
  });
});
```

## Rollback Plan

If migration issues occur:

1. **Database Rollback**
```bash
psql -d mydb -f migrations/[timestamp]_rollback.sql
```

2. **Code Rollback**
```bash
git revert [commit-hash]
```

3. **Feature Flag**
```typescript
if (process.env.ENABLE_WALLET_AUTH === 'true') {
  // Show wallet option
}
```

## Best Practices

1. **Communicate Changes**
   - Notify users about new feature
   - Explain benefits
   - Provide documentation

2. **Gradual Rollout**
   - Start with beta users
   - Monitor for issues
   - Expand slowly

3. **Maintain Backwards Compatibility**
   - Keep existing auth working
   - Don't force users to switch
   - Allow time for adoption

4. **Monitor Metrics**
   - Track wallet adoption rate
   - Monitor auth failures
   - Collect user feedback

## Support

If you encounter issues during migration:

- [GitHub Issues](https://github.com/yourusername/openlink/issues)
- [Discord Support](https://discord.gg/openlink)
- [Migration FAQ](./faq.md)


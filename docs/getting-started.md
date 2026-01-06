# Getting Started with OpenLink

This guide will help you integrate OpenLink into your application in under 10 minutes.

## Prerequisites

- Node.js 18+ or modern browser
- Existing Web2 application (or new project)
- Solana wallet extension (Phantom recommended)

## Quick Start Guide

### Step 1: Choose Your Integration

**React/Next.js Application:**
```bash
npm install @openlink/react
# or for Next.js
npm install @openlink/nextjs
```

**Vanilla JavaScript/HTML:**
```html
<script src="https://unpkg.com/@openlink/vanilla"></script>
```

**Backend Server:**
```bash
npm install @openlink/server
```

### Step 2: Frontend Setup

#### React

```tsx
// App.tsx
import { OpenLinkProvider, WalletButton } from '@openlink/react';

function App() {
  return (
    <OpenLinkProvider network="mainnet-beta" appName="My App">
      <Header />
      <YourApp />
    </OpenLinkProvider>
  );
}

function Header() {
  return (
    <header>
      <h1>My App</h1>
      <WalletButton />
    </header>
  );
}
```

#### Next.js (App Router)

```tsx
// app/layout.tsx
import { OpenLinkProvider } from '@openlink/nextjs';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <OpenLinkProvider network="mainnet-beta" appName="My App">
          {children}
        </OpenLinkProvider>
      </body>
    </html>
  );
}
```

```tsx
// app/page.tsx
'use client';
import { WalletButton } from '@openlink/nextjs';

export default function Home() {
  return <WalletButton />;
}
```

#### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <title>My App</title>
</head>
<body>
  <div id="wallet-button"></div>

  <script src="https://unpkg.com/@openlink/vanilla"></script>
  <script>
    const openlink = new OpenLink({
      network: 'mainnet-beta',
      appName: 'My App'
    });

    OpenLink.createWalletButton(openlink, {
      container: '#wallet-button'
    });
  </script>
</body>
</html>
```

### Step 3: Add Authentication

#### Client-Side (React)

```tsx
import { useWallet, useSignMessage } from '@openlink/react';

function AuthButton() {
  const { publicKey } = useWallet();
  const { signMessage } = useSignMessage();

  const handleAuth = async () => {
    // 1. Sign message
    const { signature, message } = await signMessage();

    // 2. Send to backend
    const response = await fetch('/api/auth/wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        publicKey: publicKey.toString(),
        signature,
        message
      })
    });

    // 3. Handle response
    const data = await response.json();
    if (data.success) {
      console.log('Authenticated!', data.sessionId);
    }
  };

  return <button onClick={handleAuth}>Authenticate</button>;
}
```

#### Server-Side (Express)

```typescript
import express from 'express';
import { verifyWalletSignature, SessionManager, MemorySessionStore } from '@openlink/server';

const app = express();
app.use(express.json());

const sessionManager = new SessionManager(new MemorySessionStore());

app.post('/api/auth/wallet', async (req, res) => {
  const { publicKey, signature, message } = req.body;

  // Verify signature
  const result = await verifyWalletSignature({
    publicKey,
    signature,
    message
  });

  if (result.valid) {
    // Create session
    const sessionId = await sessionManager.createSession(publicKey);
    
    res.json({ success: true, sessionId });
  } else {
    res.status(401).json({ error: result.error });
  }
});

app.listen(3000);
```

### Step 4: Database Setup

Generate migration for your database:

```bash
npx openlink-db migrate postgres --table users
```

This creates SQL files in `./migrations/`:

```sql
ALTER TABLE users
  ADD COLUMN wallet_public_key VARCHAR(44) UNIQUE,
  ADD COLUMN wallet_connected_at TIMESTAMP;
```

Apply the migration:

```bash
psql -d mydb -f migrations/[timestamp]_migration.sql
```

### Step 5: Link Wallets to Users

```typescript
import { UserLinkingManager, MemoryUserStore } from '@openlink/server';

const userLinking = new UserLinkingManager(new MemoryUserStore());

// After successful authentication
app.post('/api/auth/wallet', async (req, res) => {
  const result = await verifyWalletSignature({...});

  if (result.valid) {
    // Link to existing user or create new one
    const user = await userLinking.linkOrCreateUser({
      publicKey: result.publicKey,
      existingUserId: req.session?.userId // if user is already logged in
    });

    res.json({ success: true, user });
  }
});
```

## Common Use Cases

### Use Case 1: Add Wallet to Existing App

You have an app with email/password login and want to add wallet authentication:

1. Install OpenLink packages
2. Add `<WalletButton>` to your UI
3. Let users link their wallet in account settings
4. Allow login with either method

```tsx
function AccountSettings() {
  const { user } = useAuth();

  if (user.walletPublicKey) {
    return <p>Wallet: {user.walletPublicKey}</p>;
  }

  return <LinkWalletButton />;
}
```

### Use Case 2: Wallet-Only Authentication

New app that only uses wallet authentication:

1. Install OpenLink packages
2. Remove traditional login forms
3. Use `<WalletButton>` as primary auth
4. Handle authentication on backend

```tsx
function Login() {
  return (
    <div>
      <h1>Sign In</h1>
      <WalletButton />
    </div>
  );
}
```

### Use Case 3: NFT/Token Gating

Restrict content based on wallet holdings:

1. Connect wallet
2. Authenticate user
3. Check holdings on backend
4. Grant/deny access

```tsx
function PremiumContent() {
  const { connected } = useWallet();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (connected) {
      checkAccess();
    }
  }, [connected]);

  if (!hasAccess) {
    return <p>Connect wallet and hold NFT to access</p>;
  }

  return <PremiumFeatures />;
}
```

## Testing

### Development Mode

Use `devnet` for testing:

```tsx
<OpenLinkProvider network="devnet" appName="My App">
```

Get test SOL from [Solana Faucet](https://faucet.solana.com/).

### Production

Switch to `mainnet-beta`:

```tsx
<OpenLinkProvider network="mainnet-beta" appName="My App">
```

## Troubleshooting

### Wallet Not Connecting

1. Check if wallet extension is installed
2. Try refreshing the page
3. Check browser console for errors
4. Ensure you're on correct network

### Signature Verification Fails

1. Check server time synchronization
2. Verify message format
3. Ensure using same network on client/server
4. Check timestamp validation settings

### Database Errors

1. Verify migration was applied
2. Check unique constraints
3. Ensure proper indexes exist
4. Review database logs

## Next Steps

- **Read Core Concepts**: [docs/concepts.md](./concepts.md)
- **Explore Examples**: [examples/](../examples/)
- **API Reference**: [docs/api.md](./api.md)
- **Database Guide**: [packages/db/README.md](../packages/db/README.md)

## Support

- [GitHub Issues](https://github.com/yourusername/openlink/issues)
- [Discord Community](https://discord.gg/openlink)
- [Documentation](https://openlink-sdk.dev)

## What's Next?

Now that you have basic integration working:

1. **Customize the UI** - Style components to match your brand
2. **Add User Linking** - Connect wallets to existing accounts
3. **Implement Token Gating** - Restrict content based on holdings
4. **Set Up Analytics** - Track wallet connections and usage
5. **Go to Production** - Switch to mainnet and deploy

Welcome to Web3! 🚀


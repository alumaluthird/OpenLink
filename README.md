<div align="center">
  <img src="./docs/Bans1.png" alt="OpenLink SDK Banner" width="100%" />
  
  <h1>OpenLink SDK</h1>
  
  <p>Add Solana wallet authentication to your existing app without changing your current login system.</p>
  
  <p><strong>CA:</strong> <code>BRFsmFmvSGpP3KePatB4WmCaK5gEnu482ic83y6QBAGS</code></p>
  
  <p>
    <img src="https://img.shields.io/badge/version-0.2.1-blue.svg" alt="Version 0.2.1" />
    <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Solana-14F195?logo=solana&logoColor=black" alt="Solana" />
    <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="MIT License" />
    <img src="https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/Next.js-14+-000000?logo=next.js&logoColor=white" alt="Next.js" />
  </p>
</div>

---

This SDK lets you connect Web3 wallets to any Web2 service. Users can sign in with their wallet while you keep your existing OAuth, email/password, or session-based auth. Everything works together.

## What's included

- Wallet connection and signature verification for Solana
- React hooks and components, Next.js integration, vanilla JavaScript support
- Server-side verification utilities (Express middleware, session management)
- Database migration tools (PostgreSQL, MySQL, SQLite, MongoDB, Prisma)
- Account linking - connect wallets to existing user records
- Works alongside your current authentication (OAuth, JWT, sessions)

## Packages

| Package | What it does |
|---------|-------------|
| `@openlink/core` | Wallet connection, message signing, signature verification |
| `@openlink/react` | React hooks (`useWallet`, `useSignMessage`) and components |
| `@openlink/nextjs` | Next.js integration (App Router & Pages Router) |
| `@openlink/vanilla` | Plain JavaScript - works in any HTML page |
| `@openlink/server` | Express middleware, session management, user linking |
| `@openlink/db` | Generate SQL migrations for your database |

## Installation

Not on npm yet. Clone and build locally:

```bash
git clone https://github.com/yourusername/openlink.git
cd openlink
npm install
npm run build

# Link packages
cd packages/react && npm link
cd ../server && npm link
cd ../db && npm link

# In your project
npm link @openlink/react
npm link @openlink/server
```

## Usage

### React

```tsx
import { OpenLinkProvider, useWallet } from '@openlink/react';

function App() {
  return (
    <OpenLinkProvider network="mainnet-beta" appName="My App">
      <WalletButton />
    </OpenLinkProvider>
  );
}

function WalletButton() {
  const { connect, disconnect, connected, publicKey } = useWallet();
  
  return (
    <button onClick={connected ? disconnect : connect}>
      {connected ? `Connected: ${publicKey?.slice(0, 8)}...` : 'Connect Wallet'}
    </button>
  );
}
```

### Vanilla JavaScript

```bash
cd packages/vanilla && npm run build
```

```html
<script src="path/to/packages/vanilla/dist/index.global.js"></script>
<script>
  const openlink = new OpenLink({ network: 'mainnet-beta', appName: 'My App' });
  document.getElementById('btn').onclick = () => openlink.connect();
</script>
```

### Server

```typescript
import { verifyWalletSignature } from '@openlink/server';

app.post('/auth/wallet', async (req, res) => {
  const { publicKey, signature, message } = req.body;
  
  const result = await verifyWalletSignature({ publicKey, signature, message });
  
  if (result.valid) {
    // Create session, link to existing user, etc.
    req.session.userId = await findOrCreateUser(result.publicKey);
    res.json({ success: true });
  } else {
    res.status(401).json({ error: result.error });
  }
});
```

## Database

Add wallet fields to your existing users table:

```bash
npx openlink-db migrate postgres --table users
# Creates migration SQL that adds:
# - wallet_public_key (varchar, unique, nullable)
# - wallet_connected_at (timestamp, nullable)
```

Or use it in code:

```typescript
import { createMigration } from '@openlink/db';

const migration = createMigration({
  dialect: 'postgres',
  userTable: 'users',
  strategy: 'extend'
});
// migration.sql has the ALTER TABLE statement
```

Supports: PostgreSQL, MySQL, SQLite, MongoDB, Prisma

## How it works

1. User connects wallet (Phantom, Solflare, etc)
2. User signs a message to prove they own the wallet
3. Your server verifies the signature
4. Link the wallet to their existing user account, or create a new one
5. User can now log in with wallet or traditional auth

## Examples

- `examples/react-example` - React app with wallet auth
- `examples/nextjs-example` - Next.js app router
- `examples/vanilla-example` - Plain HTML/JS
- `examples/server-example` - Express server with user linking

## Documentation

- `docs/getting-started.md` - Setup guide
- `docs/concepts.md` - How everything works
- `docs/api.md` - Full API reference
- `packages/*/README.md` - Per-package docs

## Development

```bash
npm install
npm run build  # Build all packages
npm run dev    # Watch mode
npm test       # Run tests
```

## License

MIT

---

Built for Solana


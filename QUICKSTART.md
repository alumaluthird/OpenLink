# OpenLink Quick Start

Get up and running with OpenLink in 5 minutes.

## Installation

**Note:** This SDK is not yet published to npm. Follow these steps for local development:

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/openlink.git
cd openlink

# 2. Install dependencies
npm install

# 3. Build all packages
npm run build

# 4. Link packages
cd packages/core && npm link
cd ../react && npm link
cd ../nextjs && npm link
cd ../vanilla && npm link
cd ../server && npm link
cd ../db && npm link

# 5. In your project, link the package you need
cd /path/to/your/project
npm link @openlink/react  # or nextjs, vanilla, server, db
```

## Frontend Integration

### React

```tsx
// 1. Wrap your app
import { OpenLinkProvider, WalletButton } from '@openlink/react';

function App() {
  return (
    <OpenLinkProvider network="mainnet-beta" appName="My App">
      <WalletButton />
    </OpenLinkProvider>
  );
}
```

### Next.js

```tsx
// app/layout.tsx
import { OpenLinkProvider } from '@openlink/nextjs';

export default function Layout({ children }) {
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

// app/page.tsx
'use client';
import { WalletButton } from '@openlink/nextjs';

export default function Home() {
  return <WalletButton />;
}
```

### Vanilla JavaScript

```bash
# Build the vanilla package
cd packages/vanilla
npm run build
```

```html
<!DOCTYPE html>
<html>
<body>
  <div id="wallet-button"></div>

  <!-- Include the built file -->
  <script src="path/to/openlink/packages/vanilla/dist/index.global.js"></script>
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

## Backend Integration

### Express Server

```typescript
import express from 'express';
import { verifyWalletSignature } from '@openlink/server';

const app = express();
app.use(express.json());

app.post('/api/auth/wallet', async (req, res) => {
  const { publicKey, signature, message } = req.body;

  const result = await verifyWalletSignature({
    publicKey,
    signature,
    message
  });

  if (result.valid) {
    // Create session, JWT, etc.
    res.json({ success: true });
  } else {
    res.status(401).json({ error: result.error });
  }
});

app.listen(3000);
```

## Database Setup

```bash
# After linking @openlink/db, generate migration
npx openlink-db migrate postgres

# Apply migration
psql -d mydb -f migrations/[timestamp]_migration.sql
```

## That's It!

You now have:
- Wallet connection button
- Signature verification
- Database schema

## Next Steps

1. **Customize UI** - Style the wallet button to match your brand
2. **Add User Linking** - Connect wallets to existing users
3. **Implement Features** - Build token-gated content, NFT features, etc.

## Full Documentation

- [Getting Started Guide](docs/getting-started.md)
- [Core Concepts](docs/concepts.md)
- [API Reference](docs/api.md)
- [Examples](examples/README.md)

## Need Help?

- [GitHub Issues](https://github.com/yourusername/openlink/issues)


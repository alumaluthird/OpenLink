# @openlink/nextjs

Next.js integration for OpenLink - supports both App Router and Pages Router.

## Installation

```bash
npm install @openlink/nextjs
```

## App Router (Next.js 13+)

### Setup

Create a client component for the provider:

```tsx
// app/providers.tsx
'use client';

import { OpenLinkProvider } from '@openlink/nextjs';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <OpenLinkProvider
      network="mainnet-beta"
      appName="My App"
    >
      {children}
    </OpenLinkProvider>
  );
}
```

Use it in your root layout:

```tsx
// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Use in Client Components

```tsx
// app/wallet-button.tsx
'use client';

import { useWallet, WalletButton } from '@openlink/nextjs';

export function MyWalletButton() {
  const { connected, publicKey } = useWallet();

  return (
    <div>
      <WalletButton />
      {connected && <p>Connected: {publicKey?.toString()}</p>}
    </div>
  );
}
```

### Server Actions

```tsx
// app/actions.ts
'use server';

import { verifyWalletSignature } from '@openlink/nextjs/server';

export async function authenticateWallet(
  publicKey: string,
  signature: string,
  message: string
) {
  const result = await verifyWalletSignature({
    publicKey,
    signature,
    message
  });

  if (result.valid) {
    // Create session, update database, etc.
    return { success: true, publicKey: result.publicKey };
  }

  return { success: false, error: result.error };
}
```

Use in client component:

```tsx
'use client';

import { useWallet, useSignMessage } from '@openlink/nextjs';
import { authenticateWallet } from './actions';

export function AuthButton() {
  const { publicKey } = useWallet();
  const { signMessage } = useSignMessage();

  const handleAuth = async () => {
    const { signature, message } = await signMessage();
    const result = await authenticateWallet(
      publicKey!.toString(),
      signature,
      message
    );

    if (result.success) {
      console.log('Authenticated!');
    }
  };

  return <button onClick={handleAuth}>Authenticate</button>;
}
```

## Pages Router (Next.js 12 and earlier)

### Setup with HOC

```tsx
// pages/_app.tsx
import { withWallet } from '@openlink/nextjs';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default withWallet(MyApp, {
  network: 'mainnet-beta',
  appName: 'My App'
});
```

### Or wrap in _app manually

```tsx
// pages/_app.tsx
import { OpenLinkProvider } from '@openlink/nextjs';
import type { AppProps } from 'next/app';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <OpenLinkProvider network="mainnet-beta" appName="My App">
      <Component {...pageProps} />
    </OpenLinkProvider>
  );
}
```

### Use in Pages

```tsx
// pages/index.tsx
import { useWallet, WalletButton } from '@openlink/nextjs';

export default function Home() {
  const { connected, publicKey } = useWallet();

  return (
    <div>
      <h1>My App</h1>
      <WalletButton />
      {connected && <p>Wallet: {publicKey?.toString()}</p>}
    </div>
  );
}
```

## API Routes

### Authentication Endpoint

```tsx
// pages/api/auth/wallet.ts (Pages Router)
// or app/api/auth/wallet/route.ts (App Router)

import { verifyWalletSignature } from '@openlink/nextjs/server';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { publicKey, signature, message } = req.body;

  const result = await verifyWalletSignature({
    publicKey,
    signature,
    message
  });

  if (result.valid) {
    // Store in session or create JWT token
    req.session.publicKey = result.publicKey;
    await req.session.save();

    return res.json({ success: true });
  }

  return res.status(401).json({ error: result.error });
}
```

### App Router API Route

```tsx
// app/api/auth/wallet/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyWalletSignature } from '@openlink/nextjs/server';

export async function POST(request: NextRequest) {
  const { publicKey, signature, message } = await request.json();

  const result = await verifyWalletSignature({
    publicKey,
    signature,
    message
  });

  if (result.valid) {
    // Create session or JWT
    return NextResponse.json({ success: true, publicKey: result.publicKey });
  }

  return NextResponse.json(
    { error: result.error },
    { status: 401 }
  );
}
```

## Middleware

Protect routes with wallet authentication:

```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyWalletSignature } from '@openlink/nextjs/server';

export async function middleware(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader?.startsWith('Wallet ')) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const [publicKey, signature, message] = authHeader.slice(7).split(':');

  const result = await verifyWalletSignature({
    publicKey,
    signature,
    message: decodeURIComponent(message)
  });

  if (!result.valid) {
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 401 }
    );
  }

  // Add publicKey to request headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-wallet-public-key', result.publicKey!);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: '/api/protected/:path*',
};
```

## Full Example: Protected Dashboard

```tsx
// app/dashboard/page.tsx
'use client';

import { useWallet, useSignMessage } from '@openlink/nextjs';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { connected, publicKey } = useWallet();
  const { signMessage } = useSignMessage();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (connected) {
      fetchProtectedData();
    }
  }, [connected]);

  const fetchProtectedData = async () => {
    const { signature, message } = await signMessage();

    const response = await fetch('/api/protected/data', {
      headers: {
        Authorization: `Wallet ${publicKey}:${signature}:${encodeURIComponent(message)}`
      }
    });

    const data = await response.json();
    setData(data);
  };

  if (!connected) {
    return <div>Please connect your wallet</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Wallet: {publicKey?.toString()}</p>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
```

## Server Components

While wallet connection must happen on the client, you can use server components for layouts:

```tsx
// app/dashboard/layout.tsx
import { WalletButton } from '@openlink/nextjs';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header>
        <nav>
          <WalletButton />
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
```

## TypeScript Support

All exports are fully typed for both App Router and Pages Router.

## License

MIT


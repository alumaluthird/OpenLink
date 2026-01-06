# OpenLink Examples

This directory contains examples demonstrating how to use OpenLink in different scenarios.

## Available Examples

### 1. React Example

**Location:** `react-example/`

A simple React application using Vite demonstrating:
- Wallet connection with `useWallet` hook
- Balance display with `useWalletBalance` hook
- Message signing with `useSignMessage` hook
- Authentication with backend

**Run:**
```bash
cd react-example
npm install
npm run dev
```

### 2. Vanilla JavaScript Example

**Location:** `vanilla-example/`

A pure HTML/JavaScript example demonstrating:
- CDN usage of OpenLink
- Wallet connection without any framework
- UI components creation
- Works with any legacy website

**Run:**
```bash
cd vanilla-example
# Open index.html in browser or use a simple server:
python -m http.server 8080
# Visit http://localhost:8080
```

### 3. Server Example

**Location:** `server-example/`

An Express.js server demonstrating:
- Wallet signature verification
- Session management
- User linking
- Protected routes
- Authentication middleware

**Run:**
```bash
cd server-example
npm install
npm run dev
```

### 4. Next.js Example

**Location:** `nextjs-example/`

A Next.js App Router application demonstrating:
- Client-side wallet connection
- Server-side signature verification
- API routes with wallet auth
- App Router integration

**Run:**
```bash
cd nextjs-example
npm install
npm run dev
```

## Full Stack Setup

To see the complete integration:

1. **Start the backend:**
```bash
cd server-example
npm install
npm run dev
# Server runs on http://localhost:3000
```

2. **Start a frontend (choose one):**

**React:**
```bash
cd react-example
npm install
npm run dev
# App runs on http://localhost:5173
```

**Next.js:**
```bash
cd nextjs-example
npm install
npm run dev
# App runs on http://localhost:3000 (will conflict with server, change port)
```

**Vanilla:**
```bash
cd vanilla-example
# Open index.html in browser
```

3. **Test the flow:**
   - Click "Connect Wallet"
   - Select a wallet (Phantom recommended for devnet)
   - Click "Authenticate"
   - Check server logs to see the authentication process

## Common Scenarios

### Scenario 1: Add Wallet Auth to Existing App

See `react-example/` - shows how to wrap an existing app with `OpenLinkProvider` and add wallet functionality.

### Scenario 2: Legacy Website Integration

See `vanilla-example/` - demonstrates adding wallet functionality to any website without build tools.

### Scenario 3: Backend Integration

See `server-example/` - shows how to verify signatures, manage sessions, and link wallets to existing users.

### Scenario 4: Next.js Full Stack

See `nextjs-example/` - demonstrates both client and server integration in Next.js.

## Database Examples

### PostgreSQL with Prisma

```bash
# Generate migration
npx openlink-db migrate prisma --output ./prisma/migrations

# Apply migration
npx prisma migrate dev --name add_wallet_fields

# Use in code
import { PrismaAdapter } from '@openlink/db';
import { UserLinkingManager } from '@openlink/server';

const adapter = new PrismaAdapter(prisma);
const userLinking = new UserLinkingManager(adapter);
```

### MongoDB

```bash
# Generate migration
npx openlink-db migrate mongodb --output ./migrations

# Apply
mongosh mydb < migrations/[timestamp]_migration.js

# Use in code
import { MongoDBAdapter } from '@openlink/db';

const adapter = new MongoDBAdapter(db.collection('users'));
const userLinking = new UserLinkingManager(adapter);
```

## Testing

All examples are configured for **devnet** by default. To use mainnet:

1. Change `network` prop to `'mainnet-beta'`
2. Ensure you have real SOL for transactions
3. Update RPC endpoints if using custom ones

## Troubleshooting

### Wallet not connecting
- Make sure you have a Solana wallet installed (Phantom, Solflare, etc.)
- Check browser console for errors
- Verify you're on the correct network (devnet/mainnet)

### CORS errors
- Backend server includes CORS middleware
- If using different ports, update CORS settings in `server-example/index.ts`

### Signature verification fails
- Check that clocks are synchronized (timestamp validation)
- Verify the message format is correct
- Ensure you're using the same network on client and server

## Additional Resources

- [OpenLink Documentation](../README.md)
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)

## Contributing

Feel free to submit additional examples! See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.


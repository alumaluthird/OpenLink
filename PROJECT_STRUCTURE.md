# OpenLink Project Structure

This document explains the organization of the OpenLink SDK monorepo.

## Directory Structure

```
openlink/
├── packages/               # SDK packages
│   ├── core/              # Core Solana wallet integration
│   ├── react/             # React hooks and components
│   ├── nextjs/            # Next.js integration
│   ├── vanilla/           # Vanilla JavaScript
│   ├── server/            # Server-side utilities
│   └── db/                # Database migration tools
├── examples/              # Example applications
│   ├── react-example/     # React + Vite example
│   ├── nextjs-example/    # Next.js App Router example
│   ├── vanilla-example/   # Pure HTML/JS example
│   └── server-example/    # Express server example
├── docs/                  # Documentation
│   ├── getting-started.md
│   ├── concepts.md
│   ├── api.md
│   └── migration-guide.md
├── README.md              # Main documentation
├── CONTRIBUTING.md        # Contribution guidelines
├── LICENSE                # MIT License
└── package.json           # Workspace configuration
```

## Packages

### @openlink/core

**Purpose:** Core SDK with Solana wallet integration

**Exports:**
- `WalletManager` - Main wallet management class
- `verifySignature` - Signature verification
- `generateSignatureMessage` - Message generation
- Utility functions

**Dependencies:**
- `@solana/web3.js`
- `@solana/wallet-adapter-base`
- `@solana/wallet-adapter-wallets`
- `bs58`
- `tweetnacl`

### @openlink/react

**Purpose:** React hooks and components

**Exports:**
- `OpenLinkProvider` - Context provider
- `useWallet` - Main wallet hook
- `useSignMessage` - Message signing hook
- `useWalletBalance` - Balance fetching hook
- `WalletButton` - Pre-styled button component
- `WalletModal` - Wallet selection modal

**Dependencies:**
- `@openlink/core`
- `react` (peer)
- `react-dom` (peer)

### @openlink/nextjs

**Purpose:** Next.js integration (App Router & Pages Router)

**Exports:**
- All React exports
- `verifyWalletSignature` (server)
- `createWalletAuthMiddleware` (server)

**Dependencies:**
- `@openlink/core`
- `@openlink/react`
- `next` (peer)

### @openlink/vanilla

**Purpose:** Vanilla JavaScript for any website

**Exports:**
- `OpenLink` - Main class
- `createWalletButton` - Create button element
- `createWalletModal` - Create modal element

**Distribution:**
- NPM package
- CDN via unpkg/jsdelivr
- IIFE bundle for `<script>` tags

### @openlink/server

**Purpose:** Server-side authentication and utilities

**Exports:**
- `verifyWalletSignature` - Verify signatures
- `SessionManager` - Session management
- `UserLinkingManager` - User linking
- `createWalletAuthMiddleware` - Express middleware

**Store Implementations:**
- `MemorySessionStore` - In-memory sessions (dev)
- `MemoryUserStore` - In-memory users (dev)

### @openlink/db

**Purpose:** Database migration and integration

**Exports:**
- `createMigration` - Generate migrations
- `PrismaAdapter` - Prisma integration
- `MongoDBAdapter` - MongoDB integration
- `SQLAdapter` - SQL base class

**CLI:**
- `openlink-db migrate` - Generate migrations

**Supported Databases:**
- PostgreSQL
- MySQL
- SQLite
- MongoDB
- Prisma

## Examples

### react-example

Simple React app using Vite demonstrating:
- Wallet connection
- Balance display
- Message signing
- Backend authentication

**Tech Stack:**
- React 18
- Vite
- @openlink/react

### nextjs-example

Next.js App Router application demonstrating:
- Client components
- Server actions
- API routes
- Wallet authentication

**Tech Stack:**
- Next.js 14
- React 18
- @openlink/nextjs

### vanilla-example

Pure HTML/JavaScript example demonstrating:
- CDN usage
- No build tools
- Legacy browser support
- Simple integration

**Tech Stack:**
- HTML5
- Vanilla JavaScript
- @openlink/vanilla (CDN)

### server-example

Express server demonstrating:
- Signature verification
- Session management
- User linking
- Protected routes
- Middleware

**Tech Stack:**
- Express
- TypeScript
- @openlink/server

## Documentation

### getting-started.md

Quick start guide covering:
- Installation
- Basic setup
- Authentication flow
- Common use cases

### concepts.md

Core concepts explaining:
- Architecture
- Authentication flow
- Security
- Database strategies
- Best practices

### api.md

Complete API reference for:
- All packages
- All methods
- All types
- All components

### migration-guide.md

Migration guide for:
- Email/password apps
- OAuth apps
- Session-based apps
- JWT apps
- Legacy apps

## Development

### Building

```bash
# Build all packages
npm run build

# Build specific package
cd packages/core
npm run build
```

### Development Mode

```bash
# Watch all packages
npm run dev

# Watch specific package
cd packages/react
npm run dev
```

### Testing

```bash
# Test all packages
npm test

# Test specific package
cd packages/server
npm test
```

## Publishing

### Version Update

```bash
# Update version in all package.json files
# packages/core/package.json
# packages/react/package.json
# etc.
```

### Build

```bash
npm run build
```

### Publish

```bash
# Publish each package
cd packages/core && npm publish
cd packages/react && npm publish
cd packages/nextjs && npm publish
cd packages/vanilla && npm publish
cd packages/server && npm publish
cd packages/db && npm publish
```

## Dependencies

### Shared Dependencies

- TypeScript 5.3+
- Node.js 18+

### Build Tools

- tsup - TypeScript bundler
- Vite - Frontend build tool (examples)

### Solana

- @solana/web3.js - Solana JavaScript SDK
- @solana/wallet-adapter-* - Wallet adapters

### Utilities

- bs58 - Base58 encoding
- tweetnacl - Cryptography

## Configuration Files

### Root Level

- `package.json` - Workspace configuration
- `tsconfig.json` - Base TypeScript config
- `.gitignore` - Git ignore rules
- `.npmignore` - NPM publish ignore
- `.eslintrc.json` - ESLint configuration
- `.prettierrc` - Prettier configuration

### Package Level

Each package has:
- `package.json` - Package metadata
- `tsconfig.json` - TypeScript config (extends root)
- `README.md` - Package documentation

## Contribution Workflow

1. Fork repository
2. Create feature branch
3. Make changes
4. Run tests
5. Build packages
6. Create pull request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/openlink/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/openlink/discussions)
- **Discord:** [Community Server](https://discord.gg/openlink)

## License

MIT License - see [LICENSE](./LICENSE) file.

---

**Note:** This is a monorepo using npm workspaces. All packages are published independently but developed together.


# @openlink/db

Database migration and integration utilities for OpenLink - easily add wallet authentication to your existing database.

## Installation

```bash
npm install @openlink/db
```

## Features

- Generate migrations for multiple databases
- Support for extend (add columns) or separate table strategies
- Database adapters for popular ORMs
- CLI tool for quick migration generation
- Support for: PostgreSQL, MySQL, SQLite, MongoDB, Prisma

## Quick Start

### CLI Usage

```bash
# Generate PostgreSQL migration
npx openlink-db migrate postgres

# Generate with custom table name
npx openlink-db migrate postgres --table accounts

# Use separate table strategy
npx openlink-db migrate mysql --strategy separate

# Custom output directory
npx openlink-db migrate mongodb --output ./db/migrations
```

### Programmatic Usage

```typescript
import { createMigration } from '@openlink/db';

const migration = createMigration({
  dialect: 'postgres',
  userTable: 'users',
  strategy: 'extend' // or 'separate'
});

console.log(migration.sql);
console.log(migration.rollback);
```

## Migration Strategies

### Extend Strategy (Recommended)

Adds wallet columns to your existing user table:

```sql
ALTER TABLE users
  ADD COLUMN wallet_public_key VARCHAR(44) UNIQUE,
  ADD COLUMN wallet_connected_at TIMESTAMP;
```

**Pros:**
- Simpler queries
- One-to-one relationship
- Easier to implement

**Cons:**
- Modifies existing table
- All users must have nullable wallet fields

### Separate Strategy

Creates a separate `wallet_connections` table:

```sql
CREATE TABLE wallet_connections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  wallet_public_key VARCHAR(44) UNIQUE,
  connected_at TIMESTAMP
);
```

**Pros:**
- Doesn't modify existing table
- More flexible (could support multiple wallets per user)
- Cleaner separation of concerns

**Cons:**
- Requires JOIN queries
- Additional table to manage

## Database Support

### PostgreSQL

```bash
npx openlink-db migrate postgres
```

Generates SQL with:
- `ALTER TABLE` for extend strategy
- `CREATE TABLE` for separate strategy
- Proper indexes and constraints
- Rollback SQL

### MySQL

```bash
npx openlink-db migrate mysql
```

Compatible with MySQL 5.7+ and MariaDB.

### SQLite

```bash
npx openlink-db migrate sqlite
```

Note: SQLite has limited `ALTER TABLE` support for rollbacks.

### MongoDB

```bash
npx openlink-db migrate mongodb
```

Generates JavaScript for MongoDB shell:

```javascript
// Extend strategy
db.users.updateMany(
  { walletPublicKey: { $exists: false } },
  { $set: { walletPublicKey: null, walletConnectedAt: null } }
);

db.users.createIndex({ walletPublicKey: 1 }, { unique: true, sparse: true });
```

### Prisma

```bash
npx openlink-db migrate prisma
```

Generates Prisma schema updates:

```prisma
model User {
  // ... existing fields
  walletPublicKey   String?   @unique @db.VarChar(44)
  walletConnectedAt DateTime?
}
```

Then run:
```bash
npx prisma migrate dev --name add_wallet_fields
```

## Database Adapters

Use pre-built adapters with `@openlink/server`:

### Prisma

```typescript
import { PrismaAdapter } from '@openlink/db';
import { UserLinkingManager } from '@openlink/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const adapter = new PrismaAdapter(prisma);
const userLinking = new UserLinkingManager(adapter);

// Now use userLinking as normal
const user = await userLinking.linkOrCreateUser({
  publicKey: '7xKx...'
});
```

### MongoDB

```typescript
import { MongoDBAdapter } from '@openlink/db';
import { UserLinkingManager } from '@openlink/server';
import { MongoClient } from 'mongodb';

const client = new MongoClient('mongodb://localhost:27017');
await client.connect();
const collection = client.db('myapp').collection('users');

const adapter = new MongoDBAdapter(collection);
const userLinking = new UserLinkingManager(adapter);
```

### Custom SQL Databases

Extend `SQLAdapter` for other SQL databases:

```typescript
import { SQLAdapter } from '@openlink/db';
import pg from 'pg';

class PostgresAdapter extends SQLAdapter {
  constructor(private pool: pg.Pool, tableName = 'users') {
    super(tableName);
  }

  async query(sql: string, params: any[]) {
    const result = await this.pool.query(sql, params);
    return result.rows;
  }

  async execute(sql: string, params: any[]) {
    await this.pool.query(sql, params);
  }
}

// Usage
const pool = new pg.Pool({ connectionString: '...' });
const adapter = new PostgresAdapter(pool);
```

## Custom Adapters

Implement the `UserStore` interface:

```typescript
import { UserStore, UserRecord } from '@openlink/server';

class CustomAdapter implements UserStore {
  async findByPublicKey(publicKey: string): Promise<UserRecord | null> {
    // Your implementation
  }

  async findByUserId(userId: string): Promise<UserRecord | null> {
    // Your implementation
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    // Your implementation
  }

  async create(data: Partial<UserRecord>): Promise<UserRecord> {
    // Your implementation
  }

  async update(userId: string, data: Partial<UserRecord>): Promise<UserRecord> {
    // Your implementation
  }
}
```

## Migration Examples

### Example 1: Adding to Existing Users Table (PostgreSQL)

```sql
-- Generated migration
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS wallet_public_key VARCHAR(44) UNIQUE,
  ADD COLUMN IF NOT EXISTS wallet_connected_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_users_wallet_public_key 
  ON users(wallet_public_key);
```

Apply:
```bash
psql -d mydb -f migrations/2024-01-01_migration.sql
```

### Example 2: Separate Table (MySQL)

```sql
CREATE TABLE IF NOT EXISTS wallet_connections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  wallet_public_key VARCHAR(44) NOT NULL UNIQUE,
  connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

Apply:
```bash
mysql -u root -p mydb < migrations/2024-01-01_migration.sql
```

### Example 3: MongoDB

```javascript
// Add wallet fields to existing documents
db.users.updateMany(
  { walletPublicKey: { $exists: false } },
  { $set: { walletPublicKey: null, walletConnectedAt: null } }
);

// Create index
db.users.createIndex({ walletPublicKey: 1 }, { unique: true, sparse: true });
```

Apply:
```bash
mongosh mydb < migrations/2024-01-01_migration.js
```

## Best Practices

1. **Backup First**: Always backup your database before running migrations
2. **Test in Dev**: Test migrations in development environment first
3. **Review SQL**: Review generated SQL before applying
4. **Use Transactions**: Wrap migrations in transactions when possible
5. **Keep Rollbacks**: Save rollback scripts for emergency recovery

## Integration with ORMs

### Sequelize

```typescript
import { Sequelize, DataTypes, Model } from 'sequelize';

interface UserAttributes {
  id: number;
  email?: string;
  walletPublicKey?: string;
  walletConnectedAt?: Date;
}

class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public email?: string;
  public walletPublicKey?: string;
  public walletConnectedAt?: Date;
}

User.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: DataTypes.STRING,
  walletPublicKey: { type: DataTypes.STRING(44), unique: true },
  walletConnectedAt: DataTypes.DATE
}, { sequelize, modelName: 'User' });
```

### TypeORM

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  email?: string;

  @Column({ length: 44, unique: true, nullable: true })
  walletPublicKey?: string;

  @Column({ type: 'timestamp', nullable: true })
  walletConnectedAt?: Date;
}
```

## Troubleshooting

### Unique Constraint Violations

If you have existing NULL values causing unique constraint issues:

```sql
-- PostgreSQL: Use partial index
CREATE UNIQUE INDEX idx_users_wallet_public_key 
  ON users(wallet_public_key) 
  WHERE wallet_public_key IS NOT NULL;
```

### MongoDB Index Issues

If index creation fails due to duplicates:

```javascript
// Use sparse index
db.users.createIndex(
  { walletPublicKey: 1 }, 
  { unique: true, sparse: true }
);
```

## CLI Reference

```
openlink-db migrate <dialect> [options]

Arguments:
  dialect              Database dialect (postgres, mysql, sqlite, mongodb, prisma)

Options:
  --table <name>       Table/collection name (default: users)
  --strategy <type>    Migration strategy: extend | separate (default: extend)
  --output <dir>       Output directory (default: ./migrations)
  
Examples:
  openlink-db migrate postgres
  openlink-db migrate mysql --table accounts
  openlink-db migrate mongodb --strategy separate
```

## License

MIT


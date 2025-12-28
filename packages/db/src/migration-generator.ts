export type DatabaseDialect = 'postgres' | 'mysql' | 'sqlite' | 'mongodb' | 'prisma';
export type MigrationStrategy = 'extend' | 'separate';

export interface MigrationOptions {
  dialect: DatabaseDialect;
  userTable?: string;
  strategy?: MigrationStrategy;
  customFields?: Record<string, string>;
}

export interface Migration {
  sql?: string;
  rollback?: string;
  mongodb?: string;
  prisma?: string;
  instructions: string;
}

/**
 * Generate database migration for wallet integration
 */
export function createMigration(options: MigrationOptions): Migration {
  const {
    dialect,
    userTable = 'users',
    strategy = 'extend',
    customFields = {}
  } = options;

  switch (dialect) {
    case 'postgres':
      return generatePostgresMigration(userTable, strategy, customFields);
    case 'mysql':
      return generateMySQLMigration(userTable, strategy, customFields);
    case 'sqlite':
      return generateSQLiteMigration(userTable, strategy, customFields);
    case 'mongodb':
      return generateMongoDBMigration(userTable, strategy, customFields);
    case 'prisma':
      return generatePrismaMigration(userTable, strategy, customFields);
    default:
      throw new Error(`Unsupported dialect: ${dialect}`);
  }
}

function generatePostgresMigration(
  tableName: string,
  strategy: MigrationStrategy,
  customFields: Record<string, string>
): Migration {
  if (strategy === 'extend') {
    const fields = [
      'wallet_public_key VARCHAR(44) UNIQUE',
      'wallet_connected_at TIMESTAMP',
      ...Object.entries(customFields).map(([k, v]) => `${k} ${v}`)
    ];

    const sql = `
-- Add wallet fields to existing ${tableName} table
ALTER TABLE ${tableName}
  ADD COLUMN IF NOT EXISTS wallet_public_key VARCHAR(44) UNIQUE,
  ADD COLUMN IF NOT EXISTS wallet_connected_at TIMESTAMP;

-- Create index on wallet_public_key for faster lookups
CREATE INDEX IF NOT EXISTS idx_${tableName}_wallet_public_key 
  ON ${tableName}(wallet_public_key);

-- Add comment
COMMENT ON COLUMN ${tableName}.wallet_public_key IS 'Solana wallet public key';
`.trim();

    const rollback = `
-- Remove wallet fields from ${tableName} table
ALTER TABLE ${tableName}
  DROP COLUMN IF EXISTS wallet_public_key,
  DROP COLUMN IF EXISTS wallet_connected_at;

DROP INDEX IF EXISTS idx_${tableName}_wallet_public_key;
`.trim();

    return {
      sql,
      rollback,
      instructions: `
Run the migration:
  psql -d your_database -f migration.sql

Rollback:
  psql -d your_database -f rollback.sql
      `.trim()
    };
  } else {
    const sql = `
-- Create separate wallet_connections table
CREATE TABLE IF NOT EXISTS wallet_connections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES ${tableName}(id) ON DELETE CASCADE,
  wallet_public_key VARCHAR(44) NOT NULL UNIQUE,
  connected_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB,
  CONSTRAINT unique_user_wallet UNIQUE(user_id)
);

CREATE INDEX idx_wallet_connections_public_key ON wallet_connections(wallet_public_key);
CREATE INDEX idx_wallet_connections_user_id ON wallet_connections(user_id);
`.trim();

    const rollback = `DROP TABLE IF EXISTS wallet_connections;`;

    return { sql, rollback, instructions: 'Run migration.sql' };
  }
}

function generateMySQLMigration(
  tableName: string,
  strategy: MigrationStrategy,
  customFields: Record<string, string>
): Migration {
  if (strategy === 'extend') {
    const sql = `
-- Add wallet fields to existing ${tableName} table
ALTER TABLE ${tableName}
  ADD COLUMN wallet_public_key VARCHAR(44) UNIQUE,
  ADD COLUMN wallet_connected_at TIMESTAMP NULL;

-- Create index
CREATE INDEX idx_${tableName}_wallet_public_key 
  ON ${tableName}(wallet_public_key);
`.trim();

    const rollback = `
ALTER TABLE ${tableName}
  DROP COLUMN wallet_public_key,
  DROP COLUMN wallet_connected_at;

DROP INDEX idx_${tableName}_wallet_public_key ON ${tableName};
`.trim();

    return { sql, rollback, instructions: 'Run migration.sql with mysql' };
  } else {
    const sql = `
CREATE TABLE IF NOT EXISTS wallet_connections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  wallet_public_key VARCHAR(44) NOT NULL UNIQUE,
  connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSON,
  FOREIGN KEY (user_id) REFERENCES ${tableName}(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_wallet (user_id)
);

CREATE INDEX idx_wallet_public_key ON wallet_connections(wallet_public_key);
`.trim();

    const rollback = `DROP TABLE IF EXISTS wallet_connections;`;

    return { sql, rollback, instructions: 'Run migration.sql' };
  }
}

function generateSQLiteMigration(
  tableName: string,
  strategy: MigrationStrategy,
  customFields: Record<string, string>
): Migration {
  if (strategy === 'extend') {
    const sql = `
-- Add wallet fields to existing ${tableName} table
ALTER TABLE ${tableName} ADD COLUMN wallet_public_key TEXT UNIQUE;
ALTER TABLE ${tableName} ADD COLUMN wallet_connected_at INTEGER;

-- Create index
CREATE INDEX idx_${tableName}_wallet_public_key ON ${tableName}(wallet_public_key);
`.trim();

    const rollback = `
-- SQLite doesn't support DROP COLUMN directly
-- You'll need to recreate the table without these columns
`.trim();

    return { sql, rollback, instructions: 'Run with sqlite3' };
  } else {
    const sql = `
CREATE TABLE IF NOT EXISTS wallet_connections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  wallet_public_key TEXT NOT NULL UNIQUE,
  connected_at INTEGER,
  metadata TEXT,
  FOREIGN KEY (user_id) REFERENCES ${tableName}(id) ON DELETE CASCADE
);

CREATE INDEX idx_wallet_public_key ON wallet_connections(wallet_public_key);
`.trim();

    const rollback = `DROP TABLE IF EXISTS wallet_connections;`;

    return { sql, rollback, instructions: 'Run migration.sql' };
  }
}

function generateMongoDBMigration(
  collectionName: string,
  strategy: MigrationStrategy,
  customFields: Record<string, string>
): Migration {
  if (strategy === 'extend') {
    const mongodb = `
// Add wallet fields to existing documents
db.${collectionName}.updateMany(
  { walletPublicKey: { $exists: false } },
  {
    $set: {
      walletPublicKey: null,
      walletConnectedAt: null
    }
  }
);

// Create unique index on walletPublicKey
db.${collectionName}.createIndex(
  { walletPublicKey: 1 },
  { unique: true, sparse: true }
);
`.trim();

    return {
      mongodb,
      instructions: `
Run in MongoDB shell:
  mongosh your_database < migration.js

Or programmatically with your MongoDB driver.
      `.trim()
    };
  } else {
    const mongodb = `
// Create wallet_connections collection
db.createCollection('wallet_connections');

// Create indexes
db.wallet_connections.createIndex({ walletPublicKey: 1 }, { unique: true });
db.wallet_connections.createIndex({ userId: 1 }, { unique: true });

// Example document structure:
// {
//   userId: ObjectId("..."),
//   walletPublicKey: "7xKx...",
//   connectedAt: ISODate("..."),
//   metadata: {}
// }
`.trim();

    return { mongodb, instructions: 'Run migration.js' };
  }
}

function generatePrismaMigration(
  modelName: string,
  strategy: MigrationStrategy,
  customFields: Record<string, string>
): Migration {
  if (strategy === 'extend') {
    const prisma = `
// Add to your schema.prisma
model ${modelName.charAt(0).toUpperCase() + modelName.slice(1)} {
  // ... existing fields
  
  walletPublicKey   String?   @unique @db.VarChar(44)
  walletConnectedAt DateTime?
  
  @@index([walletPublicKey])
}
`.trim();

    return {
      prisma,
      instructions: `
1. Add the fields to your schema.prisma
2. Run: npx prisma migrate dev --name add_wallet_fields
3. Run: npx prisma generate
      `.trim()
    };
  } else {
    const prisma = `
// Add to your schema.prisma
model WalletConnection {
  id               Int       @id @default(autoincrement())
  userId           Int       @unique
  user             ${modelName.charAt(0).toUpperCase() + modelName.slice(1)} @relation(fields: [userId], references: [id], onDelete: Cascade)
  walletPublicKey  String    @unique @db.VarChar(44)
  connectedAt      DateTime  @default(now())
  metadata         Json?
  
  @@index([walletPublicKey])
}

// Add to your User model:
model ${modelName.charAt(0).toUpperCase() + modelName.slice(1)} {
  // ... existing fields
  walletConnection WalletConnection?
}
`.trim();

    return {
      prisma,
      instructions: `
1. Add the models to your schema.prisma
2. Run: npx prisma migrate dev --name add_wallet_connections
3. Run: npx prisma generate
      `.trim()
    };
  }
}


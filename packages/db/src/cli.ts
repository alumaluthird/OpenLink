#!/usr/bin/env node

import { createMigration, DatabaseDialect, MigrationStrategy } from './migration-generator';
import * as fs from 'fs';
import * as path from 'path';

function printUsage() {
  console.log(`
OpenLink Database Migration Generator

Usage:
  openlink-db migrate <dialect> [options]

Dialects:
  postgres, mysql, sqlite, mongodb, prisma

Options:
  --table <name>       Table/collection name (default: users)
  --strategy <type>    Migration strategy: extend | separate (default: extend)
  --output <dir>       Output directory (default: ./migrations)

Examples:
  openlink-db migrate postgres
  openlink-db migrate postgres --table accounts --strategy separate
  openlink-db migrate mongodb --output ./db/migrations
  openlink-db migrate prisma --strategy extend
  `);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === 'help' || args[0] === '--help') {
    printUsage();
    process.exit(0);
  }

  if (args[0] !== 'migrate') {
    console.error('Error: Unknown command. Use "migrate"');
    printUsage();
    process.exit(1);
  }

  const dialect = args[1] as DatabaseDialect;
  if (!dialect) {
    console.error('Error: Dialect required');
    printUsage();
    process.exit(1);
  }

  const validDialects = ['postgres', 'mysql', 'sqlite', 'mongodb', 'prisma'];
  if (!validDialects.includes(dialect)) {
    console.error(`Error: Invalid dialect. Must be one of: ${validDialects.join(', ')}`);
    process.exit(1);
  }

  // Parse options
  let tableName = 'users';
  let strategy: MigrationStrategy = 'extend';
  let outputDir = './migrations';

  for (let i = 2; i < args.length; i += 2) {
    const option = args[i];
    const value = args[i + 1];

    switch (option) {
      case '--table':
        tableName = value;
        break;
      case '--strategy':
        if (value !== 'extend' && value !== 'separate') {
          console.error('Error: Strategy must be "extend" or "separate"');
          process.exit(1);
        }
        strategy = value as MigrationStrategy;
        break;
      case '--output':
        outputDir = value;
        break;
      default:
        console.error(`Error: Unknown option ${option}`);
        printUsage();
        process.exit(1);
    }
  }

  try {
    // Generate migration
    const migration = createMigration({
      dialect,
      userTable: tableName,
      strategy
    });

    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const prefix = `${timestamp}_openlink_wallet_${strategy}`;

    // Write migration files
    if (migration.sql) {
      const migrationFile = path.join(outputDir, `${prefix}.sql`);
      fs.writeFileSync(migrationFile, migration.sql);
      console.log(`✓ Created migration: ${migrationFile}`);

      if (migration.rollback) {
        const rollbackFile = path.join(outputDir, `${prefix}_rollback.sql`);
        fs.writeFileSync(rollbackFile, migration.rollback);
        console.log(`✓ Created rollback: ${rollbackFile}`);
      }
    }

    if (migration.mongodb) {
      const migrationFile = path.join(outputDir, `${prefix}.js`);
      fs.writeFileSync(migrationFile, migration.mongodb);
      console.log(`✓ Created migration: ${migrationFile}`);
    }

    if (migration.prisma) {
      const schemaFile = path.join(outputDir, `${prefix}_schema.txt`);
      fs.writeFileSync(schemaFile, migration.prisma);
      console.log(`✓ Created schema update: ${schemaFile}`);
    }

    // Write instructions
    const instructionsFile = path.join(outputDir, `${prefix}_INSTRUCTIONS.txt`);
    fs.writeFileSync(instructionsFile, migration.instructions);
    console.log(`✓ Created instructions: ${instructionsFile}`);

    console.log('\n' + migration.instructions);
    console.log('\n✓ Migration files generated successfully!');

  } catch (error) {
    console.error('Error generating migration:', error);
    process.exit(1);
  }
}

main();


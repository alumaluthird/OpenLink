export { createMigration } from './migration-generator';
export type { 
  DatabaseDialect, 
  MigrationStrategy, 
  MigrationOptions, 
  Migration 
} from './migration-generator';

export { SQLAdapter, PrismaAdapter, MongoDBAdapter } from './adapters';


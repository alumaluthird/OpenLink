/**
 * Database adapters for common ORMs and drivers
 */

import { UserStore, UserRecord } from '@openlink/server';

/**
 * Generic SQL adapter base class
 */
export abstract class SQLAdapter implements UserStore {
  constructor(protected tableName: string = 'users') {}

  abstract query(sql: string, params: any[]): Promise<any[]>;
  abstract execute(sql: string, params: any[]): Promise<any>;

  async findByPublicKey(publicKey: string): Promise<UserRecord | null> {
    const rows = await this.query(
      `SELECT * FROM ${this.tableName} WHERE wallet_public_key = $1`,
      [publicKey]
    );
    return rows[0] ? this.mapRow(rows[0]) : null;
  }

  async findByUserId(userId: string): Promise<UserRecord | null> {
    const rows = await this.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [userId]
    );
    return rows[0] ? this.mapRow(rows[0]) : null;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const rows = await this.query(
      `SELECT * FROM ${this.tableName} WHERE email = $1`,
      [email]
    );
    return rows[0] ? this.mapRow(rows[0]) : null;
  }

  async create(data: Partial<UserRecord>): Promise<UserRecord> {
    const fields = ['wallet_public_key', 'email', 'wallet_connected_at'];
    const values = [data.walletPublicKey, data.email, data.walletConnectedAt || Date.now()];
    
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const rows = await this.query(
      `INSERT INTO ${this.tableName} (${fields.join(', ')}) 
       VALUES (${placeholders}) 
       RETURNING *`,
      values
    );
    
    return this.mapRow(rows[0]);
  }

  async update(userId: string, data: Partial<UserRecord>): Promise<UserRecord> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.walletPublicKey !== undefined) {
      updates.push(`wallet_public_key = $${paramIndex++}`);
      values.push(data.walletPublicKey);
    }
    if (data.email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(data.email);
    }
    if (data.walletConnectedAt !== undefined) {
      updates.push(`wallet_connected_at = $${paramIndex++}`);
      values.push(data.walletConnectedAt);
    }

    values.push(userId);

    const rows = await this.query(
      `UPDATE ${this.tableName} 
       SET ${updates.join(', ')} 
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    return this.mapRow(rows[0]);
  }

  protected mapRow(row: any): UserRecord {
    return {
      id: row.id.toString(),
      walletPublicKey: row.wallet_public_key,
      email: row.email,
      walletConnectedAt: row.wallet_connected_at,
      metadata: row.metadata || {}
    };
  }
}

/**
 * Prisma adapter example
 */
export class PrismaAdapter implements UserStore {
  constructor(private prisma: any) {}

  async findByPublicKey(publicKey: string): Promise<UserRecord | null> {
    const user = await this.prisma.user.findUnique({
      where: { walletPublicKey: publicKey }
    });
    return user ? this.mapUser(user) : null;
  }

  async findByUserId(userId: string): Promise<UserRecord | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });
    return user ? this.mapUser(user) : null;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const user = await this.prisma.user.findUnique({
      where: { email }
    });
    return user ? this.mapUser(user) : null;
  }

  async create(data: Partial<UserRecord>): Promise<UserRecord> {
    const user = await this.prisma.user.create({
      data: {
        walletPublicKey: data.walletPublicKey,
        email: data.email,
        walletConnectedAt: data.walletConnectedAt ? new Date(data.walletConnectedAt) : new Date(),
        metadata: data.metadata
      }
    });
    return this.mapUser(user);
  }

  async update(userId: string, data: Partial<UserRecord>): Promise<UserRecord> {
    const user = await this.prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        walletPublicKey: data.walletPublicKey,
        email: data.email,
        walletConnectedAt: data.walletConnectedAt ? new Date(data.walletConnectedAt) : undefined
      }
    });
    return this.mapUser(user);
  }

  private mapUser(user: any): UserRecord {
    return {
      id: user.id.toString(),
      walletPublicKey: user.walletPublicKey,
      email: user.email,
      walletConnectedAt: user.walletConnectedAt?.getTime(),
      metadata: user.metadata || {}
    };
  }
}

/**
 * MongoDB adapter example
 */
export class MongoDBAdapter implements UserStore {
  constructor(private collection: any) {}

  async findByPublicKey(publicKey: string): Promise<UserRecord | null> {
    const user = await this.collection.findOne({ walletPublicKey: publicKey });
    return user ? this.mapDocument(user) : null;
  }

  async findByUserId(userId: string): Promise<UserRecord | null> {
    const ObjectId = (await import('mongodb')).ObjectId;
    const user = await this.collection.findOne({ _id: new ObjectId(userId) });
    return user ? this.mapDocument(user) : null;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const user = await this.collection.findOne({ email });
    return user ? this.mapDocument(user) : null;
  }

  async create(data: Partial<UserRecord>): Promise<UserRecord> {
    const doc = {
      walletPublicKey: data.walletPublicKey,
      email: data.email,
      walletConnectedAt: data.walletConnectedAt || Date.now(),
      metadata: data.metadata || {}
    };
    const result = await this.collection.insertOne(doc);
    return this.mapDocument({ _id: result.insertedId, ...doc });
  }

  async update(userId: string, data: Partial<UserRecord>): Promise<UserRecord> {
    const ObjectId = (await import('mongodb')).ObjectId;
    const updateDoc: any = {};
    
    if (data.walletPublicKey !== undefined) updateDoc.walletPublicKey = data.walletPublicKey;
    if (data.email !== undefined) updateDoc.email = data.email;
    if (data.walletConnectedAt !== undefined) updateDoc.walletConnectedAt = data.walletConnectedAt;
    if (data.metadata !== undefined) updateDoc.metadata = data.metadata;

    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateDoc },
      { returnDocument: 'after' }
    );

    return this.mapDocument(result.value);
  }

  private mapDocument(doc: any): UserRecord {
    return {
      id: doc._id.toString(),
      walletPublicKey: doc.walletPublicKey,
      email: doc.email,
      walletConnectedAt: doc.walletConnectedAt,
      metadata: doc.metadata || {}
    };
  }
}


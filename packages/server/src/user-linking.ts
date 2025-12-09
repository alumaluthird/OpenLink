/**
 * User linking utilities for connecting wallets to existing users
 */

export interface UserLinkOptions {
  publicKey: string;
  existingUserId?: string;
  email?: string;
  metadata?: Record<string, any>;
}

export interface UserRecord {
  id: string;
  walletPublicKey?: string;
  email?: string;
  walletConnectedAt?: number;
  metadata?: Record<string, any>;
}

export interface UserStore {
  findByPublicKey(publicKey: string): Promise<UserRecord | null>;
  findByUserId(userId: string): Promise<UserRecord | null>;
  findByEmail(email: string): Promise<UserRecord | null>;
  create(data: Partial<UserRecord>): Promise<UserRecord>;
  update(userId: string, data: Partial<UserRecord>): Promise<UserRecord>;
}

/**
 * User linking manager
 */
export class UserLinkingManager {
  constructor(private userStore: UserStore) {}

  /**
   * Link wallet to existing user or create new user
   */
  async linkOrCreateUser(options: UserLinkOptions): Promise<UserRecord> {
    const { publicKey, existingUserId, email, metadata } = options;

    // Check if wallet is already linked
    const existingWallet = await this.userStore.findByPublicKey(publicKey);
    if (existingWallet) {
      return existingWallet;
    }

    // If existing user ID provided, link wallet to that user
    if (existingUserId) {
      const user = await this.userStore.findByUserId(existingUserId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.walletPublicKey) {
        throw new Error('User already has a linked wallet');
      }

      return await this.userStore.update(existingUserId, {
        walletPublicKey: publicKey,
        walletConnectedAt: Date.now(),
        metadata: { ...user.metadata, ...metadata }
      });
    }

    // If email provided, check if user exists
    if (email) {
      const user = await this.userStore.findByEmail(email);
      if (user) {
        if (user.walletPublicKey) {
          throw new Error('Email already has a linked wallet');
        }

        return await this.userStore.update(user.id, {
          walletPublicKey: publicKey,
          walletConnectedAt: Date.now(),
          metadata: { ...user.metadata, ...metadata }
        });
      }
    }

    // Create new user
    return await this.userStore.create({
      walletPublicKey: publicKey,
      email,
      walletConnectedAt: Date.now(),
      metadata
    });
  }

  /**
   * Unlink wallet from user
   */
  async unlinkWallet(userId: string): Promise<UserRecord> {
    const user = await this.userStore.findByUserId(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return await this.userStore.update(userId, {
      walletPublicKey: undefined,
      walletConnectedAt: undefined
    });
  }

  /**
   * Get user by public key
   */
  async getUserByPublicKey(publicKey: string): Promise<UserRecord | null> {
    return await this.userStore.findByPublicKey(publicKey);
  }

  /**
   * Check if wallet is linked
   */
  async isWalletLinked(publicKey: string): Promise<boolean> {
    const user = await this.userStore.findByPublicKey(publicKey);
    return user !== null;
  }
}

/**
 * In-memory user store (for development/testing)
 */
export class MemoryUserStore implements UserStore {
  private users: Map<string, UserRecord> = new Map();
  private emailIndex: Map<string, string> = new Map();
  private walletIndex: Map<string, string> = new Map();
  private nextId = 1;

  async findByPublicKey(publicKey: string): Promise<UserRecord | null> {
    const userId = this.walletIndex.get(publicKey);
    if (!userId) return null;
    return this.users.get(userId) || null;
  }

  async findByUserId(userId: string): Promise<UserRecord | null> {
    return this.users.get(userId) || null;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const userId = this.emailIndex.get(email);
    if (!userId) return null;
    return this.users.get(userId) || null;
  }

  async create(data: Partial<UserRecord>): Promise<UserRecord> {
    const user: UserRecord = {
      id: data.id || String(this.nextId++),
      walletPublicKey: data.walletPublicKey,
      email: data.email,
      walletConnectedAt: data.walletConnectedAt,
      metadata: data.metadata || {}
    };

    this.users.set(user.id, user);

    if (user.email) {
      this.emailIndex.set(user.email, user.id);
    }

    if (user.walletPublicKey) {
      this.walletIndex.set(user.walletPublicKey, user.id);
    }

    return user;
  }

  async update(userId: string, data: Partial<UserRecord>): Promise<UserRecord> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Update indexes
    if (data.email && data.email !== user.email) {
      if (user.email) {
        this.emailIndex.delete(user.email);
      }
      this.emailIndex.set(data.email, userId);
    }

    if (data.walletPublicKey !== undefined) {
      if (user.walletPublicKey) {
        this.walletIndex.delete(user.walletPublicKey);
      }
      if (data.walletPublicKey) {
        this.walletIndex.set(data.walletPublicKey, userId);
      }
    }

    const updatedUser = { ...user, ...data };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
}


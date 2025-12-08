/**
 * Session management utilities
 */

export interface WalletSession {
  publicKey: string;
  userId?: string;
  createdAt: number;
  expiresAt?: number;
  metadata?: Record<string, any>;
}

export interface SessionStore {
  set(sessionId: string, data: WalletSession): Promise<void>;
  get(sessionId: string): Promise<WalletSession | null>;
  delete(sessionId: string): Promise<void>;
  cleanup(): Promise<void>;
}

/**
 * In-memory session store (for development)
 */
export class MemorySessionStore implements SessionStore {
  private sessions: Map<string, WalletSession> = new Map();

  async set(sessionId: string, data: WalletSession): Promise<void> {
    this.sessions.set(sessionId, data);
  }

  async get(sessionId: string): Promise<WalletSession | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // Check expiration
    if (session.expiresAt && session.expiresAt < Date.now()) {
      this.sessions.delete(sessionId);
      return null;
    }

    return session;
  }

  async delete(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  async cleanup(): Promise<void> {
    const now = Date.now();
    for (const [id, session] of this.sessions.entries()) {
      if (session.expiresAt && session.expiresAt < now) {
        this.sessions.delete(id);
      }
    }
  }
}

/**
 * Create a session ID
 */
export function generateSessionId(): string {
  return Array.from({ length: 32 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

/**
 * Session manager
 */
export class SessionManager {
  constructor(
    private store: SessionStore,
    private defaultTTL: number = 86400000 // 24 hours
  ) {
    // Run cleanup periodically
    setInterval(() => this.store.cleanup(), 3600000); // Every hour
  }

  async createSession(
    publicKey: string,
    options?: {
      userId?: string;
      ttl?: number;
      metadata?: Record<string, any>;
    }
  ): Promise<string> {
    const sessionId = generateSessionId();
    const ttl = options?.ttl || this.defaultTTL;

    const session: WalletSession = {
      publicKey,
      userId: options?.userId,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttl,
      metadata: options?.metadata
    };

    await this.store.set(sessionId, session);
    return sessionId;
  }

  async getSession(sessionId: string): Promise<WalletSession | null> {
    return await this.store.get(sessionId);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.store.delete(sessionId);
  }

  async refreshSession(sessionId: string, ttl?: number): Promise<boolean> {
    const session = await this.store.get(sessionId);
    if (!session) return false;

    session.expiresAt = Date.now() + (ttl || this.defaultTTL);
    await this.store.set(sessionId, session);
    return true;
  }
}


export { verifyWalletSignature, generateNonce, createChallenge } from './auth';
export type { VerifySignatureOptions, VerifySignatureResult } from './auth';

export { SessionManager, MemorySessionStore, generateSessionId } from './session';
export type { WalletSession, SessionStore } from './session';

export { UserLinkingManager, MemoryUserStore } from './user-linking';
export type { UserLinkOptions, UserRecord, UserStore } from './user-linking';

export { createWalletAuthMiddleware, createOptionalWalletAuthMiddleware } from './middleware';
export type { Request, Response, NextFunction, MiddlewareOptions } from './middleware';

// Re-export core utilities
export { verifySignature, isValidPublicKey, isMessageTimestampValid } from '@openlink/core';

/**
 * OpenLink Server - Main export
 */
export class OpenLinkServer {
  constructor(
    private config: {
      secretKey?: string;
      sessionTTL?: number;
    } = {}
  ) {}

  /**
   * Get configuration
   */
  getConfig() {
    return this.config;
  }
}


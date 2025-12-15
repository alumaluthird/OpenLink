import { verifySignature, isValidPublicKey, isMessageTimestampValid } from '@openlink/core';

/**
 * Server-side utilities for Next.js API routes and Server Actions
 */

export interface VerifyWalletSignatureParams {
  publicKey: string;
  signature: string;
  message: string;
  checkTimestamp?: boolean;
  maxAgeMs?: number;
}

export interface VerifyWalletSignatureResult {
  valid: boolean;
  publicKey?: string;
  error?: string;
}

/**
 * Verify wallet signature in API routes or Server Actions
 */
export async function verifyWalletSignature({
  publicKey,
  signature,
  message,
  checkTimestamp = true,
  maxAgeMs = 300000 // 5 minutes
}: VerifyWalletSignatureParams): Promise<VerifyWalletSignatureResult> {
  try {
    // Validate public key format
    if (!isValidPublicKey(publicKey)) {
      return {
        valid: false,
        error: 'Invalid public key format'
      };
    }

    // Check message timestamp if required
    if (checkTimestamp && !isMessageTimestampValid(message, maxAgeMs)) {
      return {
        valid: false,
        error: 'Message timestamp expired or invalid'
      };
    }

    // Verify signature
    const valid = verifySignature(message, signature, publicKey);

    if (valid) {
      return {
        valid: true,
        publicKey
      };
    } else {
      return {
        valid: false,
        error: 'Invalid signature'
      };
    }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Create a session token (implement your own logic)
 * This is just a helper structure
 */
export interface WalletSession {
  publicKey: string;
  timestamp: number;
  userId?: string;
}

/**
 * Middleware helper for protecting routes
 */
export function createWalletAuthMiddleware(options?: {
  onUnauthorized?: () => Response;
  onError?: (error: Error) => Response;
}) {
  return async function walletAuthMiddleware(
    request: Request,
    handler: (publicKey: string) => Promise<Response>
  ): Promise<Response> {
    try {
      const authHeader = request.headers.get('Authorization');
      
      if (!authHeader || !authHeader.startsWith('Wallet ')) {
        return options?.onUnauthorized?.() || new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Parse wallet auth header
      // Format: "Wallet publicKey:signature:message"
      const [publicKey, signature, message] = authHeader.slice(7).split(':');

      const result = await verifyWalletSignature({
        publicKey,
        signature,
        message: decodeURIComponent(message)
      });

      if (!result.valid) {
        return new Response(
          JSON.stringify({ error: result.error || 'Invalid signature' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return handler(publicKey);
    } catch (error) {
      return options?.onError?.(error as Error) || new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  };
}

// Re-export utilities
export { verifySignature, isValidPublicKey, isMessageTimestampValid };


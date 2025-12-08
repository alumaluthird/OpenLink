import { verifySignature, isValidPublicKey, isMessageTimestampValid } from '@openlink/core';

export interface VerifySignatureOptions {
  publicKey: string;
  signature: string;
  message: string;
  checkTimestamp?: boolean;
  maxAgeMs?: number;
}

export interface VerifySignatureResult {
  valid: boolean;
  publicKey?: string;
  error?: string;
  timestamp?: number;
}

/**
 * Verify a wallet signature on the server
 */
export async function verifyWalletSignature(
  options: VerifySignatureOptions
): Promise<VerifySignatureResult> {
  const {
    publicKey,
    signature,
    message,
    checkTimestamp = true,
    maxAgeMs = 300000 // 5 minutes
  } = options;

  try {
    // Validate public key
    if (!isValidPublicKey(publicKey)) {
      return {
        valid: false,
        error: 'Invalid public key format'
      };
    }

    // Check timestamp if required
    if (checkTimestamp) {
      if (!isMessageTimestampValid(message, maxAgeMs)) {
        return {
          valid: false,
          error: 'Message timestamp expired or invalid'
        };
      }
    }

    // Extract timestamp
    const timestampMatch = message.match(/Timestamp: (\d+)/);
    const timestamp = timestampMatch ? parseInt(timestampMatch[1], 10) : undefined;

    // Verify signature
    const valid = verifySignature(message, signature, publicKey);

    if (valid) {
      return {
        valid: true,
        publicKey,
        timestamp
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
      error: error instanceof Error ? error.message : 'Verification failed'
    };
  }
}

/**
 * Generate a nonce for challenge-response authentication
 */
export function generateNonce(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Create a challenge message for the wallet to sign
 */
export function createChallenge(appName: string, nonce: string): string {
  return `${appName} wants you to sign in with your Solana account.\n\nNonce: ${nonce}\nTimestamp: ${Date.now()}`;
}


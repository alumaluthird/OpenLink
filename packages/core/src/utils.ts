import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import nacl from 'tweetnacl';

/**
 * Generate a message for wallet signature
 */
export function generateSignatureMessage(appName: string, nonce?: string): string {
  const timestamp = Date.now();
  const nonceStr = nonce || Math.random().toString(36).substring(7);
  
  return `${appName} wants you to sign in with your Solana account.\n\nNonce: ${nonceStr}\nTimestamp: ${timestamp}`;
}

/**
 * Verify a signed message from a wallet
 */
export function verifySignature(
  message: string,
  signature: string,
  publicKey: string
): boolean {
  try {
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = bs58.decode(signature);
    const publicKeyBytes = new PublicKey(publicKey).toBytes();

    return nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

/**
 * Encode message to Uint8Array
 */
export function encodeMessage(message: string): Uint8Array {
  return new TextEncoder().encode(message);
}

/**
 * Decode signature from base58
 */
export function decodeSignature(signature: string): Uint8Array {
  return bs58.decode(signature);
}

/**
 * Encode signature to base58
 */
export function encodeSignature(signature: Uint8Array): string {
  return bs58.encode(signature);
}

/**
 * Validate Solana public key
 */
export function isValidPublicKey(publicKey: string): boolean {
  try {
    new PublicKey(publicKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get RPC endpoint for network
 */
export function getEndpoint(network: 'mainnet-beta' | 'testnet' | 'devnet', customEndpoint?: string): string {
  if (customEndpoint) return customEndpoint;
  
  const endpoints = {
    'mainnet-beta': 'https://api.mainnet-beta.solana.com',
    'testnet': 'https://api.testnet.solana.com',
    'devnet': 'https://api.devnet.solana.com'
  };
  
  return endpoints[network];
}

/**
 * Truncate public key for display
 */
export function truncatePublicKey(publicKey: string, chars: number = 4): string {
  return `${publicKey.slice(0, chars)}...${publicKey.slice(-chars)}`;
}

/**
 * Check if message timestamp is valid (within 5 minutes)
 */
export function isMessageTimestampValid(message: string, maxAgeMs: number = 300000): boolean {
  const timestampMatch = message.match(/Timestamp: (\d+)/);
  if (!timestampMatch) return false;
  
  const timestamp = parseInt(timestampMatch[1], 10);
  const now = Date.now();
  
  return now - timestamp < maxAgeMs;
}


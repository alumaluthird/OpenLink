import { verifyWalletSignature } from './auth';

/**
 * Express-like middleware for wallet authentication
 */

export interface Request {
  headers: { [key: string]: string | string[] | undefined };
  walletPublicKey?: string;
  [key: string]: any;
}

export interface Response {
  status(code: number): Response;
  json(data: any): Response;
  send(data: any): Response;
  [key: string]: any;
}

export type NextFunction = (error?: any) => void;

export interface MiddlewareOptions {
  headerName?: string;
  checkTimestamp?: boolean;
  maxAgeMs?: number;
  onUnauthorized?: (req: Request, res: Response) => void;
  onError?: (req: Request, res: Response, error: Error) => void;
}

/**
 * Create wallet authentication middleware
 */
export function createWalletAuthMiddleware(options: MiddlewareOptions = {}) {
  const {
    headerName = 'Authorization',
    checkTimestamp = true,
    maxAgeMs = 300000,
    onUnauthorized,
    onError
  } = options;

  return async function walletAuthMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const authHeader = req.headers[headerName.toLowerCase()];
      
      if (!authHeader || typeof authHeader !== 'string') {
        if (onUnauthorized) {
          return onUnauthorized(req, res);
        }
        return res.status(401).json({ error: 'Unauthorized: No wallet signature provided' });
      }

      // Parse Authorization header
      // Format: "Wallet publicKey:signature:message"
      if (!authHeader.startsWith('Wallet ')) {
        if (onUnauthorized) {
          return onUnauthorized(req, res);
        }
        return res.status(401).json({ error: 'Unauthorized: Invalid authorization format' });
      }

      const [publicKey, signature, encodedMessage] = authHeader.slice(7).split(':');
      
      if (!publicKey || !signature || !encodedMessage) {
        if (onUnauthorized) {
          return onUnauthorized(req, res);
        }
        return res.status(401).json({ error: 'Unauthorized: Invalid authorization format' });
      }

      const message = decodeURIComponent(encodedMessage);

      // Verify signature
      const result = await verifyWalletSignature({
        publicKey,
        signature,
        message,
        checkTimestamp,
        maxAgeMs
      });

      if (!result.valid) {
        if (onUnauthorized) {
          return onUnauthorized(req, res);
        }
        return res.status(401).json({ error: `Unauthorized: ${result.error}` });
      }

      // Attach public key to request
      req.walletPublicKey = result.publicKey;

      next();
    } catch (error) {
      if (onError) {
        return onError(req, res, error as Error);
      }
      console.error('Wallet auth middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}

/**
 * Optional wallet authentication middleware
 * Attaches public key if valid signature is present, but doesn't fail if missing
 */
export function createOptionalWalletAuthMiddleware(options: MiddlewareOptions = {}) {
  const {
    headerName = 'Authorization',
    checkTimestamp = true,
    maxAgeMs = 300000
  } = options;

  return async function optionalWalletAuthMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const authHeader = req.headers[headerName.toLowerCase()];
      
      if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Wallet ')) {
        return next();
      }

      const [publicKey, signature, encodedMessage] = authHeader.slice(7).split(':');
      
      if (!publicKey || !signature || !encodedMessage) {
        return next();
      }

      const message = decodeURIComponent(encodedMessage);

      const result = await verifyWalletSignature({
        publicKey,
        signature,
        message,
        checkTimestamp,
        maxAgeMs
      });

      if (result.valid) {
        req.walletPublicKey = result.publicKey;
      }

      next();
    } catch (error) {
      console.error('Optional wallet auth middleware error:', error);
      next();
    }
  };
}


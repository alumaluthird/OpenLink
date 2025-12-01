import { useState, useCallback } from 'react';
import { useWallet } from '../context';

interface UseSignMessageReturn {
  signMessage: (message?: string) => Promise<any>;
  signing: boolean;
  error: Error | null;
  signatureData: any | null;
}

export function useSignMessage(): UseSignMessageReturn {
  const { signMessage: walletSignMessage } = useWallet();
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [signatureData, setSignatureData] = useState<any | null>(null);

  const signMessage = useCallback(async (message?: string) => {
    try {
      setSigning(true);
      setError(null);
      const data = await walletSignMessage(message);
      setSignatureData(data);
      return data;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setSigning(false);
    }
  }, [walletSignMessage]);

  return {
    signMessage,
    signing,
    error,
    signatureData
  };
}


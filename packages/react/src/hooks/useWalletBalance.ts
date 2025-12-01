import { useState, useEffect } from 'react';
import { useWallet } from '../context';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

interface UseWalletBalanceReturn {
  balance: number | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useWalletBalance(): UseWalletBalanceReturn {
  const { wallet, publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalance = async () => {
    if (!wallet || !publicKey || !connected) {
      setBalance(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const connection = wallet.getConnection();
      const lamports = await connection.getBalance(publicKey);
      setBalance(lamports / LAMPORTS_PER_SOL);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [publicKey, connected]);

  return {
    balance,
    loading,
    error,
    refresh: fetchBalance
  };
}


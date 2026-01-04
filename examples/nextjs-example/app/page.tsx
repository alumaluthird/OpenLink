'use client';

import { useWallet, WalletButton, useSignMessage } from '@openlink/nextjs';
import { useState } from 'react';

export default function Home() {
  const { connected, publicKey } = useWallet();
  const { signMessage, signing } = useSignMessage();
  const [authStatus, setAuthStatus] = useState('');

  const handleAuth = async () => {
    try {
      const { signature, message } = await signMessage();

      const response = await fetch('/api/auth/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicKey: publicKey?.toString(),
          signature,
          message
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setAuthStatus('✓ Authenticated!');
      } else {
        setAuthStatus('✗ Authentication failed');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setAuthStatus('✗ Error');
    }
  };

  return (
    <main style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>OpenLink Next.js Example</h1>
      
      <div style={{ marginTop: '20px' }}>
        <WalletButton />
      </div>

      {connected && (
        <div style={{ marginTop: '20px' }}>
          <p><strong>Wallet:</strong> {publicKey?.toString()}</p>
          
          <button onClick={handleAuth} disabled={signing}>
            {signing ? 'Authenticating...' : 'Authenticate'}
          </button>
          
          {authStatus && <p>{authStatus}</p>}
        </div>
      )}
    </main>
  );
}


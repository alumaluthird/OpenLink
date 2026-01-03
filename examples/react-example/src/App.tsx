import { OpenLinkProvider, useWallet, WalletButton, useSignMessage, useWalletBalance } from '@openlink/react';
import { useState } from 'react';

function WalletInfo() {
  const { connected, publicKey, disconnect } = useWallet();
  const { balance, refresh } = useWalletBalance();
  const { signMessage, signing } = useSignMessage();
  const [authStatus, setAuthStatus] = useState<string>('');

  const handleAuthenticate = async () => {
    try {
      const { signature, message } = await signMessage();

      // Send to backend
      const response = await fetch('http://localhost:3000/api/auth/wallet', {
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
        setAuthStatus('✓ Authenticated successfully!');
      } else {
        setAuthStatus('✗ Authentication failed');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setAuthStatus('✗ Error during authentication');
    }
  };

  if (!connected) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h2>Welcome to OpenLink Demo</h2>
        <p>Connect your Solana wallet to get started</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h3>Wallet Connected</h3>
      <p><strong>Public Key:</strong> {publicKey?.toString()}</p>
      <p>
        <strong>Balance:</strong> {balance?.toFixed(4)} SOL{' '}
        <button onClick={refresh}>Refresh</button>
      </p>

      <div style={{ marginTop: '20px' }}>
        <button onClick={handleAuthenticate} disabled={signing}>
          {signing ? 'Signing...' : 'Authenticate with Backend'}
        </button>
        {authStatus && <p>{authStatus}</p>}
      </div>

      <div style={{ marginTop: '20px' }}>
        <button onClick={disconnect}>Disconnect</button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <OpenLinkProvider
      network="devnet"
      appName="OpenLink Demo"
    >
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <header style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1>OpenLink React Example</h1>
          <WalletButton />
        </header>

        <WalletInfo />
      </div>
    </OpenLinkProvider>
  );
}


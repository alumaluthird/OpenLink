import React, { CSSProperties, useState } from 'react';
import { useWallet } from '../context';
import { truncatePublicKey } from '@openlink/core';

interface WalletButtonProps {
  className?: string;
  style?: CSSProperties;
  connectText?: string;
  disconnectText?: string;
  connectingText?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function WalletButton({
  className = '',
  style = {},
  connectText = 'Connect Wallet',
  disconnectText = 'Disconnect',
  connectingText = 'Connecting...',
  onConnect,
  onDisconnect
}: WalletButtonProps) {
  const { connect, disconnect, connected, connecting, publicKey } = useWallet();

  const handleClick = async () => {
    if (connected) {
      await disconnect();
      onDisconnect?.();
    } else {
      await connect();
      onConnect?.();
    }
  };

  const defaultStyle: CSSProperties = {
    padding: '10px 20px',
    fontSize: '16px',
    fontWeight: 600,
    borderRadius: '8px',
    border: 'none',
    cursor: connecting ? 'not-allowed' : 'pointer',
    backgroundColor: connected ? '#f44336' : '#6366f1',
    color: 'white',
    transition: 'all 0.2s',
    opacity: connecting ? 0.6 : 1,
    ...style
  };

  let buttonText = connectText;
  if (connecting) {
    buttonText = connectingText;
  } else if (connected && publicKey) {
    buttonText = truncatePublicKey(publicKey.toString(), 4);
  }

  return (
    <button
      className={className}
      style={defaultStyle}
      onClick={handleClick}
      disabled={connecting}
    >
      {buttonText}
    </button>
  );
}


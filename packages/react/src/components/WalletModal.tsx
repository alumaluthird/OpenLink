import React, { CSSProperties, useEffect, useState } from 'react';
import { useWallet } from '../context';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
  style?: CSSProperties;
}

export function WalletModal({
  isOpen,
  onClose,
  title = 'Connect Wallet',
  className = '',
  style = {}
}: WalletModalProps) {
  const { wallet, connect } = useWallet();
  const [wallets, setWallets] = useState<Array<{ name: string; icon: string; url: string; installed: boolean }>>([]);

  useEffect(() => {
    if (wallet && isOpen) {
      setWallets(wallet.getAvailableWallets());
    }
  }, [wallet, isOpen]);

  const handleWalletClick = async (walletName: string, installed: boolean) => {
    if (!installed) {
      const walletInfo = wallets.find(w => w.name === walletName);
      if (walletInfo) {
        window.open(walletInfo.url, '_blank');
      }
      return;
    }

    try {
      await connect(walletName);
      onClose();
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  if (!isOpen) return null;

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  };

  const modalStyle: CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '400px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
    ...style
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  };

  const titleStyle: CSSProperties = {
    fontSize: '24px',
    fontWeight: 700,
    margin: 0
  };

  const closeButtonStyle: CSSProperties = {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '4px',
    color: '#666'
  };

  const walletListStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  };

  const walletItemStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  };

  const walletIconStyle: CSSProperties = {
    width: '32px',
    height: '32px',
    borderRadius: '8px'
  };

  const walletNameStyle: CSSProperties = {
    flex: 1,
    fontSize: '16px',
    fontWeight: 600
  };

  const badgeStyle: CSSProperties = {
    fontSize: '12px',
    padding: '4px 8px',
    borderRadius: '4px',
    backgroundColor: '#e0e0e0',
    color: '#666'
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div className={className} style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>{title}</h2>
          <button style={closeButtonStyle} onClick={onClose}>×</button>
        </div>
        
        <div style={walletListStyle}>
          {wallets.map((w) => (
            <div
              key={w.name}
              style={walletItemStyle}
              onClick={() => handleWalletClick(w.name, w.installed)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <img src={w.icon} alt={w.name} style={walletIconStyle} />
              <div style={walletNameStyle}>{w.name}</div>
              {!w.installed && (
                <div style={badgeStyle}>Install</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


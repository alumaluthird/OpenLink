import { OpenLinkVanilla } from './openlink-vanilla';

export interface ButtonOptions {
  container: string | HTMLElement;
  className?: string;
  style?: Partial<CSSStyleDeclaration>;
  connectText?: string;
  disconnectText?: string;
  connectingText?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export interface ModalOptions {
  className?: string;
  title?: string;
  style?: Partial<CSSStyleDeclaration>;
}

/**
 * Create a wallet connection button
 */
export function createWalletButton(
  openlink: OpenLinkVanilla,
  options: ButtonOptions
): HTMLButtonElement {
  const button = document.createElement('button');
  button.className = options.className || 'openlink-wallet-button';
  
  // Apply default styles
  const defaultStyle = {
    padding: '10px 20px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: '#6366f1',
    color: 'white',
    transition: 'all 0.2s'
  };

  Object.assign(button.style, defaultStyle, options.style || {});

  // Update button text
  const updateButton = () => {
    if (openlink.connecting) {
      button.textContent = options.connectingText || 'Connecting...';
      button.style.opacity = '0.6';
      button.style.cursor = 'not-allowed';
      button.disabled = true;
    } else if (openlink.connected && openlink.publicKey) {
      button.textContent = truncateAddress(openlink.publicKey.toString());
      button.style.backgroundColor = '#f44336';
      button.disabled = false;
      button.style.opacity = '1';
      button.style.cursor = 'pointer';
    } else {
      button.textContent = options.connectText || 'Connect Wallet';
      button.style.backgroundColor = '#6366f1';
      button.disabled = false;
      button.style.opacity = '1';
      button.style.cursor = 'pointer';
    }
  };

  // Handle click
  button.addEventListener('click', async () => {
    if (openlink.connected) {
      await openlink.disconnect();
      options.onDisconnect?.();
    } else {
      await openlink.connect();
      options.onConnect?.();
    }
  });

  // Listen to events
  openlink.on('connect', updateButton);
  openlink.on('disconnect', updateButton);
  openlink.on('connecting', updateButton);

  // Initial update
  updateButton();

  // Mount to container
  const container = typeof options.container === 'string' 
    ? document.querySelector(options.container) 
    : options.container;

  if (container) {
    container.appendChild(button);
  }

  return button;
}

/**
 * Create a wallet selection modal
 */
export function createWalletModal(
  openlink: OpenLinkVanilla,
  options: ModalOptions = {}
): { open: () => void; close: () => void; element: HTMLDivElement } {
  const overlay = document.createElement('div');
  overlay.className = 'openlink-modal-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `;

  const modal = document.createElement('div');
  modal.className = options.className || 'openlink-modal';
  modal.style.cssText = `
    background-color: white;
    border-radius: 12px;
    padding: 24px;
    max-width: 400px;
    width: 90%;
    max-height: 80vh;
    overflow: auto;
  `;

  Object.assign(modal.style, options.style || {});

  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  `;

  const title = document.createElement('h2');
  title.textContent = options.title || 'Connect Wallet';
  title.style.cssText = 'font-size: 24px; font-weight: 700; margin: 0;';

  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.style.cssText = `
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    padding: 4px;
    color: #666;
  `;

  header.appendChild(title);
  header.appendChild(closeButton);

  const walletList = document.createElement('div');
  walletList.style.cssText = 'display: flex; flex-direction: column; gap: 12px;';

  modal.appendChild(header);
  modal.appendChild(walletList);
  overlay.appendChild(modal);

  const close = () => {
    overlay.style.display = 'none';
  };

  const open = () => {
    overlay.style.display = 'flex';
    
    // Populate wallet list
    walletList.innerHTML = '';
    const wallets = openlink.getAvailableWallets();

    wallets.forEach((wallet) => {
      const item = document.createElement('div');
      item.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        cursor: pointer;
        transition: background-color 0.2s;
      `;

      const icon = document.createElement('img');
      icon.src = wallet.icon;
      icon.alt = wallet.name;
      icon.style.cssText = 'width: 32px; height: 32px; border-radius: 8px;';

      const name = document.createElement('div');
      name.textContent = wallet.name;
      name.style.cssText = 'flex: 1; font-size: 16px; font-weight: 600;';

      item.appendChild(icon);
      item.appendChild(name);

      if (!wallet.installed) {
        const badge = document.createElement('div');
        badge.textContent = 'Install';
        badge.style.cssText = `
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 4px;
          background-color: #e0e0e0;
          color: #666;
        `;
        item.appendChild(badge);
      }

      item.addEventListener('mouseenter', () => {
        item.style.backgroundColor = '#f5f5f5';
      });

      item.addEventListener('mouseleave', () => {
        item.style.backgroundColor = 'transparent';
      });

      item.addEventListener('click', async () => {
        if (!wallet.installed) {
          window.open(wallet.url, '_blank');
        } else {
          await openlink.connect(wallet.name);
          close();
        }
      });

      walletList.appendChild(item);
    });
  };

  closeButton.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  document.body.appendChild(overlay);

  return { open, close, element: overlay };
}

function truncateAddress(address: string, chars: number = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}


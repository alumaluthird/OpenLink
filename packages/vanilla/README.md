# @openlink/vanilla

Vanilla JavaScript integration for OpenLink - works with any HTML site, no framework required.

## Installation

### Via NPM

```bash
npm install @openlink/vanilla
```

### Via CDN

```html
<script src="https://unpkg.com/@openlink/vanilla"></script>
```

## Quick Start

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
  <title>My App</title>
</head>
<body>
  <div id="wallet-button"></div>

  <script src="https://unpkg.com/@openlink/vanilla"></script>
  <script>
    // Initialize OpenLink
    const openlink = new OpenLink({
      network: 'mainnet-beta',
      appName: 'My App'
    });

    // Create wallet button
    OpenLink.createWalletButton(openlink, {
      container: '#wallet-button',
      onConnect: () => {
        console.log('Connected:', openlink.publicKey.toString());
      },
      onDisconnect: () => {
        console.log('Disconnected');
      }
    });
  </script>
</body>
</html>
```

### With NPM/Module Bundler

```javascript
import { OpenLink, createWalletButton } from '@openlink/vanilla';

const openlink = new OpenLink({
  network: 'mainnet-beta',
  appName: 'My App'
});

createWalletButton(openlink, {
  container: '#wallet-button'
});
```

## API Reference

### `OpenLink`

Main class for wallet management.

```javascript
const openlink = new OpenLink({
  network: 'mainnet-beta',    // or 'testnet', 'devnet'
  appName: 'My App',
  endpoint: 'https://...',     // optional custom RPC
  autoConnect: false           // optional auto-connect
});
```

#### Methods

**`connect(walletName?)`**

Connect to a wallet. Returns a Promise.

```javascript
await openlink.connect();
// or specify wallet
await openlink.connect('Phantom');
```

**`disconnect()`**

Disconnect the wallet.

```javascript
await openlink.disconnect();
```

**`signMessage(message?)`**

Sign a message with the wallet.

```javascript
const { signature, message, publicKey } = await openlink.signMessage('Hello!');
```

**`getAvailableWallets()`**

Get list of available wallet adapters.

```javascript
const wallets = openlink.getAvailableWallets();
// Returns: [{ name, icon, url, installed }, ...]
```

#### Properties

**`publicKey`**

Current wallet's public key.

```javascript
if (openlink.connected) {
  console.log(openlink.publicKey.toString());
}
```

**`connected`**

Boolean indicating connection status.

**`walletName`**

Name of connected wallet.

**`connecting`**

Boolean indicating connection in progress.

#### Events

**`on(event, callback)`**

Listen to events.

```javascript
openlink.on('connect', (data) => {
  console.log('Connected:', data.publicKey);
});

openlink.on('disconnect', () => {
  console.log('Disconnected');
});

openlink.on('error', (error) => {
  console.error('Error:', error);
});
```

Available events:
- `connect`
- `disconnect`
- `error`
- `connecting`

## UI Components

### `createWalletButton()`

Create a pre-styled wallet button.

```javascript
import { createWalletButton } from '@openlink/vanilla';

const button = createWalletButton(openlink, {
  container: '#button-container',  // CSS selector or HTMLElement
  className: 'my-button',           // optional custom class
  style: {                          // optional custom styles
    backgroundColor: '#6366f1'
  },
  connectText: 'Connect Wallet',
  disconnectText: 'Disconnect',
  connectingText: 'Connecting...',
  onConnect: () => console.log('Connected'),
  onDisconnect: () => console.log('Disconnected')
});
```

### `createWalletModal()`

Create a wallet selection modal.

```javascript
import { createWalletModal } from '@openlink/vanilla';

const modal = createWalletModal(openlink, {
  className: 'my-modal',
  title: 'Connect Wallet',
  style: {
    backgroundColor: 'white'
  }
});

// Open the modal
document.getElementById('open-modal-btn').addEventListener('click', () => {
  modal.open();
});

// Close programmatically
modal.close();
```

## Authentication Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>Auth Example</title>
</head>
<body>
  <div id="wallet-button"></div>
  <button id="auth-button" style="display: none;">Authenticate</button>
  <div id="status"></div>

  <script src="https://unpkg.com/@openlink/vanilla"></script>
  <script>
    const openlink = new OpenLink({
      network: 'mainnet-beta',
      appName: 'My App'
    });

    const authButton = document.getElementById('auth-button');
    const status = document.getElementById('status');

    // Create wallet button
    OpenLink.createWalletButton(openlink, {
      container: '#wallet-button',
      onConnect: () => {
        authButton.style.display = 'block';
      },
      onDisconnect: () => {
        authButton.style.display = 'none';
        status.textContent = '';
      }
    });

    // Authenticate
    authButton.addEventListener('click', async () => {
      try {
        // Sign message
        const { signature, message, publicKey } = await openlink.signMessage();

        // Send to backend
        const response = await fetch('/api/auth/wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicKey, signature, message })
        });

        const data = await response.json();
        
        if (data.success) {
          status.textContent = 'Authenticated!';
          status.style.color = 'green';
        } else {
          status.textContent = 'Authentication failed';
          status.style.color = 'red';
        }
      } catch (error) {
        console.error('Auth error:', error);
        status.textContent = 'Error: ' + error.message;
        status.style.color = 'red';
      }
    });
  </script>
</body>
</html>
```

## Legacy Framework Integration

### jQuery

```javascript
$(document).ready(function() {
  const openlink = new OpenLink({
    network: 'mainnet-beta',
    appName: 'My App'
  });

  OpenLink.createWalletButton(openlink, {
    container: '#wallet-button'
  });

  openlink.on('connect', function() {
    $('#wallet-status').text('Connected: ' + openlink.publicKey);
  });
});
```

### Vanilla JavaScript (ES5)

```html
<script src="https://unpkg.com/@openlink/vanilla"></script>
<script>
  var openlink = new OpenLink({
    network: 'mainnet-beta',
    appName: 'My App'
  });

  document.getElementById('connect-btn').addEventListener('click', function() {
    openlink.connect().then(function() {
      console.log('Connected');
    }).catch(function(error) {
      console.error('Error:', error);
    });
  });
</script>
```

## Custom Styling

You can fully customize the appearance:

```javascript
createWalletButton(openlink, {
  container: '#my-button',
  className: 'custom-wallet-btn',
  style: {
    padding: '15px 30px',
    fontSize: '18px',
    backgroundColor: '#ff6b6b',
    borderRadius: '25px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  }
});
```

Or use CSS:

```css
.custom-wallet-btn {
  padding: 15px 30px;
  font-size: 18px;
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  border-radius: 25px;
}
```

## TypeScript Support

TypeScript definitions are included:

```typescript
import { OpenLink, ButtonOptions } from '@openlink/vanilla';

const config = {
  network: 'mainnet-beta' as const,
  appName: 'My App'
};

const openlink = new OpenLink(config);
```

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 12+, Chrome Android

## License

MIT


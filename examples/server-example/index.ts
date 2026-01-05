import express from 'express';
import cors from 'cors';
import {
  createWalletAuthMiddleware,
  verifyWalletSignature,
  SessionManager,
  MemorySessionStore,
  UserLinkingManager,
  MemoryUserStore
} from '@openlink/server';

const app = express();
app.use(express.json());
app.use(cors());

// Initialize managers
const sessionManager = new SessionManager(new MemorySessionStore(), 86400000); // 24 hours
const userLinking = new UserLinkingManager(new MemoryUserStore());

// Authentication endpoint
app.post('/api/auth/wallet', async (req, res) => {
  try {
    const { publicKey, signature, message } = req.body;

    // Verify signature
    const result = await verifyWalletSignature({
      publicKey,
      signature,
      message
    });

    if (!result.valid) {
      return res.status(401).json({ 
        success: false, 
        error: result.error 
      });
    }

    // Link or create user
    const user = await userLinking.linkOrCreateUser({
      publicKey: result.publicKey!
    });

    // Create session
    const sessionId = await sessionManager.createSession(result.publicKey!, {
      userId: user.id
    });

    res.json({
      success: true,
      sessionId,
      user: {
        id: user.id,
        walletPublicKey: user.walletPublicKey
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Get session
app.get('/api/session/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  
  const session = await sessionManager.getSession(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const user = await userLinking.getUserByPublicKey(session.publicKey);

  res.json({
    session,
    user
  });
});

// Protected route example
app.get('/api/protected/profile', 
  createWalletAuthMiddleware(),
  async (req, res) => {
    const user = await userLinking.getUserByPublicKey(req.walletPublicKey!);
    
    res.json({
      message: 'This is a protected route',
      user
    });
  }
);

// Link wallet to existing user (e.g., after OAuth login)
app.post('/api/user/link-wallet', async (req, res) => {
  try {
    const { userId, publicKey, signature, message } = req.body;

    // Verify signature
    const result = await verifyWalletSignature({
      publicKey,
      signature,
      message
    });

    if (!result.valid) {
      return res.status(401).json({ 
        success: false, 
        error: result.error 
      });
    }

    // Link wallet to existing user
    const user = await userLinking.linkOrCreateUser({
      publicKey: result.publicKey!,
      existingUserId: userId
    });

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Link wallet error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Logout
app.post('/api/auth/logout', async (req, res) => {
  const { sessionId } = req.body;
  
  await sessionManager.deleteSession(sessionId);
  
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('\nAvailable endpoints:');
  console.log('  POST /api/auth/wallet - Authenticate with wallet');
  console.log('  GET  /api/session/:sessionId - Get session');
  console.log('  GET  /api/protected/profile - Protected route (requires auth header)');
  console.log('  POST /api/user/link-wallet - Link wallet to existing user');
  console.log('  POST /api/auth/logout - Logout');
});


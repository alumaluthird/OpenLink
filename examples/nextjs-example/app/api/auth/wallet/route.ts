import { NextRequest, NextResponse } from 'next/server';
import { verifyWalletSignature } from '@openlink/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { publicKey, signature, message } = await request.json();

    const result = await verifyWalletSignature({
      publicKey,
      signature,
      message
    });

    if (result.valid) {
      // Here you would:
      // 1. Create/update user in database
      // 2. Create session
      // 3. Set session cookie
      
      return NextResponse.json({ 
        success: true, 
        publicKey: result.publicKey 
      });
    }

    return NextResponse.json(
      { success: false, error: result.error },
      { status: 401 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}


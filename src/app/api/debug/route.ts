import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    // Check if Clerk environment variables are set
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    const secretKey = process.env.CLERK_SECRET_KEY;

    console.log('🔍 Debug Info:');
    console.log('- Publishable Key exists:', !!publishableKey);
    console.log('- Secret Key exists:', !!secretKey);
    console.log('- Publishable Key starts with:', publishableKey?.substring(0, 10));

    // Try to get auth info
    const authResult = await auth();
    console.log('- Auth result:', { 
      userId: authResult.userId,
      sessionId: authResult.sessionId 
    });

    return NextResponse.json({
      clerk: {
        publishableKeyExists: !!publishableKey,
        secretKeyExists: !!secretKey,
        publishableKeyPrefix: publishableKey?.substring(0, 15),
      },
      auth: {
        userId: authResult.userId,
        sessionId: authResult.sessionId,
        isAuthenticated: !!authResult.userId
      }
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      error: 'Debug failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 
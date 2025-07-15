import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

interface DebugInfo {
  environment: string | undefined;
  publishableKeyExists: boolean;
  secretKeyExists: boolean;
  publishableKeyPrefix: string | undefined;
  timestamp: string;
  auth: {
    userId?: string;
    isAuthenticated: boolean;
    error?: string;
  };
}

export async function GET() {
  try {
    // Only available in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Debug endpoint not available in production' }, { status: 404 });
    }

    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    const secretKey = process.env.CLERK_SECRET_KEY;
    
    const debugInfo: Partial<DebugInfo> = {
      environment: process.env.NODE_ENV,
      publishableKeyExists: !!publishableKey,
      secretKeyExists: !!secretKey,
      publishableKeyPrefix: publishableKey?.substring(0, 10),
      timestamp: new Date().toISOString(),
    };

    // Test auth
    try {
      const { userId } = await auth();
      debugInfo.auth = {
        userId: userId || 'No user',
        isAuthenticated: !!userId,
      };
    } catch {
      debugInfo.auth = {
        error: 'Auth failed',
        isAuthenticated: false,
      };
    }

    return NextResponse.json({
      success: true,
      debug: debugInfo,
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Debug endpoint failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
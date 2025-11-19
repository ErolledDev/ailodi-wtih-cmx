import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('[LOGIN] Request received');
    const body = await request.json();
    console.log('[LOGIN] Body:', body);
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const isValid = password === adminPassword;

    console.log('[LOGIN] Password valid:', isValid);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Simple token generation without cookies for now
    const token = Buffer.from(`admin:${Date.now()}`).toString('base64');
    console.log('[LOGIN] Token generated');

    return NextResponse.json(
      { success: true, token },
      { status: 200 }
    );
  } catch (error) {
    console.error('[LOGIN] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

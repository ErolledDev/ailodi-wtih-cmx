/**
 * Cloudflare Pages Function for admin logout
 * Deploy: This file is automatically deployed to /api/auth/logout
 */

export default async (context: any) => {
  const { request } = context;

  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Clear session cookie by setting expiry to past
    const expiresAt = new Date(0).toUTCString();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `admin-session=; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${expiresAt}`,
      },
    });
  } catch (error) {
    console.error('[LOGOUT] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

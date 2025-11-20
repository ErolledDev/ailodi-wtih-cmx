/**
 * Cloudflare Pages Function to verify admin session
 * Deploy: This file is automatically deployed to /api/auth/verify
 */

export default async (context: any) => {
  const { request } = context;

  try {
    // Get cookies from request
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map((c: string) => {
        const [key, value] = c.split('=');
        return [key, value];
      })
    );

    const sessionToken = cookies['admin-session'];

    if (!sessionToken) {
      return new Response(JSON.stringify({ authenticated: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Session exists and is valid
    return new Response(JSON.stringify({ authenticated: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[VERIFY] Error:', error);
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

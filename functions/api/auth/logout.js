/**
 * Cloudflare Pages Function for admin logout
 * Route: /api/auth/logout (via nested directory structure)
 */

export async function onRequest(context) {
  const { request } = context;

  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Clear the session cookie by setting expiry to epoch
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'session_token=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 UTC',
    },
  });
}

/**
 * Cloudflare Pages Function for session verification
 * Route: GET /api/auth/verify
 */

export async function onRequest(context) {
  const { request } = context;

  // Only allow GET requests
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Check if session cookie exists
  const cookies = request.headers.get('cookie') || '';
  const hasSession = cookies.includes('session_token=authenticated');

  if (hasSession) {
    return new Response(JSON.stringify({ authenticated: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ authenticated: false }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

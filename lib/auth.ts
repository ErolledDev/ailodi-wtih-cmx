// Server-side authentication using Cloudflare Pages Functions
// Passwords are kept secret - only sent to server
// Sessions are stored in secure httpOnly cookies

/**
 * Validate password on server
 * Returns session token if valid
 */
export async function validatePasswordOnServer(password: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const data = await response.json();
      return { success: false, error: data.error };
    }

    return { success: true };
  } catch (error) {
    console.error('[AUTH] Login error:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Check if user is authenticated
 */
export async function verifySessionOnServer(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/verify', {
      method: 'GET',
      credentials: 'include', // Include cookies
    });

    if (!response.ok) return false;

    const data = await response.json();
    return data.authenticated === true;
  } catch (error) {
    console.error('[AUTH] Verify error:', error);
    return false;
  }
}

/**
 * Logout user
 */
export async function logoutOnServer(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include', // Include cookies
    });
  } catch (error) {
    console.error('[AUTH] Logout error:', error);
  }
}

// Legacy client-side functions (kept for reference, not used with Cloudflare)
export function validatePasswordClient(password: string): boolean {
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
  return password === adminPassword;
}

export function createSessionClient(): string {
  if (typeof window !== 'undefined') {
    const token = `client-${Date.now()}`;
    localStorage.setItem('admin-session-client', token);
    return token;
  }
  return '';
}

export function isAuthenticatedClient(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('admin-session-client') !== null;
}

export function clearSessionClient(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin-session-client');
  }
}



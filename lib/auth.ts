// Client-side authentication for static export
// This uses localStorage since we can't use cookies/server sessions with output: 'export'

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
const SESSION_STORAGE_KEY = 'admin-session-token';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Client-side functions (use in client components)
export function validatePasswordClient(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export function createSessionClient(): string {
  const timestamp = Date.now();
  const sessionToken = `${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_STORAGE_KEY, sessionToken);
    localStorage.setItem(`${SESSION_STORAGE_KEY}-expires`, String(timestamp + SESSION_DURATION));
  }

  return sessionToken;
}

export function getSessionClient(): string | null {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem(SESSION_STORAGE_KEY);
  const expiresStr = localStorage.getItem(`${SESSION_STORAGE_KEY}-expires`);
  
  if (!token || !expiresStr) return null;
  
  const expires = parseInt(expiresStr, 10);
  if (Date.now() > expires) {
    clearSessionClient();
    return null;
  }
  
  return token;
}

export function clearSessionClient(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(`${SESSION_STORAGE_KEY}-expires`);
  }
}

export function isAuthenticatedClient(): boolean {
  return getSessionClient() !== null;
}

// Server-side functions (for API routes if needed)
export async function validatePassword(password: string): Promise<boolean> {
  return password === ADMIN_PASSWORD;
}


// Client-side auth utilities
// Note: Token generation and password hashing should only happen on the server
// This file is kept for type definitions only

export interface JWTPayload {
  userId: number;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}


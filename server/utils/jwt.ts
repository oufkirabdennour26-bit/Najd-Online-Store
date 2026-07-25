import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AccessTokenPayload, RefreshTokenPayload, UserPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET and JWT_REFRESH_SECRET environment variables must be defined.');
  process.exit(1);
}

const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

export function generateAccessToken(user: UserPayload): string {
  const payload: AccessTokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    type: 'access'
  };
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
}

export function generateRefreshToken(user: UserPayload): string {
  const payload: RefreshTokenPayload = {
    id: user.id,
    type: 'refresh'
  };
  return jwt.sign(payload, JWT_REFRESH_SECRET as string, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, JWT_SECRET as string) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET as string) as RefreshTokenPayload;
}

export function generateCryptoToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
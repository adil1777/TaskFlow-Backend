import jwt from 'jsonwebtoken';
import serverConfig from '../config/serverConfig';
import { OrgRole, SystemRole } from '@prisma/client';
import crypto from 'crypto';

interface AccessTokenPayload {
  sub: string;
  systemRole: SystemRole;

  organizationId?: string;
  role?: OrgRole;
}

export interface RefreshTokenPayload {
  sub: string;
  tokenId: string;
}

export const generateAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, serverConfig.jwtAccessSecret, {
    expiresIn: serverConfig.accessTokenExpiresIn,
  });
};

export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
  return jwt.sign(payload, serverConfig.jwtRefreshSecret, {
    expiresIn: serverConfig.refreshTokenExpiresIn,
  });
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, serverConfig.jwtAccessSecret) as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(
    token,
    serverConfig.jwtRefreshSecret
  ) as RefreshTokenPayload;
};

export const hashRefreshToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const REFRESH_TOKEN_DAYS = 7;

export const getRefreshTokenExpiry = () =>
  new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

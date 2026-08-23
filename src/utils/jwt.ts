import jwt from "jsonwebtoken";
import serverConfig  from "../config/serverConfig";
import { OrgRole } from "@prisma/client";
import crypto from "crypto";

export interface AccessTokenPayload {
  sub: string;
  organizationId: string;
  role: OrgRole;
}

export interface RefreshTokenPayload {
  sub: string;
  tokenId: string;
}

export const generateAccessToken = (
  payload: AccessTokenPayload
): string => {
  return jwt.sign(payload, serverConfig.jwtAccessSecret, {
    expiresIn: serverConfig.accessTokenExpiresIn,
  });
};

export const generateRefreshToken = (
  payload: RefreshTokenPayload
): string => {
  return jwt.sign(payload, serverConfig.jwtRefreshSecret, {
    expiresIn: serverConfig.refreshTokenExpiresIn,
  });
};

export const verifyAccessToken = (
  token: string
): AccessTokenPayload => {
  return jwt.verify(
    token,
    serverConfig.jwtAccessSecret
  ) as AccessTokenPayload;
};

export const verifyRefreshToken = (
  token: string
): RefreshTokenPayload => {
  return jwt.verify(
    token,
    serverConfig.jwtRefreshSecret
  ) as RefreshTokenPayload;
};

export const hashRefreshToken = (token: string): string => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};
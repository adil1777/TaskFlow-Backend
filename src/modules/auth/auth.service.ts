import crypto from "crypto";
import authRepository from "./auth.repository";
import messages from "../../utils/messages";

import {
  comparePassword,
  hashPassword,
} from "../../utils/password";

import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";
import { LoginInput, RegisterInput } from "./auth.types";
import { AppError } from "../../utils/error";

//REGISTER SERVICE
const register = async (input: RegisterInput) => {
  try {

    const existingUser =
      await authRepository.findUserByEmail(input.email);

     if (existingUser) {
      throw new AppError(
        messages.USER_EXISTS,
        "USER_EXISTS",
        409
      );
    }

    const passwordHash = await hashPassword(input.password);

    const result =
      await authRepository.createOrganizationWithAdmin({
        organizationName: input.organizationName,
        name: input.name,
        email: input.email,
        passwordHash,
      });

    return {
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      },

      organization: {
        id: result.organization.id,
        name: result.organization.name,
      },
    };
  } catch (error) {
    throw error;
  }
};

//LOGIN SERVICE
const login = async (input:LoginInput) => {
  try {

    const user =
      await authRepository.findUserWithMemberships(
        input.email
      );

     if (!user) {
      throw new AppError(
        messages.INVALID_CREDENTIALS,
        "INVALID_CREDENTIALS",
        401
      );
    }

    const passwordValid = await comparePassword(
      input.password,
      user.passwordHash
    );

    if (!passwordValid) {
      throw new AppError(
        messages.INVALID_CREDENTIALS,
        "INVALID_CREDENTIALS",
        401
      );
    }

    const membership = user.memberships[0];

     if (!membership) {
      throw new AppError(
        messages.ORGANIZATION_MEMBERSHIP_NOT_FOUND,
        "ORGANIZATION_MEMBERSHIP_NOT_FOUND",
        403
      );
    }

    // Generate access token
    const accessToken = generateAccessToken({
      sub: user.id,
      organizationId: membership.organizationId,
      role: membership.role,
    });

    // Generate refresh token
    const tokenId = crypto.randomUUID();

    const refreshToken = generateRefreshToken({
      sub: user.id,
      tokenId,
    });

    // Hash refresh token before storing in DB
    const tokenHash = hashRefreshToken(refreshToken);

    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    await authRepository.createRefreshToken({
      id: tokenId,
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw error;
  }
};

// REFRESH SERVICE
const refresh = async (refreshToken: string) => {
  try {
    if (!refreshToken) {
      throw new AppError(
        messages.MISSING_REFRESH_TOKEN,
        "MISSING_REFRESH_TOKEN",
        400
      );
    }

    // Verify JWT signature
    let payload;

    try {
      payload =
        verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError(
        messages.INVALID_REFRESH_TOKEN,
        "INVALID_REFRESH_TOKEN",
        401
      );
    }

    // Hash token to search DB
    const tokenHash =
      hashRefreshToken(refreshToken);

    // Find stored refresh token
    const storedToken =
      await authRepository.findRefreshToken(
        tokenHash
      );

    if (!storedToken) {
      throw new AppError(
        messages.INVALID_REFRESH_TOKEN,
        "INVALID_REFRESH_TOKEN",
        401
      );
    }

    // Already revoked
    if (storedToken.revokedAt) {
      throw new AppError(
        messages.INVALID_REFRESH_TOKEN,
        "INVALID_REFRESH_TOKEN",
        401
      );
    }

    // Expired
    if (storedToken.expiresAt < new Date()) {
      throw new AppError(
        messages.REFRESH_TOKEN_EXPIRED,
        "REFRESH_TOKEN_EXPIRED",
        401
      );
    }

    // Token must belong to same user
    if (storedToken.userId !== payload.sub) {
      throw new AppError(
        messages.INVALID_REFRESH_TOKEN,
        "INVALID_REFRESH_TOKEN",
        401
      );
    }

    // Get user with memberships
    const user =
      await authRepository.findUserWithMembershipsById(
        payload.sub
      );

    if (!user) {
      throw new AppError(
        messages.INVALID_CREDENTIALS,
        "INVALID_CREDENTIALS",
        401
      );
    }

    const membership = user.memberships[0];

    if (!membership) {
      throw new AppError(
        messages.ORGANIZATION_MEMBERSHIP_NOT_FOUND,
        "ORGANIZATION_MEMBERSHIP_NOT_FOUND",
        403
      );
    }

    // Generate new access token
    const accessToken =
      generateAccessToken({
        sub: user.id,
        organizationId:
          membership.organizationId,
        role: membership.role,
      });

    // Rotate refresh token
    const newTokenId =
      crypto.randomUUID();

    const newRefreshToken =
      generateRefreshToken({
        sub: user.id,
        tokenId: newTokenId,
      });

    const newTokenHash =
      hashRefreshToken(newRefreshToken);

    const expiresAt = new Date(
      Date.now() +
        7 * 24 * 60 * 60 * 1000
    );

    // Revoke old token
    await authRepository.revokeRefreshToken(
      tokenHash
    );

    // Store new token
    await authRepository.createRefreshToken({
      id: newTokenId,
      userId: user.id,
      tokenHash: newTokenHash,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    throw error;
  }
};


// LOGOUT SERVICE
const logout = async (refreshToken: string) => {
  try {
    if (!refreshToken) {
      throw new AppError(
        messages.MISSING_REFRESH_TOKEN,
        "MISSING_REFRESH_TOKEN",
        400
      );
    }

    const tokenHash =
      hashRefreshToken(refreshToken);

    await authRepository.revokeRefreshToken(
      tokenHash
    );
  } catch (error) {
    throw error;
  }
};


export default {
  register,
  login,
  refresh,
  logout,
};
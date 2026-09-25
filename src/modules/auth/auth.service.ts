import crypto from 'crypto';

import { OrgRole, SystemRole } from '@prisma/client';

import authRepository from './auth.repository';

import messages from '../../utils/messages';
import statusCodes from '../../utils/statusCodes';
import { AppError } from '../../utils/error';

import { comparePassword, hashPassword } from '../../utils/password';

import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
  hashRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt';

import { LoginInput, RegisterInput } from './auth.types';

// REGISTER
const register = async (input: RegisterInput) => {
  try {
    const existingUser = await authRepository.findUserByEmail(input.email);

    if (existingUser) {
      throw new AppError(
        messages.USER_EXISTS,
        'USER_EXISTS',
        statusCodes.CONFLICT
      );
    }

    const passwordHash = await hashPassword(input.password);

    const user = await authRepository.createUser({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        systemRole: user.systemRole,
      },
    };
  } catch (error) {
    throw error;
  }
};

// CREATE SESSION
const createSession = async (data: {
  userId: string;
  systemRole: SystemRole;
  organizationId?: string;
  role?: OrgRole;
}) => {
  try {
    const tokenId = crypto.randomUUID();

    const accessToken = generateAccessToken({
      sub: data.userId,
      systemRole: data.systemRole,
      ...(data.organizationId && {
        organizationId: data.organizationId,
      }),
      ...(data.role && {
        role: data.role,
      }),
    });

    const refreshToken = generateRefreshToken({
      sub: data.userId,
      tokenId,
    });

    const tokenHash = hashRefreshToken(refreshToken);

    await authRepository.createRefreshToken({
      id: tokenId,
      userId: data.userId,
      tokenHash,
      expiresAt: getRefreshTokenExpiry(),
    });

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw error;
  }
};

// LOGIN
const login = async (input: LoginInput) => {
  try {
    const user = await authRepository.findUserWithMemberships(input.email);

    if (!user) {
      throw new AppError(
        messages.INVALID_CREDENTIALS,
        'INVALID_CREDENTIALS',
        statusCodes.UNAUTHORIZED
      );
    }

    const passwordValid = await comparePassword(
      input.password,
      user.passwordHash
    );

    if (!passwordValid) {
      throw new AppError(
        messages.INVALID_CREDENTIALS,
        'INVALID_CREDENTIALS',
        statusCodes.UNAUTHORIZED
      );
    }

    // SYSTEM ADMIN
    if (user.systemRole === SystemRole.system_admin) {
      const session = await createSession({
        userId: user.id,
        systemRole: user.systemRole,
      });

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          systemRole: user.systemRole,
        },

        organization: null,

        ...session,
      };
    }

    // ORGANIZATION USER
    const membership = user.memberships[0];

    // USER WITHOUT ORGANIZATION
    if (!membership) {
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          systemRole: user.systemRole,
        },

        organization: null,

        accessToken: null,
        refreshToken: null,
      };
    }

    // USER WITH ORGANIZATION
    const session = await createSession({
      userId: user.id,
      systemRole: user.systemRole,
      organizationId: membership.organizationId,
      role: membership.role,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        systemRole: user.systemRole,
      },

      organization: {
        id: membership.organizationId,
        name: membership.organization.name,
        role: membership.role,
      },

      ...session,
    };
  } catch (error) {
    throw error;
  }
};

// REFRESH
const refresh = async (refreshToken: string) => {
  try {
    if (!refreshToken) {
      throw new AppError(
        messages.MISSING_REFRESH_TOKEN,
        'MISSING_REFRESH_TOKEN',
        statusCodes.BAD_REQUEST
      );
    }

    let payload;

    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError(
        messages.INVALID_REFRESH_TOKEN,
        'INVALID_REFRESH_TOKEN',
        statusCodes.UNAUTHORIZED
      );
    }

    const tokenHash = hashRefreshToken(refreshToken);

    const storedToken = await authRepository.findRefreshToken(tokenHash);

    if (!storedToken) {
      throw new AppError(
        messages.INVALID_REFRESH_TOKEN,
        'INVALID_REFRESH_TOKEN',
        statusCodes.UNAUTHORIZED
      );
    }

    if (storedToken.revokedAt) {
      throw new AppError(
        messages.INVALID_REFRESH_TOKEN,
        'INVALID_REFRESH_TOKEN',
        statusCodes.UNAUTHORIZED
      );
    }

    if (storedToken.expiresAt <= new Date()) {
      throw new AppError(
        messages.REFRESH_TOKEN_EXPIRED,
        'REFRESH_TOKEN_EXPIRED',
        statusCodes.UNAUTHORIZED
      );
    }

    if (storedToken.userId !== payload.sub) {
      throw new AppError(
        messages.INVALID_REFRESH_TOKEN,
        'INVALID_REFRESH_TOKEN',
        statusCodes.UNAUTHORIZED
      );
    }

    const user = await authRepository.findUserWithMembershipsById(payload.sub);

    if (!user) {
      throw new AppError(
        messages.INVALID_CREDENTIALS,
        'INVALID_CREDENTIALS',
        statusCodes.UNAUTHORIZED
      );
    }

    // DETERMINE ORGANIZATION CONTEXT
    let organizationId: string | undefined;

    let role: any | undefined;

    if (user.systemRole !== SystemRole.system_admin) {
      const membership = user.memberships[0];

      if (!membership) {
        throw new AppError(
          messages.ORGANIZATION_MEMBERSHIP_NOT_FOUND,
          'ORGANIZATION_MEMBERSHIP_NOT_FOUND',
          statusCodes.FORBIDDEN
        );
      }

      organizationId = membership.organizationId;

      role = membership.role;
    }

    // ROTATE TOKEN
    const session = await createSession({
      userId: user.id,
      systemRole: user.systemRole,
      organizationId,
      role,
    });

    await authRepository.revokeRefreshToken(tokenHash);

    return session;
  } catch (error) {
    throw error;
  }
};

// LOGOUT
const logout = async (refreshToken: string) => {
  try {
    if (!refreshToken) {
      throw new AppError(
        messages.MISSING_REFRESH_TOKEN,
        'MISSING_REFRESH_TOKEN',
        statusCodes.BAD_REQUEST
      );
    }

    const tokenHash = hashRefreshToken(refreshToken);

    await authRepository.revokeRefreshToken(tokenHash);
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

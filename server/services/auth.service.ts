import { UserRepository } from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, generateCryptoToken, hashToken } from '../utils/jwt';
import { ApiError } from '../utils/errors';

export class AuthService {
  static sanitizeUser(user: any) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
      phone: user.phone || undefined,
      address: user.address || undefined,
      city: user.city || undefined,
      zipCode: user.zipCode || undefined,
      createdAt: user.createdAt
    };
  }

  static async register(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    address?: string;
    city?: string;
    zipCode?: string;
  }) {
    const existing = await UserRepository.findByEmail(data.email);
    if (existing) {
      throw new ApiError('User with this email already exists', 400, true, 'هذا البريد الإلكتروني مسجل بالفعل', 'User with this email already exists');
    }

    const hashedPassword = await hashPassword(data.password);
    const verificationToken = generateCryptoToken();

    const newUser = await UserRepository.create({
      email: data.email,
      name: data.name,
      password: hashedPassword,
      phone: data.phone,
      address: data.address,
      city: data.city,
      zipCode: data.zipCode,
      verificationToken,
      emailVerified: false
    });

    const userPayload = { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name };
    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    await UserRepository.updateRefreshToken(newUser.id, refreshToken);

    console.log(`[AUTH ARCHITECTURE] Verification email token generated for ${newUser.email}: ${verificationToken}`);
    // NOTE: verificationToken is intentionally NOT returned in the API response.
    // In production this token must be delivered via a real email service
    // (e.g. nodemailer/SES) - returning it here would let anyone who knows a
    // user's email verify+takeover that flow without ever touching their inbox.
    // For local development/testing without an email provider configured, check
    // the server logs above for the token.

    return {
      user: this.sanitizeUser(newUser),
      accessToken,
      refreshToken
    };
  }

  static async login(email: string, pass: string) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new ApiError('Invalid email or password', 401, true, 'بيانات الاعتماد غير صالحة', 'Invalid email or password');
    }

    const isMatch = await comparePassword(pass, user.password);
    if (!isMatch) {
      throw new ApiError('Invalid email or password', 401, true, 'بيانات الاعتماد غير صالحة', 'Invalid email or password');
    }

    const userPayload = { id: user.id, email: user.email, role: user.role, name: user.name };
    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    await UserRepository.updateRefreshToken(user.id, refreshToken);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken
    };
  }

  static async logout(userId: string) {
    await UserRepository.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }

  static async refreshToken(token: string) {
    if (!token) {
      throw new ApiError('Refresh token required', 400);
    }

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch (err) {
      throw new ApiError('Invalid or expired refresh token', 401);
    }

    const user = await UserRepository.findById(payload.id);
    if (!user || user.refreshToken !== token) {
      throw new ApiError('Invalid or revoked refresh token', 401);
    }

    const userPayload = { id: user.id, email: user.email, role: user.role, name: user.name };
    const newAccessToken = generateAccessToken(userPayload);
    const newRefreshToken = generateRefreshToken(userPayload);

    await UserRepository.updateRefreshToken(user.id, newRefreshToken);

    return {
      user: this.sanitizeUser(user),
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  static async forgotPassword(email: string) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      // Return neutral message to avoid email enumeration
      return {
        message: 'If an account exists with that email, a password reset link has been prepared.'
      };
    }

    const rawResetToken = generateCryptoToken();
    const hashedResetToken = hashToken(rawResetToken);
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await UserRepository.update(user.id, {
      passwordResetToken: hashedResetToken,
      passwordResetExpires: expires
    });

    console.log(`[AUTH ARCHITECTURE] Password reset link for ${user.email}: /reset-password?token=${rawResetToken}`);
    // NOTE: rawResetToken is intentionally NOT returned in the API response.
    // Returning it here previously meant anyone who knew a registered email could
    // call this endpoint and immediately obtain a valid password-reset token for
    // that account - a full account-takeover vulnerability. In production this
    // token must be delivered via a real email service (nodemailer/SES/etc).
    // For local development/testing, check the server logs above for the link.

    return {
      message: 'If an account exists with that email, a password reset link has been prepared.'
    };
  }

  static async resetPassword(rawToken: string, newPassword: string) {
    const hashedResetToken = hashToken(rawToken);
    const user = await UserRepository.findByResetToken(hashedResetToken);

    if (!user) {
      throw new ApiError('Invalid or expired password reset token', 400);
    }

    const hashedPassword = await hashPassword(newPassword);

    await UserRepository.update(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
      refreshToken: null // Revoke existing refresh tokens
    });

    return { message: 'Password reset successfully. You may now log in with your new password.' };
  }

  static async verifyEmail(token: string) {
    const user = await UserRepository.findByVerificationToken(token);
    if (!user) {
      throw new ApiError('Invalid or expired verification token', 400);
    }

    await UserRepository.update(user.id, {
      emailVerified: true,
      verificationToken: null
    });

    return { message: 'Email verified successfully.' };
  }

  static async getProfile(userId: string) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    return this.sanitizeUser(user);
  }
}

import { prisma } from '../prisma/client';

export class UserRepository {
  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
  }

  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id }
    });
  }

  static async findByVerificationToken(token: string) {
    return prisma.user.findFirst({
      where: { verificationToken: token }
    });
  }

  static async findByResetToken(hashedToken: string) {
    return prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          gt: new Date()
        }
      }
    });
  }

  static async create(data: {
    email: string;
    name: string;
    password: string;
    role?: string;
    phone?: string;
    address?: string;
    city?: string;
    zipCode?: string;
    verificationToken?: string;
    emailVerified?: boolean;
  }) {
    return prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        name: data.name,
        password: data.password,
        role: data.role || 'user',
        phone: data.phone,
        address: data.address,
        city: data.city,
        zipCode: data.zipCode,
        verificationToken: data.verificationToken,
        emailVerified: data.emailVerified ?? false
      }
    });
  }

  static async update(id: string, data: any) {
    return prisma.user.update({
      where: { id },
      data
    });
  }

  static async updateRefreshToken(id: string, refreshToken: string | null) {
    return prisma.user.update({
      where: { id },
      data: { refreshToken }
    });
  }

  static async findAll() {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  static async delete(id: string) {
    return prisma.user.delete({
      where: { id }
    });
  }

  static async count(where?: any) {
    return prisma.user.count({ where });
  }
}

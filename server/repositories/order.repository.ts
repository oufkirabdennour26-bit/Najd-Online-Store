import { prisma } from '../prisma/client';

export class OrderRepository {
  static async create(data: any) {
    return prisma.order.create({
      data,
      include: { items: true }
    });
  }

  static async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: { 
        items: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }

  static async findMany(where: any) {
    return prisma.order.findMany({
      where,
      include: { 
        items: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async findAllAdmin() {
    return prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async updateStatus(id: string, status: string) {
    return prisma.order.update({
      where: { id },
      data: { status }
    });
  }

  static async delete(id: string) {
    return prisma.order.delete({ where: { id } });
  }

  static async count(where?: any) {
    return prisma.order.count({ where });
  }
}

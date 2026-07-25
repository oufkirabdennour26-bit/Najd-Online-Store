import { prisma } from '../prisma/client';

export class CategoryRepository {
  static async findAll() {
    return prisma.category.findMany({
      include: {
        parent: true,
        children: true
      },
      orderBy: { slug: 'asc' }
    });
  }

  static async findBySlug(slug: string) {
    return prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: true
      }
    });
  }

  static async findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true
      }
    });
  }

  static async create(data: { slug: string; nameAr: string; nameEn: string; parentId?: string | null }) {
    return prisma.category.create({
      data: {
        slug: data.slug,
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        parentId: data.parentId || null
      },
      include: {
        parent: true,
        children: true
      }
    });
  }

  static async update(id: string, data: { slug?: string; nameAr?: string; nameEn?: string; parentId?: string | null }) {
    return prisma.category.update({
      where: { id },
      data: {
        ...(data.slug && { slug: data.slug }),
        ...(data.nameAr && { nameAr: data.nameAr }),
        ...(data.nameEn && { nameEn: data.nameEn }),
        ...(data.parentId !== undefined && { parentId: data.parentId || null })
      },
      include: {
        parent: true,
        children: true
      }
    });
  }

  static async delete(id: string) {
    return prisma.category.delete({ where: { id } });
  }

  static async count() {
    return prisma.category.count();
  }
}

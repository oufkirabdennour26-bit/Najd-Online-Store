import { AuthService } from './auth.service';
import { OrderRepository } from '../repositories/order.repository';
import { ProductRepository } from '../repositories/product.repository';
import { UserRepository } from '../repositories/user.repository';
import { prisma } from '../prisma/client';
import { ApiError } from '../utils/errors';
import { Product } from '../../src/types';
import { hashPassword, comparePassword } from '../utils/password';

export class AdminService {
  static async login(email: string, pass: string) {
    const result = await AuthService.login(email, pass);
    if (result.user.role !== 'admin') {
      throw new ApiError('Access denied. Administrator privileges required.', 403, true, 'غير مصرح للوصول. يتطلب صلاحيات المدير.', 'Access denied. Administrator privileges required.');
    }
    return {
      success: true,
      token: result.accessToken,
      refreshToken: result.refreshToken,
      admin: result.user
    };
  }

  // دالة تغيير كلمة مرور الأدمن الآمنة
  static async changeAdminPassword(adminId: string, oldPass: string, newPass: string) {
    const user = await UserRepository.findById(adminId);
    if (!user) {
      throw new ApiError('User not found', 404, true, 'المستخدم غير موجود', 'User not found');
    }

    const isMatch = await comparePassword(oldPass, user.password);
    if (!isMatch) {
      throw new ApiError('Incorrect old password', 400, true, 'كلمة المرور الحالية غير صحيحة', 'Incorrect old password');
    }

    if (!newPass || newPass.length < 6) {
      throw new ApiError('New password must be at least 6 characters', 400, true, 'كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف', 'New password must be at least 6 characters');
    }

    const hashedNewPassword = await hashPassword(newPass);

    await UserRepository.update(adminId, {
      password: hashedNewPassword,
      refreshToken: null // إبطال الجلسة الحالية لإجبار إعادة تسجيل الدخول بالكلمة الجديدة
    });

    return { success: true, message: 'Password changed successfully' };
  }

  static async getStats() {
    const orders = await OrderRepository.findAllAdmin();
    const productsList = await ProductRepository.findWithQuery({ includeDeleted: false });
    const products: Product[] = Array.isArray(productsList) ? productsList : (productsList as any).items || [];
    const productsCount = await ProductRepository.count({ isDeleted: false });
    const customersCount = await UserRepository.count();
    const categoriesCount = await prisma.category.count();

    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = orders.length;

    const lowStockProducts = products.filter((p) => Number(p.stock) <= (p.lowStockThreshold || 5));

    const statusCounts = {
      placed: orders.filter((o) => o.status === 'placed').length,
      verified: orders.filter((o) => o.status === 'verified').length,
      packing: orders.filter((o) => o.status === 'packing').length,
      shipping: orders.filter((o) => o.status === 'shipping').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
    };

    const recentOrders = orders.slice(0, 5).map((o) => ({
      id: o.id,
      fullName: o.fullName,
      email: o.email,
      total: o.total,
      status: o.status,
      itemCount: o.items ? o.items.reduce((acc: number, it: any) => acc + (it.quantity || 1), 0) : 0,
      createdAt: o.createdAt
    }));

    return {
      totalSales: totalRevenue,
      totalOrders,
      totalProducts: productsCount,
      totalCustomers: customersCount,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      statusCounts,
      recentOrders,
      categoriesCount
    };
  }

  static async getAdminOrders() {
    return prisma.order.findMany({
      include: { 
        items: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async updateOrderStatus(orderId: string, status: string, operatorName = 'Admin') {
    const validStatuses = ['placed', 'verified', 'packing', 'shipping', 'delivered'];
    if (!validStatuses.includes(status)) {
      throw new ApiError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const existingOrder = await OrderRepository.findById(orderId);
    if (!existingOrder) {
      throw new ApiError('Order not found', 404);
    }

    const fromStatus = existingOrder.status;
    const result = await OrderRepository.updateStatus(orderId, status);

    if (fromStatus !== status) {
      await prisma.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus,
          toStatus: status,
          operatorName,
          notes: `Changed order status from '${fromStatus}' to '${status}'.`
        }
      });
    }

    return result;
  }

  static async getInventoryLogs() {
    return prisma.stockLog.findMany({
      include: {
        product: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
            sku: true,
            barcode: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  static async adjustStock(productId: string, quantity: number, type: string, reason: string, operatorName: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new ApiError('Product not found', 404);
    }

    const oldStock = product.stock;
    const newStock = type === 'set' ? quantity : Math.max(0, oldStock + (type === 'increase' ? quantity : -quantity));
    const delta = newStock - oldStock;

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        stock: newStock,
        status: newStock === 0 ? 'OutOfStock' : product.status
      }
    });

    await prisma.stockLog.create({
      data: {
        productId,
        quantityBefore: oldStock,
        quantityAfter: newStock,
        delta,
        type,
        reason,
        operatorName
      }
    });

    return updated;
  }

  static async getOrderHistory(orderId: string) {
    return prisma.orderStatusHistory.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getAdminCustomers() {
    const users = await UserRepository.findAll();
    const orders = await OrderRepository.findAllAdmin();

    return users.map((user) => {
      const uEmail = (user.email || '').toLowerCase();
      const userOrders = orders.filter(
        (o) => (o.userId && o.userId === user.id) || (o.email && o.email.toLowerCase() === uEmail)
      );
      const totalSpent = userOrders.reduce((sum, o) => sum + (o.total || 0), 0);

      return {
        id: user.id,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || 'N/A',
        ordersCount: userOrders.length,
        totalSpent,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt
      };
    });
  }
}
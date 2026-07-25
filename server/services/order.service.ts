import { OrderRepository } from '../repositories/order.repository';
import { CheckoutInput } from '../types';
import { ApiError } from '../utils/errors';
import { prisma } from '../prisma/client';
import { CouponService } from './coupon.service';
import { SettingsService } from './settings.service';
import { generateCryptoToken } from '../utils/jwt';

function generateOrderId(): string {
  // 8 hex chars from a CSPRNG - astronomically lower collision risk than Math.random(),
  // and we still retry on the rare unique-constraint clash (see createOrder below).
  return 'ORD-' + generateCryptoToken().slice(0, 8).toUpperCase();
}

const MAX_CREATE_ATTEMPTS = 5;

export class OrderService {
  static async createOrder(data: CheckoutInput, userId?: string) {
    // 1. Load the real products from the database - never trust client-submitted
    //    price/name/subtotal/total values.
    const productIds = [...new Set(data.items.map((item) => item.productId))];
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const computedItems = data.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product || product.isDeleted) {
        throw new ApiError(`Product ${item.productId} is no longer available`, 400, true, 'أحد المنتجات لم يعد متوفراً', 'One of the products is no longer available');
      }
      if (product.status === 'Hidden') {
        throw new ApiError(`Product ${product.nameEn} is not available for purchase`, 400, true, `المنتج ${product.nameAr} غير متاح للشراء حالياً`, `Product ${product.nameEn} is not available for purchase`);
      }
      if (product.stock < item.quantity) {
        throw new ApiError(
          `Insufficient stock for ${product.nameEn}. Available: ${product.stock}`,
          409,
          true,
          `الكمية المتوفرة من "${product.nameAr}" غير كافية (المتوفر: ${product.stock})`,
          `Insufficient stock for ${product.nameEn}. Available: ${product.stock}`
        );
      }
      return {
        productId: product.id,
        nameAr: product.nameAr,
        nameEn: product.nameEn,
        price: product.price, // authoritative price from the DB, ignoring whatever the client sent
        quantity: item.quantity
      };
    });

    // 2. Recompute the subtotal server-side.
    const subtotal = Math.round(computedItems.reduce((sum, it) => sum + it.price * it.quantity, 0) * 100) / 100;

    // 3. Recompute the discount server-side by re-validating the promo code against
    //    the real Coupon table - never trust a client-submitted discount amount.
    let discount = 0;
    if (data.promoCode) {
      const promoResult = await CouponService.validateCoupon(data.promoCode, subtotal);
      if (promoResult.valid) {
        discount = promoResult.discount;
      }
    }

    // 4. Validate the requested shipping cost against the store's actual configured
    //    options (free, or the admin-configured default) instead of trusting any number.
    const settings = await SettingsService.getSettings();
    const allowedShippingCosts = [0, settings.defaultShippingCost];
    const shippingCost = allowedShippingCosts.includes(data.shippingCost as number)
      ? (data.shippingCost as number)
      : settings.defaultShippingCost;

    const total = Math.round((subtotal - discount + shippingCost) * 100) / 100;

    // 5. Create the order and atomically decrement stock in a single transaction,
    //    retrying if the (now cryptographically random) order ID happens to collide.
    let lastError: unknown;
    for (let attempt = 0; attempt < MAX_CREATE_ATTEMPTS; attempt++) {
      const orderId = generateOrderId();
      const secureToken = 'TXN-' + generateCryptoToken().slice(0, 12).toUpperCase();

      try {
        const newOrder = await prisma.$transaction(async (tx) => {
          // Atomic, race-safe stock decrement: only succeeds if enough stock is
          // still available at the moment of the update (prevents overselling
          // when two checkouts for the same product happen at the same time).
          for (const item of computedItems) {
            const result = await tx.product.updateMany({
              where: { id: item.productId, stock: { gte: item.quantity } },
              data: { stock: { decrement: item.quantity } }
            });
            if (result.count === 0) {
              const product = productMap.get(item.productId)!;
              throw new ApiError(
                `Insufficient stock for ${product.nameEn}`,
                409,
                true,
                `نفدت الكمية المتوفرة من "${product.nameAr}"`,
                `Insufficient stock for ${product.nameEn}`
              );
            }

            const updatedProduct = await tx.product.findUniqueOrThrow({ where: { id: item.productId } });
            if (updatedProduct.stock === 0 && updatedProduct.status !== 'OutOfStock') {
              await tx.product.update({ where: { id: item.productId }, data: { status: 'OutOfStock' } });
            }

            await tx.stockLog.create({
              data: {
                productId: item.productId,
                quantityBefore: updatedProduct.stock + item.quantity,
                quantityAfter: updatedProduct.stock,
                delta: -item.quantity,
                type: 'sale',
                reason: `Ordered in Order #${orderId}`,
                operatorName: 'System (Checkout)'
              }
            });
          }

          const order = await tx.order.create({
            data: {
              id: orderId,
              userId: userId || null,
              fullName: data.shipping.fullName,
              email: data.shipping.email,
              phone: data.shipping.phone,
              address: data.shipping.address,
              city: data.shipping.city,
              zipCode: data.shipping.zipCode,
              paymentMethod: data.payment.method,
              subtotal,
              shippingCost,
              discount,
              total,
              status: 'placed',
              secureToken,
              items: { create: computedItems }
            }
          });

          await tx.orderStatusHistory.create({
            data: {
              orderId: order.id,
              fromStatus: 'none',
              toStatus: 'placed',
              operatorName: 'System (Checkout)',
              notes: 'Order placed successfully by customer.'
            }
          });

          return order;
        });

        return {
          orderId: newOrder.id,
          secureToken: newOrder.secureToken,
          status: newOrder.status,
          total: newOrder.total,
          createdAt: newOrder.createdAt
        };
      } catch (err: any) {
        lastError = err;
        // P2002 = unique constraint violation (order ID collision) - retry with a new ID.
        if (err?.code === 'P2002') {
          continue;
        }
        throw err;
      }
    }

    throw lastError instanceof Error ? lastError : new ApiError('Failed to create order, please try again', 500);
  }

  static async getOrdersByUserId(userId: string) {
    return OrderRepository.findMany({ userId });
  }

  static async getOrderByIdAndToken(id: string, token: string) {
    const order = await OrderRepository.findById(id);
    if (!order) {
      throw new ApiError('Order not found', 404);
    }
    if (order.secureToken !== token) {
      throw new ApiError('Unauthorized order access', 403);
    }
    return order;
  }
}

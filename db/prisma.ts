import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);

export const prisma = new PrismaClient({ adapter }).$extends({
    result: {
      product: {
        price: {
          compute(product) {
            return product.price.toString();
          },
        },
        rating: {
          compute(product) {
            return product.rating.toString();
          },
        },
        compareAtPrice: {
          needs: { compareAtPrice: true },
          compute(product) {
            return product.compareAtPrice ? product.compareAtPrice.toString() : null;
          },
        },
      },
      cart: {
        itemsPrice: {
          needs: { itemsPrice: true },
          compute(cart) {
            return cart.itemsPrice.toString();
          },
        },
        shippingPrice: {
          needs: { shippingPrice: true },
          compute(cart) {
            return cart.shippingPrice.toString();
          },
        },
        taxPrice: {
          needs: { taxPrice: true },
          compute(cart) {
            return cart.taxPrice.toString();
          },
        },
        totalPrice: {
          needs: { totalPrice: true },
          compute(cart) {
            return cart.totalPrice.toString();
          },
        },
        discountAmount: {
          needs: { discountAmount: true },
          compute(cart) {
            return cart.discountAmount.toString();
          },
        },
      },
      order: {
        itemsPrice: {
          needs: { itemsPrice: true },
          compute(cart) {
            return cart.itemsPrice.toString();
          },
        },
        shippingPrice: {
          needs: { shippingPrice: true },
          compute(cart) {
            return cart.shippingPrice.toString();
          },
        },
        taxPrice: {
          needs: { taxPrice: true },
          compute(cart) {
            return cart.taxPrice.toString();
          },
        },
        totalPrice: {
          needs: { totalPrice: true },
          compute(cart) {
            return cart.totalPrice.toString();
          },
        },
        discountAmount: {
          needs: { discountAmount: true },
          compute(order) {
            return order.discountAmount.toString();
          },
        },
      },
      orderItem: {
        price: {
          compute(cart) {
            return cart.price.toString();
          },
        },
      },
      coupon: {
        value: {
          needs: { value: true },
          compute(coupon) {
            return Number(coupon.value);
          },
        },
        minOrderValue: {
          needs: { minOrderValue: true },
          compute(coupon) {
            return coupon.minOrderValue !== null ? Number(coupon.minOrderValue) : null;
          },
        },
        startsAt: {
          needs: { startsAt: true },
          compute(coupon) {
            return coupon.startsAt ? coupon.startsAt.toISOString() : null;
          },
        },
        expiresAt: {
          needs: { expiresAt: true },
          compute(coupon) {
            return coupon.expiresAt ? coupon.expiresAt.toISOString() : null;
          },
        },
      },
    },
  });
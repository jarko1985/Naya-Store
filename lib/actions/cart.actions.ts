'use server';

import { cookies } from 'next/headers';
import { CartItem } from '@/types';
import { convertToPlainObject, formatError, round2 } from '../utils';
import { auth } from '@/auth';
import { prisma } from '@/db/prisma';
import { cartItemSchema, insertCartSchema } from '../validators';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

const CART_COOKIE_NAME = 'sessionCartId';
const CART_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

async function getOrCreateSessionCartId(): Promise<string> {
  const cookieStore = await cookies();
  let sessionCartId = cookieStore.get(CART_COOKIE_NAME)?.value;
  if (!sessionCartId) {
    sessionCartId = randomUUID();
    cookieStore.set(CART_COOKIE_NAME, sessionCartId, {
      path: '/',
      maxAge: CART_COOKIE_MAX_AGE,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    });
  }
  return sessionCartId;
}

// Calculate cart prices
const calcPrice = (items: CartItem[]) => {
    const itemsPrice = round2(
        items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
      ),
      shippingPrice = round2(itemsPrice > 100 ? 0 : 10),
      taxPrice = round2(0.15 * itemsPrice),
      totalPrice = round2(itemsPrice + taxPrice + shippingPrice);
  
    return {
      itemsPrice: itemsPrice.toFixed(2),
      shippingPrice: shippingPrice.toFixed(2),
      taxPrice: taxPrice.toFixed(2),
      totalPrice: totalPrice.toFixed(2),
    };
  };

  export async function addItemToCart(data: CartItem) {
    try {
      const sessionCartId = await getOrCreateSessionCartId();

      // Get session and user ID
      const session = await auth();
      const userId = session?.user?.id ? (session.user.id as string) : undefined;

      // Get cart
      const cart = await getMyCart();
  
      // Parse and validate item
      const item = cartItemSchema.parse(data);
  
      // Find product in database
      const product = await prisma.product.findFirst({
        where: { id: item.productId },
      });
      if (!product) throw new Error('Product not found');
  
      if (!cart) {
        // Create new cart object
        const newCart = insertCartSchema.parse({
          userId: userId,
          items: [item],
          sessionCartId: sessionCartId,
          ...calcPrice([item]),
        });
  
        // Add to database
        await prisma.cart.create({
          data: newCart,
        });
  
        // Revalidate product page
        revalidatePath(`/product/${product.slug}`);
  
        return {
          success: true,
          message: `${product.name} added to cart`,
        };
      } else {
        // Check if item is already in cart
        const existItem = (cart.items as CartItem[]).find(
          (x) => x.productId === item.productId
        );
  
        if (existItem) {
          // Check stock
          if (product.stock < existItem.qty + 1) {
            throw new Error('Not enough stock');
          }
  
          // Increase the quantity
          (cart.items as CartItem[]).find(
            (x) => x.productId === item.productId
          )!.qty = existItem.qty + 1;
        } else {
          // If item does not exist in cart
          // Check stock
          if (product.stock < 1) throw new Error('Not enough stock');
  
          // Add item to the cart.items
          cart.items.push(item);
        }
  
        // Save to database
        await prisma.cart.update({
          where: { id: cart.id },
          data: {
            items: cart.items as Prisma.CartUpdateitemsInput[],
            ...calcPrice(cart.items as CartItem[]),
          },
        });
  
        revalidatePath(`/product/${product.slug}`);
  
        return {
          success: true,
          message: `${product.name} ${
            existItem ? 'updated in' : 'added to'
          } cart`,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: formatError(error),
      };
    }
  }

  export async function getMyCart() {
    const sessionCartId = (await cookies()).get(CART_COOKIE_NAME)?.value;
    if (!sessionCartId) return undefined;

    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    let cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { sessionCartId },
    });

    if (userId && !cart) {
      const sessionCart = await prisma.cart.findFirst({
        where: { sessionCartId },
      });
      if (sessionCart) {
        await prisma.cart.deleteMany({ where: { userId } });
        await prisma.cart.update({
          where: { id: sessionCart.id },
          data: { userId },
        });
        cart = await prisma.cart.findFirst({
          where: { id: sessionCart.id },
        });
      }
    }

    if (!cart) return undefined;

    return convertToPlainObject({
      ...cart,
      items: cart.items as CartItem[],
      itemsPrice: cart.itemsPrice.toString(),
      totalPrice: cart.totalPrice.toString(),
      shippingPrice: cart.shippingPrice.toString(),
      taxPrice: cart.taxPrice.toString(),
    });
  }
  
  export async function removeItemFromCart(productId: string) {
    try {
      const sessionCartId = (await cookies()).get(CART_COOKIE_NAME)?.value;
      if (!sessionCartId) throw new Error('Cart session not found');
  
      // Get Product
      const product = await prisma.product.findFirst({
        where: { id: productId },
      });
      if (!product) throw new Error('Product not found');
  
      // Get user cart
      const cart = await getMyCart();
      if (!cart) throw new Error('Cart not found');
  
      // Check for item
      const exist = (cart.items as CartItem[]).find(
        (x) => x.productId === productId
      );
      if (!exist) throw new Error('Item not found');
  
      // Check if only one in qty
      if (exist.qty === 1) {
        // Remove from cart
        cart.items = (cart.items as CartItem[]).filter(
          (x) => x.productId !== exist.productId
        );
      } else {
        // Decrease qty
        (cart.items as CartItem[]).find((x) => x.productId === productId)!.qty =
          exist.qty - 1;
      }
  
      // Update cart in database
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items as Prisma.CartUpdateitemsInput[],
          ...calcPrice(cart.items as CartItem[]),
        },
      });
  
      revalidatePath(`/product/${product.slug}`);
  
      return {
        success: true,
        message: `${product.name} was removed from cart`,
      };
    } catch (error) {
      return { success: false, message: formatError(error) };
    }
  }
'use server';

import { cookies } from 'next/headers';
import { CartItem } from '@/types';
import { convertToPlainObject, formatError } from '../utils';
import { auth } from '@/auth';
import { prisma } from '@/db/prisma';
import { cartItemSchema, insertCartSchema } from '../validators';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { calcPrice } from '../cart-pricing';

async function getOrCreateSessionCartId(): Promise<string> {
  const cookieStore = await cookies();
  let id = cookieStore.get('sessionCartId')?.value;
  if (!id) {
    id = randomUUID();
    cookieStore.set('sessionCartId', id, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    });
  }
  return id;
}

export async function addItemToCart(data: CartItem) {
  try {
    const sessionCartId = await getOrCreateSessionCartId();

    const session = await auth();
    const rawUserId = session?.user?.id ? (session.user.id as string) : undefined;

    // Verify the user actually exists in the DB (guards against stale sessions after a re-seed)
    let userId: string | undefined = undefined;
    if (rawUserId) {
      const userExists = await prisma.user.findFirst({ where: { id: rawUserId }, select: { id: true } });
      if (userExists) userId = rawUserId;
    }

    const cart = await getMyCart();

    const item = cartItemSchema.parse(data);

    const product = await prisma.product.findFirst({
      where: { id: item.productId },
    });
    if (!product) throw new Error('Product not found');

    // Determine available stock (variant or product level)
    let availableStock = product.stock;
    if (item.variantId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const variant = await (prisma as any).productVariant.findFirst({
        where: { id: item.variantId },
      });
      if (!variant) throw new Error('Variant not found');
      availableStock = variant.stock;
    }

    if (!cart) {
      const newCart = insertCartSchema.parse({
        userId: userId,
        items: [item],
        sessionCartId: sessionCartId,
        ...calcPrice([item]),
      });

      await prisma.cart.create({
        data: newCart,
      });

      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: `${product.name} added to cart`,
      };
    } else {
      const existItem = (cart.items as CartItem[]).find(
        (x) => x.productId === item.productId && x.variantId === item.variantId
      );

      if (existItem) {
        if (availableStock < existItem.qty + 1) {
          throw new Error('Not enough stock');
        }

        (cart.items as CartItem[]).find(
          (x) => x.productId === item.productId && x.variantId === item.variantId
        )!.qty = existItem.qty + 1;
      } else {
        if (availableStock < 1) throw new Error('Not enough stock');
        cart.items.push(item);
      }

      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items as Prisma.CartUpdateitemsInput[],
          ...calcPrice(cart.items as CartItem[], Number(cart.discountAmount ?? 0)),
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
  const sessionCartId = (await cookies()).get('sessionCartId')?.value;
  if (!sessionCartId) return undefined;

  const session = await auth();
  const rawUserId = session?.user?.id ? (session.user.id as string) : undefined;

  // Verify user exists to guard against stale sessions
  let userId: string | undefined = undefined;
  if (rawUserId) {
    const userExists = await prisma.user.findFirst({ where: { id: rawUserId }, select: { id: true } });
    if (userExists) userId = rawUserId;
  }

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
    discountAmount: cart.discountAmount.toString(),
  });
}

export async function removeItemFromCart(productId: string, variantId?: string) {
  try {
    const sessionCartId = (await cookies()).get('sessionCartId')?.value;
    if (!sessionCartId) throw new Error('Cart session not found');

    const product = await prisma.product.findFirst({
      where: { id: productId },
    });
    if (!product) throw new Error('Product not found');

    const cart = await getMyCart();
    if (!cart) throw new Error('Cart not found');

    const exist = (cart.items as CartItem[]).find(
      (x) => x.productId === productId && x.variantId === variantId
    );
    if (!exist) throw new Error('Item not found');

    if (exist.qty === 1) {
      cart.items = (cart.items as CartItem[]).filter(
        (x) => !(x.productId === exist.productId && x.variantId === exist.variantId)
      );
    } else {
      (cart.items as CartItem[]).find(
        (x) => x.productId === productId && x.variantId === variantId
      )!.qty = exist.qty - 1;
    }

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items as Prisma.CartUpdateitemsInput[],
        ...calcPrice(cart.items as CartItem[], Number(cart.discountAmount ?? 0)),
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

// Re-add every item from a past order to the current cart ("Buy again").
// Items whose variant was discontinued or that are now out of stock are
// skipped and reported back rather than failing the whole reorder.
export async function reorderFromOrder(orderId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error('You must be signed in to reorder');
    const userId = session.user.id as string;

    const order = await prisma.order.findFirst({
      where: { id: orderId },
      include: { orderitems: true },
    });
    if (!order || order.userId !== userId) throw new Error('Order not found');

    const sessionCartId = await getOrCreateSessionCartId();
    const existingCart = await getMyCart();
    const cartItems: CartItem[] = existingCart
      ? [...(existingCart.items as CartItem[])]
      : [];

    const skipped: { name: string; reason: string }[] = [];
    let addedCount = 0;

    for (const item of order.orderitems) {
      const product = await prisma.product.findFirst({
        where: { id: item.productId },
      });
      if (!product) {
        skipped.push({ name: item.name, reason: 'no longer available' });
        continue;
      }

      let stock = product.stock;
      let price = product.price.toString();
      let image = product.images[0] ?? item.image;
      let color = item.color ?? undefined;
      let size = item.size ?? undefined;

      if (item.variantId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const variant = await (prisma as any).productVariant.findFirst({
          where: { id: item.variantId },
        });
        if (!variant) {
          skipped.push({ name: item.name, reason: 'no longer available' });
          continue;
        }
        stock = variant.stock;
        price = variant.price.toString();
        image = variant.image;
        color = variant.color;
        size = variant.size;
      }

      if (stock <= 0) {
        skipped.push({ name: item.name, reason: 'out of stock' });
        continue;
      }

      const qty = Math.min(item.qty, stock);
      if (qty < item.qty) {
        skipped.push({ name: item.name, reason: `only ${qty} available` });
      }

      const existingLine = cartItems.find(
        (x) => x.productId === item.productId && x.variantId === (item.variantId ?? undefined)
      );

      if (existingLine) {
        existingLine.qty = Math.min(existingLine.qty + qty, stock);
      } else {
        cartItems.push({
          productId: item.productId,
          name: product.name,
          slug: product.slug,
          price,
          qty,
          image,
          variantId: item.variantId ?? undefined,
          color,
          size,
        });
      }

      addedCount += qty;
    }

    if (addedCount === 0) {
      return {
        success: false,
        message: 'None of the items in this order are available to reorder',
        addedCount: 0,
        skipped,
      };
    }

    const pricing = calcPrice(cartItems, Number(existingCart?.discountAmount ?? 0));

    if (existingCart) {
      await prisma.cart.update({
        where: { id: existingCart.id },
        data: {
          items: cartItems as Prisma.CartUpdateitemsInput[],
          ...pricing,
        },
      });
    } else {
      const newCart = insertCartSchema.parse({
        userId,
        items: cartItems,
        sessionCartId,
        ...pricing,
      });
      await prisma.cart.create({ data: newCart });
    }

    revalidatePath('/cart');

    return {
      success: true,
      message:
        skipped.length > 0
          ? `Added ${addedCount} item${addedCount === 1 ? '' : 's'} to your cart — some items were unavailable`
          : `Added ${addedCount} item${addedCount === 1 ? '' : 's'} to your cart`,
      addedCount,
      skipped,
    };
  } catch (error) {
    return { success: false, message: formatError(error), addedCount: 0, skipped: [] };
  }
}

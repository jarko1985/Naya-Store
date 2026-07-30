import { CartItem } from '@/types';
import { round2 } from './utils';
import { FREE_SHIPPING_THRESHOLD } from './constants';

export const calcPrice = (items: CartItem[], discountAmount = 0) => {
  const itemsPrice = round2(
      items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
    ),
    shippingPrice = round2(itemsPrice > FREE_SHIPPING_THRESHOLD ? 0 : 10),
    taxPrice = round2(0.15 * itemsPrice),
    discount = round2(Math.min(discountAmount, itemsPrice)),
    totalPrice = round2(itemsPrice + taxPrice + shippingPrice - discount);

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    discountAmount: discount.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

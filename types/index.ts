import { insertProductSchema, insertCartSchema, cartItemSchema, shippingAddressSchema, insertOrderItemSchema, insertOrderSchema, paymentResultSchema, insertReviewSchema, insertCouponSchema } from '@/lib/validators';
import { z } from 'zod';

export type ProductVariant = {
  id: string;
  productId: string;
  color: string;
  size: string;
  price: string;
  compareAtPrice?: string | null;
  stock: number;
  image: string;
  createdAt: Date;
};

export type CategoryRef = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  parentId: string | null;
};

export type Product = z.infer<typeof insertProductSchema> & {
    id: string;
    rating: string;
    numReviews: number;
    createdAt: Date;
    variants?: ProductVariant[];
    category?: CategoryRef;
  };
  export type Cart = z.infer<typeof insertCartSchema> & {
    id: string;
    couponCode?: string | null;
    discountAmount: string;
    createdAt: Date;
  };
  export type CartItem = z.infer<typeof cartItemSchema>;
  export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
  export type Address = {
    id: string;
    userId: string;
    label: string | null;
    fullName: string;
    streetAddress: string;
    city: string;
    postalCode: string;
    country: string;
    lat: number | null;
    lng: number | null;
    isDefault: boolean;
    createdAt: Date;
  };
export type OrderItem = z.infer<typeof insertOrderItemSchema>;
export type Order = z.infer<typeof insertOrderSchema> & {
  id: string;
  couponCode?: string | null;
  discountAmount: string;
  createdAt: Date;
  isPaid: boolean;
  paidAt: Date | null;
  isDelivered: boolean;
  deliveredAt: Date | null;
  orderitems: OrderItem[];
  user: { name: string; email: string };
  paymentResult: PaymentResult;
};
export type PaymentResult = z.infer<typeof paymentResultSchema>;
export type Review = z.infer<typeof insertReviewSchema> & {
  id: string;
  createdAt: Date;
  user?: { name: string };
};

export type WishlistItem = {
  id: string;
  userId: string;
  productId: string;
  variantId?: string | null;
  createdAt: Date;
  product: Product;
};

export type RecentlyViewedItem = {
  id: string;
  userId: string;
  productId: string;
  viewedAt: Date;
  product: Product;
};

export type Coupon = z.infer<typeof insertCouponSchema> & {
  id: string;
  usedCount: number;
  createdAt: Date;
};
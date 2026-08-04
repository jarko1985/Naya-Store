import CartTable from './cart-table';
import { getMyCart } from '@/lib/actions/cart.actions';
import { getProductsByIds, getCartUpsells } from '@/lib/actions/product.action';
import ProductList from '@/components/shared/product/product-list';
import { Product } from '@/types';

export const metadata = {
  title: 'Shopping Cart',
};

const CartPage = async () => {
  const cart = await getMyCart();

  let upsells: Product[] = [];
  if (cart && cart.items.length > 0) {
    const productIds = cart.items.map((item) => item.productId);
    const cartProducts = (await getProductsByIds(productIds)) as unknown as Product[];
    const categoryIds = [...new Set(cartProducts.map((p) => p.categoryId))];
    upsells = (await getCartUpsells({ categoryIds, excludeIds: productIds })) as Product[];
  }

  return (
    <>
      <CartTable cart={cart} />
      {upsells.length > 0 && <ProductList data={upsells} title='Customers Also Bought' />}
    </>
  );
};

export default CartPage;
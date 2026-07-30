import { Heart } from 'lucide-react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getWishlist } from '@/lib/actions/wishlist.actions';
import ProductList from '@/components/shared/product/product-list';
import EmptyState from '@/components/shared/empty-state';
import { Product } from '@/types';
import { WishlistItem } from '@/types';

export const metadata = {
  title: 'Wishlist',
};

const WishlistPage = async () => {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in?callbackUrl=/wishlist');

  const wishlist = (await getWishlist()) as WishlistItem[];
  const products: Product[] = wishlist.map((item) => item.product);

  return (
    <div className='space-y-4'>
      <h1 className='h2-bold py-4'>My Wishlist</h1>
      {products.length === 0 ? (
        <EmptyState
          icon={Heart}
          title='Your wishlist is empty'
          description='Save products you love by tapping the heart icon.'
          actionLabel='Browse Products'
          actionHref='/'
        />
      ) : (
        <ProductList data={products} title={`${products.length} saved item${products.length === 1 ? '' : 's'}`} />
      )}
    </div>
  );
};

export default WishlistPage;

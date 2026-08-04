import ProductCard from '@/components/shared/product/product-card';
import EmptyState from '@/components/shared/empty-state';
import SortChips from '@/components/shared/search/sort-chips';
import ResultSummary from '@/components/shared/search/result-summary';
import FiltersDrawer from '@/components/shared/search/filters-drawer';
import { getAllProducts } from '@/lib/actions/product.action';
import { getCategoryTree } from '@/lib/actions/category.actions';
import { PRODUCT_COLORS, PRODUCT_SIZES, PRODUCT_COLOR_SWATCHES } from '@/lib/constants';
import { flattenCategoryTree } from '@/lib/utils';
import Link from 'next/link';
import { SearchX } from 'lucide-react';

const prices = [
  {
    name: '$1 to $50',
    value: '1-50',
  },
  {
    name: '$51 to $100',
    value: '51-100',
  },
  {
    name: '$101 to $200',
    value: '101-200',
  },
  {
    name: '$201 to $500',
    value: '201-500',
  },
  {
    name: '$501 to $1000',
    value: '501-1000',
  },
];

const ratings = [4, 3, 2, 1];

const sortOrders = ['newest', 'lowest', 'highest', 'rating'];

export async function generateMetadata(props: {
  searchParams: Promise<{
    q: string;
    category: string;
    price: string;
    rating: string;
  }>;
}) {
  const {
    q = 'all',
    category = 'all',
    price = 'all',
    rating = 'all',
  } = await props.searchParams;

  const isQuerySet = q && q !== 'all' && q.trim() !== '';
  const isCategorySet =
    category && category !== 'all' && category.trim() !== '';
  const isPriceSet = price && price !== 'all' && price.trim() !== '';
  const isRatingSet = rating && rating !== 'all' && rating.trim() !== '';

  if (isQuerySet || isCategorySet || isPriceSet || isRatingSet) {
    return {
      title: `
      Search ${isQuerySet ? q : ''}
      ${isCategorySet ? `: Category ${category}` : ''}
      ${isPriceSet ? `: Price ${price}` : ''}
      ${isRatingSet ? `: Rating ${rating}` : ''}`,
    };
  } else {
    return {
      title: 'Search Products',
    };
  }
}

const SearchPage = async (props: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    price?: string;
    rating?: string;
    color?: string;
    size?: string;
    sort?: string;
    page?: string;
  }>;
}) => {
  const {
    q = 'all',
    category = 'all',
    price = 'all',
    rating = 'all',
    color = 'all',
    size = 'all',
    sort = 'newest',
    page = '1',
  } = await props.searchParams;

  const colorList = color !== 'all' ? color.split(',').filter(Boolean) : [];
  const sizeList = size !== 'all' ? size.split(',').filter(Boolean) : [];

  // Construct filter url
  const getFilterUrl = ({
    c,
    p,
    s,
    r,
    pg,
    cl,
    sz,
  }: {
    c?: string;
    p?: string;
    s?: string;
    r?: string;
    pg?: string;
    cl?: string;
    sz?: string;
  }) => {
    const params = { q, category, price, rating, color, size, sort, page };

    if (c) params.category = c;
    if (p) params.price = p;
    if (s) params.sort = s;
    if (r) params.rating = r;
    if (pg) params.page = pg;
    if (cl) params.color = cl;
    if (sz) params.size = sz;

    return `/search?${new URLSearchParams(params).toString()}`;
  };

  // Toggle a single color/size value in/out of the current comma-separated selection
  const toggleColorUrl = (value: string) => {
    const next = colorList.includes(value)
      ? colorList.filter((v) => v !== value)
      : [...colorList, value];
    return getFilterUrl({ cl: next.length > 0 ? next.join(',') : 'all' });
  };
  const toggleSizeUrl = (value: string) => {
    const next = sizeList.includes(value)
      ? sizeList.filter((v) => v !== value)
      : [...sizeList, value];
    return getFilterUrl({ sz: next.length > 0 ? next.join(',') : 'all' });
  };

  const products = await getAllProducts({
    query: q,
    category,
    price,
    rating,
    color,
    size,
    sort,
    page: Number(page),
  });

  const categoryTree = await getCategoryTree();
  const categoryRows = flattenCategoryTree(categoryTree);
  const categoryNameBySlug = new Map(categoryRows.map(({ node }) => [node.slug, node.name]));

  const hasAnyFilter =
    (q !== 'all' && q !== '') ||
    (category !== 'all' && category !== '') ||
    rating !== 'all' ||
    price !== 'all' ||
    colorList.length > 0 ||
    sizeList.length > 0;

  const activeFilters = [
    ...(category !== 'all' && category !== ''
      ? [{ label: `Category: ${categoryNameBySlug.get(category) ?? category}`, clearHref: getFilterUrl({ c: 'all' }) }]
      : []),
    ...(price !== 'all'
      ? [{ label: `Price: ${prices.find((p) => p.value === price)?.name ?? price}`, clearHref: getFilterUrl({ p: 'all' }) }]
      : []),
    ...(rating !== 'all'
      ? [{ label: `${rating} stars & up`, clearHref: getFilterUrl({ r: 'all' }) }]
      : []),
    ...colorList.map((c) => ({ label: `Color: ${c}`, clearHref: toggleColorUrl(c) })),
    ...sizeList.map((s) => ({ label: `Size: ${s}`, clearHref: toggleSizeUrl(s) })),
  ];

  const filterContent = (
    <>
      {/* Category Links */}
      <div className='text-xl mb-2 mt-3'>Department</div>
      <div>
        <ul className='space-y-1'>
          <li>
            <Link
              className={`${
                (category === 'all' || category === '') && 'font-bold'
              }`}
              href={getFilterUrl({ c: 'all' })}
            >
              Any
            </Link>
          </li>
          {categoryRows.map(({ node, depth }) => (
            <li key={node.id} style={{ paddingLeft: `${depth * 1}rem` }}>
              <Link
                className={`${category === node.slug && 'font-bold'}`}
                href={getFilterUrl({ c: node.slug })}
              >
                {depth > 0 && '— '}
                {node.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {/* Price Links */}
      <div className='text-xl mb-2 mt-8'>Price</div>
      <div>
        <ul className='space-y-1'>
          <li>
            <Link
              className={`${price === 'all' && 'font-bold'}`}
              href={getFilterUrl({ p: 'all' })}
            >
              Any
            </Link>
          </li>
          {prices.map((p) => (
            <li key={p.value}>
              <Link
                className={`${price === p.value && 'font-bold'}`}
                href={getFilterUrl({ p: p.value })}
              >
                {p.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {/* Rating Links */}
      <div className='text-xl mb-2 mt-8'>Customer Ratings</div>
      <div>
        <ul className='space-y-1'>
          <li>
            <Link
              className={`${rating === 'all' && 'font-bold'}`}
              href={getFilterUrl({ r: 'all' })}
            >
              Any
            </Link>
          </li>
          {ratings.map((r) => (
            <li key={r}>
              <Link
                className={`${rating === r.toString() && 'font-bold'}`}
                href={getFilterUrl({ r: `${r}` })}
              >
                {`${r} stars & up`}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {/* Color Links */}
      <div className='text-xl mb-2 mt-8'>Color</div>
      <div className='flex flex-wrap gap-2'>
        {PRODUCT_COLORS.map((c) => {
          const isSelected = colorList.includes(c);
          return (
            <Link
              key={c}
              href={toggleColorUrl(c)}
              title={c}
              className={`flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs ${
                isSelected ? 'border-primary bg-primary/10 font-bold' : 'border-border'
              }`}
            >
              <span
                className='w-3 h-3 rounded-full border border-border shrink-0'
                style={{ backgroundColor: PRODUCT_COLOR_SWATCHES[c] ?? '#ccc' }}
              />
              {c}
            </Link>
          );
        })}
      </div>
      {/* Size Links */}
      <div className='text-xl mb-2 mt-8'>Size</div>
      <div className='flex flex-wrap gap-2'>
        {PRODUCT_SIZES.map((s) => {
          const isSelected = sizeList.includes(s);
          return (
            <Link
              key={s}
              href={toggleSizeUrl(s)}
              className={`rounded-full border px-2.5 py-1 text-xs ${
                isSelected ? 'border-primary bg-primary/10 font-bold' : 'border-border'
              }`}
            >
              {s}
            </Link>
          );
        })}
      </div>
    </>
  );

  return (
    <div className='grid md:grid-cols-5 md:gap-5'>
      <div className='hidden md:block filter-links rounded-xl border bg-card shadow-sm p-4 h-fit'>{filterContent}</div>
      <div className='md:col-span-4 space-y-4'>
        <div className='flex-between flex-col md:flex-row gap-3 my-4'>
          <div className='flex items-center gap-3 w-full md:w-auto'>
            <FiltersDrawer>{filterContent}</FiltersDrawer>
            <ResultSummary
              resultCount={products.data.length}
              query={q}
              activeFilters={activeFilters}
              clearAllHref='/search'
            />
          </div>
          <SortChips
            sortOrders={sortOrders}
            currentSort={sort}
            getHref={(s) => getFilterUrl({ s })}
          />
        </div>
        {products.data.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title='No products found'
            description="Try adjusting your search or filters to find what you're looking for."
            actionLabel={hasAnyFilter ? 'Clear filters' : undefined}
            actionHref={hasAnyFilter ? '/search' : undefined}
          />
        ) : (
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            {products.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;

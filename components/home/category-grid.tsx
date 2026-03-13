import Link from 'next/link';
import Image from 'next/image';
import {
  Shirt,
  Smartphone,
  Home,
  Dumbbell,
  BookOpen,
  Gem,
  Baby,
  Car,
  Utensils,
  Headphones,
  Camera,
  Gamepad2,
  Package,
  Watch,
  Sofa,
  Palette,
  Flower2,
  ShoppingBag,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getAllCategories } from '@/lib/actions/product.action';
import { getAllCategoryMeta } from '@/lib/actions/category.actions';
import type { LucideIcon } from 'lucide-react';

type CategoryStyle = {
  icon: LucideIcon;
  gradient: string;
  iconColor: string;
};

const CATEGORY_MAP: Record<string, CategoryStyle> = {
  electronics:  { icon: Smartphone,  gradient: 'from-blue-500/15 to-cyan-500/15',    iconColor: 'text-blue-400'   },
  phones:       { icon: Smartphone,  gradient: 'from-blue-500/15 to-cyan-500/15',    iconColor: 'text-blue-400'   },
  clothing:     { icon: Shirt,       gradient: 'from-pink-500/15 to-rose-500/15',    iconColor: 'text-pink-400'   },
  fashion:      { icon: Shirt,       gradient: 'from-pink-500/15 to-rose-500/15',    iconColor: 'text-pink-400'   },
  apparel:      { icon: Shirt,       gradient: 'from-pink-500/15 to-rose-500/15',    iconColor: 'text-pink-400'   },
  shirts:       { icon: Shirt,       gradient: 'from-pink-500/15 to-rose-500/15',    iconColor: 'text-pink-400'   },
  home:         { icon: Home,        gradient: 'from-amber-500/15 to-yellow-500/15', iconColor: 'text-amber-400'  },
  furniture:    { icon: Sofa,        gradient: 'from-amber-500/15 to-orange-500/15', iconColor: 'text-amber-400'  },
  sports:       { icon: Dumbbell,    gradient: 'from-green-500/15 to-emerald-500/15',iconColor: 'text-green-400'  },
  fitness:      { icon: Dumbbell,    gradient: 'from-green-500/15 to-emerald-500/15',iconColor: 'text-green-400'  },
  activewear:   { icon: Dumbbell,    gradient: 'from-green-500/15 to-emerald-500/15',iconColor: 'text-green-400'  },
  books:        { icon: BookOpen,    gradient: 'from-purple-500/15 to-violet-500/15',iconColor: 'text-purple-400' },
  jewelry:      { icon: Gem,         gradient: 'from-yellow-500/15 to-amber-500/15', iconColor: 'text-yellow-400' },
  accessories:  { icon: Watch,       gradient: 'from-yellow-500/15 to-amber-500/15', iconColor: 'text-yellow-400' },
  watches:      { icon: Watch,       gradient: 'from-yellow-500/15 to-amber-500/15', iconColor: 'text-yellow-400' },
  baby:         { icon: Baby,        gradient: 'from-sky-500/15 to-blue-500/15',     iconColor: 'text-sky-400'    },
  kids:         { icon: Baby,        gradient: 'from-sky-500/15 to-blue-500/15',     iconColor: 'text-sky-400'    },
  boys:         { icon: Baby,        gradient: 'from-sky-500/15 to-blue-500/15',     iconColor: 'text-sky-400'    },
  girls:        { icon: Baby,        gradient: 'from-sky-500/15 to-blue-500/15',     iconColor: 'text-sky-400'    },
  automotive:   { icon: Car,         gradient: 'from-red-500/15 to-orange-500/15',   iconColor: 'text-red-400'    },
  food:         { icon: Utensils,    gradient: 'from-orange-500/15 to-red-500/15',   iconColor: 'text-orange-400' },
  audio:        { icon: Headphones,  gradient: 'from-indigo-500/15 to-blue-500/15',  iconColor: 'text-indigo-400' },
  cameras:      { icon: Camera,      gradient: 'from-slate-500/15 to-gray-500/15',   iconColor: 'text-slate-400'  },
  gaming:       { icon: Gamepad2,    gradient: 'from-violet-500/15 to-purple-500/15',iconColor: 'text-violet-400' },
  art:          { icon: Palette,     gradient: 'from-fuchsia-500/15 to-pink-500/15', iconColor: 'text-fuchsia-400'},
  beauty:       { icon: Flower2,     gradient: 'from-rose-500/15 to-pink-500/15',    iconColor: 'text-rose-400'   },
  bags:         { icon: ShoppingBag, gradient: 'from-teal-500/15 to-cyan-500/15',    iconColor: 'text-teal-400'   },
  swimwear:     { icon: Shirt,       gradient: 'from-cyan-500/15 to-blue-500/15',    iconColor: 'text-cyan-400'   },
  loungewear:   { icon: Shirt,       gradient: 'from-purple-500/15 to-indigo-500/15',iconColor: 'text-purple-400' },
  workwear:     { icon: ShoppingBag, gradient: 'from-gray-500/15 to-slate-500/15',   iconColor: 'text-gray-400'   },
  shoes:        { icon: Package,     gradient: 'from-amber-500/15 to-orange-500/15', iconColor: 'text-amber-400'  },
  boots:        { icon: Package,     gradient: 'from-amber-500/15 to-orange-500/15', iconColor: 'text-amber-400'  },
  sneakers:     { icon: Package,     gradient: 'from-green-500/15 to-teal-500/15',   iconColor: 'text-green-400'  },
  sandals:      { icon: Package,     gradient: 'from-yellow-500/15 to-orange-500/15',iconColor: 'text-yellow-400' },
};

const DEFAULT_STYLE: CategoryStyle = {
  icon: Package,
  gradient: 'from-gray-500/15 to-slate-500/15',
  iconColor: 'text-gray-400',
};

function getCategoryStyle(name: string): CategoryStyle {
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(CATEGORY_MAP)) {
    if (key.includes(k)) return v;
  }
  return DEFAULT_STYLE;
}

const CategoryGrid = async () => {
  const [categories, categoryMeta] = await Promise.all([
    getAllCategories(),
    getAllCategoryMeta(),
  ]);

  if (!categories.length) return null;

  const metaMap = Object.fromEntries(
    categoryMeta.map((m: { name: string; image: string }) => [m.name, m.image])
  );

  return (
    <section className='mb-12'>
      {/* Section header */}
      <div className='flex items-end justify-between mb-6'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-widest text-primary mb-1'>
            Explore
          </p>
          <h2 className='text-2xl font-bold'>Shop by Category</h2>
        </div>
        <Link
          href='/search'
          className='text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block'
        >
          Browse all →
        </Link>
      </div>

      {/* Category grid */}
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3'>
        {categories.map(({ category, _count }: { category: string; _count: number }) => {
          const image = metaMap[category];
          const { icon: Icon, gradient, iconColor } = getCategoryStyle(category);

          return image ? (
            // ── Image card ────────────────────────────────────────────
            <Link
              key={category}
              href={`/search?category=${encodeURIComponent(category)}`}
              className='group relative flex flex-col overflow-hidden rounded-xl border border-white/5 hover:scale-[1.04] hover:shadow-xl transition-all duration-200 cursor-pointer aspect-[3/4]'
            >
              <Image
                src={image}
                alt={category}
                fill
                className='object-cover group-hover:scale-105 transition-transform duration-500'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent' />
              <div className='absolute bottom-0 left-0 right-0 p-3'>
                <p className='text-white text-sm font-semibold line-clamp-2 leading-tight'>
                  {category}
                </p>
                <Badge
                  variant='secondary'
                  className='mt-1.5 text-xs px-2 py-0 h-5 font-normal bg-white/20 text-white border-0 backdrop-blur-sm'
                >
                  {_count} items
                </Badge>
              </div>
            </Link>
          ) : (
            // ── Icon fallback card ─────────────────────────────────────
            <Link
              key={category}
              href={`/search?category=${encodeURIComponent(category)}`}
              className={`group flex flex-col items-center gap-3 p-5 rounded-xl border border-white/5 bg-gradient-to-br ${gradient} hover:scale-[1.04] hover:shadow-xl hover:border-white/10 transition-all duration-200 cursor-pointer`}
            >
              <div className='p-3 rounded-full bg-background/40 backdrop-blur-sm group-hover:bg-background/60 transition-colors'>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <div className='text-center'>
                <p className='text-sm font-semibold line-clamp-1'>{category}</p>
                <Badge
                  variant='secondary'
                  className='mt-1.5 text-xs px-2 py-0 h-5 font-normal'
                >
                  {_count} items
                </Badge>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryGrid;

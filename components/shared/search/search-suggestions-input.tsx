'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { getProductSuggestions } from '@/lib/actions/product.action';
import { formatCurrency } from '@/lib/utils';

interface Suggestion {
  id: string;
  name: string;
  slug: string;
  images: string[];
  price: string;
  category: string;
}

const SearchSuggestionsInput = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      const results = await getProductSuggestions(query);
      setSuggestions(results as Suggestion[]);
      setOpen(true);
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className='relative flex-1'>
      <Input
        name='q'
        type='text'
        placeholder='Search...'
        autoComplete='off'
        className='md:w-[100px] lg:w-[300px]'
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
      />
      {open && suggestions.length > 0 && (
        <div className='absolute top-full left-0 mt-1 w-full min-w-[280px] bg-popover border rounded-md shadow-lg z-50 overflow-hidden'>
          {suggestions.map((s) => (
            <Link
              key={s.id}
              href={`/product/${s.slug}`}
              className='flex items-center gap-3 px-3 py-2 hover:bg-muted transition-colors'
              onClick={() => setOpen(false)}
            >
              <Image
                src={s.images[0]}
                alt={s.name}
                width={32}
                height={32}
                className='w-8 h-8 object-cover rounded shrink-0'
              />
              <div className='flex-1 min-w-0'>
                <p className='text-sm truncate'>{s.name}</p>
                <p className='text-xs text-muted-foreground'>{s.category}</p>
              </div>
              <span className='text-sm font-medium shrink-0'>{formatCurrency(s.price)}</span>
            </Link>
          ))}
          <button
            type='button'
            onClick={() => {
              setOpen(false);
              router.push(`/search?q=${encodeURIComponent(query)}`);
            }}
            className='w-full text-left px-3 py-2 text-sm text-primary hover:bg-muted transition-colors border-t'
          >
            See all results for &quot;{query}&quot;
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchSuggestionsInput;

'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
import {
  SUPPORTED_CURRENCIES,
  SupportedCurrency,
  CURRENCY_COUNTRY_CODES,
  CURRENCY_NAMES,
} from '@/lib/constants';
import { useCurrency } from './currency-provider';

// eslint-disable-next-line @next/next/no-img-element -- small external flag
// icon, not a Next-optimized local asset; plain <img> avoids remotePatterns config
const FlagIcon = ({ currency }: { currency: SupportedCurrency }) => (
  <img
    src={`https://flagcdn.com/24x18/${CURRENCY_COUNTRY_CODES[currency]}.png`}
    alt=""
    width={20}
    height={15}
    className='inline-block rounded-[2px] object-cover shrink-0'
  />
);

const CurrencySwitcher = () => {
  const { currency, setCurrency, isPending } = useCurrency();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          disabled={isPending}
          className='focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer font-medium gap-1.5'
        >
          <FlagIcon currency={currency} />
          {currency}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {SUPPORTED_CURRENCIES.map((code: SupportedCurrency) => (
          <DropdownMenuCheckboxItem
            key={code}
            checked={currency === code}
            onClick={() => setCurrency(code)}
            className='gap-2'
          >
            <FlagIcon currency={code} />
            <span className='font-medium'>{code}</span>
            <span className='text-muted-foreground text-xs'>{CURRENCY_NAMES[code]}</span>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CurrencySwitcher;

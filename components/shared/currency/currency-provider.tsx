'use client';

import { createContext, useContext, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setCurrency as setCurrencyAction } from '@/lib/actions/currency.actions';
import { formatCurrency as formatCurrencyBase } from '@/lib/utils';
import { SupportedCurrency, DEFAULT_CURRENCY } from '@/lib/constants';

type CurrencyContextValue = {
  currency: SupportedCurrency;
  rates: Record<string, number>;
  isPending: boolean;
  setCurrency: (currency: SupportedCurrency) => void;
  // Converts a USD-denominated amount into the active currency and formats it.
  formatFromUsd: (usdAmount: number | string | null) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({
  initialCurrency,
  initialRates,
  children,
}: {
  initialCurrency: SupportedCurrency;
  initialRates: Record<string, number>;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [currency, setCurrencyState] = useState<SupportedCurrency>(initialCurrency);
  const [rates] = useState<Record<string, number>>(initialRates);
  const [isPending, startTransition] = useTransition();

  const setCurrency = (next: SupportedCurrency) => {
    setCurrencyState(next);
    startTransition(async () => {
      await setCurrencyAction(next);
      router.refresh();
    });
  };

  const formatFromUsd = (usdAmount: number | string | null) => {
    if (usdAmount === null) return 'NaN';
    const amount = typeof usdAmount === 'string' ? Number(usdAmount) : usdAmount;
    const rate = rates[currency] ?? 1;
    return formatCurrencyBase(amount * rate, currency);
  };

  return (
    <CurrencyContext.Provider
      value={{ currency, rates, isPending, setCurrency, formatFromUsd }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    // Fall back to USD, unconverted — keeps components usable outside the
    // provider (e.g. isolated tests) instead of throwing.
    return {
      currency: DEFAULT_CURRENCY,
      rates: { [DEFAULT_CURRENCY]: 1 },
      isPending: false,
      setCurrency: () => {},
      formatFromUsd: (amount: number | string | null) => formatCurrencyBase(amount),
    } satisfies CurrencyContextValue;
  }
  return ctx;
}

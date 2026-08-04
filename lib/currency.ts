import { prisma } from '@/db/prisma';
import { cookies } from 'next/headers';
import { auth } from '@/auth';
import { DEFAULT_CURRENCY, SUPPORTED_CURRENCIES, SupportedCurrency } from './constants';

// Pure conversion/rounding helpers (getCurrencyDecimals, roundToCurrency,
// convert, toMinorUnits) live in lib/utils.ts — that module has no
// server-only imports, so client components (e.g. stripe-payment.tsx) can
// import them directly without pulling in next/headers/Prisma from here.
export { getCurrencyDecimals, roundToCurrency, convert, toMinorUnits } from './utils';

const RATE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

// Used only if the DB cache is empty AND the live FX fetch also fails (e.g.
// first boot with no network reachability) — approximate, just keeps
// checkout functional rather than blocking on FX API availability.
const FALLBACK_RATES: Record<string, number> = {
  EUR: 0.92,
  GBP: 0.79,
  AED: 3.67,
  SAR: 3.75,
  JOD: 0.71,
  QAR: 3.64,
  OMR: 0.38,
  KWD: 0.31,
  SYP: 13000,
  TRY: 34,
};

async function fetchLiveRates(): Promise<Record<string, number> | null> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.result !== 'success' || !data.rates) return null;
    return data.rates as Record<string, number>;
  } catch {
    return null;
  }
}

// Reads cached USD->currency rates for every supported non-USD currency,
// refreshing from the live API if any are missing or older than the TTL.
// Never fails the caller: falls back to stale cached rows, then to
// FALLBACK_RATES, so checkout doesn't hard-fail on FX downtime.
export async function getExchangeRates(): Promise<Record<SupportedCurrency, number>> {
  const nonUsd = SUPPORTED_CURRENCIES.filter((c) => c !== 'USD');
  let cached = await prisma.exchangeRate.findMany({
    where: { currency: { in: [...nonUsd] } },
  });
  const cachedMap = new Map(cached.map((r) => [r.currency, r]));

  const now = Date.now();
  const isStale = nonUsd.some((c) => {
    const row = cachedMap.get(c);
    return !row || now - row.updatedAt.getTime() > RATE_TTL_MS;
  });

  if (isStale) {
    const live = await fetchLiveRates();
    if (live) {
      const toUpsert = nonUsd.filter((c) => typeof live[c] === 'number');
      await Promise.all(
        toUpsert.map((c) =>
          prisma.exchangeRate.upsert({
            where: { currency: c },
            update: { rate: live[c] },
            create: { currency: c, rate: live[c] },
          })
        )
      );
      cached = await prisma.exchangeRate.findMany({
        where: { currency: { in: [...nonUsd] } },
      });
      cachedMap.clear();
      cached.forEach((r) => cachedMap.set(r.currency, r));
    }
  }

  const rates = { USD: 1 } as Record<SupportedCurrency, number>;
  for (const c of nonUsd) {
    const row = cachedMap.get(c);
    rates[c] = row ? Number(row.rate) : FALLBACK_RATES[c] ?? 1;
  }
  return rates;
}

function isSupportedCurrency(value: string | undefined | null): value is SupportedCurrency {
  return !!value && (SUPPORTED_CURRENCIES as readonly string[]).includes(value);
}

// Resolves the active display/charge currency for the current request:
// `currency` cookie -> signed-in session preference -> USD default.
//
// The cookie is checked FIRST, ahead of the session: NextAuth's JWT session
// is stateless (baked in at sign-in), and setCurrency() only updates the DB
// + cookie — it can't rewrite an already-issued JWT. If session took
// priority, a signed-in user's currency switch would silently do nothing
// until their next sign-in. The session is still useful as the fallback for
// a fresh device/browser that has no cookie yet (mirrors the sessionCartId
// cookie fallback pattern in lib/actions/cart.actions.ts, but cookie-first).
export async function getActiveCurrency(): Promise<SupportedCurrency> {
  const cookieStore = await cookies();
  const cookieCurrency = cookieStore.get('currency')?.value;
  if (isSupportedCurrency(cookieCurrency)) {
    return cookieCurrency;
  }

  const session = await auth();
  if (isSupportedCurrency(session?.user?.currency)) {
    return session.user.currency;
  }

  return DEFAULT_CURRENCY;
}

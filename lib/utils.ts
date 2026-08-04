import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import qs from 'query-string';
import { CURRENCY_DECIMALS, CURRENCY_DISPLAY_AS_CODE, DEFAULT_CURRENCY } from '@/lib/constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

// Flattens a category tree into rows in display order, tracking depth for indentation
export function flattenCategoryTree<T extends { children: T[] }>(
  nodes: T[],
  depth = 0
): { node: T; depth: number }[] {
  return nodes.flatMap((node) => [
    { node, depth },
    ...flattenCategoryTree(node.children, depth + 1),
  ]);
}

export function formatNumberWithDecimal(num: number): string {
  const [int, decimal] = num.toString().split('.');
  return decimal ? `${int}.${decimal.padEnd(2, '0')}` : `${int}.00`;
}
export function formatError(error: any) {
  if (error.name === 'ZodError') {
    // Handle Zod error
    const fieldErrors = Object.keys(error.errors).map(
      (field) => error.errors[field].message
    );

    return fieldErrors.join('. ');
  } else if (
    error.name === 'PrismaClientKnownRequestError' &&
    error.code === 'P2002'
  ) {
    // Handle Prisma error
    const field = error.meta?.target ? error.meta.target[0] : 'Field';
    return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  } else {
    // Handle other errors
    return typeof error.message === 'string'
      ? error.message
      : JSON.stringify(error.message);
  }
}
export function round2(value: number | string) {
  if (typeof value === 'number') {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  } else if (typeof value === 'string') {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  } else {
    throw new Error('Value is not a number or string');
  }
}
export function getCurrencyDecimals(currency: string): number {
  return CURRENCY_DECIMALS[currency] ?? 2;
}

export function roundToCurrency(value: number, currency: string): number {
  const decimals = getCurrencyDecimals(currency);
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

// Converts a USD amount into `currency` using the given USD->currency rate,
// rounded to that currency's own minor-unit precision.
export function convert(usdAmount: number, rate: number, currency: string): number {
  return roundToCurrency(usdAmount * rate, currency);
}

// Converts a decimal amount already denominated in `currency` into that
// currency's smallest unit for the Stripe API (e.g. 10.00 AED -> 1000,
// 10.000 KWD -> 10000).
export function toMinorUnits(amount: number, currency: string): number {
  return Math.round(amount * 10 ** getCurrencyDecimals(currency));
}

const currencyFormatters = new Map<string, Intl.NumberFormat>();

function getCurrencyFormatter(currency: string): Intl.NumberFormat {
  let formatter = currencyFormatters.get(currency);
  if (!formatter) {
    const decimals = CURRENCY_DECIMALS[currency] ?? 2;
    formatter = new Intl.NumberFormat('en-US', {
      currency,
      style: 'currency',
      currencyDisplay: CURRENCY_DISPLAY_AS_CODE.includes(currency) ? 'code' : 'symbol',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    currencyFormatters.set(currency, formatter);
  }
  return formatter;
}

// Format an amount in the given currency (defaults to USD). `amount` is
// expected to already be denominated in `currency` — this only formats,
// it does not convert.
export function formatCurrency(
  amount: number | string | null,
  currency: string = DEFAULT_CURRENCY
) {
  const formatter = getCurrencyFormatter(currency);
  if (typeof amount === 'number') {
    return formatter.format(amount);
  } else if (typeof amount === 'string') {
    return formatter.format(Number(amount));
  } else {
    return 'NaN';
  }
}
const NUMBER_FORMATTER = new Intl.NumberFormat('en-US');

export function formatNumber(number: number) {
  return NUMBER_FORMATTER.format(number);
}

// Shorten UUID
export function formatId(id: string) {
  return `..${id.substring(id.length - 6)}`;
}

// Format date and times
export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    month: 'short', // abbreviated month name (e.g., 'Oct')
    year: 'numeric', // abbreviated month name (e.g., 'Oct')
    day: 'numeric', // numeric day of the month (e.g., '25')
    hour: 'numeric', // numeric hour (e.g., '8')
    minute: 'numeric', // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short', // abbreviated weekday name (e.g., 'Mon')
    month: 'short', // abbreviated month name (e.g., 'Oct')
    year: 'numeric', // numeric year (e.g., '2023')
    day: 'numeric', // numeric day of the month (e.g., '25')
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric', // numeric hour (e.g., '8')
    minute: 'numeric', // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };
  const formattedDateTime: string = new Date(dateString).toLocaleString(
    'en-US',
    dateTimeOptions
  );
  const formattedDate: string = new Date(dateString).toLocaleString(
    'en-US',
    dateOptions
  );
  const formattedTime: string = new Date(dateString).toLocaleString(
    'en-US',
    timeOptions
  );
  return {
    dateTime: formattedDateTime,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};

// Form the pagination links
export function formUrlQuery({
  params,
  key,
  value,
}: {
  params: string;
  key: string;
  value: string | null;
}) {
  const query = qs.parse(params);

  query[key] = value;

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query,
    },
    {
      skipNull: true,
    }
  );
}

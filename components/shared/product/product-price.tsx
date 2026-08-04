"use client";

import { cn, convert } from "@/lib/utils";
import { CURRENCY_DISPLAY_AS_CODE } from "@/lib/constants";
import { useCurrency } from "@/components/shared/currency/currency-provider";

// `value` is always USD (product prices are USD at rest) — converted here to
// the active display currency. Symbol/prefix-vs-suffix placement is derived
// via Intl.NumberFormat.formatToParts rather than a hardcoded "$", since
// different currencies (e.g. AED, JOD) format differently.
export default function ProductPrice({ value, className }: { value: number; className?: string }) {
    const { currency, rates } = useCurrency();
    const amount = convert(value, rates[currency] ?? 1, currency);

    const parts = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        currencyDisplay: CURRENCY_DISPLAY_AS_CODE.includes(currency) ? "code" : "narrowSymbol",
    }).formatToParts(amount);

    const symbol = parts.filter((p) => p.type === "currency").map((p) => p.value).join("");
    const integer = parts
        .filter((p) => p.type === "integer" || p.type === "group")
        .map((p) => p.value)
        .join("");
    const fraction = parts.filter((p) => p.type === "fraction").map((p) => p.value).join("");
    const symbolIsPrefix = parts[0]?.type === "currency";

    return (
        <p className={cn('text-2xl gap-2', className)}>
            {symbolIsPrefix && <span className="text-xs align-super">{symbol}</span>}
            {integer}
            {fraction && <span className="text-xs align-super">{fraction}</span>}
            {!symbolIsPrefix && <span className="text-xs align-super">{symbol}</span>}
        </p>
    );
}
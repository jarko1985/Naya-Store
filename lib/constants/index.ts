export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Naya Store";
export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
  "A Modern E-commerce Platform built with Next.js and Tailwind CSS";
export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
export const LATEST_PRODUCTS_LIMIT =
  Number(process.env.NEXT_PUBLIC_LATEST_PRODUCTS_LIMIT) || 4;
export const signInDefaultValues = {
  email: "admin@example.com",
  password: "123456",
};
export const signUpDefaultValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export const shippingAddressDefaultValues = {
  fullName: "",
  streetAddress: "",
  city: "",
  postalCode: "",
  country: "",
};
export const PAYMENT_METHODS = process.env.PAYMENT_METHODS
  ? process.env.PAYMENT_METHODS.split(", ")
  : ["PayPal", "Stripe", "CashOnDelivery"];
export const DEFAULT_PAYMENT_METHOD =
  process.env.DEFAULT_PAYMENT_METHOD || "PayPal";

export const PAGE_SIZE = Number(process.env.PAGE_SIZE) || 12;

export const productDefaultValues = {
  name: "",
  slug: "",
  categoryId: "",
  images: [],
  brand: "",
  description: "",
  price: "0",
  compareAtPrice: "",
  stock: 0,
  rating: "0",
  numReviews: "0",
  color: "Black",
  size: "M",
  isFeatured: false,
  banner: null,
};

export const USER_ROLES = process.env.USER_ROLES
  ? process.env.USER_ROLES.split(", ")
  : ["admin", "user"];

export const reviewFormDefaultValues = {
  title: "",
  comment: "",
  rating: 0,
};

export const SENDER_EMAIL =
  process.env.SENDER_EMAIL || "new.naya.store@gmail.com";

export const PRODUCT_SIZES = ["S", "M", "L", "XL", "XXL", "XXXL"];

export const PRODUCT_COLORS = [
  "Black",
  "White",
  "Red",
  "Green",
  "Blue",
  "Yellow",
  "Orange",
  "Purple",
  "Pink",
  "Brown",
  "Gray",
  "Navy",
  "Beige",
  "Teal",
];

// Maps color names to CSS color values for swatches
export const PRODUCT_COLOR_SWATCHES: Record<string, string> = {
  Black: "#000000", White: "#FFFFFF", Red: "#EF4444", Green: "#22C55E",
  Blue: "#3B82F6", Yellow: "#EAB308", Orange: "#F97316", Purple: "#A855F7",
  Pink: "#EC4899", Brown: "#92400E", Gray: "#6B7280", Navy: "#1E3A5F",
  Beige: "#D4B896", Teal: "#14B8A6",
};

export const LOW_STOCK_THRESHOLD = 5;

export const FREE_SHIPPING_THRESHOLD = 100;

export const COMPARE_PRODUCTS_LIMIT = 4;

export const RECENTLY_VIEWED_LIMIT = 8;

export const PROMO_BANNER_MESSAGE = `Free shipping on orders over $${FREE_SHIPPING_THRESHOLD} — no code needed`;

export const SUPPORTED_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "AED",
  "SAR",
  "JOD",
  "QAR",
  "OMR",
  "KWD",
  "SYP",
  "TRY",
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const DEFAULT_CURRENCY: SupportedCurrency = "USD";

// ISO 4217 minor-unit digits. Everything defaults to 2 unless listed here.
export const CURRENCY_DECIMALS: Record<string, number> = {
  JOD: 3,
  KWD: 3,
  OMR: 3,
};

export const CURRENCY_NAMES: Record<SupportedCurrency, string> = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  AED: "UAE Dirham",
  SAR: "Saudi Riyal",
  JOD: "Jordanian Dinar",
  QAR: "Qatari Riyal",
  OMR: "Omani Rial",
  KWD: "Kuwaiti Dinar",
  SYP: "Syrian Pound",
  TRY: "Turkish Lira",
};

// ISO 3166-1 alpha-2 country codes used to render actual flag icon images
// (via flagcdn.com) next to each currency in the switcher — emoji flags
// don't reliably render as real flag glyphs on Windows, so this uses real
// image assets instead. EUR isn't a single country, so it uses flagcdn's
// "eu" (European Union) flag rather than any one member state's.
export const CURRENCY_COUNTRY_CODES: Record<SupportedCurrency, string> = {
  USD: "us",
  EUR: "eu",
  GBP: "gb",
  AED: "ae",
  SAR: "sa",
  JOD: "jo",
  QAR: "qa",
  OMR: "om",
  KWD: "kw",
  SYP: "sy",
  TRY: "tr",
};

// Currencies whose CLDR/Intl symbol renders as a generic glyph that reads as
// the wrong currency at a glance (e.g. SYP's symbol is a pound-like "£S" that
// looks identical to GBP) — these render as their plain ISO code instead.
export const CURRENCY_DISPLAY_AS_CODE: readonly string[] = ["SYP"];

// PayPal's REST API only accepts this fixed set of currency codes — confirmed
// against PayPal's currency-code docs. None of the Gulf/Levant currencies in
// SUPPORTED_CURRENCIES are chargeable through PayPal.
export const PAYPAL_SUPPORTED_CURRENCIES: string[] = ["USD", "EUR", "GBP"];

// Stripe presentment currencies actually usable by this account, confirmed via
// live test-mode PaymentIntent creation (see Sprint 5 log) rather than docs
// alone — SYP in particular is excluded due to Syria sanctions.
export const STRIPE_SUPPORTED_CURRENCIES: string[] = [
  "USD",
  "EUR",
  "GBP",
  "AED",
  "SAR",
  "JOD",
  "QAR",
  "OMR",
  "KWD",
  "TRY",
];

// 'pending' isn't its own timeline step — it just means "placed, not yet
// shipped". The timeline's first step ("Placed") is always complete and
// comes from Order.createdAt, independent of this field.
export const SHIPMENT_STATUSES = [
  "pending",
  "shipped",
  "out_for_delivery",
  "delivered",
] as const;

export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  pending: "Order Placed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
};

// Used to enforce forward-only status transitions and to determine which
// timeline steps are "complete" relative to the current status.
export const SHIPMENT_STATUS_RANK: Record<ShipmentStatus, number> = {
  pending: 0,
  shipped: 1,
  out_for_delivery: 2,
  delivered: 3,
};

// Single source of truth for the "N-day returns" policy — also used for
// eligibility enforcement in requestReturn(), not just marketing copy.
export const RETURN_WINDOW_DAYS = 30;

export const RETURN_STATUSES = ['requested', 'approved', 'rejected', 'resolved'] as const;

export type ReturnStatus = (typeof RETURN_STATUSES)[number];

export const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
  requested: 'Requested',
  approved: 'Approved',
  rejected: 'Rejected',
  resolved: 'Resolved',
};

// Return status is a branching state machine (approve/reject fork, then a
// single resolve step), not a linear progression like SHIPMENT_STATUS_RANK.
export const RETURN_STATUS_TRANSITIONS: Record<ReturnStatus, ReturnStatus[]> = {
  requested: ['approved', 'rejected'],
  approved: ['resolved'],
  rejected: [],
  resolved: [],
};

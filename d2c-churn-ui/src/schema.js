// Mirrors CustomerFeatures in app/main.py exactly — keep field names, types
// and validation ranges in sync with the backend.

export const CATEGORICAL_FIELDS = [
  {
    name: "city_tier",
    label: "City tier",
    options: ["Tier 1", "Tier 2", "Tier 3"],
    default: "Tier 2",
  },
  {
    name: "age_group",
    label: "Age group",
    options: ["18-24", "25-34", "35-44", "45-54", "55+"],
    default: "25-34",
  },
  {
    name: "acquisition_channel",
    label: "Acquisition channel",
    options: ["Organic", "Paid Social", "Search", "Referral", "Affiliate", "Email"],
    default: "Organic",
  },
  {
    name: "loyalty_tier",
    label: "Loyalty tier",
    options: ["Bronze", "Silver", "Gold", "Platinum"],
    default: "Silver",
  },
  {
    name: "preferred_category",
    label: "Preferred category",
    options: ["Skin Care", "Hair Care", "Makeup", "Fragrance", "Wellness", "Personal Care"],
    default: "Skin Care",
  },
  {
    name: "marketing_consent",
    label: "Marketing consent",
    options: ["Yes", "No"],
    default: "Yes",
  },
];

// group, name, label, unit, min, max, step, default, help
export const NUMERIC_GROUPS = [
  {
    title: "Purchase & Value (180d)",
    caption: "How often, how recently, and how much this customer buys.",
    fields: [
      { name: "recency_days", label: "Recency", unit: "days", min: 0, step: 1, default: 30, help: "Days since last purchase." },
      { name: "frequency_180d", label: "Frequency", unit: "orders", min: 0, step: 1, default: 3, help: "Orders placed in the last 180 days." },
      { name: "monetary_180d", label: "Monetary value", unit: "₹", min: 0, step: 1, default: 2500, help: "Total spend in the last 180 days." },
      { name: "return_rate_180d", label: "Return rate", unit: "ratio", min: 0, max: 1, step: 0.01, default: 0.1, help: "Share of orders returned, 0–1." },
      { name: "avg_discount_pct_180d", label: "Avg. discount used", unit: "ratio", min: 0, max: 1, step: 0.01, default: 0.15, help: "Average discount % applied, 0–1." },
      { name: "avg_rating_180d", label: "Avg. rating given", unit: "1–5", min: 1, max: 5, step: 0.1, default: 4.2, help: "Average product rating left by the customer." },
      { name: "category_diversity_180d", label: "Category diversity", unit: "categories", min: 0, step: 1, default: 2, help: "Distinct categories purchased from." },
    ],
  },
  {
    title: "Support Interactions (90d)",
    caption: "Recent friction with customer support.",
    fields: [
      { name: "ticket_count_90d", label: "Ticket count", unit: "tickets", min: 0, step: 1, default: 0, help: "Support tickets opened in 90 days." },
      { name: "negative_ticket_rate_90d", label: "Negative ticket rate", unit: "ratio", min: 0, max: 1, step: 0.01, default: 0.1, help: "Share of tickets resolved unfavorably, 0–1." },
      { name: "avg_resolution_hours_90d", label: "Avg. resolution time", unit: "hours", min: 0, step: 1, default: 12, help: "Average hours to resolve a ticket." },
    ],
  },
  {
    title: "Account & Site Activity (30d)",
    caption: "How engaged the customer is right now.",
    fields: [
      { name: "days_since_signup", label: "Days since signup", unit: "days", min: 0, step: 1, default: 400, help: "Account age in days." },
      { name: "sessions_30d", label: "Sessions", unit: "sessions", min: 0, step: 1, default: 8, help: "Site/app sessions in 30 days." },
      { name: "product_views_30d", label: "Product views", unit: "views", min: 0, step: 1, default: 25, help: "Product detail views in 30 days." },
      { name: "cart_adds_30d", label: "Cart adds", unit: "adds", min: 0, step: 1, default: 3, help: "Items added to cart in 30 days." },
      { name: "wishlist_adds_30d", label: "Wishlist adds", unit: "adds", min: 0, step: 1, default: 1, help: "Items wishlisted in 30 days." },
      { name: "abandoned_carts_30d", label: "Abandoned carts", unit: "carts", min: 0, step: 1, default: 1, help: "Carts started but not checked out." },
      { name: "email_opens_30d", label: "Email opens", unit: "opens", min: 0, step: 1, default: 4, help: "Marketing emails opened in 30 days." },
      { name: "campaign_clicks_30d", label: "Campaign clicks", unit: "clicks", min: 0, step: 1, default: 1, help: "Campaign link clicks in 30 days." },
      { name: "last_visit_days_ago", label: "Last visit", unit: "days ago", min: 0, step: 1, default: 5, help: "Days since the last site visit." },
    ],
  },
];

export function buildDefaultPayload() {
  const payload = {};
  CATEGORICAL_FIELDS.forEach((f) => (payload[f.name] = f.default));
  NUMERIC_GROUPS.forEach((group) =>
    group.fields.forEach((f) => (payload[f.name] = f.default))
  );
  return payload;
}

// The exact "customer at real risk" sample from the user's own test call —
// useful as a one-click preset to demonstrate a Medium/High reading.
export const AT_RISK_PRESET = {
  city_tier: "Tier 2",
  age_group: "25-34",
  acquisition_channel: "Organic",
  loyalty_tier: "Silver",
  preferred_category: "Skin Care",
  marketing_consent: "Yes",
  recency_days: 0,
  frequency_180d: 0,
  monetary_180d: 0,
  return_rate_180d: 1,
  avg_discount_pct_180d: 1,
  avg_rating_180d: 1,
  category_diversity_180d: 0,
  ticket_count_90d: 0,
  negative_ticket_rate_90d: 1,
  avg_resolution_hours_90d: 0,
  days_since_signup: 0,
  sessions_30d: 0,
  product_views_30d: 0,
  cart_adds_30d: 0,
  wishlist_adds_30d: 0,
  abandoned_carts_30d: 0,
  email_opens_30d: 0,
  campaign_clicks_30d: 0,
  last_visit_days_ago: 0,
};

export type Category =
  | "rooms"
  | "restaurant"
  | "prices"
  | "facilities"
  | "services"
  | "location"
  | "other";

const RULES: Array<[Category, RegExp]> = [
  ["rooms", /\b(room|suite|bed|king|queen|twin|balcony|view|floor|check[- ]?in|check[- ]?out)\b/i],
  ["restaurant", /\b(restaurant|breakfast|dinner|lunch|menu|food|bar|drink|cuisine|buffet|coffee)\b/i],
  ["prices", /\b(price|cost|rate|fee|discount|cheap|expensive|how much|per night|charge|pay)\b/i],
  ["facilities", /\b(pool|gym|spa|sauna|jacuzzi|wifi|parking|beach|garden|amenit|fitness)\b/i],
  ["services", /\b(service|reception|concierge|laundry|shuttle|taxi|tour|booking|reserve|cancel|policy)\b/i],
  ["location", /\b(location|address|where|near|nearby|airport|distance|direction|map)\b/i],
];

export function categorize(text: string): Category {
  for (const [cat, rx] of RULES) if (rx.test(text)) return cat;
  return "other";
}

export const CATEGORY_LABELS: Record<Category, string> = {
  rooms: "Rooms",
  restaurant: "Restaurant",
  prices: "Prices",
  facilities: "Facilities",
  services: "Services",
  location: "Location",
  other: "Other",
};

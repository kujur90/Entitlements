// North-East India states this app is scoped to. Extend this list to widen coverage.
export const STATES = [
  { code: "assam", label: "Assam" },
  { code: "nagaland", label: "Nagaland" },
  { code: "meghalaya", label: "Meghalaya" },
  { code: "manipur", label: "Manipur" },
  { code: "mizoram", label: "Mizoram" },
  { code: "tripura", label: "Tripura" },
  { code: "arunachal", label: "Arunachal Pradesh" },
  { code: "sikkim", label: "Sikkim" },
  { code: "all", label: "All North-East states" },
];

export const STATE_LOOKUP = Object.fromEntries(STATES.map((s) => [s.code, s.label]));

export const CATEGORIES = [
  { code: "credit", label: "Loans & credit" },
  { code: "subsidy", label: "Subsidy & input support" },
  { code: "insurance", label: "Insurance" },
  { code: "training", label: "Training & skilling" },
  { code: "marketing", label: "Marketing & market linkage" },
  { code: "land", label: "Land & irrigation" },
  { code: "welfare", label: "Welfare & pension" },
  { code: "other", label: "Other" },
];

export const CATEGORY_LOOKUP = Object.fromEntries(CATEGORIES.map((c) => [c.code, c.label]));

// A scheme is badged "new" for this many days after it is published.
export const NEW_WINDOW_DAYS = 45;

export function isNew(createdAt) {
  const created = new Date(createdAt).getTime();
  const days = (Date.now() - created) / (1000 * 60 * 60 * 24);
  return days <= NEW_WINDOW_DAYS;
}

// Morocco-only address validation helpers. Mirrors
// ecommerce-website-backend/utils/morocco.js — keep them in sync.

export const CANONICAL_COUNTRY = 'Maroc';

const ACCEPTED_COUNTRY_ALIASES = new Set(['maroc', 'morocco', 'ma', 'mar']);

export function isMoroccanCountry(raw) {
  if (typeof raw !== 'string') return false;
  return ACCEPTED_COUNTRY_ALIASES.has(raw.trim().toLowerCase());
}

// Accepts local (06/07/05 + 8 digits), +212, 00212, and bare 212 international
// forms. Tolerates spaces / dashes / parentheses / dots. Returns `{ valid,
// normalized }` where `normalized` is `+2126XXXXXXXX` (E.164-ish) suitable for
// submission; the component may still display the user's raw input.
export function normalizeMoroccanPhone(raw) {
  if (typeof raw !== 'string') return { valid: false, normalized: '' };
  const stripped = raw.replace(/[\s\-().]/g, '');
  if (!stripped) return { valid: false, normalized: '' };

  let local;
  if (stripped.startsWith('+212')) {
    local = '0' + stripped.slice(4);
  } else if (stripped.startsWith('00212')) {
    local = '0' + stripped.slice(5);
  } else if (stripped.startsWith('212') && stripped.length === 12) {
    local = '0' + stripped.slice(3);
  } else {
    local = stripped;
  }

  if (!/^0[567]\d{8}$/.test(local)) {
    return { valid: false, normalized: '' };
  }
  return { valid: true, normalized: '+212' + local.slice(1) };
}

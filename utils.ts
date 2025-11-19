export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("id-ID").format(value);
};

// Greatest Common Divisor
export const gcd = (a: number, b: number): number =>
  b === 0 ? a : gcd(b, a % b);

// Least Common Multiple
export const lcm = (a: number, b: number): number =>
  a === 0 || b === 0 ? 0 : (a * b) / gcd(a, b);

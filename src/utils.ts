
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

export const formatDate = (
  dateString: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  return new Date(dateString).toLocaleDateString(
    "id-ID",
    options || defaultOptions
  );
};

// Greatest Common Divisor
export const gcd = (a: number, b: number): number =>
  b === 0 ? a : gcd(b, a % b);

// Least Common Multiple
export const lcm = (a: number, b: number): number =>
  a === 0 || b === 0 ? 0 : (a * b) / gcd(a, b);

// Browser Detection
export const isSafari = typeof navigator !== 'undefined' && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

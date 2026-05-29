
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

// Greatest Common Divisor (with input guards)
export const gcd = (a: number, b: number): number => {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 1;
  if (a < 0) a = Math.abs(a);
  if (b < 0) b = Math.abs(b);
  if (a === 0 && b === 0) return 1; // Guard: gcd(0,0) undefined, return 1 to avoid division by zero downstream
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
};

// Least Common Multiple (with input guards)
export const lcm = (a: number, b: number): number => {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 1;
  if (a === 0 || b === 0) return 0;
  if (a < 0) a = Math.abs(a);
  if (b < 0) b = Math.abs(b);
  return (a / gcd(a, b)) * b; // Divide first to reduce overflow risk
};

// Browser Detection
export const isSafari = typeof navigator !== 'undefined' && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

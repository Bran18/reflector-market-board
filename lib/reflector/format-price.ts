/**
 * Reflector (and SEP-40 oracles generally) store prices as integers.
 * Floating-point JS numbers cannot represent 14-decimal i128 values
 * without rounding, so never convert the raw `price` with `Number()`.
 *
 * The formatted string is for humans (up to 8 fraction digits). The card's
 * developer details still show the full integer.
 */
export function formatOraclePrice(
  value: bigint,
  decimals: number,
  fullPrecision = false,
): string {
  if (decimals < 0) {
    throw new Error("Oracle decimals must be non-negative");
  }

  const negative = value < BigInt(0);
  const abs = negative ? -value : value;
  const scale = BigInt(10) ** BigInt(decimals);
  const whole = abs / scale;
  const fraction = abs % scale;

  const wholePart = whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const digits =
    decimals === 0 ? "" : fraction.toString().padStart(decimals, "0");
  const fractionPart = fullPrecision
    ? digits.replace(/0+$/, "")
    : trimFraction(digits);
  const sign = negative ? "-" : "";

  if (!fractionPart) {
    return `${sign}${wholePart}`;
  }

  return `${sign}${wholePart}.${fractionPart}`;
}

function trimFraction(fraction: string): string {
  let trimmed = fraction.replace(/0+$/, "");
  if (!trimmed) {
    return "00";
  }

  if (trimmed.length > 8) {
    trimmed = trimmed.slice(0, 8).replace(/0+$/, "") || "00";
  }

  return trimmed.length >= 2 ? trimmed : trimmed.padEnd(2, "0");
}

export function formatQuote(formattedPrice: string, baseLabel: string): string {
  if (baseLabel === "USD" || baseLabel === "USDC") {
    return `$${formattedPrice}`;
  }

  return `${formattedPrice} ${baseLabel}`;
}

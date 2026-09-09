/** Pulse public timestamps are unix seconds, not milliseconds. */
export function formatUpdatedAt(
  timestampSeconds: bigint,
  nowMs = Date.now(),
): string {
  const timestampMs = Number(timestampSeconds) * 1000;
  if (!Number.isFinite(timestampMs) || timestampMs <= 0) {
    return "Update time unknown";
  }

  const deltaSeconds = Math.max(0, Math.floor((nowMs - timestampMs) / 1000));

  if (deltaSeconds < 5) {
    return "Last update: just now";
  }

  if (deltaSeconds < 60) {
    return `Last update: ${deltaSeconds} sec ago`;
  }

  const minutes = Math.floor(deltaSeconds / 60);
  if (minutes < 60) {
    return `Last update: ${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);
  return `Last update: ${hours} hr ago`;
}

export function networkLabel(networkPassphrase: string): string {
  if (networkPassphrase.includes("Public Global Stellar Network")) {
    return "Stellar Public Network";
  }

  if (networkPassphrase.includes("Test SDF Network")) {
    return "Stellar Test Network";
  }

  return networkPassphrase;
}

/** Keep non-whole minutes exact rather than rounding the feed interval. */
export function formatResolution(seconds: number): string {
  if (seconds >= 60 && seconds % 60 === 0) return `${seconds / 60} min`;
  return `${seconds} sec`;
}

/**
 * PulseClient throws `Error('Contract simulation error: #<code> <Name>')`
 * and may attach diagnostic events as `error.events`. Keep those in
 * development logs; they are the closest thing to a stack trace for a
 * failed Soroban simulation.
 */
export function logReflectorError(context: string, error: unknown) {
  console.error(context, error);

  if (error && typeof error === "object" && "events" in error) {
    console.error(`${context} diagnostic events`, (error as { events: unknown }).events);
  }
}

export function publicErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.startsWith("Missing ")) {
    return error.message;
  }

  return "Could not read this Pulse feed. Check the RPC URL and contract ID.";
}

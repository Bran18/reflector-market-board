import "server-only";

import { PulseClient } from "@reflector/contract-client";
import { Networks } from "@stellar/stellar-sdk";

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env.local and set the Pulse client values.`,
    );
  }

  return value;
}

/**
 * Pulse is Reflector's public price oracle: anyone can simulate `lastPrice`
 * without buying feed access. Beam is the prepaid, faster sibling — it is
 * out of scope for this read-only demo.
 *
 * Reads still go through Soroban RPC as *simulated* invocations. The client
 * therefore needs:
 * - rpcUrl: where to send simulateTransaction
 * - contractId: which Pulse instance (Pubnet DEX, external CEX, FX, …)
 * - publicKey: source account on the simulated transaction (no signature)
 */
function createPulseClient() {
  return new PulseClient({
    publicKey: requiredEnv("REFLECTOR_PUBLIC_KEY"),
    rpcUrl: requiredEnv("REFLECTOR_RPC_URL"),
    contractId: requiredEnv("REFLECTOR_PULSE_CONTRACT_ID"),
    networkPassphrase:
      process.env.REFLECTOR_NETWORK_PASSPHRASE?.trim() || Networks.PUBLIC,
  });
}

let pulseClient: PulseClient | undefined;

export function getPulseClient(): PulseClient {
  pulseClient ??= createPulseClient();
  return pulseClient;
}

export function getPulseContractId(): string {
  return requiredEnv("REFLECTOR_PULSE_CONTRACT_ID");
}

export function getNetworkPassphrase(): string {
  return process.env.REFLECTOR_NETWORK_PASSPHRASE?.trim() || Networks.PUBLIC;
}

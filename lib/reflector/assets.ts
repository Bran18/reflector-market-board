import type { Asset } from "@reflector/contract-client";
import { Asset as StellarAsset, Networks } from "@stellar/stellar-sdk";
import type { FeaturedSymbol } from "./types";

export const FEATURED_ASSETS = ["XLM", "AQUA", "PYUSD", "SolvBTC"] as const;

type FeaturedMatchers = {
  symbol: FeaturedSymbol;
  /**
   * `Other` tickers used by CEX/DEX Pulse oracles.
   * A shorthand string only works when the oracle stores this tag.
   */
  otherTickers: string[];
  /**
   * Stellar Asset Contract (C…) addresses used by Pubnet Pulse.
   * Pubnet feeds almost never use the human ticker as the contract key.
   */
  stellarContracts: string[];
};

const PUBNET = Networks.PUBLIC;

const USDC_ISSUER = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";
const AQUA_ISSUER = "GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA";
const PYUSD_ISSUER = "GDQE7IXJ4HUHV6RQHIUPRJSEZE4DRS5WY577O2FY6YQ5LVWZ7JZTU2V5";

const XLM_SAC = StellarAsset.native().contractId(PUBNET);
const USDC_SAC = new StellarAsset("USDC", USDC_ISSUER).contractId(PUBNET);
const AQUA_SAC = new StellarAsset("AQUA", AQUA_ISSUER).contractId(PUBNET);
const PYUSD_SAC = new StellarAsset("PYUSD", PYUSD_ISSUER).contractId(PUBNET);
const SOLVBTC_CONTRACT = "CBIJBDNZNF4X35BJ4FFZWCDBSCKOP5NB4PLG4SNENRMLAPYG4P5FM6VN";

/**
 * Labels for known C-addresses, including Circle USDC which is Pubnet Pulse
 * `base()` and is not a featured feed.
 */
const KNOWN_STELLAR_LABELS: Record<string, string> = {
  [XLM_SAC]: "XLM",
  [USDC_SAC]: "USDC",
  [AQUA_SAC]: "AQUA",
  [PYUSD_SAC]: "PYUSD",
  [SOLVBTC_CONTRACT]: "SolvBTC",
};

/**
 * Featured identities for the default Pubnet Pulse oracle.
 *
 * XLM, AQUA, and PYUSD are classic assets with a deterministic SAC.
 * SolvBTC is a contract token (`C…`), not a classic code+issuer pair.
 */
export const FEATURED_ASSET_REGISTRY: FeaturedMatchers[] = [
  {
    symbol: "XLM",
    otherTickers: ["XLM"],
    stellarContracts: [XLM_SAC],
  },
  {
    symbol: "AQUA",
    otherTickers: ["AQUA"],
    stellarContracts: [AQUA_SAC],
  },
  {
    symbol: "PYUSD",
    otherTickers: ["PYUSD"],
    stellarContracts: [
      PYUSD_SAC,
      "CAKBVGHJIK2HPP5JPT2UOP27O2IMKIUUCFGP3LOOMGCZLE3NP73Z44H6",
    ],
  },
  {
    symbol: "SolvBTC",
    otherTickers: ["SolvBTC"],
    stellarContracts: [SOLVBTC_CONTRACT],
  },
];

export function findOracleAsset(
  featured: FeaturedSymbol,
  oracleAssets: Asset[],
): Asset | undefined {
  const matchers = FEATURED_ASSET_REGISTRY.find((item) => item.symbol === featured);
  if (!matchers) {
    return undefined;
  }

  return oracleAssets.find((asset) => {
    const value = asset.values[0];
    if (asset.tag === "Other") {
      return matchers.otherTickers.includes(value);
    }

    return matchers.stellarContracts.includes(value);
  });
}

export function assetLabel(asset: Asset): string {
  if (asset.tag === "Other") {
    return asset.values[0];
  }

  const known = KNOWN_STELLAR_LABELS[asset.values[0]];
  if (known) {
    return known;
  }

  const id = asset.values[0];
  return `${id.slice(0, 4)}…${id.slice(-4)}`;
}

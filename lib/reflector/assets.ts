import type { Asset } from "@reflector/contract-client";
import { Asset as StellarAsset, Networks } from "@stellar/stellar-sdk";
import type { FeaturedSymbol } from "./types";

export const FEATURED_ASSETS = ["XLM", "USDC", "PYUSD", "SolvBTC"] as const;

type FeaturedMatchers = {
  symbol: FeaturedSymbol;
  /**
   * `Other` tickers used by CEX/DEX Pulse oracles.
   * Passing `"XLM"` to lastPrice() only works when the oracle lists this tag.
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
const PYUSD_ISSUER = "GDQE7IXJ4HUHV6RQHIUPRJSEZE4DRS5WY577O2FY6YQ5LVWZ7JZTU2V5";

/**
 * Known identities for the four featured symbols.
 *
 * Classic assets (XLM, Circle USDC, Paxos PYUSD) have a deterministic SAC
 * via `Asset.contractId(passphrase)`. SolvBTC on Stellar is a contract token
 * (`C…`), not a classic code+issuer pair, so its address is listed directly.
 */
export const FEATURED_ASSET_REGISTRY: FeaturedMatchers[] = [
  {
    symbol: "XLM",
    otherTickers: ["XLM"],
    stellarContracts: [StellarAsset.native().contractId(PUBNET)],
  },
  {
    symbol: "USDC",
    otherTickers: ["USDC"],
    stellarContracts: [new StellarAsset("USDC", USDC_ISSUER).contractId(PUBNET)],
  },
  {
    symbol: "PYUSD",
    otherTickers: ["PYUSD"],
    stellarContracts: [
      new StellarAsset("PYUSD", PYUSD_ISSUER).contractId(PUBNET),
      // Some listings use the token contract rather than the derived SAC.
      "CAKBVGHJIK2HPP5JPT2UOP27O2IMKIUUCFGP3LOOMGCZLE3NP73Z44H6",
    ],
  },
  {
    symbol: "SolvBTC",
    otherTickers: ["SolvBTC"],
    stellarContracts: [
      "CBIJBDNZNF4X35BJ4FFZWCDBSCKOP5NB4PLG4SNENRMLAPYG4P5FM6VN",
    ],
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

  const featured = FEATURED_ASSET_REGISTRY.find((item) =>
    item.stellarContracts.includes(asset.values[0]),
  );

  if (featured) {
    return featured.symbol;
  }

  const id = asset.values[0];
  return `${id.slice(0, 4)}…${id.slice(-4)}`;
}

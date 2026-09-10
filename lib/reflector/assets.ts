import type { Asset } from "@reflector/contract-client";
import { Asset as StellarAsset, Networks } from "@stellar/stellar-sdk";
import type { FeaturedSymbol } from "./types";

export const FEATURED_ASSETS = [
  "XLM",
  "AQUA",
  "PYUSD",
  "SolvBTC",
  "BTCLN",
  "yUSDC",
  "SSLX",
  "ARST",
  "EURC",
  "XRP",
  "XRF",
  "USDGLO",
] as const;

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
const SOLVBTC_CONTRACT =
  "CBIJBDNZNF4X35BJ4FFZWCDBSCKOP5NB4PLG4SNENRMLAPYG4P5FM6VN";

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
  {
    symbol: "BTCLN",
    otherTickers: ["BTCLN"],
    stellarContracts: [
      "CBHIQPUXLFLC5O44ZJVUTCL5LMZFLVGU5DEIGSYKBSAPFMOGTKOQEPFM",
    ],
  },
  {
    symbol: "yUSDC",
    otherTickers: ["yUSDC"],
    stellarContracts: [
      "CDOFW7HNKLUZRLFZST4EW7V3AV4JI5IHMT6BPXXSY2IEFZ4NE5TWU2P4",
    ],
  },
  {
    symbol: "SSLX",
    otherTickers: ["SSLX"],
    stellarContracts: [
      "CBHBD77PWZ3AXPQVYVDBHDKEMVNOR26UZUZHWCB6QC7J5SETQPRUQAS4",
    ],
  },
  {
    symbol: "ARST",
    otherTickers: ["ARST"],
    stellarContracts: [
      "CCRPYMVKZLWGZHEDZ23FOE22E3T3HOCNP5Y2EFZFVRUVIXU5NJ7UNGV2",
    ],
  },
  {
    symbol: "EURC",
    otherTickers: ["EURC"],
    stellarContracts: [
      "CBVDRT5474OBUEXF5MJB3UGQ5CG7CKGCAH5M4RV5NBCDJUBZ5OXHJLOU",
    ],
  },
  {
    symbol: "XRP",
    otherTickers: ["XRP"],
    stellarContracts: [
      "CAAV3AE3VKD2P4TY7LWTQMMJHIJ4WOCZ5ANCIJPC3NRSERKVXNHBU2W7",
    ],
  },
  {
    symbol: "XRF",
    otherTickers: ["XRF"],
    stellarContracts: [
      "CBLLEW7HD2RWATVSMLAGWM4G3WCHSHDJ25ALP4DI6LULV5TU35N2CIZA",
    ],
  },
  {
    symbol: "USDGLO",
    otherTickers: ["USDGLO"],
    stellarContracts: [
      "CB226ZOEYXTBPD3QEGABTJYSKZVBP2PASEISLG3SBMTN5CE4QZUVZ3CE",
    ],
  },
];

export function findOracleAsset(
  featured: FeaturedSymbol,
  oracleAssets: Asset[],
): Asset | undefined {
  const matchers = FEATURED_ASSET_REGISTRY.find(
    (item) => item.symbol === featured,
  );
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

  const known =
    KNOWN_STELLAR_LABELS[asset.values[0]] ??
    FEATURED_ASSET_REGISTRY.find((entry) =>
      entry.stellarContracts.includes(asset.values[0]),
    )?.symbol;
  if (known) {
    return known;
  }

  const id = asset.values[0];
  return `${id.slice(0, 4)}…${id.slice(-4)}`;
}

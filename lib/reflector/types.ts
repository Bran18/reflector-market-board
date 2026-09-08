import type { Asset } from "@reflector/contract-client";

export type FeaturedSymbol = "XLM" | "USDC" | "PYUSD" | "SolvBTC";

/**
 * Raw Pulse quote before any UI formatting.
 * `price` is the integer the contract stores; `decimals` says where the point goes.
 */
export type OraclePrice = {
  asset: FeaturedSymbol;
  oracleAsset: Asset;
  price: bigint;
  decimals: number;
  timestamp: bigint;
  base: Asset;
  resolution: number;
};

export type OracleSnapshot = {
  assets: Asset[];
  base: Asset;
  decimals: number;
  resolution: number;
  lastTimestamp: bigint;
  contractId: string;
  networkPassphrase: string;
};

export type MarketAsset =
  | {
      status: "available";
      asset: FeaturedSymbol;
      formattedPrice: string;
      displayPrice: string;
      rawPrice: bigint;
      decimals: number;
      timestamp: bigint;
      updatedLabel: string;
      resolution: number;
      baseLabel: string;
      network: string;
      contractId: string;
    }
  | {
      status: "unsupported";
      asset: FeaturedSymbol;
    }
  | {
      status: "quote_asset";
      asset: FeaturedSymbol;
      baseLabel: string;
    }
  | {
      status: "stale";
      asset: FeaturedSymbol;
      resolution: number;
      network: string;
      contractId: string;
    }
  | {
      status: "error";
      asset: FeaturedSymbol;
      message: string;
    };

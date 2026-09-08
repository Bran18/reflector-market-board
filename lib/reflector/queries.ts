import "server-only";

import { findOracleAsset, FEATURED_ASSETS, assetLabel } from "./assets";
import { getNetworkPassphrase, getPulseClient, getPulseContractId } from "./client";
import { logReflectorError, publicErrorMessage } from "./errors";
import { formatOraclePrice, formatQuote } from "./format-price";
import { formatUpdatedAt, networkLabel } from "./format-time";
import type { FeaturedSymbol, MarketAsset, OracleSnapshot } from "./types";

export { FEATURED_ASSETS };

export async function getOracleSnapshot(): Promise<OracleSnapshot> {
  const client = getPulseClient();

  const [assets, base, decimals, resolution, lastTimestamp] = await Promise.all([
    client.assets(),
    client.base(),
    client.decimals(),
    client.resolution(),
    client.lastTimestamp(),
  ]);

  return {
    assets,
    base,
    decimals,
    resolution,
    lastTimestamp,
    contractId: getPulseContractId(),
    networkPassphrase: getNetworkPassphrase(),
  };
}

export async function getMarketAsset(
  symbol: FeaturedSymbol,
  snapshot: OracleSnapshot,
): Promise<MarketAsset> {
  const oracleAsset = findOracleAsset(symbol, snapshot.assets);

  if (!oracleAsset) {
    const baseMatch = findOracleAsset(symbol, [snapshot.base]);
    if (baseMatch) {
      return {
        status: "quote_asset",
        asset: symbol,
        baseLabel: assetLabel(snapshot.base),
      };
    }

    return { status: "unsupported", asset: symbol };
  }

  try {
    const data = await getPulseClient().lastPrice(oracleAsset);

    if (!data) {
      // Feed is listed on this oracle, but lastPrice returned none.
      // That usually means the record is missing or considered stale.
      return {
        status: "stale",
        asset: symbol,
        resolution: snapshot.resolution,
        network: networkLabel(snapshot.networkPassphrase),
        contractId: snapshot.contractId,
      };
    }

    const formattedPrice = formatOraclePrice(data.price, snapshot.decimals);
    const baseLabel = assetLabel(snapshot.base);

    return {
      status: "available",
      asset: symbol,
      formattedPrice,
      displayPrice: formatQuote(formattedPrice, baseLabel),
      rawPrice: data.price,
      decimals: snapshot.decimals,
      timestamp: data.timestamp,
      updatedLabel: formatUpdatedAt(data.timestamp),
      resolution: snapshot.resolution,
      baseLabel,
      network: networkLabel(snapshot.networkPassphrase),
      contractId: snapshot.contractId,
    };
  } catch (error) {
    logReflectorError(`Failed to fetch Reflector price for ${symbol}`, error);
    return {
      status: "error",
      asset: symbol,
      message: publicErrorMessage(error),
    };
  }
}

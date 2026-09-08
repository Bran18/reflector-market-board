import "server-only";

import { FEATURED_ASSETS, getMarketAsset } from "@/lib/reflector/queries";
import type { OracleSnapshot } from "@/lib/reflector/types";
import { MarketCard, MarketCardSkeleton } from "./market-card";
import { Suspense } from "react";

export function MarketGrid({ snapshot }: { snapshot: OracleSnapshot }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      {FEATURED_ASSETS.map((asset) => (
        <Suspense key={asset} fallback={<MarketCardSkeleton asset={asset} />}>
          <MarketCardSlot asset={asset} snapshot={snapshot} />
        </Suspense>
      ))}
    </section>
  );
}

async function MarketCardSlot({
  asset,
  snapshot,
}: {
  asset: (typeof FEATURED_ASSETS)[number];
  snapshot: OracleSnapshot;
}) {
  const market = await getMarketAsset(asset, snapshot);
  return <MarketCard market={asset} data={market} />;
}

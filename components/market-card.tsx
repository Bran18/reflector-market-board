import type { MarketAsset } from "@/lib/reflector/types";
import { OracleDetails } from "./oracle-details";

export function MarketCardSkeleton({ asset }: { asset: string }) {
  return (
    <article className="flex min-h-56 flex-col border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-sm tracking-[0.2em] text-zinc-500">{asset}</p>
      <div className="mt-6 h-10 w-40 animate-pulse bg-zinc-100 dark:bg-zinc-900" />
      <p className="mt-4 text-sm text-zinc-400">Loading Pulse feed…</p>
    </article>
  );
}

export function MarketCard({
  market,
  data,
}: {
  market: string;
  data: MarketAsset;
}) {
  return (
    <article className="flex min-h-56 flex-col border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-sm tracking-[0.2em] text-zinc-900 dark:text-zinc-100">
          {market}
        </h2>
        <span className="text-xs tracking-wide text-zinc-400">Pulse</span>
      </div>

      {data.status === "available" ? (
        <>
          <p className="mt-6 font-mono text-3xl tracking-tight text-zinc-950 dark:text-zinc-50">
            {data.displayPrice}
          </p>
          <p className="mt-3 text-sm text-zinc-500">{data.updatedLabel}</p>
          <div className="mt-auto pt-6">
            <OracleDetails data={data} />
          </div>
        </>
      ) : null}

      {data.status === "unsupported" ? (
        <p className="mt-6 text-sm leading-6 text-zinc-500">
          Feed unavailable on this oracle
        </p>
      ) : null}

      {data.status === "quote_asset" ? (
        <p className="mt-6 text-sm leading-6 text-zinc-500">
          {data.asset} is the quote asset of this Pulse oracle ({data.baseLabel}
          ). Other cards are already priced in {data.baseLabel}, so there is no
          {` ${data.asset}/${data.baseLabel} `} feed.
        </p>
      ) : null}

      {data.status === "stale" ? (
        <>
          <p className="mt-6 text-sm leading-6 text-zinc-500">
            No current price. Pulse `lastPrice` returned empty for this listed
            feed — the record is missing or stale.
          </p>
          <p className="mt-3 text-xs text-zinc-400">
            Resolution {data.resolution} seconds
          </p>
        </>
      ) : null}

      {data.status === "error" ? (
        <p className="mt-6 text-sm leading-6 text-zinc-500">{data.message}</p>
      ) : null}
    </article>
  );
}

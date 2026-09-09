import { formatOraclePrice } from "@/lib/reflector/format-price";
import type { MarketAsset } from "@/lib/reflector/types";

type AvailableMarket = Extract<MarketAsset, { status: "available" }>;

export function OracleDetails({ data }: { data: AvailableMarket }) {
  const rows = [
    ["Oracle", "Pulse"],
    ["Network", data.network],
    ["Quoted in", data.baseLabel],
    ["Raw price", data.rawPrice.toString()],
    ["Decimals", String(data.decimals)],
    ["Timestamp (s)", data.timestamp.toString()],
    ["Updated (UTC)", new Date(Number(data.timestamp) * 1000).toISOString()],
    ["Resolution", `${data.resolution} seconds`],
    ["Contract", data.contractId],
  ];

  return (
    <details className="group border-t border-zinc-100 pt-4 dark:border-zinc-800">
      <summary className="cursor-pointer text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
        Oracle details
      </summary>
      <dl className="mt-4 space-y-2 font-mono text-xs text-zinc-600 dark:text-zinc-400">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[7rem_1fr] gap-2">
            <dt className="text-zinc-400">{label}</dt>
            <dd className="break-all text-zinc-700 dark:text-zinc-300">
              {value}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 space-y-2 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
        <p>
          Reflector returns integer prices. The oracle’s <code>decimals()</code>{" "}
          sets the scale:
        </p>
        <p className="font-mono">
          rawPrice / 10^decimals = human-readable price
        </p>
        <p className="break-all font-mono">
          {data.rawPrice.toString()} / 10^{data.decimals} ={" "}
          {formatOraclePrice(data.rawPrice, data.decimals, true)}{" "}
          {data.baseLabel}
        </p>
        <p>
          The card displays {data.displayPrice}, truncating to at most 8
          fraction digits. Bigint arithmetic preserves the raw value without
          converting it to a floating-point Number.
        </p>
      </div>
    </details>
  );
}

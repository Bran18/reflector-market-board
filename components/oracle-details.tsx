import type { MarketAsset } from "@/lib/reflector/types";

type AvailableMarket = Extract<MarketAsset, { status: "available" }>;

export function OracleDetails({ data }: { data: AvailableMarket }) {
  const rows = [
    ["Oracle", "Pulse"],
    ["Network", data.network],
    ["Quoted in", data.baseLabel],
    ["Raw price", data.rawPrice.toString()],
    ["Decimals", String(data.decimals)],
    ["Timestamp", data.timestamp.toString()],
    ["Resolution", `${data.resolution} seconds`],
    ["Contract", `${data.contractId.slice(0, 8)}…${data.contractId.slice(-4)}`],
  ];

  return (
    <details className="group border-t border-zinc-100 pt-4 dark:border-zinc-800">
      <summary className="cursor-pointer text-sm text-zinc-500 outline-none hover:text-zinc-800 dark:hover:text-zinc-200">
        Oracle details
      </summary>
      <dl className="mt-4 space-y-2 font-mono text-xs text-zinc-600 dark:text-zinc-400">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[7rem_1fr] gap-2">
            <dt className="text-zinc-400">{label}</dt>
            <dd className="break-all text-zinc-700 dark:text-zinc-300">{value}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

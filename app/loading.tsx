import { MarketCardSkeleton } from "@/components/market-card";
import { FEATURED_ASSETS } from "@/lib/reflector/assets";

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-12 sm:px-8 sm:py-16">
      <div className="space-y-3 border-b border-zinc-200 pb-10 dark:border-zinc-800">
        <p className="text-xs tracking-[0.35em] text-zinc-500">REFLECTOR</p>
        <div className="h-8 w-64 animate-pulse bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <section className="grid gap-4 sm:grid-cols-2">
        {FEATURED_ASSETS.map((asset) => (
          <MarketCardSkeleton key={asset} asset={asset} />
        ))}
      </section>
    </div>
  );
}

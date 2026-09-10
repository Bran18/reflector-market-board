"use client";

import { useState, type ReactNode } from "react";

export function FeedSelector({
  feeds,
}: {
  feeds: { symbol: string; card: ReactNode }[];
}) {
  const [selected, setSelected] = useState("all");

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="market-board" className="text-xl font-medium">
            Explore live feeds
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Choose a feed and open its oracle details to explore the price.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <label htmlFor="feed-selector" className="text-xs text-zinc-500">
            Price feed
          </label>
          <select
            id="feed-selector"
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
            className="min-w-48 border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          >
            <option value="all">All featured feeds</option>
            {feeds.map(({ symbol }) => (
              <option key={symbol} value={symbol}>
                {symbol}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {selected === "all"
          ? "Showing all featured feeds"
          : `Showing ${selected} feed`}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {feeds.map(({ symbol, card }) => (
          <div
            key={symbol}
            hidden={selected !== "all" && selected !== symbol}
            className="min-w-0"
          >
            {card}
          </div>
        ))}
      </div>
      <p className="text-xs text-zinc-500">
        Prices are read on page load. Reload for the latest oracle update.
      </p>
    </div>
  );
}

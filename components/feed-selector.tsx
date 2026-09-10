"use client";

import { useState, type ReactNode } from "react";
import type { FeaturedSymbol } from "@/lib/reflector/types";

import { DEFAULT_FEEDS } from "@/lib/reflector/display-feeds";

export function FeedSelector({
  feeds,
}: {
  feeds: { symbol: FeaturedSymbol; card: ReactNode }[];
}) {
  const [selected, setSelected] = useState("all");
  const [showMore, setShowMore] = useState(false);
  const defaultFeeds = DEFAULT_FEEDS.flatMap((symbol) =>
    feeds.filter((feed) => feed.symbol === symbol),
  );
  const remainingFeeds = feeds.filter(
    (feed) => !DEFAULT_FEEDS.includes(feed.symbol),
  );
  const orderedFeeds = [...defaultFeeds, ...remainingFeeds];

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
      {selected === "all" && remainingFeeds.length > 0 ? (
        <button
          type="button"
          aria-expanded={showMore}
          aria-controls="feed-cards"
          onClick={() => setShowMore((expanded) => !expanded)}
          className="border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          {showMore ? "Show less" : `Show more (${remainingFeeds.length})`}
        </button>
      ) : null}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {selected === "all"
          ? `Showing ${showMore ? feeds.length : defaultFeeds.length} featured feeds`
          : `Showing ${selected} feed`}
      </div>
      <div id="feed-cards" className="grid gap-4 sm:grid-cols-2">
        {orderedFeeds.map(({ symbol, card }) => (
          <div
            key={symbol}
            hidden={
              selected === "all"
                ? !showMore && !DEFAULT_FEEDS.includes(symbol)
                : selected !== symbol
            }
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

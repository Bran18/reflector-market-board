import { LINKS } from "@/lib/links";
import { FEATURED_ASSETS } from "@/lib/reflector/assets";

const clientExample = `import { PulseClient } from "@reflector/contract-client";
import { Networks } from "@stellar/stellar-sdk";

// Inside createPulseClient() in lib/reflector/client.ts:
return new PulseClient({
  publicKey: requiredEnv("REFLECTOR_PUBLIC_KEY"),
  rpcUrl: requiredEnv("REFLECTOR_RPC_URL"),
  contractId: requiredEnv("REFLECTOR_PULSE_CONTRACT_ID"),
  networkPassphrase:
    process.env.REFLECTOR_NETWORK_PASSPHRASE?.trim() || Networks.PUBLIC,
});`;

const priceExample = `// Inside getMarketAsset() in lib/reflector/queries.ts:
const oracleAsset = findOracleAsset(symbol, snapshot.assets);
// After checking that oracleAsset exists:
const data = await getPulseClient().lastPrice(oracleAsset);`;

export function Walkthrough({ contractId }: { contractId?: string }) {
  return (
    <section
      id="learn"
      aria-labelledby="learn-heading"
      className="min-w-0 scroll-mt-8 border border-zinc-200 bg-white p-5 text-sm leading-6 text-zinc-600 sm:p-8 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400"
    >
      <p className="text-xs tracking-[0.2em] text-zinc-500">
        DEVELOPER WALKTHROUGH
      </p>
      <h2
        id="learn-heading"
        className="mt-2 text-2xl font-medium text-zinc-950 dark:text-zinc-50"
      >
        Build with Reflector
      </h2>
      <p className="mt-3">
        Follow the price from the oracle to the card, then try adding a feed
        yourself.
      </p>
      <details className="mt-6">
        <summary className="cursor-pointer font-medium text-zinc-900 dark:text-zinc-100">
          How it works, why no wallet, and your first integration
        </summary>
        <div className="mt-6 space-y-10">
          <section
            aria-labelledby="how-it-works"
            className="space-y-4 border-t border-zinc-200 pt-8 dark:border-zinc-800"
          >
            <h3
              id="how-it-works"
              className="text-xl font-medium text-zinc-950 dark:text-zinc-50"
            >
              How it works
            </h3>
            <p>
              Next.js uses{" "}
              <a href={LINKS.sdk} className="underline underline-offset-4">
                @reflector/contract-client
              </a>{" "}
              to read live oracle data. PulseClient sends a simulated invocation
              through Soroban RPC to the configured Reflector Pulse contract.
            </p>
            <ol
              aria-label="Price read flow"
              className="flex flex-wrap items-center gap-2 font-mono text-xs text-zinc-800 dark:text-zinc-200"
            >
              {[
                "PulseClient",
                "Soroban RPC",
                "Reflector Pulse contract",
                "lastPrice(asset)",
                "Server Component",
                "Market card",
              ].map((step, index) => (
                <li key={step} className="flex items-center gap-2">
                  {index > 0 ? <span aria-hidden="true">→</span> : null}
                  <span className="border border-zinc-200 px-3 py-2 dark:border-zinc-800">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
            <p>
              The <code>contractId</code> comes from{" "}
              <code>REFLECTOR_PULSE_CONTRACT_ID</code> in your server
              environment. The example environment selects Stellar Pubnet Pulse;
              explore{" "}
              <a href={LINKS.pulse} className="underline underline-offset-4">
                Pulse deployments
              </a>{" "}
              for supported feeds.
            </p>
            {contractId ? (
              <p className="break-all font-mono text-xs">
                Current contract: {contractId}
              </p>
            ) : null}
            <details
              className="border border-zinc-200 p-4 dark:border-zinc-800"
              open
            >
              <summary className="cursor-pointer font-medium text-zinc-900 dark:text-zinc-100">
                Initialize the client · lib/reflector/client.ts
              </summary>
              <pre
                className="mt-4 overflow-x-auto text-xs leading-6"
                tabIndex={0}
              >
                <code>{clientExample}</code>
              </pre>
              <p className="mt-3">
                <code>requiredEnv()</code> is the local helper that validates
                required settings. <code>getPulseClient()</code> creates this
                client once and reuses it.
              </p>
            </details>
            <pre
              className="overflow-x-auto border border-zinc-200 p-4 text-xs leading-6 dark:border-zinc-800"
              tabIndex={0}
            >
              <code>{priceExample}</code>
            </pre>
            <p>
              <code>getOracleSnapshot()</code> loads <code>assets()</code> and
              shared metadata. <code>findOracleAsset()</code> matches a
              configured symbol to an actual listed asset. If{" "}
              <code>lastPrice()</code> returns a record,{" "}
              <code>getMarketAsset()</code> formats it, and the async{" "}
              <code>MarketCardSlot</code> Server Component passes it to{" "}
              <code>MarketCard</code>. Missing feeds and empty records get
              explicit fallback cards.
            </p>
            <p>
              Open any card’s <strong>Oracle details</strong> for its raw
              integer, decimals, exact conversion, UTC timestamp, and full
              contract ID. Feed resolution is the oracle’s interval, not the age
              of an individual price. Ages are calculated when the server
              renders; reload to fetch again.
            </p>
          </section>

          <section aria-labelledby="no-wallet" className="space-y-3">
            <h3
              id="no-wallet"
              className="text-xl font-medium text-zinc-950 dark:text-zinc-50"
            >
              Why no wallet?
            </h3>
            <p>
              These public Pulse reads simulate contract calls through Soroban
              RPC. They do not sign or submit transactions. The SDK needs a
              public G-address to build the simulation envelope, but no secret
              key, Freighter connection, or signing callback is needed. Next.js
              performs the reads on the server and renders the results for your
              browser.
            </p>
          </section>

          <section
            aria-labelledby="your-turn"
            className="space-y-4 border-t border-zinc-200 pt-8 dark:border-zinc-800"
          >
            <h3
              id="your-turn"
              className="text-xl font-medium text-zinc-950 dark:text-zinc-50"
            >
              Your turn: add another feed
            </h3>
            <p>
              Add one more Reflector-supported asset to the board by editing{" "}
              <code>lib/reflector/assets.ts</code>. This is the current list:
            </p>
            <pre
              className="overflow-x-auto border border-zinc-200 p-4 text-xs dark:border-zinc-800"
              tabIndex={0}
            >
              <code>{`export const FEATURED_ASSETS = ${JSON.stringify(FEATURED_ASSETS)} as const;`}</code>
            </pre>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                Inspect <code>await getPulseClient().assets()</code> on the
                server, or use the{" "}
                <a href={LINKS.pulse} className="underline underline-offset-4">
                  Pulse asset list
                </a>
                , to choose a feed on your configured contract. The quote asset
                returned by <code>base()</code> is not a separate price feed.
              </li>
              <li>
                Add its display symbol to <code>FEATURED_ASSETS</code> and a
                matching entry to <code>FEATURED_ASSET_REGISTRY</code> in the
                same file. For a <code>Stellar</code> asset, put its exact
                C-address in <code>stellarContracts</code>; for an{" "}
                <code>Other</code> asset, put its exact ticker in{" "}
                <code>otherTickers</code>. Use an empty array for the unused
                kind. A ticker alone will not match a Stellar contract address.
              </li>
              <li>
                Follow the{" "}
                <a
                  href={LINKS.source + "#installation"}
                  className="underline underline-offset-4"
                >
                  README setup
                </a>
                , then run <code>npm run dev</code> and open{" "}
                <code>localhost:3000</code>.
              </li>
              <li>
                Confirm the new card returns a price and inspect its raw value.
                If the feed is unavailable, check the identifier against{" "}
                <code>assets()</code> on the same contract; an empty{" "}
                <code>lastPrice()</code> means no current record.
              </li>
            </ol>
            <p>
              The grid uses the same client methods for every configured asset.
              No new data source or UI logic is needed.
            </p>
          </section>
        </div>
      </details>
    </section>
  );
}

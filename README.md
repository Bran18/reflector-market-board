# Reflector Market Board

A small Next.js reference app that reads **Reflector Pulse**, a public Reflector price oracle, with [`@reflector/contract-client`](https://github.com/reflector-network/contract-client-js).

It is meant to be cloned, read, and copied from — not a production trading dashboard.

## What this project is

A Server Component page that:

1. Connects to one Pulse oracle contract.
2. Asks the contract which assets it quotes.
3. Fetches `lastPrice` for the configured featured assets when they exist on that oracle.
4. Formats integer oracle prices using the contract `decimals()` value.
5. Shows raw Pulse metadata so you can see how the data is actually stored.

[View the live board](https://reflector-market-board.vercel.app/) · [Read Reflector docs](https://reflector.network/docs)

The main board shows PYUSD, XLM, SolvBTC, and USDGLO by default, in that order.
**Show more** reveals the remaining feeds; **Show less** returns to those four.
The dropdown retains every configured featured feed and can show any individual
asset directly, including feeds hidden in the default view. It filters
server-rendered cards locally; changing the selection does not fetch new prices.
Reload for fresh data. The **Build with Reflector** section groups the expandable
walkthrough and asset exercise. X and Discord links stay in
the header for community support.

## What you will learn

- How to install `@reflector/contract-client` and its `@stellar/stellar-sdk` peer.
- How to construct a `PulseClient` (and why Pulse, not Beam).
- How to choose a Pulse `contractId` among several live deployments.
- How to discover feeds with `assets()`.
- Why `"XLM"` as a string is not always a valid Pulse asset key.
- How to fetch the latest quote with `lastPrice()`.
- How `PriceData` is shaped (`price: bigint`, `timestamp` in seconds).
- How to format bigint prices without `Number(price)`.
- How resolution and timestamps relate to “updated X seconds ago”.
- How to treat missing `lastPrice` as stale/unavailable instead of crashing.
- How to keep Reflector logic out of UI components in the App Router.

## Architecture

```text
┌─────────────────────┐
│       Browser       │
└──────────┬─────────┘
           │
           ▼
┌─────────────────────┐
│       Next.js       │
│   Server Components  │
└──────────┬─────────┘
           │
           ▼
┌─────────────────────────────┐
│ @reflector/contract-client    │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────┐
│     Stellar RPC     │
└──────────┬─────────┘
           │
           ▼
┌─────────────────────┐
│  Reflector Pulse     │
│  Soroban Contract    │
└─────────────────────┘
```

| Layer                        | Role                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------ |
| Browser                      | Renders HTML. No wallet, no secret keys, no extra price APIs.                              |
| Next.js Server Components    | Call `lib/reflector` during render. `Suspense` lets each card wait on its own `lastPrice`. |
| `@reflector/contract-client` | Builds and **simulates** Soroban invocations. Reads do not sign or submit.                 |
| Stellar RPC                  | Runs `simulateTransaction` against the Pulse contract. Horizon is not enough.              |
| Pulse contract               | Stores integer prices, decimals, resolution, and the asset list on-chain.                  |

v1 stays on the server so the first example does not depend on a browser wallet. A later example could call `PulseClient` in the browser the same way.

## Requirements

- Node.js 22+
- npm
- A Soroban RPC URL for Pubnet (or Testnet, if you point `contractId` at a test oracle)
- A Stellar **public** key (`G…`) used only as the simulation source account

## Installation

```bash
git clone https://github.com/Bran18/reflector-market-board.git
cd reflector-market-board
npm install
cp .env.example .env.local
```

Fill `.env.local`, then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To use the same SDK in an existing project:

```bash
npm install @reflector/contract-client @stellar/stellar-sdk
```

## Environment variables

These are **server-only**. They are not `NEXT_PUBLIC_*` because the Pulse client never runs in the browser in this app.

| Variable                       | Required | Purpose                                                                                                                                                              |
| ------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `REFLECTOR_PUBLIC_KEY`         | yes      | Source account on simulated transactions. No secret, no wallet, usually no balance required. The JS client still needs a G-address to build the simulation envelope. |
| `REFLECTOR_RPC_URL`            | yes      | Soroban JSON-RPC. Example from the official client README: `https://rpc.lightsail.network/`                                                                          |
| `REFLECTOR_PULSE_CONTRACT_ID`  | yes      | Which Pulse instance to read. Several exist; see below.                                                                                                              |
| `REFLECTOR_NETWORK_PASSPHRASE` | no       | Defaults to Pubnet. Set the Testnet passphrase when using test contracts.                                                                                            |

Default `REFLECTOR_PULSE_CONTRACT_ID` in `.env.example` is **Stellar Pubnet Pulse**:

`CALI2BYU2JE6WVRUFYTS6MSBNEHGJ35P4AVCZYF3B6QOE3QKOB2PLE6M`

That oracle quotes Stellar-issued assets (typically in USDC). The featured list includes XLM, AQUA, PYUSD, SolvBTC, BTCLN, yUSDC, SSLX, ARST, EURC, XRP, XRF, and USDGLO. Each is matched by its Stellar contract address, since tickers can be shared by different issuers.

Other public Pulse contracts ([Reflector Pulse](https://reflector.network/pulse), [Stellar oracle providers](https://developers.stellar.org/docs/data/oracles/oracle-providers)):

| Oracle             | Contract                                                   | Typical quotes                               |
| ------------------ | ---------------------------------------------------------- | -------------------------------------------- |
| External CEX & DEX | `CAFJZQWSED6YAWZU3GWRTOCNPPCGBN32L7QV43XX5LZLFTK6JLN34DLN` | `Other` tickers such as `BTC`, quoted in USD |
| Stellar Pubnet     | `CALI2BYU2JE6WVRUFYTS6MSBNEHGJ35P4AVCZYF3B6QOE3QKOB2PLE6M` | `Stellar` SAC addresses, quoted in USDC      |
| Fiat FX            | `CBKGPWGKSKZF52CFHMTRR23TBWTPMRDIYZ4O2P5VS65BMHYH4DXMCJZC` | Fiat symbols                                 |

If you point this app at the CEX oracle, tickers such as `BTC` and often `XLM` resolve as `Other` symbols, while AQUA / PYUSD / SolvBTC will often show **Feed unavailable on this oracle**. That is intentional: the UI never assumes a feed exists.

**Pubnet Pulse quotes in USDC.** Circle USDC is `base()`, not a row in `assets()`. It is not a featured card. If a featured symbol ever matches `base()`, the card explains that instead of inventing a 1.00 price.

## Connecting to Reflector Pulse

```ts
import { PulseClient } from "@reflector/contract-client";
import { Networks } from "@stellar/stellar-sdk";

const pulse = new PulseClient({
  publicKey: process.env.REFLECTOR_PUBLIC_KEY!,
  rpcUrl: process.env.REFLECTOR_RPC_URL!,
  contractId: process.env.REFLECTOR_PULSE_CONTRACT_ID!,
  networkPassphrase:
    process.env.REFLECTOR_NETWORK_PASSPHRASE?.trim() || Networks.PUBLIC,
});
```

This minimal example assumes the required environment variables are set. The implementation in `client.ts` validates them with `requiredEnv()` and reuses the client through `getPulseClient()`.

Pulse vs Beam:

- **Pulse** — public feeds, `lastPrice(asset)` with no prepaid access.
- **Beam** — prepaid `track()` access; every price read needs a `caller` with access. Not used here.

This app does not pass `signTransaction`. That callback is only required for writes (`extendAssetTtl`, admin methods, etc.).

See [`lib/reflector/client.ts`](lib/reflector/client.ts).

## Discovering supported assets

```ts
const listed = await pulse.assets();
```

Each asset is a tagged union:

```ts
{ tag: "Stellar", values: ["C…contract"] } | { tag: "Other", values: ["BTC"] }
```

`lastPrice("XLM")` only works when the oracle stores `Other("XLM")`. Pubnet Pulse usually stores native XLM as its Stellar Asset Contract:

`CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA`

This demo keeps a featured registry (display symbol → `Other` tickers and known `C…` addresses), then **intersects** it with `assets()`. If there is no match, the card renders unavailable and `lastPrice` is not called.

That mapping is the main integration friction this example exists to show. See [`lib/reflector/assets.ts`](lib/reflector/assets.ts).

## Fetching the latest price

```ts
const data = await pulse.lastPrice(oracleAsset);

if (!data) {
  // listed, but no usable current record
}
```

Never assume `lastPrice` returns an object. An empty result is how Pulse reports a missing or stale snapshot.

Shared metadata comes from consumer methods only:

- `assets()`
- `base()`
- `decimals()`
- `lastTimestamp()`
- `resolution()`

Admin / cluster methods (`config`, `setPrice`, `addAssets`, …) are not used.

## Understanding PriceData

```ts
type PriceData = {
  price: bigint; // integer scaled by decimals()
  timestamp: bigint; // unix seconds on public methods
};
```

Decimals live on the **oracle**, not on each `PriceData` row. Fetch `decimals()` once per oracle. Live Pulse deployments typically use `14`.

`resolution()` is the tick size in **seconds** (Pulse is commonly 300). Internal admin config uses milliseconds — do not mix the two.

## Formatting bigint prices

```ts
formatOraclePrice(39182000000000n, 14);
// "0.39182"
```

Human value = `price / 10^decimals`.

For example, `18394515104679 / 10^14 = 0.18394515104679`.
The card truncates to at most eight fraction digits (`0.18394515` here).
Open **Oracle details** for a calculation using that card’s actual returned value;
`formatOraclePrice(price, decimals, true)` preserves every fraction digit.
The quote unit comes from `base()`; decimals come from `decimals()`.

Do not do this:

```ts
Number(price) / 10 ** decimals;
```

`Number` is a 64-bit float. Oracle integers at 14 decimals are larger than that type can represent exactly.

Implementation: [`lib/reflector/format-price.ts`](lib/reflector/format-price.ts).

Prices are quoted in `base()`, not necessarily USD. The UI prefixes `$` only when the base label is `USD` or `USDC`.

## Handling unavailable feeds

| Situation                              | UI                                                         |
| -------------------------------------- | ---------------------------------------------------------- |
| Featured symbol not in `assets()`      | “Feed unavailable on this oracle”                          |
| Featured symbol is the oracle `base()` | Explains it is the quote asset, not a feed                 |
| In `assets()` but `lastPrice` is empty | Stale / no current price                                   |
| RPC or simulation throws               | Short error on that card (or the page, if metadata failed) |
| Still loading                          | Card skeleton inside `Suspense`                            |

Simulation failures may include `error.events`. Those are logged in the server console and not shown as stack traces in the page.

## Understanding timestamps and resolution

Public client helpers (`lastPrice`, `lastTimestamp`, `resolution`, `historyRetentionPeriod`) use **seconds**.

“Last update: 14 sec ago” is `now - PriceData.timestamp`. Pulse often publishes every `resolution` seconds (5 minutes), so the age can sit near that interval even when the feed is healthy.

## Running the project

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
npm run start
```

The page is `force-dynamic`: it reads prices on each request, and the production build does not query RPC. Ages are computed during server rendering; there is no polling timer. Reload to fetch fresh data. Feed resolution is the oracle interval (for example, `5 min`), not a promise that every asset has just updated. Exact timestamps and resolution in seconds remain in Oracle details.

## Project structure

```text
app/
  layout.tsx
  page.tsx          # loads oracle metadata, isolates RPC failures
  loading.tsx
  error.tsx
  globals.css
components/
  header.tsx
  market-grid.tsx   # Suspense per featured asset
  market-card.tsx
  oracle-details.tsx
  oracle-error.tsx
lib/reflector/
  client.ts         # PulseClient singleton
  assets.ts         # featured symbols vs oracle Asset union
  queries.ts        # snapshot + lastPrice
  format-price.ts
  format-time.ts
  types.ts
  errors.ts
.env.example
```

Presentation components do not import `PulseClient`. They receive a `MarketAsset` view model.

## Your turn: add another asset

1. Inspect `await getPulseClient().assets()` on the server to select a feed on
   your configured Pulse contract. Keep the returned tag and identifier. The
   asset from `base()` is the quote unit, not a separate feed.
2. Open [`lib/reflector/assets.ts`](lib/reflector/assets.ts). Add the display
   symbol to the existing list:

   ```ts
   export const FEATURED_ASSETS = [
     "XLM",
     "AQUA",
     "PYUSD",
     "SolvBTC",
     "BTCLN",
     "yUSDC",
     "SSLX",
     "ARST",
     "EURC",
     "XRP",
     "XRF",
     "USDGLO",
   ] as const;
   ```

3. Add an entry to `FEATURED_ASSET_REGISTRY` in that same file with `symbol`,
   `otherTickers`, and `stellarContracts`. Copy a `Stellar` asset’s exact
   C-address into `stellarContracts`, or an `Other` asset’s exact ticker into
   `otherTickers`; leave the unused array empty. Do not substitute a display
   ticker for a Stellar contract identifier. `FeaturedSymbol` is derived from
   the list, so there is no separate type union to edit.
4. Run `npm run dev`, reload the board, and confirm the new card has a price.
   Expand Oracle details and check its raw value and conversion. An unsupported
   card means no matching identifier; an empty `lastPrice` means no current record.

The grid automatically uses `getMarketAsset()` for every featured symbol.
It matches against `snapshot.assets`, calls `lastPrice(oracleAsset)`, formats
with the oracle decimals, and passes the result from `MarketCardSlot` to
`MarketCard`. No additional price API or client-side state is needed.

## Reflector resources

- JS client: [github.com/reflector-network/contract-client-js](https://github.com/reflector-network/contract-client-js)
- Pulse deployments: [reflector.network/pulse](https://reflector.network/pulse)
- Protocol docs: [reflector.network/docs](https://reflector.network/docs)
- X: [x.com/in_reflector](https://x.com/in_reflector)
- Discord: [discord.gg/axzHwqUtG](https://discord.gg/axzHwqUtG)
- Stellar oracle list: [developers.stellar.org/docs/data/oracles/oracle-providers](https://developers.stellar.org/docs/data/oracles/oracle-providers)

## License

MIT (application code in this repository). `@reflector/contract-client` is separately licensed by its authors.

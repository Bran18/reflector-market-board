# Reflector Market Board

A small Next.js reference app that reads **Reflector Pulse** price feeds with [`@reflector/contract-client`](https://github.com/reflector-network/contract-client-js).

It is meant to be cloned, read, and copied from — not a production trading dashboard.

## What this project is

A Server Component page that:

1. Connects to one Pulse oracle contract.
2. Asks the contract which assets it quotes.
3. Fetches `lastPrice` for XLM, USDC, PYUSD, and SolvBTC when they exist on that oracle.
4. Formats integer oracle prices using the contract `decimals()` value.
5. Shows raw Pulse metadata so you can see how the data is actually stored.

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

| Layer | Role |
| --- | --- |
| Browser | Renders HTML. No wallet, no secret keys, no extra price APIs. |
| Next.js Server Components | Call `lib/reflector` during render. `Suspense` lets each card wait on its own `lastPrice`. |
| `@reflector/contract-client` | Builds and **simulates** Soroban invocations. Reads do not sign or submit. |
| Stellar RPC | Runs `simulateTransaction` against the Pulse contract. Horizon is not enough. |
| Pulse contract | Stores integer prices, decimals, resolution, and the asset list on-chain. |

v1 stays on the server so the first example does not depend on a browser wallet. A later example could call `PulseClient` in the browser the same way.

## Requirements

- Node.js 22+
- npm
- A Soroban RPC URL for Pubnet (or Testnet, if you point `contractId` at a test oracle)
- A Stellar **public** key (`G…`) used only as the simulation source account

## Installation

```bash
git clone <this-repo>
cd reflector-market-board
npm install
cp .env.example .env.local
```

Fill `.env.local`, then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

These are **server-only**. They are not `NEXT_PUBLIC_*` because the Pulse client never runs in the browser in this app.

| Variable | Required | Purpose |
| --- | --- | --- |
| `REFLECTOR_PUBLIC_KEY` | yes | Source account on simulated transactions. No secret, no wallet, usually no balance required. The JS client still needs a G-address to build the simulation envelope. |
| `REFLECTOR_RPC_URL` | yes | Soroban JSON-RPC. Example from the official client README: `https://rpc.lightsail.network/` |
| `REFLECTOR_PULSE_CONTRACT_ID` | yes | Which Pulse instance to read. Several exist; see below. |
| `REFLECTOR_NETWORK_PASSPHRASE` | no | Defaults to Pubnet. Set the Testnet passphrase when using test contracts. |

Default `REFLECTOR_PULSE_CONTRACT_ID` in `.env.example` is **Stellar Pubnet Pulse**:

`CALI2BYU2JE6WVRUFYTS6MSBNEHGJ35P4AVCZYF3B6QOE3QKOB2PLE6M`

That oracle quotes Stellar-issued assets (typically in USDC). The featured set is Stellar-native, so this is the instance most likely to list them.

Other public Pulse contracts ([Reflector Pulse](https://reflector.network/pulse), [Stellar oracle providers](https://developers.stellar.org/docs/data/oracles/oracle-providers)):

| Oracle | Contract | Typical quotes |
| --- | --- | --- |
| External CEX & DEX | `CAFJZQWSED6YAWZU3GWRTOCNPPCGBN32L7QV43XX5LZLFTK6JLN34DLN` | `Other` tickers such as `BTC`, quoted in USD |
| Stellar Pubnet | `CALI2BYU2JE6WVRUFYTS6MSBNEHGJ35P4AVCZYF3B6QOE3QKOB2PLE6M` | `Stellar` SAC addresses, quoted in USDC |
| Fiat FX | `CBKGPWGKSKZF52CFHMTRR23TBWTPMRDIYZ4O2P5VS65BMHYH4DXMCJZC` | Fiat symbols |

If you point this app at the CEX oracle, XLM may still resolve as `Other("XLM")`, but PYUSD / SolvBTC will often show **Feed unavailable on this oracle**. That is intentional: the UI never assumes a feed exists.

**Pubnet Pulse quotes in USDC.** Circle USDC is `base()`, not a row in `assets()`. The USDC card explains that instead of inventing a USDC/USDC price.

## Connecting to Reflector Pulse

```ts
import { PulseClient } from "@reflector/contract-client";

const pulse = new PulseClient({
  publicKey: process.env.REFLECTOR_PUBLIC_KEY!,
  rpcUrl: process.env.REFLECTOR_RPC_URL!,
  contractId: process.env.REFLECTOR_PULSE_CONTRACT_ID!,
});
```

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
  price: bigint;      // integer scaled by decimals()
  timestamp: bigint;  // unix seconds on public methods
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

Do not do this:

```ts
Number(price) / 10 ** decimals
```

`Number` is a 64-bit float. Oracle integers at 14 decimals are larger than that type can represent exactly.

Implementation: [`lib/reflector/format-price.ts`](lib/reflector/format-price.ts).

Prices are quoted in `base()`, not necessarily USD. The UI prefixes `$` only when the base label is `USD` or `USDC`.

## Handling unavailable feeds

| Situation | UI |
| --- | --- |
| Featured symbol not in `assets()` | “Feed unavailable on this oracle” |
| Featured symbol is the oracle `base()` | Explains it is the quote asset, not a feed |
| In `assets()` but `lastPrice` is empty | Stale / no current price |
| RPC or simulation throws | Short error on that card (or the page, if metadata failed) |
| Still loading | Card skeleton inside `Suspense` |

Simulation failures may include `error.events`. Those are logged in the server console and not shown as stack traces in the page.

## Understanding timestamps and resolution

Public client helpers (`lastPrice`, `lastTimestamp`, `resolution`, `historyRetentionPeriod`) use **seconds**.

“Updated 14 seconds ago” is `now - PriceData.timestamp`. Pulse often publishes every `resolution` seconds (5 minutes), so the age can sit near that interval even when the feed is healthy.

## Running the project

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
npm run start
```

The page is `force-dynamic` so a production build does not require RPC, and `revalidate = 60` is a hint not to hammer the endpoint on every client refresh.

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

## Extending the example

Not in this version, but the module split leaves room for:

- `prices(asset, 20)` and a small history chart
- Switching Pulse `contractId` from the UI
- A Beam example (`track` / `caller`)
- Calling `PulseClient` from the browser
- Flare webhooks
- Reading the same feeds from a Soroban contract

## Reflector resources

- JS client: [github.com/reflector-network/contract-client-js](https://github.com/reflector-network/contract-client-js)
- Pulse deployments: [reflector.network/pulse](https://reflector.network/pulse)
- Protocol docs: [reflector.network/docs](https://reflector.network/docs)
- Stellar oracle list: [developers.stellar.org/docs/data/oracles/oracle-providers](https://developers.stellar.org/docs/data/oracles/oracle-providers)

## License

MIT (application code in this repository). `@reflector/contract-client` is separately licensed by its authors.

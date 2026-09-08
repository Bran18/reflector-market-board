import { Header } from "@/components/header";
import { MarketGrid } from "@/components/market-grid";
import { OracleError } from "@/components/oracle-error";
import { assetLabel } from "@/lib/reflector/assets";
import { logReflectorError, publicErrorMessage } from "@/lib/reflector/errors";
import { getOracleSnapshot } from "@/lib/reflector/queries";
import type { OracleSnapshot } from "@/lib/reflector/types";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function Home() {
  let snapshot: OracleSnapshot | undefined;
  let loadError: unknown;

  try {
    snapshot = await getOracleSnapshot();
  } catch (error) {
    logReflectorError("Failed to load Reflector Pulse metadata", error);
    loadError = error;
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-12 sm:px-8 sm:py-16">
      <Header />
      {snapshot ? (
        <>
          <p className="text-xs tracking-wide text-zinc-400">
            Quoted in {assetLabel(snapshot.base)}
            {" · "}
            {snapshot.decimals} decimals
            {" · "}
            {snapshot.resolution}s resolution
          </p>
          <MarketGrid snapshot={snapshot} />
        </>
      ) : (
        <OracleError message={publicErrorMessage(loadError)} />
      )}
    </div>
  );
}

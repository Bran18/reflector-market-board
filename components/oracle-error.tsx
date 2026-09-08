export function OracleError({ message }: { message: string }) {
  return (
    <section className="border border-zinc-200 bg-white p-6 text-sm leading-6 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
      <p className="font-medium text-zinc-900 dark:text-zinc-100">
        Pulse is not reachable
      </p>
      <p className="mt-2">{message}</p>
      <p className="mt-4 text-zinc-500">
        Copy <code>.env.example</code> to <code>.env.local</code>, set a G-address,
        a Soroban RPC URL, and a Pulse contract ID, then restart the dev server.
      </p>
    </section>
  );
}

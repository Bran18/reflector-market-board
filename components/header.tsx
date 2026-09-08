export function Header() {
  return (
    <header className="flex flex-col gap-6 border-b border-zinc-200 pb-10 dark:border-zinc-800">
      <p className="text-xs tracking-[0.35em] text-zinc-500">REFLECTOR</p>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl space-y-3">
          <h1 className="text-3xl font-medium tracking-tight text-zinc-950 dark:text-zinc-50">
            Live Stellar Oracle
          </h1>
          <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            A small Next.js reference for reading Reflector Pulse from Server
            Components with <code>@reflector/contract-client</code>. No wallet
            and no other price APIs.
          </p>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm text-zinc-500">
          <a
            className="hover:text-zinc-900 dark:hover:text-zinc-100"
            href="https://github.com/reflector-network/contract-client-js"
          >
            JS client
          </a>
          <a
            className="hover:text-zinc-900 dark:hover:text-zinc-100"
            href="https://reflector.network/pulse"
          >
            Pulse oracles
          </a>
          <a
            className="hover:text-zinc-900 dark:hover:text-zinc-100"
            href="https://reflector.network/docs"
          >
            Docs
          </a>
          <a
            className="hover:text-zinc-900 dark:hover:text-zinc-100"
            href="https://x.com/in_reflector"
            rel="noopener noreferrer"
            target="_blank"
          >
            X
          </a>
          <a
            className="hover:text-zinc-900 dark:hover:text-zinc-100"
            href="https://discord.gg/axzHwqUtG"
            rel="noopener noreferrer"
            target="_blank"
          >
            Discord
          </a>
        </nav>
      </div>
    </header>
  );
}

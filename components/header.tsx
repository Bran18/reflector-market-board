import { LINKS } from "@/lib/links";

export function Header() {
  return (
    <header className="flex flex-col gap-6 border-b border-zinc-200 pb-10 dark:border-zinc-800">
      <p className="text-xs tracking-[0.35em] text-zinc-500">REFLECTOR</p>
      <div className="max-w-2xl space-y-3">
        <h1 className="text-3xl font-medium tracking-tight text-zinc-950 dark:text-zinc-50">
          Live Stellar Oracle
        </h1>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Reflector Pulse is a public Reflector price oracle. This small Next.js
          reference reads its live on-chain prices from Server Components with{" "}
          <code>@reflector/contract-client</code>.
        </p>
      </div>
      <nav
        aria-label="Developer resources"
        className="flex flex-wrap gap-3 text-sm"
      >
        <a
          className="bg-zinc-950 px-4 py-3 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300"
          href={LINKS.source}
        >
          View source on GitHub ↗
        </a>
        <a
          className="border border-zinc-300 px-4 py-3 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          href={LINKS.docs}
        >
          Read Reflector docs ↗
        </a>
        <a className="px-4 py-3 underline underline-offset-4" href="#learn">
          How it works ↓
        </a>
      </nav>
      <nav
        aria-label="Reflector community"
        className="flex flex-wrap gap-5 text-sm text-zinc-600 dark:text-zinc-400"
      >
        <a
          className="hover:text-zinc-950 dark:hover:text-white"
          href={LINKS.x}
          target="_blank"
          rel="noopener noreferrer"
        >
          Follow on X ↗
        </a>
        <a
          className="hover:text-zinc-950 dark:hover:text-white"
          href={LINKS.discord}
          target="_blank"
          rel="noopener noreferrer"
        >
          Join Discord ↗
        </a>
      </nav>
    </header>
  );
}

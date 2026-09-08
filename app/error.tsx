"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-6 py-16">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Something went wrong while rendering the market board.
      </p>
      <button
        className="w-fit border border-zinc-300 px-3 py-2 text-sm text-zinc-800 dark:border-zinc-700 dark:text-zinc-200"
        onClick={() => reset()}
        type="button"
      >
        Try again
      </button>
    </div>
  );
}

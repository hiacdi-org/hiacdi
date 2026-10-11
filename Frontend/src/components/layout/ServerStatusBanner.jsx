import { useServerReachability } from "../../context/ServerReachabilityContext";

export default function ServerStatusBanner() {
  const { offline, checking, retry } = useServerReachability();
  if (!offline) return null;

  return (
    <div
      role="status"
      className="sticky top-0 z-[60] flex flex-wrap items-center justify-between gap-3 bg-amber-100 px-4 py-2 text-sm text-amber-950"
    >
      <p className="min-w-0 font-semibold">
        {checking ? "Can't reach the server, retrying..." : "Can't reach the server."}
      </p>
      <button
        type="button"
        onClick={retry}
        disabled={checking}
        className="rounded-full bg-navy px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
      >
        {checking ? "Retrying…" : "Retry"}
      </button>
    </div>
  );
}

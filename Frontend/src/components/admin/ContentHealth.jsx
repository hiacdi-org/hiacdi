import { useEffect, useState } from "react";
import { fetchAdminDiagnostics } from "../../services/api";

export default function ContentHealth() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  function load() {
    fetchAdminDiagnostics()
      .then(setData)
      .catch((err) => setError(err.message || "Could not load content health."));
  }

  useEffect(() => {
    load();
  }, []);

  if (error) {
    return (
      <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
        {error}{" "}
        <button type="button" className="font-semibold underline" onClick={load}>
          Retry
        </button>
      </div>
    );
  }
  if (!data) return <div className="mt-6 h-28 animate-pulse rounded-2xl bg-navy/5" />;

  const cards = [
    ["MongoDB", data.mongo?.ready ? "Connected" : "Offline", data.mongo?.ready],
    ["Cloudinary", data.cloudinary?.configured ? "Ready" : "Not configured", data.cloudinary?.configured],
    ["Home sections", `${data.cms?.sections?.published || 0} live / ${data.cms?.sections?.draft || 0} draft`, data.cms?.sections?.published > 0],
    ["Programmes", String(data.programmes?.total || 0), data.programmes?.total > 0],
    ["News", `${data.posts?.published || 0} published`, true],
    ["Resources", String(data.resources?.total || 0), true],
  ];

  return (
    <div className="mt-6 rounded-2xl border border-navy/10 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-xl font-bold text-navy">Content Health</h2>
        <button type="button" className="text-sm font-semibold text-gold" onClick={load}>
          Refresh
        </button>
      </div>
      <p className="mt-1 text-xs text-muted">
        Public pages read published API data. Drafts and hidden items stay off the live site.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, value, ok]) => (
          <div key={label} className="rounded-xl border border-navy/10 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{label}</p>
            <p className={`mt-1 text-sm font-semibold ${ok ? "text-navy" : "text-red-700"}`}>{value}</p>
          </div>
        ))}
      </div>
      {(data.warnings || []).length ? (
        <ul className="mt-4 space-y-1 text-sm text-amber-800">
          {data.warnings.map((warning) => (
            <li key={warning}>• {warning}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

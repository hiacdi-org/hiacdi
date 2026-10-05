import { useEffect, useState } from "react";
import { verifyIssuedCertificate } from "../../services/api";
import { optimizedImage } from "../../utils/media";

const FORMAT = /^HIA-[A-Z]{2,12}-[A-Z0-9]{6}$/;

export default function VerifyCertificateCard({ initialNumber = "", compact = false }) {
  const [number, setNumber] = useState(initialNumber);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [certificate, setCertificate] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (initialNumber) {
      setNumber(initialNumber);
      check(initialNumber);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialNumber]);

  async function check(raw) {
    const value = String(raw || "").trim().toUpperCase();
    if (!value) {
      setError("Enter a certificate number.");
      setStatus("");
      setCertificate(null);
      return;
    }
    const legacy = value.startsWith("HIACDI-");
    if (!legacy && !FORMAT.test(value)) {
      setError("Enter a certificate number in the form HIA-DIGLIT-A1B2C3.");
      setStatus("");
      setCertificate(null);
      return;
    }
    setBusy(true);
    setError("");
    setStatus("loading");
    try {
      const data = await verifyIssuedCertificate(value);
      setStatus(data.status);
      setMessage(data.message || "");
      setCertificate(data.certificate || null);
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Could not check this number just now.");
      setCertificate(null);
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(event) {
    event.preventDefault();
    check(number);
  }

  const banner =
    error || status === "error"
      ? "red"
      : status === "not_found"
        ? "red"
        : status === "revoked"
          ? "amber"
          : status === "valid"
            ? "green"
            : "";

  return (
    <div className={compact ? "" : "mx-auto w-full max-w-xl"}>
      {compact ? null : (
        <>
          <h2 className="font-heading text-2xl font-bold text-navy sm:text-3xl">Verify a certificate</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Enter the certificate number printed on the document. We check it against certificates issued by HIACDI.
          </p>
        </>
      )}
      <form onSubmit={onSubmit} className="mt-6 rounded-2xl bg-white p-5 shadow-[0_12px_40px_rgba(10,46,109,0.08)] sm:p-7">
        {compact ? (
          <>
            <h2 className="font-heading text-2xl font-bold text-navy">Verify a certificate</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Enter the certificate number printed on the document. We check it against certificates issued by HIACDI.
            </p>
          </>
        ) : null}
        {error || message ? (
          <div
            role="alert"
            className={`mt-4 flex items-start gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${
              banner === "green"
                ? "bg-emerald-50 text-emerald-800"
                : banner === "amber"
                  ? "bg-amber-50 text-amber-800"
                  : "bg-red-50 text-red-700"
            }`}
          >
            <span aria-hidden="true">{banner === "green" ? "✓" : banner === "amber" ? "!" : "✕"}</span>
            <span>{error || message}</span>
          </div>
        ) : null}
        <label className="mt-4 block">
          <span className="mb-1 block text-sm font-semibold text-navy">Certificate number</span>
          <input
            value={number}
            onChange={(event) => {
              setNumber(event.target.value);
              setError("");
            }}
            placeholder="HIA-DIGLIT-A1B2C3"
            autoCapitalize="characters"
            className="w-full rounded-md border border-navy/15 px-4 py-3 text-ink outline-none focus:border-gold"
            aria-invalid={Boolean(error)}
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="mt-4 w-full rounded-md bg-navy px-5 py-3 text-sm font-semibold text-white hover:bg-navy-mid disabled:opacity-60"
        >
          {busy ? "Checking…" : "Check number"}
        </button>
      </form>

      {["valid", "revoked"].includes(status) && certificate ? (
        <article className="mt-5 rounded-2xl border border-navy/10 bg-white p-5">
          <p className="text-sm font-semibold text-navy">Certificate details</p>
          <dl className="mt-4 grid gap-3 text-sm">
            <Row label="Student full name" value={certificate.studentName} />
            <Row label="Email address" value={certificate.studentEmailMasked} />
            <Row label="Course taught" value={certificate.courseName} />
            <Row label="Certificate number" value={certificate.certificateNumber} />
            <Row
              label="Issue date"
              value={certificate.issueDate ? new Date(certificate.issueDate).toLocaleDateString() : "—"}
            />
            <Row label="Status" value={certificate.status} />
          </dl>
          {certificate.studentPhoto?.url ? (
            <img
              src={optimizedImage(certificate.studentPhoto.url, 240)}
              alt={`Photo of ${certificate.studentName}`}
              className="mt-4 h-24 w-24 rounded-lg object-cover"
              loading="lazy"
            />
          ) : null}
        </article>
      ) : null}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-navy/50">{label}</dt>
      <dd className="mt-0.5 font-semibold text-navy">{value || "—"}</dd>
    </div>
  );
}

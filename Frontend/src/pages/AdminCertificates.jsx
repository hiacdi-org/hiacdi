import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import FileUpload from "../components/ui/FileUpload";
import { site } from "../data/site";
import {
  createIssuedCourse,
  deleteIssuedCertificate,
  exportCertificatesCsv,
  fetchIssuedCertificates,
  fetchIssuedCourses,
  importCertificates,
  issueCertificate,
  updateIssuedCertificate,
} from "../services/api";

export default function AdminCertificates() {
  const [list, setList] = useState({ rows: [], total: 0, active: 0, revoked: 0, issuedThisMonth: 0, page: 1, limit: 20 });
  const [courses, setCourses] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [course, setCourse] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [created, setCreated] = useState("");
  const [printRow, setPrintRow] = useState(null);
  const [form, setForm] = useState({
    studentName: "",
    studentEmail: "",
    courseCode: "",
    issueDate: new Date().toISOString().slice(0, 10),
    studentPhoto: null,
    certificateFile: null,
  });

  async function load() {
    try {
      const [certs, courseRows] = await Promise.all([
        fetchIssuedCertificates({ q, status, course, sort, page, limit: 20 }),
        fetchIssuedCourses(),
      ]);
      setList(certs);
      setCourses(courseRows);
      if (!form.courseCode && courseRows[0]) {
        setForm((current) => ({ ...current, courseCode: courseRows[0].code }));
      }
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, course, sort, page]);

  const selectedCourse = useMemo(
    () => courses.find((item) => item.code === form.courseCode) || courses[0],
    [courses, form.courseCode]
  );

  async function onIssue(event) {
    event.preventDefault();
    setError("");
    try {
      const createdRow = await issueCertificate({
        ...form,
        courseName: selectedCourse?.name || form.courseCode,
        courseCode: selectedCourse?.code || form.courseCode,
      });
      setCreated(createdRow.certificateNumber);
      setForm((current) => ({ ...current, studentName: "", studentEmail: "", studentPhoto: null, certificateFile: null }));
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function onCsv(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    const header = lines.shift()?.split(",").map((item) => item.trim().toLowerCase()) || [];
    const rows = lines.map((line) => {
      const cols = line.split(",");
      const row = {};
      header.forEach((key, index) => {
        row[key] = cols[index];
      });
      return { name: row.name, email: row.email, course: row.course, courseCode: row.coursecode };
    });
    const result = await importCertificates(rows);
    setError(result.report.filter((item) => !item.ok).map((item) => `Row ${item.row}: ${item.error}`).join(" | ") || "");
    load();
  }

  return (
    <section className="p-5 sm:p-8">
      <p className="text-sm font-semibold text-gold">Staff only</p>
      <h1 className="font-heading mt-1 text-3xl font-bold text-navy">Issue certificates</h1>
      <p className="mt-2 text-sm text-muted">Numbers look like HIA-DIGLIT-A1B2C3. Public verify never shows the full email.</p>
      <Link to="/verify" className="mt-3 inline-block text-sm font-semibold text-gold">
        Quick verify →
      </Link>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <Stat label="Total" value={list.total} />
        <Stat label="Active" value={list.active} />
        <Stat label="Revoked" value={list.revoked} />
        <Stat label="This month" value={list.issuedThisMonth} />
      </div>

      <form onSubmit={onIssue} className="mt-8 grid gap-4 rounded-2xl border border-navy/10 bg-white p-5 sm:grid-cols-2">
        <Field label="Student full name" value={form.studentName} onChange={(studentName) => setForm({ ...form, studentName })} required />
        <Field label="Email address" type="email" value={form.studentEmail} onChange={(studentEmail) => setForm({ ...form, studentEmail })} required />
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-navy">Course taught</span>
          <select
            className="w-full rounded-md border border-navy/15 px-4 py-3"
            value={form.courseCode}
            onChange={(event) => setForm({ ...form, courseCode: event.target.value })}
          >
            {courses.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name} ({item.code})
              </option>
            ))}
          </select>
        </label>
        <Field label="Issue date" type="date" value={form.issueDate} onChange={(issueDate) => setForm({ ...form, issueDate })} />
        <FileUpload folder="hiacdi/students" imagesOnly value={form.studentPhoto} onChange={(studentPhoto) => setForm({ ...form, studentPhoto })} label="Student photo (optional)" />
        <FileUpload folder="hiacdi/certificates" value={form.certificateFile} onChange={(certificateFile) => setForm({ ...form, certificateFile })} label="Certificate file (optional)" />
        <div className="sm:col-span-2">
          <button type="submit" className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white">
            Issue certificate
          </button>
        </div>
        {created ? (
          <p className="sm:col-span-2 text-sm font-semibold text-navy">
            Number: {created}{" "}
            <button type="button" className="text-gold" onClick={() => navigator.clipboard.writeText(created)}>
              Copy
            </button>
          </p>
        ) : null}
      </form>

      <form
        className="mt-6 flex flex-wrap gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          const name = event.target.courseName.value;
          const code = event.target.courseCode.value;
          createIssuedCourse({ name, code }).then(load).catch((err) => setError(err.message));
        }}
      >
        <input name="courseName" placeholder="New course name" className="rounded-md border border-navy/15 px-3 py-2 text-sm" />
        <input name="courseCode" placeholder="CODE" className="w-28 rounded-md border border-navy/15 px-3 py-2 text-sm uppercase" />
        <button type="submit" className="rounded-full border border-navy/20 px-4 py-2 text-sm font-semibold text-navy">
          Add course
        </button>
        <label className="rounded-full border border-navy/20 px-4 py-2 text-sm font-semibold text-navy">
          Import CSV
          <input type="file" accept=".csv" className="hidden" onChange={onCsv} />
        </label>
        <button
          type="button"
          className="rounded-full border border-navy/20 px-4 py-2 text-sm font-semibold text-navy"
          onClick={() => exportCertificatesCsv({ q, status, course, sort }).catch((err) => setError(err.message))}
        >
          Export CSV
        </button>
      </form>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(event) => {
            setPage(1);
            setQ(event.target.value);
          }}
          placeholder="Search name, email, or number"
          className="min-w-[12rem] flex-1 rounded-md border border-navy/15 px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(event) => {
            setPage(1);
            setStatus(event.target.value);
          }}
          className="rounded-md border border-navy/15 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="revoked">Revoked</option>
        </select>
        <select
          value={course}
          onChange={(event) => {
            setPage(1);
            setCourse(event.target.value);
          }}
          className="rounded-md border border-navy/15 px-3 py-2 text-sm"
        >
          <option value="">All courses</option>
          {courses.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          className="rounded-md border border-navy/15 px-3 py-2 text-sm"
        >
          <option value="createdAt">Newest</option>
          <option value="issueDate">Issue date</option>
          <option value="studentName">Student name</option>
        </select>
      </div>

      {error ? <p className="mt-4 text-sm font-semibold text-red-700">{error}</p> : null}

      <div className="mt-8 overflow-auto rounded-2xl border border-navy/10 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-navy text-white">
            <tr>
              <th className="px-3 py-2">Student</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Course</th>
              <th className="px-3 py-2">Number</th>
              <th className="px-3 py-2">Issued</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.rows.map((row) => (
              <tr key={row.id || row.certificateNumber} className="border-t border-navy/10">
                <td className="px-3 py-2 font-semibold text-navy">{row.studentName}</td>
                <td className="px-3 py-2">{row.studentEmail}</td>
                <td className="px-3 py-2">{row.courseName}</td>
                <td className="px-3 py-2 font-mono">{row.certificateNumber}</td>
                <td className="px-3 py-2">{row.issueDate ? new Date(row.issueDate).toLocaleDateString() : "—"}</td>
                <td className="px-3 py-2">{row.status}</td>
                <td className="px-3 py-2">
                  <button type="button" className="mr-2 text-xs font-semibold text-gold" onClick={() => setPrintRow(row)}>
                    Print
                  </button>
                  <button
                    type="button"
                    className="mr-2 text-xs font-semibold text-navy"
                    onClick={() =>
                      updateIssuedCertificate(row.id, { status: row.status === "revoked" ? "active" : "revoked" }).then(load)
                    }
                  >
                    {row.status === "revoked" ? "Reinstate" : "Revoke"}
                  </button>
                  <button
                    type="button"
                    className="text-xs font-semibold text-red-700"
                    onClick={() => {
                      if (window.confirm("Delete this certificate?")) deleteIssuedCertificate(row.id).then(load);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center gap-3 text-sm">
        <button
          type="button"
          className="rounded-full border border-navy/20 px-3 py-1 font-semibold text-navy disabled:opacity-40"
          disabled={page <= 1}
          onClick={() => setPage((value) => Math.max(1, value - 1))}
        >
          Previous
        </button>
        <span className="text-muted">
          Page {list.page || page} of {Math.max(1, Math.ceil((list.total || 0) / (list.limit || 20)))}
        </span>
        <button
          type="button"
          className="rounded-full border border-navy/20 px-3 py-1 font-semibold text-navy disabled:opacity-40"
          disabled={page * (list.limit || 20) >= (list.total || 0)}
          onClick={() => setPage((value) => value + 1)}
        >
          Next
        </button>
      </div>

      {printRow ? <PrintableCertificate row={printRow} onClose={() => setPrintRow(null)} /> : null}
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-navy/50">{label}</p>
      <p className="mt-1 font-heading text-2xl font-bold text-navy">{value}</p>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-navy">{label}</span>
      <input
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-navy/15 px-4 py-3"
      />
    </label>
  );
}

function PrintableCertificate({ row, onClose }) {
  const verifyUrl = `${window.location.origin}/verify/${encodeURIComponent(row.certificateNumber)}`;
  return (
    <div className="fixed inset-0 z-40 overflow-auto bg-black/50 p-4 print:static print:bg-white">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8">
        <div className="flex justify-end gap-2 print:hidden">
          <button type="button" className="rounded-full bg-navy px-4 py-2 text-sm text-white" onClick={() => window.print()}>
            Print
          </button>
          <button type="button" className="rounded-full border px-4 py-2 text-sm" onClick={onClose}>
            Close
          </button>
        </div>
        <article className="mt-4 border-4 border-gold p-10 text-center">
          <p className="text-sm font-semibold tracking-[0.3em] text-gold">HIACDI</p>
          <h2 className="font-heading mt-2 text-3xl font-bold text-navy">{site.fullName}</h2>
          <p className="mt-8 text-sm uppercase tracking-wide text-muted">This is to certify that</p>
          <p className="font-heading mt-3 text-4xl font-bold text-navy">{row.studentName}</p>
          <p className="mt-4 text-muted">has completed</p>
          <p className="mt-2 text-xl font-semibold text-navy">{row.courseName}</p>
          <p className="mt-6 text-sm text-muted">Certificate number {row.certificateNumber}</p>
          <p className="text-sm text-muted">Issued {row.issueDate ? new Date(row.issueDate).toLocaleDateString() : ""}</p>
          <img
            alt="Verification QR code"
            className="mx-auto mt-6 h-28 w-28"
            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(verifyUrl)}`}
          />
        </article>
      </div>
    </div>
  );
}

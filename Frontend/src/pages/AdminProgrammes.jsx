import { useEffect, useState } from "react";
import FileUpload from "../components/ui/FileUpload";
import { apiUrl } from "../services/apiBase";
import { getToken } from "../services/auth";

export default function AdminProgrammes() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(apiUrl("/api/programmes"))
      .then((response) => response.json())
      .then(setRows)
      .catch(() => setError("Could not load programmes."));
  }, []);

  async function save(row) {
    const response = await fetch(apiUrl(`/api/programmes/${row._id}`), {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        summary: row.summary,
        content: row.content,
        issuesCertificates: row.issuesCertificates,
        coverImage: row.coverImage || {},
      }),
    });
    if (!response.ok) setError("Could not save. MongoDB is required to edit programmes.");
  }

  const groups = rows.filter((row) => row.isGroup);

  return (
    <section className="p-5 sm:p-8">
      <h1 className="font-heading text-3xl font-bold text-navy">Programmes</h1>
      <p className="mt-2 text-sm text-muted">Seed with npm run seed:programmes. Editing requires MongoDB.</p>
      {error ? <p className="mt-3 text-sm font-semibold text-red-700">{error}</p> : null}
      <div className="mt-6 grid gap-4">
        {groups.map((group) => (
          <article key={group.slug} className="rounded-2xl border border-navy/10 bg-white p-5">
            <h2 className="font-heading text-lg font-bold text-navy">{group.title}</h2>
            <textarea
              className="mt-3 w-full rounded-md border border-navy/15 p-3 text-sm"
              rows={3}
              value={group.summary}
              onChange={(event) =>
                setRows((current) => current.map((item) => (item._id === group._id ? { ...item, summary: event.target.value } : item)))
              }
            />
            <div className="mt-3 max-w-sm">
              <FileUpload
                folder="hiacdi/programmes"
                imagesOnly
                value={group.coverImage}
                onChange={(coverImage) =>
                  setRows((current) => current.map((item) => (item._id === group._id ? { ...item, coverImage } : item)))
                }
                label="Cover image"
              />
            </div>
            {group._id ? (
              <button type="button" className="mt-3 rounded-full bg-navy px-4 py-2 text-xs font-semibold text-white" onClick={() => save(group)}>
                Save
              </button>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

import { useEffect, useState } from "react";
import FileUpload from "../components/ui/FileUpload";
import StatusBadge, { ViewOnSite } from "../components/cms/StatusBadge";
import { apiUrl } from "../services/apiBase";
import { getToken } from "../services/auth";

export default function AdminProgrammes() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(apiUrl("/api/programmes"), { cache: "no-store" })
      .then((response) => response.json())
      .then(setRows)
      .catch(() => setError("Could not load programmes."));
  }, []);

  async function save(row) {
    const response = await fetch(apiUrl(`/api/programmes/${row._id}`), {
      method: "PATCH",
      credentials: "include",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        title: row.title,
        summary: row.summary,
        content: row.content,
        issuesCertificates: row.issuesCertificates,
        coverImage: row.coverImage || {},
      }),
    });
    if (!response.ok) setError("Could not save. MongoDB is required to edit programmes.");
  }

  const groups = rows.filter((row) => row.isGroup);
  const itemsOf = (group) => rows.filter((row) => !row.isGroup && row.groupSlug === group.slug);

  return (
    <section className="p-5 sm:p-8">
      <h1 className="font-heading text-3xl font-bold text-navy">Programmes</h1>
      <p className="mt-2 text-sm text-muted">Edits publish immediately on /programmes. Seed with npm run seed:programmes if the list is empty.</p>
      {error ? <p className="mt-3 text-sm font-semibold text-red-700">{error}</p> : null}
      <div className="mt-6 grid gap-4">
        {groups.map((group) => (
          <article key={group.slug} className="rounded-2xl border border-navy/10 bg-white p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading flex-1 text-lg font-bold text-navy">{group.title}</h2>
              <StatusBadge status="published" visible />
              <ViewOnSite href={`/programmes/${group.slug}`} />
            </div>
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
                Save group
              </button>
            ) : null}
            <div className="mt-6 space-y-4">
              {itemsOf(group).map((item) => (
                <div key={item._id || item.slug} className="rounded-xl border border-navy/10 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="flex-1 text-sm font-semibold text-navy">{item.title}</p>
                    <StatusBadge status="published" visible />
                    <ViewOnSite href={`/programmes/${group.slug}/${item.slug}`} />
                  </div>
                  <textarea
                    className="mt-2 w-full rounded-md border border-navy/15 p-3 text-sm"
                    rows={2}
                    value={item.summary}
                    onChange={(event) =>
                      setRows((current) => current.map((row) => (row._id === item._id ? { ...row, summary: event.target.value } : row)))
                    }
                  />
                  <textarea
                    className="mt-2 w-full rounded-md border border-navy/15 p-3 text-sm"
                    rows={4}
                    value={item.content}
                    onChange={(event) =>
                      setRows((current) => current.map((row) => (row._id === item._id ? { ...row, content: event.target.value } : row)))
                    }
                  />
                  <label className="mt-2 flex items-center gap-2 text-sm font-semibold text-navy">
                    <input
                      type="checkbox"
                      checked={Boolean(item.issuesCertificates)}
                      onChange={(event) =>
                        setRows((current) =>
                          current.map((row) => (row._id === item._id ? { ...row, issuesCertificates: event.target.checked } : row))
                        )
                      }
                    />
                    Issues certificates
                  </label>
                  <button type="button" className="mt-3 rounded-full bg-navy px-4 py-2 text-xs font-semibold text-white" onClick={() => save(item)}>
                    Save activity
                  </button>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

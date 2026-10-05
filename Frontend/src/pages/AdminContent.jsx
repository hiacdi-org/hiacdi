import { useEffect, useState } from "react";
import FileUpload from "../components/ui/FileUpload";
import {
  createGalleryItem,
  createPost,
  createResource,
  deleteGalleryItem,
  deletePost,
  deleteResource,
  fetchAdminGallery,
  fetchAdminPosts,
  fetchAdminResources,
} from "../services/api";

export default function AdminContent() {
  const [tab, setTab] = useState("posts");
  const [posts, setPosts] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [resources, setResources] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      const [postRows, galleryRows, resourceRows] = await Promise.all([
        fetchAdminPosts(),
        fetchAdminGallery(),
        fetchAdminResources(),
      ]);
      setPosts(postRows);
      setGallery(galleryRows);
      setResources(resourceRows);
    } catch (err) {
      setError(err.message || "MongoDB is required to manage content.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="p-5 sm:p-8">
      <h1 className="font-heading text-3xl font-bold text-navy">Content</h1>
      <p className="mt-2 text-sm text-muted">News, gallery photos, and downloadable resources. Uploads go to Cloudinary.</p>
      {error ? <p className="mt-3 text-sm font-semibold text-red-700">{error}</p> : null}
      <div className="mt-6 flex flex-wrap gap-2">
        {[
          ["posts", "News & events"],
          ["gallery", "Gallery"],
          ["resources", "Resources"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              tab === id ? "bg-navy text-white" : "border border-navy/20 text-navy"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "posts" ? <PostForm rows={posts} onSaved={load} onError={setError} /> : null}
      {tab === "gallery" ? <GalleryForm rows={gallery} onSaved={load} onError={setError} /> : null}
      {tab === "resources" ? <ResourceForm rows={resources} onSaved={load} onError={setError} /> : null}
    </section>
  );
}

function PostForm({ rows, onSaved, onError }) {
  const [form, setForm] = useState({ title: "", category: "news", summary: "", body: "", image: null });
  return (
    <div className="mt-6">
      <form
        className="grid gap-3 rounded-2xl border border-navy/10 bg-white p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          try {
            await createPost({
              ...form,
              slug: form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
            });
            setForm({ title: "", category: "news", summary: "", body: "", image: null });
            onSaved();
          } catch (err) {
            onError(err.message);
          }
        }}
      >
        <input
          required
          placeholder="Title"
          className="rounded-md border border-navy/15 px-4 py-3"
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
        />
        <select
          className="rounded-md border border-navy/15 px-4 py-3"
          value={form.category}
          onChange={(event) => setForm({ ...form, category: event.target.value })}
        >
          <option value="news">News</option>
          <option value="event">Event</option>
          <option value="impact">Impact story</option>
        </select>
        <textarea
          placeholder="Summary"
          className="rounded-md border border-navy/15 px-4 py-3"
          rows={2}
          value={form.summary}
          onChange={(event) => setForm({ ...form, summary: event.target.value })}
        />
        <textarea
          placeholder="Body"
          className="rounded-md border border-navy/15 px-4 py-3"
          rows={4}
          value={form.body}
          onChange={(event) => setForm({ ...form, body: event.target.value })}
        />
        <FileUpload folder="hiacdi/news" imagesOnly value={form.image} onChange={(image) => setForm({ ...form, image })} label="Cover image" />
        <button type="submit" className="w-fit rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white">
          Publish
        </button>
      </form>
      <ul className="mt-6 space-y-3">
        {rows.map((row) => (
          <li key={row._id} className="flex items-center justify-between rounded-xl border border-navy/10 bg-white px-4 py-3">
            <span className="font-semibold text-navy">{row.title}</span>
            <button
              type="button"
              className="text-sm font-semibold text-red-700"
              onClick={() => {
                if (window.confirm("Delete this post?")) deletePost(row._id).then(onSaved).catch((err) => onError(err.message));
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GalleryForm({ rows, onSaved, onError }) {
  const [form, setForm] = useState({ title: "", caption: "", image: null });
  return (
    <div className="mt-6">
      <form
        className="grid gap-3 rounded-2xl border border-navy/10 bg-white p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          try {
            await createGalleryItem(form);
            setForm({ title: "", caption: "", image: null });
            onSaved();
          } catch (err) {
            onError(err.message);
          }
        }}
      >
        <input
          required
          placeholder="Photo title"
          className="rounded-md border border-navy/15 px-4 py-3"
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
        />
        <input
          placeholder="Caption"
          className="rounded-md border border-navy/15 px-4 py-3"
          value={form.caption}
          onChange={(event) => setForm({ ...form, caption: event.target.value })}
        />
        <FileUpload folder="hiacdi/gallery" imagesOnly value={form.image} onChange={(image) => setForm({ ...form, image })} label="Photo" />
        <button type="submit" className="w-fit rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white">
          Add photo
        </button>
      </form>
      <ul className="mt-6 grid gap-3 sm:grid-cols-3">
        {rows.map((row) => (
          <li key={row._id} className="rounded-xl border border-navy/10 bg-white p-3">
            {row.image?.url ? <img src={row.image.url} alt={row.title} className="h-32 w-full rounded-md object-cover" /> : null}
            <p className="mt-2 text-sm font-semibold text-navy">{row.title}</p>
            <button
              type="button"
              className="mt-2 text-xs font-semibold text-red-700"
              onClick={() => {
                if (window.confirm("Delete this photo?")) deleteGalleryItem(row._id).then(onSaved).catch((err) => onError(err.message));
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResourceForm({ rows, onSaved, onError }) {
  const [form, setForm] = useState({ title: "", category: "downloads", summary: "", file: null });
  return (
    <div className="mt-6">
      <form
        className="grid gap-3 rounded-2xl border border-navy/10 bg-white p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          try {
            await createResource(form);
            setForm({ title: "", category: "downloads", summary: "", file: null });
            onSaved();
          } catch (err) {
            onError(err.message);
          }
        }}
      >
        <input
          required
          placeholder="Resource title"
          className="rounded-md border border-navy/15 px-4 py-3"
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
        />
        <select
          className="rounded-md border border-navy/15 px-4 py-3"
          value={form.category}
          onChange={(event) => setForm({ ...form, category: event.target.value })}
        >
          <option value="reports">Reports</option>
          <option value="policies">Policies</option>
          <option value="guidelines">Guidelines</option>
          <option value="downloads">Downloads</option>
        </select>
        <textarea
          placeholder="Summary"
          className="rounded-md border border-navy/15 px-4 py-3"
          rows={2}
          value={form.summary}
          onChange={(event) => setForm({ ...form, summary: event.target.value })}
        />
        <FileUpload folder="hiacdi/resources" value={form.file} onChange={(file) => setForm({ ...form, file })} label="PDF or image" />
        <button type="submit" className="w-fit rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white">
          Add resource
        </button>
      </form>
      <ul className="mt-6 space-y-3">
        {rows.map((row) => (
          <li key={row._id} className="flex items-center justify-between rounded-xl border border-navy/10 bg-white px-4 py-3">
            <span className="font-semibold text-navy">{row.title}</span>
            <button
              type="button"
              className="text-sm font-semibold text-red-700"
              onClick={() => {
                if (window.confirm("Delete this resource?")) deleteResource(row._id).then(onSaved).catch((err) => onError(err.message));
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

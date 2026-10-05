import { useEffect, useState } from "react";
import FileUpload from "../components/ui/FileUpload";
import ConfirmDeleteDialog from "../components/ui/ConfirmDeleteDialog";
import RichTextEditor from "../components/admin/RichTextEditor";
import { grantCmsPreview } from "../services/auth";
import {
  createAdminItem,
  deleteAdminItem,
  fetchAdminAudit,
  fetchAdminCollection,
  fetchAdminRevisions,
  fetchAdminSettings,
  reorderAdminItems,
  restoreAdminRevision,
  saveAdminSettings,
  setAdminVisibility,
  updateAdminItem,
} from "../services/api";

const TABS = [
  ["general", "General Settings"],
  ["contact", "Contact & Social"],
  ["landing", "Landing Page"],
  ["about", "About & Team"],
  ["faqs", "FAQs"],
  ["navigation", "Navigation"],
  ["seo", "SEO"],
  ["history", "History"],
];

const inputClass = "w-full rounded-md border border-navy/15 px-3 py-2 text-sm outline-none focus:border-gold";

function emptyFile() {
  return { url: "", publicId: "" };
}

export default function AdminSite() {
  const [tab, setTab] = useState("general");
  const [settings, setSettings] = useState(null);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);

  async function loadSettings() {
    const data = await fetchAdminSettings();
    setSettings(data);
    setDirty(false);
  }

  useEffect(() => {
    loadSettings().catch((err) => setError(err.message || "Could not load settings."));
  }, []);

  useEffect(() => {
    function warn(event) {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function patch(path, value) {
    setDirty(true);
    setSettings((current) => {
      const next = structuredClone(current || {});
      const keys = path.split(".");
      let node = next;
      for (let i = 0; i < keys.length - 1; i += 1) {
        node[keys[i]] = node[keys[i]] || {};
        node = node[keys[i]];
      }
      node[keys[keys.length - 1]] = value;
      return next;
    });
  }

  function notify(message) {
    setToast(message);
    setTimeout(() => setToast(""), 3500);
  }

  async function saveSettings() {
    setBusy(true);
    setError("");
    try {
      const saved = await saveAdminSettings(settings);
      setSettings(saved);
      setDirty(false);
      notify("Settings saved.");
    } catch (err) {
      setError(err.message || "Could not save settings.");
    } finally {
      setBusy(false);
    }
  }

  function preview(path = "/") {
    grantCmsPreview();
    window.open(`${path}${path.includes("?") ? "&" : "?"}cmsPreview=1`, "_blank", "noopener");
  }

  if (!settings) {
    return (
      <section className="p-5 sm:p-8">
        <div className="h-8 w-48 animate-pulse rounded bg-navy/10" />
        <div className="mt-4 h-40 animate-pulse rounded-2xl bg-navy/5" />
      </section>
    );
  }

  return (
    <section className="p-5 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold text-navy">Site Content</h1>
          <p className="mt-2 text-sm text-muted">Edit public pages, organisation details, and navigation. Changes go live when you publish.</p>
        </div>
        <button type="button" onClick={() => preview("/")} className="rounded-full border border-navy/20 px-4 py-2 text-sm font-semibold text-navy">
          Preview site
        </button>
      </div>
      {toast ? <p className="mt-3 rounded-md bg-green-50 px-4 py-2 text-sm font-semibold text-green-800">{toast}</p> : null}
      {error ? <p className="mt-3 rounded-md bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">{error}</p> : null}
      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Site content sections">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === id ? "bg-navy text-white" : "border border-navy/20 text-navy"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "general" ? (
        <div className="mt-6 grid max-w-3xl gap-4 rounded-2xl border border-navy/10 bg-white p-5">
          <Field label="Organisation name" value={settings.organizationName || ""} onChange={(v) => patch("organizationName", v)} />
          <Field label="Short name" value={settings.shortName || ""} onChange={(v) => patch("shortName", v)} />
          <Field label="Tagline" value={settings.tagline || ""} onChange={(v) => patch("tagline", v)} />
          <FileUpload folder="hiacdi/brand" imagesOnly value={settings.logo} onChange={(file) => patch("logo", file || emptyFile())} label="Logo" />
          <FileUpload folder="hiacdi/brand" imagesOnly value={settings.favicon} onChange={(file) => patch("favicon", file || emptyFile())} label="Favicon" />
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-navy">Primary colour</span>
            <input type="color" value={settings.primaryColor || "#0A2E6D"} onChange={(e) => patch("primaryColor", e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-navy">Accent colour</span>
            <input type="color" value={settings.accentColor || "#D4AF37"} onChange={(e) => patch("accentColor", e.target.value)} />
          </label>
          <RichTextEditor label="Footer text" value={settings.footerText || ""} onChange={(v) => patch("footerText", v)} />
          <Field label="Copyright line" value={settings.copyright || ""} onChange={(v) => patch("copyright", v)} />
          <Field label="Education site URL" value={settings.educationSiteUrl || "https://hiacdi.org/"} onChange={(v) => patch("educationSiteUrl", v)} />
          <Field label="Certificate prefix" value={settings.certificatePrefix || "HIA"} onChange={(v) => patch("certificatePrefix", v)} />
          <label className="flex items-center gap-2 text-sm font-semibold text-navy">
            <input type="checkbox" checked={Boolean(settings.announcementBar?.enabled)} onChange={(e) => patch("announcementBar.enabled", e.target.checked)} />
            Show announcement bar
          </label>
          <Field label="Announcement text" value={settings.announcementBar?.text || ""} onChange={(v) => patch("announcementBar.text", v)} />
          <Field label="Announcement link" value={settings.announcementBar?.link || ""} onChange={(v) => patch("announcementBar.link", v)} />
          <SaveRow busy={busy} dirty={dirty} onSave={saveSettings} />
        </div>
      ) : null}

      {tab === "contact" ? (
        <div className="mt-6 grid max-w-3xl gap-4 rounded-2xl border border-navy/10 bg-white p-5">
          <Field label="Email" type="email" value={settings.contact?.email || ""} onChange={(v) => patch("contact.email", v)} />
          <Field label="Phone" value={settings.contact?.phone || ""} onChange={(v) => patch("contact.phone", v)} />
          <Field label="WhatsApp" value={settings.contact?.whatsapp || ""} onChange={(v) => patch("contact.whatsapp", v)} />
          <Field label="Address" value={settings.contact?.address || ""} onChange={(v) => patch("contact.address", v)} />
          <Field label="Office hours" value={settings.contact?.officeHours || ""} onChange={(v) => patch("contact.officeHours", v)} />
          <Field label="Map embed URL" value={settings.contact?.mapEmbedUrl || ""} onChange={(v) => patch("contact.mapEmbedUrl", v)} />
          <Field label="Facebook" value={settings.social?.facebook || ""} onChange={(v) => patch("social.facebook", v)} />
          <Field label="X" value={settings.social?.x || ""} onChange={(v) => patch("social.x", v)} />
          <Field label="Instagram" value={settings.social?.instagram || ""} onChange={(v) => patch("social.instagram", v)} />
          <Field label="LinkedIn" value={settings.social?.linkedin || ""} onChange={(v) => patch("social.linkedin", v)} />
          <Field label="YouTube" value={settings.social?.youtube || ""} onChange={(v) => patch("social.youtube", v)} />
          <Field label="TikTok" value={settings.social?.tiktok || ""} onChange={(v) => patch("social.tiktok", v)} />
          <SaveRow busy={busy} dirty={dirty} onSave={saveSettings} />
        </div>
      ) : null}

      {tab === "landing" ? (
        <div className="mt-6 space-y-8">
          <SectionEditor page="home" onToast={notify} onError={setError} onPreview={() => preview("/")} />
          <CollectionEditor kind="slides" title="Hero slides" onToast={notify} onError={setError} fields={slideFields} blank={blankSlide} />
          <CollectionEditor kind="stats" title="Impact stats" onToast={notify} onError={setError} fields={statFields} blank={blankStat} />
          <CollectionEditor kind="partners" title="Partners" onToast={notify} onError={setError} fields={partnerFields} blank={blankPartner} />
          <CollectionEditor kind="testimonials" title="Testimonials" onToast={notify} onError={setError} fields={testimonialFields} blank={blankTestimonial} />
        </div>
      ) : null}

      {tab === "about" ? (
        <div className="mt-6 space-y-8">
          <SectionEditor page="about" onToast={notify} onError={setError} onPreview={() => preview("/about")} />
          <CollectionEditor kind="team" title="Team members" onToast={notify} onError={setError} fields={teamFields} blank={blankTeam} />
        </div>
      ) : null}

      {tab === "faqs" ? (
        <div className="mt-6">
          <CollectionEditor kind="faqs" title="FAQs" onToast={notify} onError={setError} fields={faqFields} blank={blankFaq} />
        </div>
      ) : null}

      {tab === "navigation" ? (
        <div className="mt-6">
          <CollectionEditor kind="nav" title="Menu items" onToast={notify} onError={setError} fields={navFields} blank={blankNav} />
        </div>
      ) : null}

      {tab === "seo" ? (
        <div className="mt-6 grid max-w-3xl gap-4 rounded-2xl border border-navy/10 bg-white p-5">
          <Field label="Default title" value={settings.seo?.defaultTitle || ""} onChange={(v) => patch("seo.defaultTitle", v)} />
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-navy">Default description</span>
            <textarea className={inputClass} rows={3} value={settings.seo?.defaultDescription || ""} onChange={(e) => patch("seo.defaultDescription", e.target.value)} />
          </label>
          <FileUpload folder="hiacdi/seo" imagesOnly value={settings.seo?.ogImage} onChange={(file) => patch("seo.ogImage", file || emptyFile())} label="OG image" />
          {["home", "about", "contact", "programmes"].map((page) => (
            <div key={page} className="grid gap-2 rounded-xl border border-navy/10 p-3">
              <p className="text-sm font-semibold capitalize text-navy">{page} page SEO</p>
              <Field label="Title" value={settings.pageSeo?.[page]?.title || ""} onChange={(v) => patch(`pageSeo.${page}.title`, v)} />
              <Field label="Description" value={settings.pageSeo?.[page]?.description || ""} onChange={(v) => patch(`pageSeo.${page}.description`, v)} />
            </div>
          ))}
          <SaveRow busy={busy} dirty={dirty} onSave={saveSettings} />
        </div>
      ) : null}

      {tab === "history" ? <HistoryPanel onToast={notify} onError={setError} /> : null}
    </section>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-navy">{label}</span>
      <input type={type} className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function SaveRow({ busy, dirty, onSave }) {
  return (
    <button type="button" disabled={busy} onClick={onSave} className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
      {busy ? "Saving…" : dirty ? "Save changes" : "Save"}
    </button>
  );
}

const slideFields = [
  { name: "heading", label: "Heading" },
  { name: "subheading", label: "Subheading" },
  { name: "buttonLabel", label: "Button label" },
  { name: "buttonUrl", label: "Button URL" },
  { name: "image", label: "Image", type: "image" },
];
const statFields = [
  { name: "label", label: "Label" },
  { name: "value", label: "Value" },
  { name: "suffix", label: "Suffix" },
];
const partnerFields = [
  { name: "name", label: "Name" },
  { name: "website", label: "Website" },
  { name: "logo", label: "Logo", type: "image" },
];
const testimonialFields = [
  { name: "name", label: "Name" },
  { name: "role", label: "Role" },
  { name: "quote", label: "Quote", type: "textarea" },
  { name: "photo", label: "Photo", type: "image" },
];
const teamFields = [
  { name: "name", label: "Name" },
  { name: "role", label: "Role" },
  { name: "bio", label: "Bio", type: "rich" },
  { name: "photo", label: "Photo", type: "image" },
];
const faqFields = [
  { name: "question", label: "Question" },
  { name: "answer", label: "Answer", type: "rich" },
  { name: "category", label: "Category" },
];
const navFields = [
  { name: "label", label: "Label" },
  { name: "url", label: "URL" },
  { name: "parent", label: "Parent id (dropdown)" },
  { name: "openInNewTab", label: "Open in new tab", type: "checkbox" },
];

const blankSlide = { heading: "", subheading: "", buttonLabel: "", buttonUrl: "", image: emptyFile(), visible: true, status: "published" };
const blankStat = { label: "", value: "", suffix: "", visible: true, status: "published" };
const blankPartner = { name: "", website: "", logo: emptyFile(), visible: true, status: "published" };
const blankTestimonial = { name: "", role: "", quote: "", photo: emptyFile(), visible: true, status: "published" };
const blankTeam = { name: "", role: "", bio: "", photo: emptyFile(), visible: true, status: "published" };
const blankFaq = { question: "", answer: "", category: "general", visible: true, status: "published" };
const blankNav = { label: "", url: "/", parent: "", openInNewTab: false, visible: true, status: "published" };

function CollectionEditor({ kind, title, fields, blank, onToast, onError }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [dragId, setDragId] = useState("");

  async function load() {
    setRows(await fetchAdminCollection(kind));
  }

  useEffect(() => {
    load().catch((err) => onError(err.message));
  }, [kind]);

  async function save(status) {
    try {
      const payload = { ...form, status };
      if (editing) await updateAdminItem(kind, editing, payload);
      else await createAdminItem(kind, payload);
      setForm(blank);
      setEditing("");
      await load();
      onToast(status === "draft" ? "Draft saved." : "Published.");
    } catch (err) {
      onError(err.message);
    }
  }

  async function onDrop(targetId) {
    if (!dragId || dragId === targetId) return;
    const ids = rows.map((row) => row.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;
    ids.splice(from, 1);
    ids.splice(to, 0, dragId);
    setRows(await reorderAdminItems(kind, ids));
    setDragId("");
    onToast("Order saved.");
  }

  return (
    <div>
      <h2 className="font-heading text-xl font-bold text-navy">{title}</h2>
      <div className="mt-3 space-y-2">
        {rows.map((row) => (
          <div
            key={row.id}
            draggable
            onDragStart={() => setDragId(row.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(row.id)}
            className="flex flex-wrap items-center gap-2 rounded-xl border border-navy/10 bg-white px-4 py-3"
          >
            <span className="cursor-grab text-muted" aria-hidden>
              ⋮⋮
            </span>
            <p className="flex-1 text-sm font-semibold text-navy">{row.label || row.name || row.heading || row.question || row.title}</p>
            <span className="text-xs uppercase text-muted">{row.status || "published"}</span>
            {row.locked ? null : (
              <button type="button" className="text-sm font-semibold text-navy" onClick={() => setAdminVisibility(kind, row.id, !row.visible).then(load)}>
                {row.visible === false ? "Show" : "Hide"}
              </button>
            )}
            <button
              type="button"
              className="text-sm font-semibold text-gold"
              onClick={() => {
                setEditing(row.id);
                setForm(row);
              }}
            >
              Edit
            </button>
            {row.locked ? null : (
              <button type="button" className="text-sm font-semibold text-red-700" onClick={() => setPendingDelete(row)}>
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
      <form
        className="mt-4 grid gap-3 rounded-2xl border border-navy/10 bg-white p-5"
        onSubmit={(e) => {
          e.preventDefault();
          save("published");
        }}
      >
        {fields.map((field) => (
          <FormControl key={field.name} field={field} form={form} setForm={setForm} />
        ))}
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded-full border border-navy/20 px-4 py-2 text-sm font-semibold text-navy" onClick={() => save("draft")}>
            Save draft
          </button>
          <button type="submit" className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white">
            Publish
          </button>
          {editing ? (
            <button
              type="button"
              className="text-sm font-semibold text-muted"
              onClick={() => {
                setEditing("");
                setForm(blank);
              }}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>
      <ConfirmDeleteDialog
        open={Boolean(pendingDelete)}
        message={`Delete “${pendingDelete?.label || pendingDelete?.name || pendingDelete?.heading || pendingDelete?.question || "this item"}”?`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          try {
            await deleteAdminItem(kind, pendingDelete.id);
            setPendingDelete(null);
            await load();
            onToast("Deleted.");
          } catch (err) {
            onError(err.message);
          }
        }}
      />
    </div>
  );
}

function FormControl({ field, form, setForm }) {
  if (field.type === "image") {
    return (
      <FileUpload
        folder="hiacdi/cms"
        imagesOnly
        label={field.label}
        value={form[field.name]}
        onChange={(file) => setForm((current) => ({ ...current, [field.name]: file || emptyFile() }))}
      />
    );
  }
  if (field.type === "rich") {
    return <RichTextEditor label={field.label} value={form[field.name] || ""} onChange={(value) => setForm((current) => ({ ...current, [field.name]: value }))} />;
  }
  if (field.type === "textarea") {
    return (
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-navy">{field.label}</span>
        <textarea className={inputClass} rows={4} value={form[field.name] || ""} onChange={(e) => setForm((current) => ({ ...current, [field.name]: e.target.value }))} />
      </label>
    );
  }
  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 text-sm font-semibold text-navy">
        <input type="checkbox" checked={Boolean(form[field.name])} onChange={(e) => setForm((current) => ({ ...current, [field.name]: e.target.checked }))} />
        {field.label}
      </label>
    );
  }
  return <Field label={field.label} value={form[field.name] || ""} onChange={(value) => setForm((current) => ({ ...current, [field.name]: value }))} />;
}

function SectionEditor({ page, onToast, onError, onPreview }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(null);
  const [dragId, setDragId] = useState("");

  async function load() {
    const all = await fetchAdminCollection("sections");
    setRows(all.filter((row) => row.page === page).sort((a, b) => (a.order || 0) - (b.order || 0)));
  }

  useEffect(() => {
    load().catch((err) => onError(err.message));
  }, [page]);

  async function persist(status) {
    try {
      await updateAdminItem("sections", form.id, { ...form, status });
      setForm(null);
      await load();
      onToast(status === "draft" ? "Draft saved." : "Section published.");
    } catch (err) {
      onError(err.message);
    }
  }

  async function onDrop(targetId) {
    if (!dragId || dragId === targetId) return;
    const ids = rows.map((row) => row.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    ids.splice(from, 1);
    ids.splice(to, 0, dragId);
    const next = await reorderAdminItems("sections", ids);
    setRows(next.filter((row) => row.page === page));
    setDragId("");
    onToast("Section order saved.");
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-xl font-bold text-navy">{page === "home" ? "Landing sections" : "About sections"}</h2>
        {onPreview ? (
          <button type="button" onClick={onPreview} className="text-sm font-semibold text-gold">
            Preview
          </button>
        ) : null}
      </div>
      <div className="mt-3 space-y-2">
        {rows.map((row) => (
          <div
            key={row.id}
            draggable
            onDragStart={() => setDragId(row.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(row.id)}
            className="rounded-xl border border-navy/10 bg-white px-4 py-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="cursor-grab text-muted">⋮⋮</span>
              <p className="flex-1 text-sm font-semibold text-navy">{row.title || row.key}</p>
              <span className="text-xs uppercase text-muted">{row.status}</span>
              {row.locked ? null : (
                <button type="button" className="text-sm font-semibold text-navy" onClick={() => setAdminVisibility("sections", row.id, !row.visible).then(load)}>
                  {row.visible === false ? "Show" : "Hide"}
                </button>
              )}
              <button type="button" className="text-sm font-semibold text-gold" onClick={() => setForm(row)}>
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
      {form ? (
        <form
          className="mt-4 grid gap-3 rounded-2xl border border-navy/10 bg-white p-5"
          onSubmit={(e) => {
            e.preventDefault();
            persist("published");
          }}
        >
          <Field label="Title" value={form.title || ""} onChange={(v) => setForm((c) => ({ ...c, title: v }))} />
          <Field label="Subtitle" value={form.subtitle || ""} onChange={(v) => setForm((c) => ({ ...c, subtitle: v }))} />
          <RichTextEditor label="Body" value={form.body || ""} onChange={(v) => setForm((c) => ({ ...c, body: v }))} />
          <FileUpload folder="hiacdi/cms" imagesOnly label="Section image" value={form.image} onChange={(file) => setForm((c) => ({ ...c, image: file || emptyFile() }))} />
          <ButtonsEditor value={form.buttons || []} onChange={(buttons) => setForm((c) => ({ ...c, buttons }))} />
          {form.key === "about-summary" ? (
            <>
              <Field label="Our Vision" value={form.extra?.vision || ""} onChange={(v) => setForm((c) => ({ ...c, extra: { ...c.extra, vision: v } }))} />
              <Field label="Our Mission" value={form.extra?.mission || ""} onChange={(v) => setForm((c) => ({ ...c, extra: { ...c.extra, mission: v } }))} />
            </>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button type="button" className="rounded-full border border-navy/20 px-4 py-2 text-sm font-semibold text-navy" onClick={() => persist("draft")}>
              Save draft
            </button>
            <button type="submit" className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white">
              Publish
            </button>
            <button type="button" className="text-sm font-semibold text-muted" onClick={() => setForm(null)}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

function ButtonsEditor({ value, onChange }) {
  const buttons = value.length ? value : [{ label: "", url: "", style: "primary", openInNewTab: false }];
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-navy">Buttons</p>
      {buttons.map((button, index) => (
        <div key={index} className="mb-2 grid gap-2 sm:grid-cols-4">
          <input className={inputClass} placeholder="Label" value={button.label} onChange={(e) => onChange(buttons.map((item, i) => (i === index ? { ...item, label: e.target.value } : item)))} />
          <input className={inputClass} placeholder="URL" value={button.url} onChange={(e) => onChange(buttons.map((item, i) => (i === index ? { ...item, url: e.target.value } : item)))} />
          <select className={inputClass} value={button.style || "primary"} onChange={(e) => onChange(buttons.map((item, i) => (i === index ? { ...item, style: e.target.value } : item)))}>
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="navy">Navy</option>
            <option value="gold">Gold</option>
          </select>
          <button type="button" className="text-sm font-semibold text-red-700" onClick={() => onChange(buttons.filter((_, i) => i !== index))}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" className="text-sm font-semibold text-gold" onClick={() => onChange([...buttons, { label: "", url: "", style: "primary" }])}>
        Add button
      </button>
    </div>
  );
}

function HistoryPanel({ onToast, onError }) {
  const [audit, setAudit] = useState({ rows: [], page: 1, total: 0 });
  const [kind, setKind] = useState("sections");
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState("");
  const [revisions, setRevisions] = useState([]);

  useEffect(() => {
    fetchAdminAudit(1).then(setAudit).catch((err) => onError(err.message));
  }, []);

  useEffect(() => {
    if (kind === "settings") {
      fetchAdminSettings()
        .then((row) => {
          setItems([{ id: row.id || "settings", title: "Site settings" }]);
          setSelected(row.id || "settings");
        })
        .catch((err) => onError(err.message));
      return;
    }
    fetchAdminCollection(kind)
      .then((rows) => {
        setItems(rows);
        setSelected(rows[0]?.id || "");
      })
      .catch((err) => onError(err.message));
  }, [kind]);

  useEffect(() => {
    if (!selected) return;
    fetchAdminRevisions(kind, selected).then(setRevisions).catch(() => setRevisions([]));
  }, [kind, selected]);

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-navy/10 bg-white p-5">
        <h2 className="font-heading text-xl font-bold text-navy">Revisions</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <select className={inputClass} value={kind} onChange={(e) => setKind(e.target.value)}>
            {["settings", "sections", "stats", "slides", "team", "partners", "testimonials", "faqs", "nav"].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select className={inputClass} value={selected} onChange={(e) => setSelected(e.target.value)}>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label || item.name || item.heading || item.question || item.title || item.key}
              </option>
            ))}
          </select>
        </div>
        <ul className="mt-4 space-y-2">
          {revisions.map((row) => (
            <li key={row.id || row._id} className="flex items-center justify-between gap-2 rounded-xl border border-navy/10 px-3 py-2 text-sm">
              <span>{new Date(row.createdAt).toLocaleString()} · {row.editedBy}</span>
              <button
                type="button"
                className="font-semibold text-gold"
                onClick={async () => {
                  try {
                    await restoreAdminRevision(kind, selected, row.id || row._id);
                    onToast("Version restored.");
                  } catch (err) {
                    onError(err.message);
                  }
                }}
              >
                Restore this version
              </button>
            </li>
          ))}
          {revisions.length ? null : <p className="text-sm text-muted">No revisions yet for this item.</p>}
        </ul>
      </div>
      <div className="rounded-2xl border border-navy/10 bg-white p-5">
        <h2 className="font-heading text-xl font-bold text-navy">Audit log</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {(audit.rows || []).map((row) => (
            <li key={row.id || row._id} className="rounded-xl border border-navy/10 px-3 py-2">
              <p className="font-semibold text-navy">{row.action} · {row.entity}</p>
              <p className="text-muted">{row.summary}</p>
              <p className="text-xs text-muted">{row.admin} · {row.createdAt ? new Date(row.createdAt).toLocaleString() : ""}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

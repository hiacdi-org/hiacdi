import assert from "node:assert/strict";
import test from "node:test";
import { sanitizeHtml } from "../utils/htmlSanitize.js";
import { publishedOnly, reorderItems, ensureCmsSeeded, loadCollection, updateItem, cleanSettings } from "../utils/cmsStore.js";

test("sanitizer strips scripts, handlers and javascript URLs", () => {
  const dirty = `<p>Hello</p><script>alert(1)</script><a href="javascript:alert(1)">x</a><img src="https://evil.example/x.png" onerror="alert(1)"><a href="https://hiacdi.org/">ok</a><img src="https://res.cloudinary.com/demo/image/upload/a.jpg" alt="a">`;
  const clean = sanitizeHtml(dirty);
  assert.equal(clean.includes("<script"), false);
  assert.equal(clean.toLowerCase().includes("javascript:"), false);
  assert.equal(clean.toLowerCase().includes("onerror"), false);
  assert.equal(clean.includes("https://hiacdi.org/"), true);
  assert.equal(clean.includes("res.cloudinary.com"), true);
  assert.equal(clean.includes("evil.example"), false);
});

test("publishedOnly hides drafts and invisible rows unless preview", () => {
  const rows = [
    { id: "1", visible: true, status: "published" },
    { id: "2", visible: true, status: "draft" },
    { id: "3", visible: false, status: "published" },
  ];
  assert.deepEqual(publishedOnly(rows).map((row) => row.id), ["1"]);
  assert.deepEqual(publishedOnly(rows, { preview: true }).map((row) => row.id), ["1", "2"]);
});

test("reorder persists new order in JSON store", async () => {
  await ensureCmsSeeded();
  const before = await loadCollection("stats");
  const reversed = [...before].reverse().map((row) => row.id);
  const after = await reorderItems("stats", reversed, "test");
  assert.equal(after[0].id, reversed[0]);
  await reorderItems("stats", before.map((row) => row.id), "test");
});

test("draft status is stored and public filter excludes it", async () => {
  await ensureCmsSeeded();
  const stats = await loadCollection("stats");
  const first = stats[0];
  const updated = await updateItem("stats", first.id, { ...first, status: "draft" }, "test");
  assert.equal(updated.status, "draft");
  const visible = publishedOnly(await loadCollection("stats"));
  assert.equal(visible.some((row) => row.id === first.id), false);
  await updateItem("stats", first.id, { ...first, status: "published" }, "test");
});

test("cleanSettings strips script tags from footer HTML", () => {
  const cleaned = cleanSettings({
    organizationName: "HIACDI",
    footerText: "<p>Hello</p><script>alert(1)</script>",
    contact: { email: "hiacditechhub@gmail.com" },
    social: {},
    seo: {},
    announcementBar: {},
  });
  assert.equal(cleaned.footerText.includes("<script"), false);
  assert.equal(cleaned.footerText.includes("<p>Hello</p>"), true);
});

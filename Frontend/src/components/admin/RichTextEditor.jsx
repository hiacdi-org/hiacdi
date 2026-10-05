import { useEffect, useRef } from "react";
import { apiUrl } from "../../services/apiBase";
import { getToken } from "../../services/auth";

export default function RichTextEditor({ value, onChange, label = "Body" }) {
  const ref = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (value || "")) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  function command(name, arg) {
    document.execCommand(name, false, arg);
    onChange(ref.current?.innerHTML || "");
  }

  function insertImage(file) {
    if (!file) return;
    const body = new FormData();
    body.append("file", file);
    body.append("folder", "hiacdi/cms");
    body.append("imagesOnly", "true");
    const xhr = new XMLHttpRequest();
    xhr.open("POST", apiUrl("/api/uploads"));
    xhr.withCredentials = true;
    const token = getToken();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText || "{}");
        if (xhr.status >= 200 && xhr.status < 300 && data.url) {
          command("insertHTML", `<img src="${data.url}" alt="">`);
        }
      } catch {
        // ignore parse errors
      }
    };
    xhr.send(body);
  }

  return (
    <div>
      <span className="mb-1 block text-sm font-semibold text-navy">{label}</span>
      <div className="mb-2 flex flex-wrap gap-1">
        {[
          ["bold", "Bold"],
          ["italic", "Italic"],
          ["insertUnorderedList", "List"],
          ["insertOrderedList", "Numbers"],
          ["formatBlock", "H2", "h2"],
          ["formatBlock", "H3", "h3"],
          ["formatBlock", "Paragraph", "p"],
        ].map(([cmd, text, arg]) => (
          <button
            key={text}
            type="button"
            className="rounded border border-navy/15 px-2 py-1 text-xs font-semibold text-navy"
            onMouseDown={(event) => {
              event.preventDefault();
              command(cmd, arg);
            }}
          >
            {text}
          </button>
        ))}
        <button
          type="button"
          className="rounded border border-navy/15 px-2 py-1 text-xs font-semibold text-navy"
          onMouseDown={(event) => {
            event.preventDefault();
            const url = window.prompt("Link URL");
            if (url) command("createLink", url);
          }}
        >
          Link
        </button>
        <button
          type="button"
          className="rounded border border-navy/15 px-2 py-1 text-xs font-semibold text-navy"
          onMouseDown={(event) => {
            event.preventDefault();
            fileRef.current?.click();
          }}
        >
          Image
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => {
            insertImage(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </div>
      <div
        ref={ref}
        contentEditable
        role="textbox"
        aria-label={label}
        className="min-h-32 rounded-md border border-navy/15 bg-white px-3 py-2 text-sm leading-6 text-ink outline-none focus:border-gold"
        onInput={() => onChange(ref.current?.innerHTML || "")}
      />
    </div>
  );
}

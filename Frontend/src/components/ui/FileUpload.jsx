import { useState } from "react";
import { apiUrl } from "../../services/apiBase";
import { getToken } from "../../services/auth";
import { optimizedImage } from "../../utils/media";

export default function FileUpload({ folder, imagesOnly, value, onChange, label = "Upload file" }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [over, setOver] = useState(false);

  function onFile(file) {
    if (!file) return;
    setBusy(true);
    setError("");
    setProgress(0);
    const body = new FormData();
    body.append("file", file);
    body.append("folder", folder);
    if (imagesOnly) body.append("imagesOnly", "true");
    const xhr = new XMLHttpRequest();
    xhr.open("POST", apiUrl("/api/uploads"));
    xhr.withCredentials = true;
    const token = getToken();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) setProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      setBusy(false);
      try {
        const data = JSON.parse(xhr.responseText || "{}");
        if (xhr.status >= 200 && xhr.status < 300) {
          onChange(data);
          setProgress(100);
        } else {
          setError(data.message || "Upload failed.");
          setProgress(0);
        }
      } catch {
        setError("Upload failed.");
        setProgress(0);
      }
    };
    xhr.onerror = () => {
      setBusy(false);
      setError("Upload failed.");
      setProgress(0);
    };
    xhr.send(body);
  }

  return (
    <div>
      <span className="mb-1 block text-sm font-semibold text-navy">{label}</span>
      <label
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-6 text-center text-sm ${
          over ? "border-gold bg-gold/10 text-navy" : "border-navy/20 bg-soft text-muted"
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setOver(false);
          onFile(event.dataTransfer.files?.[0]);
        }}
      >
        <input
          type="file"
          className="hidden"
          accept={imagesOnly ? "image/jpeg,image/png,image/webp" : "image/jpeg,image/png,image/webp,application/pdf"}
          disabled={busy}
          onChange={(event) => onFile(event.target.files?.[0])}
        />
        Drag and drop or click to choose a file
        {busy || progress ? (
          <span className="mt-2 font-semibold text-navy" aria-live="polite">
            {busy ? `Uploading… ${progress}%` : progress === 100 ? "Uploaded" : ""}
          </span>
        ) : null}
      </label>
      {error ? (
        <p className="mt-2 text-sm font-semibold text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      {value?.url ? (
        <div className="mt-3 flex items-center gap-3">
          {String(value.resourceType || "image") !== "raw" ? (
            <img src={optimizedImage(value.url, 160)} alt="" className="h-16 w-16 rounded-md object-cover" />
          ) : (
            <a href={value.url} className="text-sm font-semibold text-gold" target="_blank" rel="noreferrer">
              View file
            </a>
          )}
          <button type="button" className="text-sm font-semibold text-red-700" onClick={() => onChange(null)}>
            Remove
          </button>
        </div>
      ) : null}
    </div>
  );
}

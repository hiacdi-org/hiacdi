import { useState } from "react";
import { authInputClass } from "./AuthShell";

export default function PasswordField({
  label = "Password",
  value,
  onChange,
  autoComplete = "current-password",
  className = authInputClass,
  disabled = false,
  required = true,
  id,
}) {
  const [visible, setVisible] = useState(false);
  const inputId = id || `password-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <label className="block" htmlFor={inputId}>
      <span className="mb-1 block text-sm font-semibold text-navy">{label}</span>
      <span className="relative block">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          className={`${className} pr-12`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          disabled={disabled}
          required={required}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center px-3 text-navy/70 hover:text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          tabIndex={0}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </span>
    </label>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a3 3 0 004.8 3.8" />
      <path d="M9.9 5.1A10.8 10.8 0 0112 5c6.5 0 10 7 10 7a18.3 18.3 0 01-3.2 3.9" />
      <path d="M6.1 6.1C3.7 7.8 2 12 2 12s3.5 7 10 7a10.4 10.4 0 004.4-.9" />
    </svg>
  );
}

/** Certificate number prefix. Change here only. */
export const CERT_PREFIX = "HIA";

/** Uppercase alphanumeric without look-alikes 0/O and 1/I. */
export const CERT_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const CERT_PATTERN = new RegExp(`^${CERT_PREFIX}-[A-Z]{2,12}-[A-Z0-9]{6}$`);

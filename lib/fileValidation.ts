const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const signatures: Record<string, (bytes: Uint8Array) => boolean> = {
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  "image/png": (b) => [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((v, i) => b[i] === v),
  "image/webp": (b) => ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 12) === "WEBP",
  "image/gif": (b) => ["GIF87a", "GIF89a"].includes(ascii(b, 0, 6)),
  "application/pdf": (b) => ascii(b, 0, 5) === "%PDF-",
};

const extensions: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp",
  "image/gif": "gif", "application/pdf": "pdf",
};

function ascii(bytes: Uint8Array, start: number, end: number) {
  return String.fromCharCode(...bytes.slice(start, end));
}

export async function validateUpload(file: File, allowedTypes: readonly string[]) {
  if (file.size < 1 || file.size > MAX_UPLOAD_BYTES) return false;
  if (!allowedTypes.includes(file.type) || !signatures[file.type]) return false;
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  return signatures[file.type](bytes);
}

export function safeFileExtension(file: File) {
  return extensions[file.type] || "bin";
}


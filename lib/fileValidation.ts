const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const signatures: Record<string, (bytes: Uint8Array) => boolean> = {
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  "image/png": (b) =>
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
      (v, i) => b[i] === v,
    ),
  "image/webp": (b) => ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 12) === "WEBP",
  "image/gif": (b) => ["GIF87a", "GIF89a"].includes(ascii(b, 0, 6)),
  "application/pdf": (b) => ascii(b, 0, 5) === "%PDF-",
  "audio/mpeg": (b) =>
    ascii(b, 0, 3) === "ID3" || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0),
  "audio/webm": (b) =>
    b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3,
  "audio/ogg": (b) => ascii(b, 0, 4) === "OggS",
  "audio/mp4": (b) => ascii(b, 4, 8) === "ftyp",
};

const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
  "audio/mpeg": "mp3",
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/mp4": "m4a",
};

function ascii(bytes: Uint8Array, start: number, end: number) {
  return String.fromCharCode(...bytes.slice(start, end));
}

export async function validateUpload(
  file: File,
  allowedTypes: readonly string[],
  maxBytes = MAX_UPLOAD_BYTES,
) {
  if (file.size < 1 || file.size > maxBytes) return false;
  if (!allowedTypes.includes(file.type) || !signatures[file.type]) return false;
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  return signatures[file.type](bytes);
}

export function safeFileExtension(file: File) {
  return extensions[file.type] || "bin";
}

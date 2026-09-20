// Prepares user-selected photos for upload.
//
// Two problems this solves, both seen on real Android phones:
//
// 1. Files from the mobile file picker are backed by temporary OS handles. If the
//    tab is backgrounded or the phone trims memory before the upload happens
//    (minutes later, after several wizard steps), the handle is revoked and every
//    later read fails — previews break and uploads die client-side with a bare
//    "Network Error". So the FIRST thing we do is copy the bytes into page-owned
//    memory; nothing downstream ever touches the picker's File again.
//
// 2. Full-resolution phone photos are 5-20MB and decode to ~50MB bitmaps. We
//    downscale/re-encode before upload, and process photos ONE AT A TIME so peak
//    memory stays at a single bitmap even for a 20-photo listing.

const MAX_DIMENSION = 1920; // matches backend FILE_UPLOAD.MAX_WIDTH/MAX_HEIGHT
const JPEG_QUALITY = 0.82;
const SKIP_COMPRESSION_BELOW_BYTES = 800 * 1024;

/** Copies a picker File into an in-memory File that cannot be revoked by the OS. */
export async function snapshotFile(file: File): Promise<File> {
  const bytes = await file.arrayBuffer();
  if (bytes.byteLength === 0) throw new Error(`"${file.name}" could not be read (empty file)`);
  return new File([bytes], file.name, { type: file.type, lastModified: file.lastModified });
}

async function compressInMemory(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;
  if (file.size < SKIP_COMPRESSION_BELOW_BYTES) return file;

  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY)
    );
    canvas.width = 0; // release the canvas backing store promptly
    canvas.height = 0;
    if (!blob || blob.size === 0 || blob.size >= file.size) return file;

    const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], newName, { type: 'image/jpeg', lastModified: Date.now() });
  } catch {
    return file; // best-effort: the in-memory original is still perfectly uploadable
  } finally {
    bitmap?.close();
  }
}

export interface PreparedImage {
  file: File;
  error?: string;
}

/**
 * Snapshots and compresses each photo sequentially, reporting per-file progress via
 * `onReady` so the UI can show thumbnails as they finish. Files that cannot be read
 * are reported with an `error` instead of silently dropped.
 */
export async function prepareImages(
  files: File[],
  onReady: (result: PreparedImage, index: number) => void
): Promise<void> {
  for (let i = 0; i < files.length; i++) {
    const original = files[i];
    try {
      const snapshot = await snapshotFile(original);
      const compressed = await compressInMemory(snapshot);
      onReady({ file: compressed }, i);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `"${original.name}" could not be read`;
      onReady({ file: original, error: msg }, i);
    }
  }
}

// Downscales and re-encodes an image in the browser before upload. Phone camera
// photos routinely run 5-20MB; sending them as-is forces the (memory-constrained)
// backend to decode + resize + re-encode each one synchronously, which can time
// out or exhaust the server's memory limit for multi-photo uploads. Shrinking
// client-side first keeps uploads fast and reliable regardless of server headroom.

const MAX_DIMENSION = 1920; // matches backend FILE_UPLOAD.MAX_WIDTH/MAX_HEIGHT
const JPEG_QUALITY = 0.82;
const SKIP_COMPRESSION_BELOW_BYTES = 800 * 1024; // not worth the trouble under ~800KB

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;
  if (file.size < SKIP_COMPRESSION_BELOW_BYTES) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY)
    );
    if (!blob || blob.size >= file.size) return file;

    const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], newName, { type: 'image/jpeg', lastModified: Date.now() });
  } catch {
    // Compression is a best-effort optimization — never block the upload over it.
    return file;
  }
}

export async function compressImages(files: File[]): Promise<File[]> {
  return Promise.all(files.map(compressImage));
}

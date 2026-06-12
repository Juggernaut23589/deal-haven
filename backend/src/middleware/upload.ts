import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { ValidationError } from '../shared/errors';
import { FILE_UPLOAD } from '../config/constants';
import type { UploadedFile } from '../shared/types';
import { nanoid } from 'nanoid';
import { logger } from '../config/logger';

// path.resolve handles both absolute UPLOAD_DIR (/home/deploy/.../uploads)
// and relative ('uploads') correctly regardless of cwd
const UPLOAD_BASE_DIR = path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? 'uploads');

export async function ensureUploadDirs(): Promise<void> {
  const dirs = ['images/listings', 'images/avatars', 'images/banners', 'documents'];
  for (const dir of dirs) {
    await fs.mkdir(path.join(UPLOAD_BASE_DIR, dir), { recursive: true });
  }
}

export function getPublicUrl(relativePath: string): string {
  // Store as a root-relative path so the URL stays valid regardless of domain,
  // protocol, or which environment the upload occurred in.
  // The backend API response layer resolves this to an absolute URL at read time.
  return `/uploads/${relativePath}`;
}

/** Resolve a stored image path (relative or legacy absolute) to a full URL. */
export function resolveUploadUrl(storedUrl: string): string {
  if (!storedUrl) return storedUrl;
  if (storedUrl.startsWith('http://') || storedUrl.startsWith('https://')) {
    return storedUrl; // legacy absolute URL — return as-is
  }
  const base = (process.env.API_URL ?? 'http://localhost:4000').replace(/\/$/, '');
  return `${base}${storedUrl}`;
}

// Detect file extension from mimetype
function extForMime(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/avif': '.avif',
  };
  return map[mime] ?? '.jpg';
}

export async function processAndSaveImage(
  buffer: Buffer,
  mimetype: string,
  subDir: string,
): Promise<Omit<UploadedFile, 'fieldname' | 'originalname' | 'size' | 'buffer'>> {
  if (!FILE_UPLOAD.ALLOWED_IMAGE_TYPES.includes(mimetype as never)) {
    throw new ValidationError(
      `Invalid file type. Allowed types: ${FILE_UPLOAD.ALLOWED_IMAGE_TYPES.join(', ')}`,
    );
  }

  const id = nanoid();
  const dirPath = path.join(UPLOAD_BASE_DIR, subDir);
  await fs.mkdir(dirPath, { recursive: true });

  try {
    // Try full sharp processing: resize + WebP conversion + thumbnail
    const metadata = await sharp(buffer).metadata();
    const width = metadata.width ?? 0;
    const height = metadata.height ?? 0;

    const webpFilename = `${id}.webp`;
    const webpPath = path.join(dirPath, webpFilename);
    await sharp(buffer)
      .resize(FILE_UPLOAD.MAX_WIDTH, FILE_UPLOAD.MAX_HEIGHT, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toFile(webpPath);

    const thumbFilename = `${id}_thumb.webp`;
    const thumbPath = path.join(dirPath, thumbFilename);
    await sharp(buffer)
      .resize(FILE_UPLOAD.THUMBNAIL_WIDTH, FILE_UPLOAD.THUMBNAIL_HEIGHT, {
        fit: 'cover',
        // Use 'centre' instead of 'attention' — 'attention' requires libvips
        // smart crop feature which may not be available on all builds
        position: 'centre',
      })
      .webp({ quality: 80 })
      .toFile(thumbPath);

    return {
      mimetype: 'image/webp',
      url: getPublicUrl(`${subDir}/${webpFilename}`),
      thumbnailUrl: getPublicUrl(`${subDir}/${thumbFilename}`),
      webpUrl: getPublicUrl(`${subDir}/${webpFilename}`),
      width,
      height,
    };
  } catch (sharpError) {
    // Sharp processing failed (binary incompatibility or unsupported operation).
    // Fall back to saving the original file as-is so uploads never fail silently.
    logger.warn({ err: sharpError, subDir }, 'sharp processing failed — saving original file');

    const ext = extForMime(mimetype);
    const origFilename = `${id}${ext}`;
    const origPath = path.join(dirPath, origFilename);
    await fs.writeFile(origPath, buffer);

    const url = getPublicUrl(`${subDir}/${origFilename}`);
    return {
      mimetype,
      url,
      thumbnailUrl: url,
      webpUrl: url,
      width: 0,
      height: 0,
    };
  }
}

export async function deleteUploadedFile(url: string): Promise<void> {
  try {
    // Handle both legacy absolute URLs and new root-relative paths
    const relativePath = url
      .replace(/^https?:\/\/[^/]+\/uploads\//, '')  // strip absolute prefix
      .replace(/^\/uploads\//, '');                  // strip root-relative prefix
    const filePath = path.join(UPLOAD_BASE_DIR, relativePath);
    await fs.unlink(filePath);
  } catch {
    // File may not exist; not a critical error
  }
}

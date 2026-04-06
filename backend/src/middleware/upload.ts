import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { ValidationError } from '../shared/errors';
import { FILE_UPLOAD } from '../config/constants';
import type { UploadedFile } from '../shared/types';
import { nanoid } from 'nanoid';

const UPLOAD_BASE_DIR = process.env.UPLOAD_DIR ?? 'uploads';

export async function ensureUploadDirs(): Promise<void> {
  const dirs = ['images/listings', 'images/avatars', 'images/banners', 'documents'];
  for (const dir of dirs) {
    await fs.mkdir(path.join(UPLOAD_BASE_DIR, dir), { recursive: true });
  }
}

export function getPublicUrl(relativePath: string): string {
  const baseUrl = process.env.API_URL ?? 'http://localhost:4000';
  return `${baseUrl}/uploads/${relativePath}`;
}

export async function processAndSaveImage(
  buffer: Buffer,
  mimetype: string,
  subDir: string,
): Promise<Omit<UploadedFile, 'fieldname' | 'originalname' | 'size' | 'buffer'>> {
  if (!FILE_UPLOAD.ALLOWED_IMAGE_TYPES.includes(mimetype as any)) {
    throw new ValidationError(
      `Invalid file type. Allowed types: ${FILE_UPLOAD.ALLOWED_IMAGE_TYPES.join(', ')}`,
    );
  }

  const id = nanoid();
  const dirPath = path.join(UPLOAD_BASE_DIR, subDir);
  await fs.mkdir(dirPath, { recursive: true });

  // Get metadata
  const metadata = await sharp(buffer).metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;

  // Main image (resized + WebP)
  const webpFilename = `${id}.webp`;
  const webpPath = path.join(dirPath, webpFilename);
  await sharp(buffer)
    .resize(FILE_UPLOAD.MAX_WIDTH, FILE_UPLOAD.MAX_HEIGHT, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 85 })
    .toFile(webpPath);

  // Thumbnail
  const thumbFilename = `${id}_thumb.webp`;
  const thumbPath = path.join(dirPath, thumbFilename);
  await sharp(buffer)
    .resize(FILE_UPLOAD.THUMBNAIL_WIDTH, FILE_UPLOAD.THUMBNAIL_HEIGHT, {
      fit: 'cover',
      position: 'attention',
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
}

export async function deleteUploadedFile(url: string): Promise<void> {
  try {
    const baseUrl = process.env.API_URL ?? 'http://localhost:4000';
    const relativePath = url.replace(`${baseUrl}/uploads/`, '');
    const filePath = path.join(UPLOAD_BASE_DIR, relativePath);
    await fs.unlink(filePath);
  } catch {
    // File may not exist; not a critical error
  }
}

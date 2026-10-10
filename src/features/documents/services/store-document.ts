import { randomUUID } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { requireEnv } from '@/lib/env.ts';

const UPLOADS_DIR = path.resolve(requireEnv('DOCUMENTS_UPLOADS_DIRECTORY'));

export interface StoredDocument {
  filePath: string;
  originalFilename: string;
  size: number;
  // Call this if the row can't be written, so no orphaned file is left behind
  discard: () => Promise<void>;
}

export async function storeDocument(userId: string, file: File): Promise<StoredDocument> {
  const extension = path.extname(file.name).toLowerCase();
  const filePath = path.posix.join(userId, `${randomUUID()}${extension}`);
  const absolutePath = path.join(UPLOADS_DIR, ...filePath.split('/'));

  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, Buffer.from(await file.arrayBuffer()));

  return {
    filePath,
    originalFilename: truncateFilename(file.name),
    size: file.size,
    discard: () => rm(absolutePath, { force: true }),
  };
}

function truncateFilename(filename: string) {
  const extension = path.extname(filename);
  const stem = path.basename(filename, extension);
  return stem.slice(0, 255 - extension.length) + extension;
}

import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { requireEnv } from '@/lib/env.ts';

const UPLOADS_DIR = path.resolve(requireEnv('DOCUMENTS_UPLOADS_DIRECTORY'));

// The counterpart of storeDocument: opens a stored file, or null when it's gone
export async function readDocument(filePath: string) {
  const absolutePath = path.join(UPLOADS_DIR, ...filePath.split('/'));
  const file = await stat(absolutePath).catch(() => null);
  if (!file) return null;

  return {
    stream: Readable.toWeb(createReadStream(absolutePath)) as ReadableStream,
    size: file.size,
  };
}

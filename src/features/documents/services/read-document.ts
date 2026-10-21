import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { resolveStoredPath } from '@/features/documents/services/stored-document-path.ts';

// The counterpart of storeDocument: opens a stored file, or null when it's gone
export async function readDocument(filePath: string) {
  const absolutePath = resolveStoredPath(filePath);
  const file = await stat(absolutePath).catch(() => null);
  if (!file) return null;

  return {
    stream: Readable.toWeb(createReadStream(absolutePath)) as ReadableStream,
    size: file.size,
  };
}

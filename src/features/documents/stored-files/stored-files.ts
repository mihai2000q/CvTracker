import 'server-only';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { requireEnv } from '@/lib/env.ts';
import { createDiskFileAdapter } from '@/features/documents/stored-files/disk-file-adapter.ts';
import type { FileAdapter } from '@/features/documents/stored-files/file-adapter.ts';

// What `withStored` hands over: a stored file for each file that was given, and for one that
// might not have been, one that might not be
export type StoredFiles<Files> = {
  [Name in keyof Files]: Files[Name] extends File ? StoredFile : StoredFile | undefined;
};

export interface StoredFile {
  // The key the row keeps in `file_path`
  filePath: string;
  originalFilename: string;
  size: number;
}

const CONTENT_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.odt': 'application/vnd.oasis.opendocument.text',
};

// The files of the documents, and what keeps them in step with the rows that point at them
export function createStoredFiles(adapter: FileAdapter) {
  async function store(userId: string, file: File): Promise<StoredFile> {
    const extension = path.extname(file.name).toLowerCase();
    const filePath = path.posix.join(userId, `${randomUUID()}${extension}`);

    await adapter.write(filePath, Buffer.from(await file.arrayBuffer()));

    return { filePath, originalFilename: truncateFilename(file.name), size: file.size };
  }

  // A file that can't be removed is left behind, and says so: it is no reason to fail what the
  // user did
  async function remove(filePath: string) {
    await adapter.remove(filePath).catch((error) => {
      console.error(`Could not remove the stored file ${filePath}`, error);
    });
  }

  // Opens a stored file with the content type its extension says, or null when it's gone
  async function open(filePath: string) {
    const file = await adapter.open(filePath);
    if (!file) return null;

    return { ...file, contentType: CONTENT_TYPES[path.extname(filePath).toLowerCase()] };
  }

  // Stores the files given, and hands them to `write`, which writes the rows that point at them.
  // When `write` throws no file is left behind. When it goes through, the files that these
  // replace (`replacing`) are removed, as nothing points at them anymore
  async function withStored<Files extends Record<string, File | undefined>, Result>(
    userId: string,
    files: Files,
    write: (stored: StoredFiles<Files>) => Promise<Result>,
    { replacing = [] }: { replacing?: string[] } = {}
  ): Promise<Result> {
    const stored: Record<string, StoredFile> = {};
    const written: StoredFile[] = [];
    let result: Result;

    try {
      for (const [name, file] of Object.entries(files)) {
        if (!file) continue;
        const storedFile = await store(userId, file);
        stored[name] = storedFile;
        written.push(storedFile);
      }
      result = await write(stored as StoredFiles<Files>);
    } catch (error) {
      await Promise.all(written.map(({ filePath }) => remove(filePath)));
      throw error;
    }

    if (written.length > 0) await Promise.all(replacing.map(remove));
    return result;
  }

  return { open, remove, withStored };
}

function truncateFilename(filename: string) {
  const extension = path.extname(filename);
  const stem = path.basename(filename, extension);
  return stem.slice(0, 255 - extension.length) + extension;
}

export const storedFiles = createStoredFiles(
  createDiskFileAdapter(requireEnv('DOCUMENTS_UPLOADS_DIRECTORY'))
);

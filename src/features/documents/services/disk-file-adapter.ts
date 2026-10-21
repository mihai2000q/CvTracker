import 'server-only';
import { createReadStream } from 'node:fs';
import { mkdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import type { FileAdapter } from '@/features/documents/services/file-adapter.ts';

// Keeps the files under a directory. A key is relative to it and always written with `/`
export function createDiskFileAdapter(directory: string): FileAdapter {
  const root = path.resolve(directory);
  const absolutePath = (key: string) => path.join(root, ...key.split('/'));

  return {
    async write(key, data) {
      const target = absolutePath(key);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, data);
    },

    async remove(key) {
      await rm(absolutePath(key), { force: true });
    },

    async open(key) {
      const target = absolutePath(key);
      const file = await stat(target).catch(() => null);
      if (!file) return null;

      return {
        stream: Readable.toWeb(createReadStream(target)) as ReadableStream,
        size: file.size,
      };
    },
  };
}

import 'server-only';
import path from 'node:path';
import { requireEnv } from '@/lib/env.ts';

const UPLOADS_DIR = path.resolve(requireEnv('DOCUMENTS_UPLOADS_DIRECTORY'));

// Where a stored document is on disk, from the `file_path` its row keeps: relative to the uploads
// directory and always written with `/`
export const resolveStoredPath = (filePath: string) =>
  path.join(UPLOADS_DIR, ...filePath.split('/'));

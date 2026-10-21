// Where the bytes of the stored files are kept, under a key: all the module of stored files asks
// of a storage. What a key looks like and what a file is called are its own business
export interface FileAdapter {
  write(key: string, data: Buffer): Promise<void>;
  // Nothing happens when there is no such file
  remove(key: string): Promise<void>;
  // Null when there is no such file
  open(key: string): Promise<{ stream: ReadableStream; size: number } | null>;
}

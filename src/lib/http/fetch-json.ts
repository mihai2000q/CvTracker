export async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) throw new Error(`Request to ${input} failed: ${res.status}`);
  return (await res.json()) as T;
}

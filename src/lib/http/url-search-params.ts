// A list value is a repeated param
export function buildSearchParams(
  params: Record<string, string | number | string[] | null | undefined>
): URLSearchParams {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((entry) => searchParams.append(key, entry));
    } else if (value !== null && value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  }
  return searchParams;
}

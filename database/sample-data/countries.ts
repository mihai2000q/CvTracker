import type { Database } from '../db.ts';
import { sized, uuid } from '../field-values.ts';

// The one thing the sample data can't give an id of its own: countries come from the reference
// data, which seeds them first (npm run db:seed)
export async function getCountryIds(db: Database) {
  const countries = await db.Country.all();
  const ids = new Map(countries.map(({ isoCode, id }) => [isoCode as string, uuid(id)]));
  return (isoCode: string) => {
    const id = ids.get(sized<2>(isoCode));
    if (!id) throw new Error(`Country ${isoCode} not found. Seed the reference data: npm run db:seed`);
    return id;
  };
}

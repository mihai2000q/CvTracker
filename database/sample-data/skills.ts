import type { Database } from '../db.ts';
import { sized, uuid } from '../field-values.ts';

type NewSkill = Parameters<Database['Skill']['create']>[0];

const skills: NewSkill[] = [
  { id: uuid('00000000-0000-7000-8000-000000001001'), name: sized<100>('TypeScript'), userId: uuid('00000000-0000-7000-8000-000000000001') },
  { id: uuid('00000000-0000-7000-8000-000000001002'), name: sized<100>('React'), userId: uuid('00000000-0000-7000-8000-000000000001') },
  { id: uuid('00000000-0000-7000-8000-000000001003'), name: sized<100>('Node.js'), userId: uuid('00000000-0000-7000-8000-000000000001') },
  { id: uuid('00000000-0000-7000-8000-000000001004'), name: sized<100>('PostgreSQL'), userId: uuid('00000000-0000-7000-8000-000000000001') },
  { id: uuid('00000000-0000-7000-8000-000000001005'), name: sized<100>('CSS'), userId: uuid('00000000-0000-7000-8000-000000000001') },
  { id: uuid('00000000-0000-7000-8000-000000001006'), name: sized<100>('Python'), userId: uuid('00000000-0000-7000-8000-000000000001') },
  { id: uuid('00000000-0000-7000-8000-000000001007'), name: sized<100>('Go'), userId: uuid('00000000-0000-7000-8000-000000000001') },
  { id: uuid('00000000-0000-7000-8000-000000001008'), name: sized<100>('Java'), userId: uuid('00000000-0000-7000-8000-000000000001') },
  { id: uuid('00000000-0000-7000-8000-000000001009'), name: sized<100>('Kubernetes'), userId: uuid('00000000-0000-7000-8000-000000000001') },
  { id: uuid('00000000-0000-7000-8000-000000001010'), name: sized<100>('AWS'), userId: uuid('00000000-0000-7000-8000-000000000001') },
  { id: uuid('00000000-0000-7000-8000-000000001011'), name: sized<100>('Leadership'), userId: uuid('00000000-0000-7000-8000-000000000001') },
  // Not used by anything
  { id: uuid('00000000-0000-7000-8000-000000001012'), name: sized<100>('COBOL'), userId: uuid('00000000-0000-7000-8000-000000000001') },
];

export async function seedSampleSkills(db: Database) {
  for (const skill of skills) {
    await db.Skill.create(skill);
  }
}

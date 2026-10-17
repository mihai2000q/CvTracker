import type { Database } from '../db.ts';
import { sized, uuid } from '../field-values.ts';
import { getCountryIds } from './countries.ts';

type NewOrganization = Parameters<Database['Organization']['create']>[0];

// Countries are the only ids not known up front, hence the function
const organizations = (countryId: (isoCode: string) => ReturnType<typeof uuid>): NewOrganization[] => [
  {
    // Several countries, several contacts (with and without every optional field)
    id: uuid('00000000-0000-7000-8000-000000003001'),
    name: sized<200>('Northwind Labs'),
    websiteUrl: 'https://northwind.example.com',
    notes: 'Remote-friendly. Engineering blog is worth a read before the interviews.',
    userId: uuid('00000000-0000-7000-8000-000000000001'),
    organizationCountries: (countries) =>
      countries.create([
        { countryId: countryId('DE') },
        { countryId: countryId('AT') },
        { countryId: countryId('CH') },
      ]),
    contacts: (contacts) =>
      contacts.create([
        {
          id: uuid('00000000-0000-7000-8000-000000004001'),
          name: sized<150>('Anna Keller'),
          email: sized<255>('anna.keller@northwind.example.com'),
          phone: sized<50>('+49 30 1234567'),
          role: sized<100>('Technical Recruiter'),
        },
        {
          id: uuid('00000000-0000-7000-8000-000000004002'),
          name: sized<150>('Markus Brandt'),
          email: sized<255>('markus.brandt@northwind.example.com'),
          role: sized<100>('Engineering Manager'),
        },
        {
          id: uuid('00000000-0000-7000-8000-000000004003'),
          name: sized<150>('Priya Nair'),
          phone: sized<50>('+49 151 2345678'),
        },
        { name: sized<150>('Jonas') },
      ]),
  },
  {
    id: uuid('00000000-0000-7000-8000-000000003002'),
    name: sized<200>('Globex Systems'),
    websiteUrl: 'https://globex.example.com',
    userId: uuid('00000000-0000-7000-8000-000000000001'),
    organizationCountries: (countries) => countries.create([{ countryId: countryId('DE') }]),
    contacts: (contacts) =>
      contacts.create([
        {
          id: uuid('00000000-0000-7000-8000-000000004004'),
          name: sized<150>('Lena Fischer'),
          email: sized<255>('lena.fischer@globex.example.com'),
          role: sized<100>('HR Partner'),
        },
      ]),
  },
  {
    id: uuid('00000000-0000-7000-8000-000000003003'),
    name: sized<200>('Initech Europe'),
    notes: 'Large consultancy, one office per country.',
    userId: uuid('00000000-0000-7000-8000-000000000001'),
    organizationCountries: (countries) =>
      countries.create([
        { countryId: countryId('NL') },
        { countryId: countryId('BE') },
        { countryId: countryId('FR') },
        { countryId: countryId('ES') },
        { countryId: countryId('IT') },
      ]),
    contacts: (contacts) =>
      contacts.create([
        {
          id: uuid('00000000-0000-7000-8000-000000004005'),
          name: sized<150>('Pieter de Vries'),
          email: sized<255>('pieter@initech.example.com'),
          role: sized<100>('Hiring Manager'),
        },
      ]),
  },
  {
    id: uuid('00000000-0000-7000-8000-000000003004'),
    name: sized<200>('Umbrella Health Technologies'),
    websiteUrl: 'https://umbrella-health.example.com',
    userId: uuid('00000000-0000-7000-8000-000000000001'),
    organizationCountries: (countries) =>
      countries.create([{ countryId: countryId('GB') }, { countryId: countryId('IE') }]),
    contacts: (contacts) =>
      contacts.create([
        {
          id: uuid('00000000-0000-7000-8000-000000004006'),
          name: sized<150>('Oliver Grant'),
          email: sized<255>('oliver.grant@umbrella-health.example.com'),
          role: sized<100>('Recruiter'),
        },
        {
          id: uuid('00000000-0000-7000-8000-000000004007'),
          name: sized<150>('Siobhan Walsh'),
          email: sized<255>('siobhan.walsh@umbrella-health.example.com'),
          role: sized<100>('Staff Engineer'),
        },
      ]),
  },
  {
    id: uuid('00000000-0000-7000-8000-000000003005'),
    name: sized<200>('Stark Robotics'),
    websiteUrl: 'https://stark-robotics.example.com',
    userId: uuid('00000000-0000-7000-8000-000000000001'),
    organizationCountries: (countries) =>
      countries.create([{ countryId: countryId('US') }, { countryId: countryId('CA') }]),
    contacts: (contacts) =>
      contacts.create([
        {
          id: uuid('00000000-0000-7000-8000-000000004008'),
          name: sized<150>('Maria Lopez'),
          email: sized<255>('maria.lopez@stark-robotics.example.com'),
          role: sized<100>('Recruiter'),
        },
      ]),
  },
  {
    id: uuid('00000000-0000-7000-8000-000000003006'),
    name: sized<200>('Wayne Logistics'),
    userId: uuid('00000000-0000-7000-8000-000000000001'),
    organizationCountries: (countries) =>
      countries.create([{ countryId: countryId('PL') }, { countryId: countryId('CZ') }]),
    contacts: (contacts) =>
      contacts.create([
        {
          name: sized<150>('Tomasz Kowalski'),
          phone: sized<50>('+48 600 100 200'),
          role: sized<100>('Team Lead'),
        },
      ]),
  },
  {
    id: uuid('00000000-0000-7000-8000-000000003007'),
    name: sized<200>('Hooli Cloud'),
    websiteUrl: 'https://hooli.example.com',
    userId: uuid('00000000-0000-7000-8000-000000000001'),
    organizationCountries: (countries) =>
      countries.create([
        { countryId: countryId('SE') },
        { countryId: countryId('DK') },
        { countryId: countryId('NO') },
        { countryId: countryId('FI') },
      ]),
    contacts: (contacts) =>
      contacts.create([
        {
          name: sized<150>('Ingrid Larsen'),
          email: sized<255>('ingrid.larsen@hooli.example.com'),
          role: sized<100>('Talent Lead'),
        },
      ]),
  },
  {
    // No contacts at all
    id: uuid('00000000-0000-7000-8000-000000003008'),
    name: sized<200>('Soylent Foods Digital'),
    userId: uuid('00000000-0000-7000-8000-000000000001'),
    organizationCountries: (countries) => countries.create([{ countryId: countryId('PT') }]),
  },
  {
    // No applications: can be deleted without taking any with it
    id: uuid('00000000-0000-7000-8000-000000003009'),
    name: sized<200>('Pied Piper'),
    websiteUrl: 'https://piedpiper.example.com',
    notes: 'Saved for later, nothing sent yet.',
    userId: uuid('00000000-0000-7000-8000-000000000001'),
    organizationCountries: (countries) => countries.create([{ countryId: countryId('US') }]),
    contacts: (contacts) =>
      contacts.create([{ name: sized<150>('Richard Hendricks'), role: sized<100>('Founder') }]),
  },
  {
    // Very long name, to check truncation in the lists
    id: uuid('00000000-0000-7000-8000-000000003010'),
    name: sized<200>(
      'The International Association for Advanced Distributed Systems Research and Applied Engineering GmbH & Co. KG'
    ),
    userId: uuid('00000000-0000-7000-8000-000000000001'),
    organizationCountries: (countries) => countries.create([{ countryId: countryId('DE') }]),
  },

  // Many more of these than the pagination needs, each with its own country and, in
  // job-applications.ts, an application
  ...(
    [
      ['Acme Analytics', 'DE'],
      ['Blue Harbor Software', 'GB'],
      ['Cobalt Payments', 'NL'],
      ['Delta Mobility', 'DE'],
      ['Echo Streaming', 'FR'],
      ['Foxglove Games', 'SE'],
      ['Granite Insurance Tech', 'CH'],
      ['Helix Genomics', 'DK'],
      ['Ironclad Security', 'US'],
      ['Juniper Retail Cloud', 'IE'],
      ['Kestrel Aerospace', 'IT'],
      ['Lumen Energy', 'ES'],
      ['Meridian Travel', 'PT'],
      ['Nimbus Weather', 'NO'],
      ['Orbit Fintech', 'AT'],
      ['Paragon Media', 'PL'],
      ['Quartz Banking', 'LU'],
      ['Redwood Automotive', 'DE'],
      ['Sable Telecom', 'FI'],
      ['Tandem Education', 'BE'],
      ['Ultraviolet Design', 'CZ'],
      ['Vertex Manufacturing', 'DE'],
      ['Willow Health', 'GB'],
      ['Xenon Semiconductors', 'NL'],
    ] as const
  ).map(
    ([name, country], index): NewOrganization => ({
      id: uuid(`00000000-0000-7000-8000-0000000031${String(index + 1).padStart(2, '0')}`),
      name: sized<200>(name),
      userId: uuid('00000000-0000-7000-8000-000000000001'),
      organizationCountries: (countries) => countries.create([{ countryId: countryId(country) }]),
      contacts: (contacts) =>
        contacts.create([
          {
            name: sized<150>(`Recruiter at ${name}`),
            email: sized<255>(`jobs@${name.toLowerCase().replace(/\W+/g, '')}.example.com`),
          },
        ]),
    })
  ),
];

export async function seedSampleOrganizations(db: Database) {
  for (const organization of organizations(await getCountryIds(db))) {
    await db.Organization.create(organization);
  }
}

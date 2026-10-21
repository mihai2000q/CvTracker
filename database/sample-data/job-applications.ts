import { Temporal } from 'temporal-polyfill';
import type { Database } from '../db.ts';
import { sized, uuid } from '../field-values.ts';
import { ApplicationStatus, InterviewOutcome, RoundType } from '../enums.ts';
import { getCountryIds } from './countries.ts';

type NewJobApplication = Parameters<Database['JobApplication']['create']>[0];


// Everything is relative to "now", so upcoming interviews stay upcoming and old
// applications stay old whenever the seed is run
const daysAgo = (days: number) => Temporal.Now.plainDateISO().subtract({ days });

// A moment `daysFromNow` days away (negative: in the past)
function at(daysFromNow: number, hourUtc: number) {
  const date = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
  date.setUTCHours(hourUtc, 0, 0, 0);
  return date.toISOString();
}

// Countries are the only ids not known up front, hence the function
const jobApplications = (countryId: (isoCode: string) => ReturnType<typeof uuid>): NewJobApplication[] => [
  // --- The whole pipeline, one per status ---
  {
    title: sized<200>('Senior Full-Stack Engineer'),
    organizationId: uuid('00000000-0000-7000-8000-000000003001'),
    countryId: countryId('DE'),
    currentStatus: ApplicationStatus.members.Applied,
    cvDocumentId: uuid('00000000-0000-7000-8000-000000002001'),
    coverLetterDocumentId: uuid('00000000-0000-7000-8000-000000002007'),
    source: sized<100>('LinkedIn'),
    postingUrl: 'https://www.linkedin.com/jobs/view/1000000001',
    notes: 'Referred by a former colleague. Salary range listed: 75-90k.',
    appliedAt: daysAgo(2),
    userId: uuid('00000000-0000-7000-8000-000000000001'),
    skills: (skills) =>
      skills.create([
        { skillId: uuid('00000000-0000-7000-8000-000000001001') },
        { skillId: uuid('00000000-0000-7000-8000-000000001002') },
        { skillId: uuid('00000000-0000-7000-8000-000000001003') },
        { skillId: uuid('00000000-0000-7000-8000-000000001004') },
      ]),
    statusHistory: (history) => history.create([{ status: ApplicationStatus.members.Applied, changedAt: at(-2, 9) }]),
  },
  {
    title: sized<200>('Frontend Engineer'),
    organizationId: uuid('00000000-0000-7000-8000-000000003002'),
    countryId: countryId('DE'),
    currentStatus: ApplicationStatus.members.Screening,
    cvDocumentId: uuid('00000000-0000-7000-8000-000000002002'),
    source: sized<100>('Indeed'),
    postingUrl: 'https://de.indeed.com/viewjob?jk=000000000002',
    appliedAt: daysAgo(9),
    userId: uuid('00000000-0000-7000-8000-000000000001'),
    skills: (skills) =>
      skills.create([
        { skillId: uuid('00000000-0000-7000-8000-000000001001') },
        { skillId: uuid('00000000-0000-7000-8000-000000001002') },
        { skillId: uuid('00000000-0000-7000-8000-000000001005') },
      ]),
    statusHistory: (history) =>
      history.create([
        { status: ApplicationStatus.members.Applied, changedAt: at(-9, 9) },
        { status: ApplicationStatus.members.Screening, changedAt: at(-6, 9), note: 'HR replied and asked for availability.' },
      ]),
    interviewRounds: (rounds) =>
      rounds.create([
        {
          // Upcoming, with a contact
          roundType: RoundType.members.IntroCall,
          scheduledAt: at(1, 9),
          outcome: InterviewOutcome.members.Scheduled,
          notes: 'Prepare the salary expectation.',
          contacts: (contacts) =>
            contacts.create([{ contactId: uuid('00000000-0000-7000-8000-000000004004') }]),
        },
      ]),
  },
  {
    // Several rounds: two passed, then two upcoming (the next interview is the Coding one)
    title: sized<200>('Staff Software Engineer, Platform'),
    organizationId: uuid('00000000-0000-7000-8000-000000003004'),
    countryId: countryId('GB'),
    currentStatus: ApplicationStatus.members.Interview,
    cvDocumentId: uuid('00000000-0000-7000-8000-000000002001'),
    coverLetterDocumentId: uuid('00000000-0000-7000-8000-000000002006'),
    source: sized<100>('Referral'),
    postingUrl: 'https://umbrella-health.example.com/careers/staff-platform',
    notes: 'Four rounds in total, the last one is on site.',
    appliedAt: daysAgo(30),
    userId: uuid('00000000-0000-7000-8000-000000000001'),
    skills: (skills) =>
      skills.create([
        { skillId: uuid('00000000-0000-7000-8000-000000001001') },
        { skillId: uuid('00000000-0000-7000-8000-000000001009') },
        { skillId: uuid('00000000-0000-7000-8000-000000001010') },
        { skillId: uuid('00000000-0000-7000-8000-000000001004') },
      ]),
    statusHistory: (history) =>
      history.create([
        { status: ApplicationStatus.members.Applied, changedAt: at(-30, 9) },
        { status: ApplicationStatus.members.Screening, changedAt: at(-24, 9) },
        { status: ApplicationStatus.members.Interview, changedAt: at(-18, 9), note: 'Moved to the technical rounds.' },
      ]),
    interviewRounds: (rounds) =>
      rounds.create([
        {
          roundType: RoundType.members.IntroCall,
          scheduledAt: at(-17, 13),
          outcome: InterviewOutcome.members.Passed,
          contacts: (contacts) =>
            contacts.create([{ contactId: uuid('00000000-0000-7000-8000-000000004006') }]),
        },
        {
          roundType: RoundType.members.Technical,
          scheduledAt: at(-8, 10),
          outcome: InterviewOutcome.members.Passed,
          notes: 'System design: rate limiter and a notification service.',
          contacts: (contacts) =>
            contacts.create([
              { contactId: uuid('00000000-0000-7000-8000-000000004007') },
              { contactId: uuid('00000000-0000-7000-8000-000000004006') },
            ]),
        },
        {
          roundType: RoundType.members.Coding,
          scheduledAt: at(4, 14),
          outcome: InterviewOutcome.members.Scheduled,
          contacts: (contacts) =>
            contacts.create([{ contactId: uuid('00000000-0000-7000-8000-000000004007') }]),
        },
        // Far away, and without anybody assigned yet
        { roundType: RoundType.members.Behavioral, scheduledAt: at(12, 15), outcome: InterviewOutcome.members.Scheduled },
      ]),
  },
  {
    title: sized<200>('Software Engineer, Robotics Tooling'),
    organizationId: uuid('00000000-0000-7000-8000-000000003005'),
    countryId: countryId('US'),
    currentStatus: ApplicationStatus.members.Offer,
    cvDocumentId: uuid('00000000-0000-7000-8000-000000002003'),
    coverLetterDocumentId: uuid('00000000-0000-7000-8000-000000002006'),
    source: sized<100>('Company site'),
    postingUrl: 'https://stark-robotics.example.com/jobs/tooling',
    notes: 'Offer received: decision due within two weeks.',
    appliedAt: daysAgo(45),
    userId: uuid('00000000-0000-7000-8000-000000000001'),
    skills: (skills) =>
      skills.create([
        { skillId: uuid('00000000-0000-7000-8000-000000001006') },
        { skillId: uuid('00000000-0000-7000-8000-000000001007') },
        { skillId: uuid('00000000-0000-7000-8000-000000001009') },
      ]),
    statusHistory: (history) =>
      history.create([
        { status: ApplicationStatus.members.Applied, changedAt: at(-45, 9) },
        { status: ApplicationStatus.members.Screening, changedAt: at(-40, 9) },
        { status: ApplicationStatus.members.Interview, changedAt: at(-33, 9) },
        { status: ApplicationStatus.members.Offer, changedAt: at(-3, 9), note: 'Verbal offer, written one to follow.' },
      ]),
    interviewRounds: (rounds) =>
      rounds.create([
        {
          roundType: RoundType.members.IntroCall,
          scheduledAt: at(-32, 13),
          outcome: InterviewOutcome.members.Passed,
          contacts: (contacts) =>
            contacts.create([{ contactId: uuid('00000000-0000-7000-8000-000000004008') }]),
        },
        {
          roundType: RoundType.members.TakeHome,
          scheduledAt: at(-26, 13),
          outcome: InterviewOutcome.members.Passed,
          notes: 'Small CLI tool, 4 hours.',
        },
        {
          roundType: RoundType.members.Technical,
          scheduledAt: at(-10, 13),
          outcome: InterviewOutcome.members.Passed,
          contacts: (contacts) =>
            contacts.create([{ contactId: uuid('00000000-0000-7000-8000-000000004008') }]),
        },
      ]),
  },
  {
    title: sized<200>('Backend Engineer'),
    organizationId: uuid('00000000-0000-7000-8000-000000003003'),
    countryId: countryId('NL'),
    currentStatus: ApplicationStatus.members.Rejected,
    cvDocumentId: uuid('00000000-0000-7000-8000-000000002003'),
    source: sized<100>('Stepstone'),
    postingUrl: 'https://www.stepstone.de/jobs--backend-engineer-000003',
    appliedAt: daysAgo(60),
    userId: uuid('00000000-0000-7000-8000-000000000001'),
    skills: (skills) =>
      skills.create([
        { skillId: uuid('00000000-0000-7000-8000-000000001008') },
        { skillId: uuid('00000000-0000-7000-8000-000000001004') },
      ]),
    statusHistory: (history) =>
      history.create([
        { status: ApplicationStatus.members.Applied, changedAt: at(-60, 9) },
        { status: ApplicationStatus.members.Screening, changedAt: at(-52, 9) },
        { status: ApplicationStatus.members.Interview, changedAt: at(-46, 9) },
        {
          status: ApplicationStatus.members.Rejected,
          changedAt: at(-35, 9),
          note: 'They went with someone with more Java experience.',
        },
      ]),
    interviewRounds: (rounds) =>
      rounds.create([
        // Passed, failed and cancelled
        {
          roundType: RoundType.members.IntroCall,
          scheduledAt: at(-45, 13),
          outcome: InterviewOutcome.members.Passed,
          contacts: (contacts) =>
            contacts.create([{ contactId: uuid('00000000-0000-7000-8000-000000004005') }]),
        },
        {
          roundType: RoundType.members.Coding,
          scheduledAt: at(-37, 13),
          outcome: InterviewOutcome.members.Failed,
          notes: 'Ran out of time on the second exercise.',
        },
        { roundType: RoundType.members.Behavioral, scheduledAt: at(-36, 13), outcome: InterviewOutcome.members.Cancelled },
      ]),
  },
  {
    title: sized<200>('Site Reliability Engineer'),
    organizationId: uuid('00000000-0000-7000-8000-000000003007'),
    countryId: countryId('SE'),
    currentStatus: ApplicationStatus.members.Withdrawn,
    cvDocumentId: uuid('00000000-0000-7000-8000-000000002003'),
    coverLetterDocumentId: uuid('00000000-0000-7000-8000-000000002006'),
    source: sized<100>('LinkedIn'),
    notes: 'Withdrew after accepting the pace of the other process.',
    appliedAt: daysAgo(50),
    userId: uuid('00000000-0000-7000-8000-000000000001'),
    skills: (skills) =>
      skills.create([
        { skillId: uuid('00000000-0000-7000-8000-000000001009') },
        { skillId: uuid('00000000-0000-7000-8000-000000001010') },
        { skillId: uuid('00000000-0000-7000-8000-000000001007') },
      ]),
    statusHistory: (history) =>
      history.create([
        { status: ApplicationStatus.members.Applied, changedAt: at(-50, 9) },
        { status: ApplicationStatus.members.Screening, changedAt: at(-44, 9) },
        {
          status: ApplicationStatus.members.Withdrawn,
          changedAt: at(-38, 9),
          note: 'Relocation to Sweden is not an option right now.',
        },
      ]),
  },
  {
    // Shown as "Ghosted"
    title: sized<200>('Data Engineer'),
    organizationId: uuid('00000000-0000-7000-8000-000000003006'),
    countryId: countryId('PL'),
    currentStatus: ApplicationStatus.members.NoResponse,
    cvDocumentId: uuid('00000000-0000-7000-8000-000000002003'),
    source: sized<100>('Indeed'),
    appliedAt: daysAgo(75),
    userId: uuid('00000000-0000-7000-8000-000000000001'),
    skills: (skills) =>
      skills.create([
        { skillId: uuid('00000000-0000-7000-8000-000000001006') },
        { skillId: uuid('00000000-0000-7000-8000-000000001004') },
      ]),
    statusHistory: (history) =>
      history.create([
        { status: ApplicationStatus.members.Applied, changedAt: at(-75, 9) },
        { status: ApplicationStatus.members.NoResponse, changedAt: at(-15, 9), note: 'Nothing for two months.' },
      ]),
  },

  // --- A source that is none of the known ones, and none at all ---
  {
    title: sized<200>('Platform Engineer'),
    organizationId: uuid('00000000-0000-7000-8000-000000003008'),
    countryId: countryId('PT'),
    currentStatus: ApplicationStatus.members.Applied,
    cvDocumentId: uuid('00000000-0000-7000-8000-000000002001'),
    source: sized<100>('Xing'),
    appliedAt: daysAgo(5),
    userId: uuid('00000000-0000-7000-8000-000000000001'),
    statusHistory: (history) => history.create([{ status: ApplicationStatus.members.Applied, changedAt: at(-5, 9) }]),
  },
  {
    title: sized<200>('Web Developer'),
    organizationId: uuid('00000000-0000-7000-8000-000000003006'),
    countryId: countryId('CZ'),
    currentStatus: ApplicationStatus.members.Applied,
    cvDocumentId: uuid('00000000-0000-7000-8000-000000002002'),
    appliedAt: daysAgo(14),
    userId: uuid('00000000-0000-7000-8000-000000000001'),
    statusHistory: (history) => history.create([{ status: ApplicationStatus.members.Applied, changedAt: at(-14, 9) }]),
  },

  // --- The same organization again, in other countries ---
  {
    // Interview status, but every round is in the past and resolved
    title: sized<200>('Engineering Manager'),
    organizationId: uuid('00000000-0000-7000-8000-000000003001'),
    countryId: countryId('AT'),
    currentStatus: ApplicationStatus.members.Interview,
    cvDocumentId: uuid('00000000-0000-7000-8000-000000002001'),
    coverLetterDocumentId: uuid('00000000-0000-7000-8000-000000002007'),
    source: sized<100>('Referral'),
    appliedAt: daysAgo(28),
    userId: uuid('00000000-0000-7000-8000-000000000001'),
    skills: (skills) =>
      skills.create([
        { skillId: uuid('00000000-0000-7000-8000-000000001001') },
        { skillId: uuid('00000000-0000-7000-8000-000000001011') },
      ]),
    statusHistory: (history) =>
      history.create([
        { status: ApplicationStatus.members.Applied, changedAt: at(-28, 9) },
        { status: ApplicationStatus.members.Screening, changedAt: at(-22, 9) },
        { status: ApplicationStatus.members.Interview, changedAt: at(-16, 9) },
      ]),
    interviewRounds: (rounds) =>
      rounds.create([
        {
          roundType: RoundType.members.IntroCall,
          scheduledAt: at(-15, 13),
          outcome: InterviewOutcome.members.Passed,
          contacts: (contacts) =>
            contacts.create([{ contactId: uuid('00000000-0000-7000-8000-000000004001') }]),
        },
        {
          roundType: RoundType.members.Behavioral,
          scheduledAt: at(-6, 13),
          outcome: InterviewOutcome.members.Passed,
          contacts: (contacts) =>
            contacts.create([
              { contactId: uuid('00000000-0000-7000-8000-000000004002') },
              { contactId: uuid('00000000-0000-7000-8000-000000004003') },
            ]),
        },
      ]),
  },
  {
    // Applied today
    title: sized<200>('Senior Full-Stack Engineer (Platform team)'),
    organizationId: uuid('00000000-0000-7000-8000-000000003001'),
    countryId: countryId('CH'),
    currentStatus: ApplicationStatus.members.Applied,
    cvDocumentId: uuid('00000000-0000-7000-8000-000000002001'),
    coverLetterDocumentId: uuid('00000000-0000-7000-8000-000000002007'),
    source: sized<100>('Company site'),
    postingUrl: 'https://northwind.example.com/careers/platform',
    appliedAt: daysAgo(0),
    userId: uuid('00000000-0000-7000-8000-000000000001'),
    skills: (skills) =>
      skills.create([
        { skillId: uuid('00000000-0000-7000-8000-000000001001') },
        { skillId: uuid('00000000-0000-7000-8000-000000001003') },
      ]),
    statusHistory: (history) => history.create([{ status: ApplicationStatus.members.Applied, changedAt: at(0, 9) }]),
  },

  // --- Odd data ---
  {
    // Long title and long notes
    title: sized<200>(
      'Principal Staff Distinguished Senior Lead Software Engineer for Distributed Real-Time Event Processing and Observability Platforms (m/f/d)'
    ),
    organizationId: uuid('00000000-0000-7000-8000-000000003010'),
    countryId: countryId('DE'),
    currentStatus: ApplicationStatus.members.Applied,
    cvDocumentId: uuid('00000000-0000-7000-8000-000000002001'),
    source: sized<100>('Company site'),
    notes:
      'A very long note, to see how the application detail copes with it. '.repeat(12) +
      '\n\nSecond paragraph, after a blank line.',
    appliedAt: daysAgo(1),
    userId: uuid('00000000-0000-7000-8000-000000000001'),
    statusHistory: (history) => history.create([{ status: ApplicationStatus.members.Applied, changedAt: at(-1, 9) }]),
  },
  {
    // The Word document, and the cover letter whose file is gone
    title: sized<200>('Junior Developer'),
    organizationId: uuid('00000000-0000-7000-8000-000000003008'),
    countryId: countryId('PT'),
    currentStatus: ApplicationStatus.members.Rejected,
    cvDocumentId: uuid('00000000-0000-7000-8000-000000002004'),
    coverLetterDocumentId: uuid('00000000-0000-7000-8000-000000002008'),
    source: sized<100>('Indeed'),
    appliedAt: daysAgo(120),
    userId: uuid('00000000-0000-7000-8000-000000000001'),
    statusHistory: (history) =>
      history.create([
        { status: ApplicationStatus.members.Applied, changedAt: at(-120, 9) },
        { status: ApplicationStatus.members.Rejected, changedAt: at(-110, 9) },
      ]),
  },
  {
    // Over a year old, to check dates and sorting far back
    title: sized<200>('IT Support Engineer'),
    organizationId: uuid('00000000-0000-7000-8000-000000003002'),
    countryId: countryId('DE'),
    currentStatus: ApplicationStatus.members.NoResponse,
    cvDocumentId: uuid('00000000-0000-7000-8000-000000002004'),
    source: sized<100>('Stepstone'),
    appliedAt: daysAgo(400),
    userId: uuid('00000000-0000-7000-8000-000000000001'),
    statusHistory: (history) =>
      history.create([
        { status: ApplicationStatus.members.Applied, changedAt: at(-400, 9) },
        { status: ApplicationStatus.members.NoResponse, changedAt: at(-340, 9) },
      ]),
  },

  // One per filler organization in organizations.ts (same order), going round every status,
  // source and title
  ...[
    'DE', 'GB', 'NL', 'DE', 'FR', 'SE', 'CH', 'DK', 'US', 'IE', 'IT', 'ES',
    'PT', 'NO', 'AT', 'PL', 'LU', 'DE', 'FI', 'BE', 'CZ', 'DE', 'GB', 'NL',
  ]
    .map((country, index): NewJobApplication => {
      const status = [ApplicationStatus.members.Applied, ApplicationStatus.members.Screening, ApplicationStatus.members.Interview, ApplicationStatus.members.Offer, ApplicationStatus.members.Rejected, ApplicationStatus.members.Withdrawn, ApplicationStatus.members.NoResponse][
        index % 7
      ];
      const source = ['LinkedIn', 'Indeed', 'Stepstone', 'Company site', 'Referral', undefined][
        index % 6
      ];
      const appliedDaysAgo = 3 + index * 4;
      return {
        title: sized<200>(
          [
            'Software Engineer',
            'Backend Developer',
            'Frontend Developer',
            'DevOps Engineer',
            'QA Automation Engineer',
            'Mobile Developer',
          ][index % 6]
        ),
        organizationId: uuid(`00000000-0000-7000-8000-0000000031${String(index + 1).padStart(2, '0')}`),
        countryId: countryId(country),
        currentStatus: status,
        cvDocumentId: uuid(
          index % 2 === 0
            ? '00000000-0000-7000-8000-000000002001'
            : '00000000-0000-7000-8000-000000002002'
        ),
        coverLetterDocumentId:
          index % 3 === 0 ? uuid('00000000-0000-7000-8000-000000002006') : undefined,
        source: source ? sized<100>(source) : undefined,
        appliedAt: daysAgo(appliedDaysAgo),
        userId: uuid('00000000-0000-7000-8000-000000000001'),
        statusHistory: (history) =>
          history.create([
            { status: ApplicationStatus.members.Applied, changedAt: at(-appliedDaysAgo, 9) },
            ...(status === ApplicationStatus.members.Applied
              ? []
              : [{ status, changedAt: at(-Math.max(appliedDaysAgo - 5, 0), 9) }]),
          ]),
      };
    }),
];

export async function seedSampleJobApplications(db: Database) {
  for (const jobApplication of jobApplications(await getCountryIds(db))) {
    await db.JobApplication.create(jobApplication);
  }
}

import 'server-only';
import ExcelJS from 'exceljs';
import { db } from '@database/db.ts';
import { uuid } from '@database/field-values.ts';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { toCsv } from '@/lib/csv.ts';
import { getTimeZone } from '@/lib/get-time-zone.ts';
import { todayIn } from '@/lib/time-zone.ts';
import { JOB_APPLICATION_STATUSES } from '@/features/job-applications/constants/job-application-statuses.ts';
import { INTERVIEW_OUTCOME_LABELS } from '@/features/job-applications/constants/interview-outcomes.ts';
import { isUpcoming } from '@/features/job-applications/services/upcoming.ts';
import { InterviewOutcome } from '@/features/job-applications/types/enums/interview-outcome.ts';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';

export interface ExportedFile {
  filename: string;
  contentType: string;
  content: string | Uint8Array;
}

type Cell = string | number | null | undefined;

const APPLICATION_HEADERS = [
  'Title',
  'Organization',
  'Organization countries',
  'Organization last activity',
  'Job country',
  'Source',
  'Posting URL',
  'Status',
  'Applied at',
  'CV',
  'CV filename',
  'Cover letter',
  'Cover letter filename',
  'Interview rounds',
  'Next interview',
  'Last interview outcome',
  'Notes',
  'Created at',
  'Updated at',
];

// The rows of every application of the user, uncached so a file is never stale
async function getExportData() {
  const userId = getUserId(await verifySession());

  const models = await db.JobApplication.where({ userId: uuid(userId) })
    .include('organization', (o) =>
      o.include('organizationCountries', (oc) =>
        oc.include('country').orderBy((c) => c.country.name.asc())
      )
    )
    .include('country')
    .include('cvDocument')
    .include('coverLetterDocument')
    .include('interviewRounds', (r) => r.orderBy((r) => r.scheduledAt.asc()))
    .orderBy((j) => j.appliedAt.desc())
    .all();

  // All the user's applications are here, so the newest update per organization is exact, as
  // the organization cards show it
  const lastActivityByOrganization = new Map<string, string>();
  for (const { organizationId, updatedAt } of models) {
    const latest = lastActivityByOrganization.get(organizationId);
    if (!latest || updatedAt > latest) lastActivityByOrganization.set(organizationId, updatedAt);
  }

  const now = new Date();
  const applicationRows: Cell[][] = models.map((model) => {
    // The rounds come ordered by date, so the first scheduled one still ahead is the next
    const nextRound = model.interviewRounds.find((round) => isUpcoming(round, now));
    const lastRound = model.interviewRounds.at(-1);

    return [
      model.title,
      model.organization!.name,
      model.organization!.organizationCountries.map(({ country }) => country.name).join('; '),
      lastActivityByOrganization.get(model.organizationId),
      model.country.name,
      model.source,
      model.postingUrl,
      JOB_APPLICATION_STATUSES[model.currentStatus as JobApplicationStatus],
      model.appliedAt.toString(),
      model.cvDocument.name,
      model.cvDocument.originalFilename,
      model.coverLetterDocument?.name,
      model.coverLetterDocument?.originalFilename,
      model.interviewRounds.length,
      nextRound?.scheduledAt,
      lastRound && INTERVIEW_OUTCOME_LABELS[lastRound.outcome as InterviewOutcome],
      model.notes,
      model.createdAt,
      model.updatedAt,
    ];
  });

  // The day in the user's time zone, not the server's
  return { applicationRows, filenameDate: todayIn(await getTimeZone()) };
}

export async function exportJobApplicationsCsv(): Promise<ExportedFile> {
  const { applicationRows, filenameDate } = await getExportData();

  return {
    filename: `job-applications-${filenameDate}.csv`,
    contentType: 'text/csv; charset=utf-8',
    content: toCsv(APPLICATION_HEADERS, applicationRows),
  };
}

export async function exportJobApplicationsExcel(): Promise<ExportedFile> {
  const { applicationRows, filenameDate } = await getExportData();

  const workbook = new ExcelJS.Workbook();
  addSheet(workbook, 'Job applications', APPLICATION_HEADERS, applicationRows);

  return {
    filename: `job-applications-${filenameDate}.xlsx`,
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    content: new Uint8Array(await workbook.xlsx.writeBuffer()),
  };
}

// Text goes in as plain strings, never as formulas, so a note like `=1+1` stays text
function addSheet(
  workbook: ExcelJS.Workbook,
  name: string,
  headers: readonly string[],
  rows: readonly Cell[][]
) {
  const sheet = workbook.addWorksheet(name, { views: [{ state: 'frozen', ySplit: 1 }] });
  sheet.addRow(headers).font = { bold: true };
  rows.forEach((row) => sheet.addRow(row.map((cell) => cell ?? null)));

  sheet.columns.forEach((column, index) => {
    const longest = Math.max(
      headers[index].length,
      ...rows.map((row) => String(row[index] ?? '').length)
    );
    column.width = Math.min(Math.max(longest + 2, 10), 60);
  });
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: headers.length } };
}

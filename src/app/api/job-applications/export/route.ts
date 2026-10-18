import {
  exportJobApplicationsCsv,
  exportJobApplicationsExcel,
} from '@/features/job-applications/queries/export-job-applications.ts';

export async function GET(request: Request) {
  const format = new URL(request.url).searchParams.get('format');
  if (format !== 'csv' && format !== 'xlsx') {
    return Response.json({ error: 'Unknown export format' }, { status: 400 });
  }

  const file =
    format === 'csv' ? await exportJobApplicationsCsv() : await exportJobApplicationsExcel();

  return new Response(file.content as BodyInit, {
    headers: {
      'Content-Type': file.contentType,
      'Content-Disposition': `attachment; filename="${file.filename}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

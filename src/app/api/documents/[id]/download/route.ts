import { downloadDocument } from '@/features/documents/queries/download-document.ts';

export async function GET(
  _request: Request,
  { params }: RouteContext<'/api/documents/[id]/download'>
) {
  const { id } = await params;
  const document = await downloadDocument(id);
  if (!document) {
    return new Response(null, { status: 404 });
  }

  return new Response(document.stream, {
    headers: {
      'Content-Type': document.contentType ?? 'application/octet-stream',
      'Content-Length': String(document.size),
      // The plain name is a fallback for clients that ignore the encoded one
      'Content-Disposition': `attachment; filename="${document.filename.replace(/[^\x20-\x7e]|"/g, '_')}"; filename*=UTF-8''${encodeURIComponent(document.filename)}`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

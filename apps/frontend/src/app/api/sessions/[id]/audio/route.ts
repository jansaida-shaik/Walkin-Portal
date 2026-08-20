import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const arrayBuffer = await req.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      return NextResponse.json({ error: 'No audio data uploaded.' }, { status: 400 });
    }

    const session = await prisma.counselingSession.findUnique({ where: { id } });
    if (!session) return NextResponse.json({ error: 'Session not found.' }, { status: 404 });

    // On Vercel, we can't write to disk. Store as a placeholder URL.
    // In production, this should upload to S3/Cloudinary/etc.
    const audioUrl = `/uploads/audio/${id}.webm`;
    const updatedSession = await prisma.counselingSession.update({ where: { id }, data: { audioUrl } });

    return NextResponse.json({ success: true, audioUrl, session: updatedSession });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to upload audio.' }, { status: 500 });
  }
}

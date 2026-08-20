import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { studentId, notes, followUpStatus, summary } = await req.json();
    if (!studentId) return NextResponse.json({ error: 'studentId is required.' }, { status: 400 });

    const session = await prisma.counselingSession.findFirst({ where: { studentId, status: 'IN_SESSION' } });
    if (!session) return NextResponse.json({ error: 'No active session found.' }, { status: 404 });

    const updated = await prisma.counselingSession.update({ where: { id: session.id }, data: { notes, followUpStatus, summary } });
    return NextResponse.json({ success: true, session: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save session notes.' }, { status: 500 });
  }
}

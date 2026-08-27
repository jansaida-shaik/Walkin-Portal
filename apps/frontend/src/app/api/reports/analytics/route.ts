import { NextResponse } from 'next/server';
import { getSession } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';
import { branches } from '../../../../lib/constants';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch 100% LIVE data from PostgreSQL
    const [convertedLeads, students, counselors] = await Promise.all([
      prisma.convertedLead.findMany({
        orderBy: { enrollmentDate: 'desc' },
      }),
      prisma.student.findMany({
        where: { deletedAt: null },
        include: {
          sessions: true,
          queueEntry: true,
        },
        orderBy: { walkinDate: 'desc' },
      }),
      prisma.counselorProfile.findMany({
        orderBy: { name: 'asc' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        convertedLeads,
        students,
        counselors,
        branches,
      },
    });
  } catch (error: any) {
    console.error('[API] /api/reports/analytics failed:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch live analytics data' },
      { status: 500 }
    );
  }
}

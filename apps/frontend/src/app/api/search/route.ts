import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { validateSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await validateSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') || '').trim();

    if (!query) {
      return NextResponse.json({ students: [], counselors: [] });
    }

    const cleanQuery = query.toLowerCase();
    const phoneClean = query.replace(/\D/g, '');

    // 1. Search Live Students / Walk-ins
    const students = await prisma.student.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { course: { contains: query, mode: 'insensitive' } },
          { id: { contains: query, mode: 'insensitive' } },
          ...(phoneClean.length >= 3 ? [{ phone: { contains: phoneClean } }] : []),
        ],
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        course: true,
        status: true,
        branchName: true,
        walkinDate: true,
      },
      take: 8,
      orderBy: { walkinDate: 'desc' },
    });

    // 2. Search Live Counselors / Staff
    const counselors = await prisma.counselorProfile.findMany({
      where: {
        OR: [
          { user: { name: { contains: query, mode: 'insensitive' } } },
          { user: { email: { contains: query, mode: 'insensitive' } } },
          { user: { roleId: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            roleId: true,
            branchId: true,
          },
        },
      },
      take: 5,
    });

    const formattedCounselors = counselors.map((c) => ({
      id: c.id,
      name: c.user?.name || 'Counselor',
      email: c.user?.email || '',
      roleId: c.user?.roleId || 'role_counselor',
      status: c.status,
      branchId: c.user?.branchId || '',
    }));

    return NextResponse.json({
      students,
      counselors: formattedCounselors,
    });
  } catch (error: any) {
    console.error('API /api/search error:', error);
    return NextResponse.json({ error: error.message || 'Search query failed' }, { status: 500 });
  }
}

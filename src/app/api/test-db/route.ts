import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

export async function GET(req: NextRequest) {
  try {
    // 1. Verify Prisma connection
    const userCount = await prisma.user.count();
    
    // 2. Fetch list of usernames and their roles (excluding passwords for security)
    const users = await prisma.user.findMany({
      select: {
        username: true,
        name: true,
        roleId: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      status: 'success',
      message: 'Database is reachable',
      database_url_configured: !!process.env.DATABASE_URL,
      user_count: userCount,
      users: users
    });
  } catch (err: any) {
    console.error('Test DB error:', err);
    return NextResponse.json({
      status: 'error',
      message: err.message || 'Failed to connect to database',
      stack: err.stack,
      database_url_configured: !!process.env.DATABASE_URL
    }, { status: 500 });
  }
}

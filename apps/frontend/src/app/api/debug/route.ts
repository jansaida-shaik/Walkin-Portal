import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const checks: any = {};

  // Check JWT_SECRET
  checks.jwt_secret_set = !!process.env.JWT_SECRET;
  checks.database_url_set = !!process.env.DATABASE_URL;
  checks.node_env = process.env.NODE_ENV;

  // Check DB connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.db_connected = true;
  } catch (e: any) {
    checks.db_connected = false;
    checks.db_error = e.message;
  }

  // Check student count
  try {
    const count = await prisma.student.count();
    checks.student_count = count;
  } catch (e: any) {
    checks.student_count_error = e.message;
  }

  // Check counselor count
  try {
    const count = await prisma.counselorProfile.count();
    checks.counselor_count = count;
  } catch (e: any) {
    checks.counselor_count_error = e.message;
  }

  // Check cookie
  const cookie = req.cookies.get('token');
  checks.cookie_present = !!cookie;

  return NextResponse.json(checks);
}

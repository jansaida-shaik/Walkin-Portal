import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getBranchName, getDepartment, getLocation, getRole } from '@/lib/constants';

export async function GET() {
  try {
    const list = await prisma.counselorProfile.findMany({ include: { user: true }, orderBy: { id: 'asc' } });
    return NextResponse.json(list.map(c => ({
      id: c.id, name: c.user.name,
      roleId: c.user.roleId, roleName: getRole(c.user.roleId),
      departmentId: c.user.departmentId, departmentName: getDepartment(c.user.departmentId),
      branchId: c.user.branchId, branchName: getBranchName(c.user.branchId),
      location: c.user.locationId, availability: c.availability,
      status: c.status, assignedStudentId: c.assignedStudentId,
    })));
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch counselors' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, departmentId, branchId, location } = await req.json();
    if (!name || !departmentId || !branchId || !location) {
      return NextResponse.json({ error: 'Name, departmentId, branchId, and location are required.' }, { status: 400 });
    }
    const list = await prisma.user.findMany({ where: { roleId: 'role_counselor' } });
    const maxVal = list.reduce((max: number, u: any) => {
      const num = parseInt(u.id.replace('c', ''));
      return isNaN(num) ? max : Math.max(max, num);
    }, 9);
    const cId = `c${maxVal + 1}`;
    const username = `counselor_${cId}`;
    const email = `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@office.com`;

    const result = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({ data: { id: cId, username, password: `${cId}123`, name, email, roleId: 'role_counselor', branchId, locationId: location, departmentId } });
      const profile = await tx.counselorProfile.create({ data: { id: cId, availability: ['09:00', '12:00', '15:00'], status: 'Available' } });
      return { user, profile };
    });

    return NextResponse.json({ success: true, counselor: {
      id: result.user.id, name: result.user.name,
      roleId: result.user.roleId, roleName: getRole(result.user.roleId),
      departmentId: result.user.departmentId, departmentName: getDepartment(result.user.departmentId),
      branchId: result.user.branchId, branchName: getBranchName(result.user.branchId),
      location: result.user.locationId, availability: result.profile.availability, status: result.profile.status,
    } }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to register counselor.' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getBranchName, getDepartment, getRole } from '@/lib/constants';

export async function GET() {
  try {
    const list = await prisma.counselorProfile.findMany({
      include: { user: true },
      orderBy: { id: 'asc' }
    });
    return NextResponse.json(list.map(c => ({
      id: c.id,
      name: c.name || c.user?.name || 'Counselor',
      roleId: c.roleId || c.user?.roleId || 'role_counselor',
      roleName: getRole(c.roleId || c.user?.roleId || 'role_counselor'),
      departmentId: c.departmentId || c.user?.departmentId || 'dept_sales',
      departmentName: c.departmentName || getDepartment(c.departmentId || 'dept_sales'),
      branchId: c.branchId || c.user?.branchId || 'branch_jntu1',
      branchName: c.branchName || getBranchName(c.branchId || c.user?.branchId || 'branch_jntu1'),
      location: c.location || c.user?.locationId || 'Hyderabad',
      availability: c.availability,
      status: c.status,
      assignedStudentId: c.assignedStudentId,
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
    const count = await prisma.counselorProfile.count();
    const cId = `c${count + 1}`;
    const email = `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@office.com`;
    const branchName = getBranchName(branchId);
    const departmentName = getDepartment(departmentId);

    const profile = await prisma.counselorProfile.create({
      data: {
        id: cId,
        name,
        email,
        departmentId,
        departmentName,
        branchId,
        branchName,
        location,
        availability: ['09:00 AM - 06:00 PM'],
        status: 'Available'
      }
    });

    return NextResponse.json({
      success: true,
      counselor: {
        id: profile.id,
        name: profile.name,
        roleId: profile.roleId,
        roleName: getRole(profile.roleId),
        departmentId: profile.departmentId,
        departmentName: profile.departmentName,
        branchId: profile.branchId,
        branchName: profile.branchName,
        location: profile.location,
        availability: profile.availability,
        status: profile.status,
      }
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to register counselor.' }, { status: 500 });
  }
}

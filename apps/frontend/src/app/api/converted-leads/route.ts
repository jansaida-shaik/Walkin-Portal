import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { branches } from '@/lib/constants';

export async function GET() {
  try {
    const leads = await prisma.convertedLead.findMany({
      include: {
        counselor: true,
      },
      orderBy: { enrollmentDate: 'desc' },
    });
    return NextResponse.json(leads);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch converted leads' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if batch import
    if (Array.isArray(body.leads)) {
      const created = [];
      for (const item of body.leads) {
        const bName = branches.find(b => b.id === item.branchId)?.name || item.branchName || '1st Campus (JNTU-HYD)';
        const lead = await prisma.convertedLead.create({
          data: {
            studentName: item.studentName || 'Student Candidate',
            studentEmail: item.studentEmail || null,
            studentPhone: item.studentPhone || null,
            course: item.course || 'Full Stack Program',
            branchId: item.branchId || 'branch_jntu1',
            branchName: bName,
            counselorId: item.counselorId || null,
            counselorName: item.counselorName || null,
            leadSource: item.leadSource || 'Direct',
            feePaid: item.feePaid ? parseFloat(item.feePaid) : 0,
            totalFee: item.totalFee ? parseFloat(item.totalFee) : 0,
            status: item.status || 'Enrolled',
            enrollmentDate: item.enrollmentDate ? new Date(item.enrollmentDate) : new Date(),
            notes: item.notes || null,
          }
        });
        created.push(lead);
      }
      return NextResponse.json({ success: true, count: created.length, leads: created });
    }

    // Single creation
    const bName = branches.find(b => b.id === body.branchId)?.name || body.branchName || '1st Campus (JNTU-HYD)';
    const lead = await prisma.convertedLead.create({
      data: {
        studentName: body.studentName,
        studentEmail: body.studentEmail || null,
        studentPhone: body.studentPhone || null,
        course: body.course,
        branchId: body.branchId || 'branch_jntu1',
        branchName: bName,
        counselorId: body.counselorId || null,
        counselorName: body.counselorName || null,
        leadSource: body.leadSource || 'Direct',
        feePaid: body.feePaid ? parseFloat(body.feePaid) : 0,
        totalFee: body.totalFee ? parseFloat(body.totalFee) : 0,
        status: body.status || 'Enrolled',
        enrollmentDate: body.enrollmentDate ? new Date(body.enrollmentDate) : new Date(),
        notes: body.notes || null,
      }
    });

    return NextResponse.json({ success: true, lead });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create converted lead' }, { status: 500 });
  }
}

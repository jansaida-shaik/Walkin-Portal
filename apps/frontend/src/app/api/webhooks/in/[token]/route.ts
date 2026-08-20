import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  try {

    const { token } = params;
    const webhook = await prisma.incomingWebhook.findUnique({ where: { token } });
    if (!webhook || !webhook.isActive) {
      return NextResponse.json({ error: 'Unauthorized or inactive webhook token' }, { status: 401 });
    }

    const payload = await request.json();

    // Map the incoming payload to the Prisma Student schema
    const name = payload['Name'] || payload['name'] || 'Unknown Lead';
    const phone = payload['Phone'] || payload['phone'];
    const email = payload['Email'] || payload['email'] || null;
    const course = payload['Choose Preferred Course:'] || payload['course'] || payload['Choose Preferred Course'] || 'Unspecified';
    const branchName = payload['Walk-in Branch'] || payload['branchName'] || '1st Campus (JNTU-HYD)';
    let source = payload['Lead Source'] || payload['source'] || 'Webhook Integration';

    // Optional: Determine branchId from branchName, assuming JNTU1 is default
    let branchId = 'branch_jntu1';
    if (branchName.toLowerCase().includes('ameerpet')) {
      branchId = 'branch_ameerpet';
    } else if (branchName.toLowerCase().includes('vijayawada')) {
      branchId = 'branch_vijayawada';
    }

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Extract all fields into the details JSON object
    const details = { ...payload };

    // Check if a student with this phone already exists
    const existingStudent = await prisma.student.findUnique({
      where: { phone }
    });

    if (existingStudent) {
      // If it exists, update the details and record it
      const updatedStudent = await prisma.student.update({
        where: { id: existingStudent.id },
        data: {
          name: name !== 'Unknown Lead' ? name : existingStudent.name,
          email: email || existingStudent.email,
          course: course !== 'Unspecified' ? course : existingStudent.course,
          branchName: branchName || existingStudent.branchName,
          branchId: branchId || existingStudent.branchId,
          source: source,
          details: {
            ...(existingStudent.details as object || {}),
            ...details,
            lastWebhookUpdate: new Date().toISOString()
          },
        }
      });
      return NextResponse.json({ success: true, message: 'Lead updated', student: updatedStudent }, { status: 200 });
    } else {
      // Create a new student
      const newStudent = await prisma.student.create({
        data: {
          name,
          phone,
          email,
          course,
          branchName,
          branchId,
          source,
          status: 'Waiting',
          details
        }
      });
      return NextResponse.json({ success: true, message: 'Lead created', student: newStudent }, { status: 201 });
    }
  } catch (error: any) {
    console.error('Incoming Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { branches } from '@/lib/constants';

// Helper to look up key in payload case-insensitively with alias support
function getField(payload: Record<string, any>, aliases: string[], fallback: string = ''): string {
  for (const alias of aliases) {
    if (payload[alias] !== undefined && payload[alias] !== null && payload[alias] !== '') {
      return String(payload[alias]).trim();
    }
  }
  const payloadKeys = Object.keys(payload);
  for (const alias of aliases) {
    const aliasClean = alias.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const key of payloadKeys) {
      const keyClean = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (keyClean === aliasClean) {
        if (payload[key] !== undefined && payload[key] !== null && payload[key] !== '') {
          return String(payload[key]).trim();
        }
      }
    }
  }
  return fallback;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const webhook = await prisma.incomingWebhook.findUnique({ where: { token } });
    if (!webhook || !webhook.isActive) {
      return NextResponse.json({ error: 'Unauthorized or inactive webhook token' }, { status: 401 });
    }

    const payload = await request.json();
    if (!payload || typeof payload !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    // 1. Primary Identification - Clearly separated Student Phone vs Parent Phone
    const phone = getField(payload, [
      'phone', 'Phone', 'student_phone', 'Student Phone', 'studentPhone',
      'mobile', 'Mobile', 'student_mobile', 'Student Mobile',
      'contact', 'Contact', 'phoneNumber', 'Phone Number'
    ]);
    
    if (!phone) {
      return NextResponse.json({ error: 'Student phone number is required (field: phone or student_phone)' }, { status: 400 });
    }

    const parentPhone = getField(payload, [
      'parent_phone', 'Parent Phone', 'parentPhone',
      'Parent Number', 'parent_number', 'parentNumber',
      'parent_mobile', 'Parent Mobile', 'parentMobile',
      'guardian_phone', 'guardianPhone', 'Guardian Phone',
      'father_phone', 'Father Phone', 'mother_phone', 'Mother Phone'
    ]);

    const name = getField(payload, ['name', 'Name', 'studentName', 'Student Name', 'fullName', 'Full Name'], 'Unknown Lead');
    const email = getField(payload, ['email', 'Email', 'email_id', 'Email Address', 'emailAddress']) || null;
    const course = getField(payload, ['course', 'Course', 'Choose Preferred Course:', 'Choose Preferred Course', 'Preferred Course', 'courseInterested'], 'Unspecified');
    const source = getField(payload, ['source', 'Source', 'Lead Source', 'lead_source', 'utm_source'], 'Webhook Integration');
    const remarks = getField(payload, ['remarks', 'Remarks', 'notes', 'Notes', 'comment', 'message', 'Description']);

    // 2. Branch Resolution
    const branchInput = getField(payload, ['branchName', 'branch', 'Branch', 'Walk-in Branch', 'Branch Name', 'branchId', 'campus', 'Campus', 'location', 'Location']);
    let matchedBranch = branches[0]; // default to 1st Campus (JNTU-HYD)
    if (branchInput) {
      const match = branches.find(b => 
        b.id.toLowerCase() === branchInput.toLowerCase() ||
        b.name.toLowerCase().includes(branchInput.toLowerCase()) ||
        branchInput.toLowerCase().includes(b.name.toLowerCase())
      );
      if (match) matchedBranch = match;
    }
    const branchId = matchedBranch.id;
    const branchName = matchedBranch.name;

    // 3. Counselor Resolution (if specified)
    const counselorInput = getField(payload, ['counselorId', 'counselor', 'counselorName', 'Counsellor', 'Counselor', 'Assigned Counsellor', 'Assigned Counselor']);
    let assignedCounselor: any = null;
    if (counselorInput) {
      assignedCounselor = await prisma.counselorProfile.findFirst({
        where: {
          OR: [
            { id: counselorInput },
            { user: { name: { contains: counselorInput, mode: 'insensitive' } } }
          ]
        },
        include: { user: true }
      });
    }

    let status = getField(payload, ['status', 'Status', 'lead_status', 'Walk-in Status']);
    if (!status) {
      status = assignedCounselor ? 'Assigned' : 'Waiting';
    }

    // 4. Detailed metadata mapping (academic, personal, training, financials)
    const details: Record<string, any> = {
      ...payload,
      // Standardized Normalized Keys for Portal UI
      name,
      phone,
      parent_phone: parentPhone,
      'Parent Number': parentPhone,
      email,
      course,
      branchId,
      branchName,
      source,
      remarks,
      status,
      // Academic
      qualification: getField(payload, ['qualification', 'Educational Qualification', 'education', 'degree']),
      'Educational Qualification': getField(payload, ['qualification', 'Educational Qualification', 'education', 'degree']),
      college_name: getField(payload, ['college_name', 'Institution Name', 'college', 'College', 'university']),
      'Institution Name': getField(payload, ['college_name', 'Institution Name', 'college', 'College', 'university']),
      passout_year: getField(payload, ['passout_year', 'Year of Passout', 'passoutYear', 'YOP']),
      'Year of Passout': getField(payload, ['passout_year', 'Year of Passout', 'passoutYear', 'YOP']),
      ssc_percentage: getField(payload, ['ssc_percentage', '10th %', '10th_Percent', 'tenthPercentage']),
      '10th %': getField(payload, ['ssc_percentage', '10th %', '10th_Percent', 'tenthPercentage']),
      inter_percentage: getField(payload, ['inter_percentage', 'Intermediate %', 'Intermediate_Percent', 'interPercentage']),
      'Intermediate %': getField(payload, ['inter_percentage', 'Intermediate %', 'Intermediate_Percent', 'interPercentage']),
      degree_percentage: getField(payload, ['degree_percentage', 'B.Tech/Degree %', 'Degree %', 'degreePercentage']),
      'B.Tech/Degree %': getField(payload, ['degree_percentage', 'B.Tech/Degree %', 'Degree %', 'degreePercentage']),
      pg_percentage: getField(payload, ['pg_percentage', 'Post Graduation %', 'pgPercentage']),
      'Post Graduation %': getField(payload, ['pg_percentage', 'Post Graduation %', 'pgPercentage']),
      // Personal
      dob: getField(payload, ['dob', 'Date of Birth', 'birthDate', 'dateOfBirth']),
      'Date of Birth': getField(payload, ['dob', 'Date of Birth', 'birthDate', 'dateOfBirth']),
      gender: getField(payload, ['gender', 'Gender', 'sex']),
      Gender: getField(payload, ['gender', 'Gender', 'sex']),
      // Training Preferences
      training_mode: getField(payload, ['training_mode', 'Mode of Training', 'trainingMode', 'mode']),
      'Mode of Training': getField(payload, ['training_mode', 'Mode of Training', 'trainingMode', 'mode']),
      reason_for_course: getField(payload, ['reason_for_course', 'Why do you want this Course?', 'reason']),
      'Why do you want this Course?': getField(payload, ['reason_for_course', 'Why do you want this Course?', 'reason']),
      // Commercial & Fees
      course_fee: getField(payload, ['course_fee', 'Course Fee', 'fee']),
      'Course Fee': getField(payload, ['course_fee', 'Course Fee', 'fee']),
      discount: getField(payload, ['discount', 'Discount', 'concession']),
      Discount: getField(payload, ['discount', 'Discount', 'concession']),
      final_course_fee: getField(payload, ['final_course_fee', 'Final Course Fee', 'finalFee']),
      'Final Course Fee': getField(payload, ['final_course_fee', 'Final Course Fee', 'finalFee']),
      duration: getField(payload, ['duration', 'Duration (In Days)', 'durationDays']),
      'Duration (In Days)': getField(payload, ['duration', 'Duration (In Days)', 'durationDays']),
      prev_institute: getField(payload, ['prev_institute', 'Previous Training Institute', 'previousInstitute']),
      'Previous Training Institute': getField(payload, ['prev_institute', 'Previous Training Institute', 'previousInstitute']),
      // Marketing & Meta
      know_about_us: getField(payload, ['know_about_us', 'How Did You Know About Us', 'referralSource']),
      'How Did You Know About Us': getField(payload, ['know_about_us', 'How Did You Know About Us', 'referralSource']),
      referrer_name: getField(payload, ['referrer_name', 'Referrer Name', 'referredBy']),
      'Referrer Name': getField(payload, ['referrer_name', 'Referrer Name', 'referredBy']),
      form_no: getField(payload, ['form_no', 'Form No', 'formNumber']),
      'Form No': getField(payload, ['form_no', 'Form No', 'formNumber']),
      walkin_time: getField(payload, ['walkin_time', 'Time', 'walkinTime']),
      Time: getField(payload, ['walkin_time', 'Time', 'walkinTime']),
      counselorName: assignedCounselor ? assignedCounselor.user.name : getField(payload, ['counselorName', 'counselor', 'Counsellor']),
      counselorId: assignedCounselor ? assignedCounselor.id : undefined,
      lastWebhookUpdate: new Date().toISOString()
    };

    // 5. Check if student already exists by Phone
    const existingStudent = await prisma.student.findUnique({
      where: { phone }
    });

    if (existingStudent) {
      const updatedStudent = await prisma.student.update({
        where: { id: existingStudent.id },
        data: {
          name: name !== 'Unknown Lead' ? name : existingStudent.name,
          email: email || existingStudent.email,
          course: course !== 'Unspecified' ? course : existingStudent.course,
          branchName: branchName || existingStudent.branchName,
          branchId: branchId || existingStudent.branchId,
          source: source || existingStudent.source,
          remarks: remarks ? `${existingStudent.remarks ? existingStudent.remarks + ' | ' : ''}${remarks}` : existingStudent.remarks,
          details: {
            ...(existingStudent.details as object || {}),
            ...details
          },
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Walk-in lead updated successfully',
        student: updatedStudent
      }, { status: 200 });
    } else {
      // 6. Create New Walk-in Student Record
      const newStudent = await prisma.student.create({
        data: {
          name,
          phone,
          email,
          course,
          branchName,
          branchId,
          source,
          remarks,
          status,
          details
        }
      });

      // If a counselor was matched, assign counselor session
      if (assignedCounselor) {
        await prisma.counselorProfile.update({
          where: { id: assignedCounselor.id },
          data: { assignedStudentId: newStudent.id }
        });
        await prisma.counselingSession.create({
          data: {
            studentId: newStudent.id,
            counselorId: assignedCounselor.id,
            status: 'ASSIGNED',
            notes: remarks || ''
          }
        });
      }

      // Generate Queue Entry Token
      const maxPosition = await prisma.queueEntry.aggregate({
        where: { student: { branchId }, status: 'active' },
        _max: { position: true }
      });
      const nextPos = (maxPosition._max.position || 100) + 1;
      await prisma.queueEntry.create({
        data: {
          id: String(nextPos),
          studentId: newStudent.id,
          position: nextPos,
          status: 'active'
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Walk-in lead registered successfully with token queue',
        student: newStudent,
        token: nextPos
      }, { status: 201 });
    }
  } catch (error: any) {
    console.error('Incoming Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

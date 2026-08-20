import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const DATA_DIR = path.join(process.cwd(), 'backend/data');

async function main() {
  console.log('[Seed] Starting database seeding from JSON backups...');

  // 1. Seed standard users (and counselors)
  console.log('[Seed] Seeding static and counselor users...');
  
  // Default system users
  const systemUsers = [
    {
      id: 'user_superadmin',
      username: 'superadmin',
      password: 'superadmin123',
      name: 'Super Admin',
      email: 'superadmin@office.com',
      roleId: 'role_super_admin',
      branchId: 'branch_jntu1',
      locationId: 'loc_hyd',
      departmentId: 'dept_administration'
    },
    {
      id: 'user_admin',
      username: 'admin',
      password: 'admin123',
      name: 'Portal Admin',
      email: 'admin@office.com',
      roleId: 'role_admin',
      branchId: 'branch_jntu1',
      locationId: 'loc_hyd',
      departmentId: 'dept_frontdesk'
    },
    {
      id: 'user_manager',
      username: 'manager',
      password: 'manager123',
      name: 'Branch Manager',
      email: 'manager@office.com',
      roleId: 'role_manager',
      branchId: 'branch_jntu1',
      locationId: 'loc_hyd',
      departmentId: 'dept_administration'
    },
    {
      id: 'user_frontdesk',
      username: 'frontdesk',
      password: 'frontdesk123',
      name: 'Front Desk Reception',
      email: 'frontdesk@office.com',
      roleId: 'role_frontdesk',
      branchId: 'branch_jntu1',
      locationId: 'loc_hyd',
      departmentId: 'dept_frontdesk'
    },
    {
      id: 'user_counselor',
      username: 'counselor',
      password: 'counselor123',
      name: 'Counselor User',
      email: 'counselor@office.com',
      roleId: 'role_counselor',
      branchId: 'branch_jntu1',
      locationId: 'loc_hyd',
      departmentId: 'dept_sales'
    }
  ];

  for (const u of systemUsers) {
    await prisma.user.upsert({
      where: { username: u.username },
      update: {},
      create: {
        id: u.id,
        username: u.username,
        password: bcrypt.hashSync(u.password, 10),
        name: u.name,
        email: u.email,
        roleId: u.roleId,
        branchId: u.branchId,
        locationId: u.locationId,
        departmentId: u.departmentId
      }
    });
  }

  // Load and seed counselors from counselors.json
  const counselorsPath = path.join(DATA_DIR, 'counselors.json');
  const counselorProfilesToSeed = [];
  if (fs.existsSync(counselorsPath)) {
    const data = JSON.parse(fs.readFileSync(counselorsPath, 'utf8'));
    for (const c of data) {
      // Ensure matching user exists
      const username = `counselor_${c.id}`;
      const email = `${c.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@office.com`;
      const locationId = c.location === 'Vijayawada' ? 'loc_vij' : (c.location === 'Visakhapatnam' ? 'loc_vsp' : 'loc_hyd');
      
      const user = await prisma.user.upsert({
        where: { username },
        update: { name: c.name, branchId: c.branchId, departmentId: c.departmentId },
        create: {
          id: c.id,
          username,
          password: bcrypt.hashSync(`${c.id}123`, 10),
          name: c.name,
          email,
          roleId: 'role_counselor',
          branchId: c.branchId,
          locationId,
          departmentId: c.departmentId
        }
      });

      counselorProfilesToSeed.push({
        id: c.id,
        availability: c.availability || [],
        status: c.status || 'Offline',
        assignedStudentId: c.assignedStudentId ? String(c.assignedStudentId) : null
      });
    }
  }

  // Seed profiles (after creating users, initially set assignedStudentId to null to avoid foreign key errors)
  for (const p of counselorProfilesToSeed) {
    await prisma.counselorProfile.upsert({
      where: { id: p.id },
      update: { status: p.status, availability: p.availability, assignedStudentId: null },
      create: {
        id: p.id,
        status: p.status,
        availability: p.availability,
        assignedStudentId: null
      }
    });
  }
  console.log(`[Seed] Seeded ${counselorProfilesToSeed.length} counselor profiles.`);

  // 2. Seed Webhook Config
  console.log('[Seed] Seeding webhook config...');
  const webhookConfigPath = path.join(DATA_DIR, 'webhook_config.json');
  if (fs.existsSync(webhookConfigPath)) {
    const config = JSON.parse(fs.readFileSync(webhookConfigPath, 'utf8'));
    await prisma.webhookConfig.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        customHeaders: config.customHeaders || [],
        globalPayloadFields: config.globalPayloadFields || [],
        signingSecret: config.signingSecret || '',
        maxRetries: config.maxRetries ?? 1,
        retryDelayMs: config.retryDelayMs ?? 2000,
        timeoutMs: config.timeoutMs ?? 5000
      }
    });
  } else {
    await prisma.webhookConfig.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        customHeaders: [],
        globalPayloadFields: [],
        signingSecret: '',
        maxRetries: 1,
        retryDelayMs: 2000,
        timeoutMs: 5000
      }
    });
  }

  // 3. Seed Webhook Subscriptions
  console.log('[Seed] Seeding webhook subscriptions...');
  const webhooksPath = path.join(DATA_DIR, 'webhook_subscriptions.json');
  if (fs.existsSync(webhooksPath)) {
    const data = JSON.parse(fs.readFileSync(webhooksPath, 'utf8'));
    for (const w of data) {
      await prisma.webhookSubscription.upsert({
        where: { id: w.id },
        update: {},
        create: {
          id: w.id,
          name: w.name,
          url: w.url,
          method: w.method || 'POST',
          events: w.events || [],
          conditions: w.conditions || [],
          enabled: w.enabled !== false
        }
      });
    }
  }

  // 4. Seed Webhook Logs
  console.log('[Seed] Seeding webhook logs...');
  const webhookLogsPath = path.join(DATA_DIR, 'webhook_logs.json');
  if (fs.existsSync(webhookLogsPath)) {
    const data = JSON.parse(fs.readFileSync(webhookLogsPath, 'utf8'));
    for (const l of data) {
      await prisma.webhookLog.upsert({
        where: { id: l.id },
        update: {},
        create: {
          id: l.id,
          subscriptionId: l.subscriptionId,
          subscriptionName: l.subscriptionName,
          url: l.url,
          method: l.method,
          event: l.event,
          conditionsMatched: l.conditionsMatched !== false,
          conditionDetails: l.conditionDetails || '',
          payload: l.payload || {},
          status: l.status,
          statusCode: l.statusCode || null,
          response: l.response || '',
          retryCount: l.retryCount ?? 0,
          triggeredAt: new Date(l.triggeredAt),
          durationMs: l.durationMs ?? 0
        }
      });
    }
  }

  // 5. Seed Students (Walk-ins)
  console.log('[Seed] Seeding students...');
  const walkinsPath = path.join(DATA_DIR, 'walkins.json');
  const seenPhones = new Set<string>();
  if (fs.existsSync(walkinsPath)) {
    const data = JSON.parse(fs.readFileSync(walkinsPath, 'utf8'));
    for (const w of data) {
      let phone = w.phone || w.contact || `99999${w.id}`;
      // Sanitize duplicates to satisfy unique constraint
      if (seenPhones.has(phone)) {
        phone = `${phone}-${w.id}`;
      }
      seenPhones.add(phone);

      const statusMap: Record<string, string> = {
        'Waiting': 'Waiting',
        'Assigned': 'Assigned',
        'In Session': 'In Session',
        'Completed': 'Completed',
        'Follow-up': 'Follow-up',
        'No Show': 'No Show',
        'Cancelled': 'Cancelled'
      };
      const status = statusMap[w.status] || 'Waiting';

      await prisma.student.upsert({
        where: { id: String(w.id) },
        update: {
          branchId: w.branchId || 'branch_jntu1',
          branchName: w.branchName || '1st Campus (JNTU-HYD)',
          details: w
        },
        create: {
          id: String(w.id),
          name: w.studentName,
          phone,
          course: w.courseInterested || w.purpose || 'General',
          branchId: w.branchId || 'branch_jntu1',
          branchName: w.branchName || '1st Campus (JNTU-HYD)',
          walkinDate: new Date(w.createdAt || new Date()),
          status,
          remarks: w.remarks || '',
          source: w.source || 'Walk-in',
          details: w
        }
      });
    }
  }

  // 6. Seed Counseling Sessions
  console.log('[Seed] Seeding sessions...');
  const sessionsPath = path.join(DATA_DIR, 'sessions.json');
  if (fs.existsSync(sessionsPath)) {
    const data = JSON.parse(fs.readFileSync(sessionsPath, 'utf8'));
    for (const s of data) {
      // Ensure student and counselor exist
      const studentExists = await prisma.student.findUnique({ where: { id: String(s.student_id) } });
      const counselorExists = await prisma.user.findUnique({ where: { id: s.counselor_id } });

      if (studentExists && counselorExists) {
        await prisma.counselingSession.upsert({
          where: { id: s.id },
          update: {},
          create: {
            id: s.id,
            studentId: String(s.student_id),
            counselorId: s.counselor_id,
            startTime: s.session_start_time ? new Date(s.session_start_time) : null,
            endTime: s.session_end_time ? new Date(s.session_end_time) : null,
            duration: s.duration_seconds || 0,
            status: s.status,
            notes: s.notes || '',
            followUpStatus: s.follow_up_status || 'No Follow-up'
          }
        });
      }
    }
  }

  // 7. Seed Queue Entries (Tokens)
  console.log('[Seed] Seeding tokens into QueueEntries...');
  const tokensPath = path.join(DATA_DIR, 'tokens.json');
  if (fs.existsSync(tokensPath)) {
    const data = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
    for (const t of data) {
      if (t.walkinId) {
        const studentExists = await prisma.student.findUnique({ where: { id: String(t.walkinId) } });
        if (studentExists) {
          await prisma.queueEntry.upsert({
            where: { id: String(t.id) },
            update: {},
            create: {
              id: String(t.id),
              studentId: String(t.walkinId),
              position: t.id,
              status: t.status // active, completed
            }
          });
        }
      }
    }
  }

  // 8. Update Counselor Profiles with their assignedStudentId now that students are seeded
  console.log('[Seed] Updating counselor profiles with assigned student IDs...');
  for (const p of counselorProfilesToSeed) {
    if (p.assignedStudentId) {
      const studentExists = await prisma.student.findUnique({ where: { id: p.assignedStudentId } });
      if (studentExists) {
        await prisma.counselorProfile.update({
          where: { id: p.id },
          data: { assignedStudentId: p.assignedStudentId }
        });
      }
    }
  }

  console.log('[Seed] Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('[Seed] Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

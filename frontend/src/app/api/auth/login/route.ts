import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db';
import { getBranchName, getDepartment, getLocation, getRole } from '@/lib/constants';

const JWT_SECRET = process.env.JWT_SECRET || 'walkin-portal-super-secret-key-123456!';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({ where: { username, deletedAt: null } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }

    const isBcryptHash = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
    let isPasswordCorrect = false;
    let needsMigration = false;

    if (isBcryptHash) {
      isPasswordCorrect = await bcrypt.compare(password, user.password);
    } else {
      isPasswordCorrect = user.password === password;
      if (isPasswordCorrect) needsMigration = true;
    }

    if (!isPasswordCorrect) {
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }

    if (needsMigration) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });
      await prisma.auditLog.create({ data: { userId: user.id, action: 'PASSWORD_MIGRATED_BCRYPT', module: 'Authentication', newValue: `Plaintext password for user ${user.username} migrated to bcrypt.` } });
    }

    const payload = {
      id: user.id, name: user.name, email: user.email,
      role: getRole(user.roleId), roleId: user.roleId,
      branchId: user.branchId, branchName: getBranchName(user.branchId),
      locationId: user.locationId, locationName: getLocation(user.locationId),
      departmentId: user.departmentId, departmentName: getDepartment(user.departmentId),
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    await prisma.auditLog.create({ data: { userId: user.id, action: 'USER_LOGIN', module: 'Authentication', newValue: `User ${user.username} logged in successfully.` } });

    return NextResponse.json({ success: true, user: payload, token });
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: err.message || 'Something went wrong during login.' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getBranchName } from '@/lib/constants';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const counselorId = (await params).id;
    const patch = await req.json();

    const updated = await prisma.$transaction(async (tx: any) => {
      // Find profile by id or userId
      let profile = await tx.counselorProfile.findFirst({
        where: {
          OR: [{ id: counselorId }, { userId: counselorId }]
        },
        include: { user: true }
      });
      if (!profile) throw new Error('Counselor profile not found.');

      const targetUserId = profile.userId || counselorId;

      const userPatch: any = {};
      if (patch.branchId) userPatch.branchId = patch.branchId;
      if (patch.locationId || patch.location) {
        const loc = patch.locationId || patch.location;
        userPatch.locationId = (loc === 'Vijayawada' || loc === 'loc_vij')
          ? 'loc_vij'
          : ((loc === 'Visakhapatnam' || loc === 'loc_vsp') ? 'loc_vsp' : 'loc_hyd');
      }
      if (Object.keys(userPatch).length > 0) {
        // Guard: only update if a real User record exists (system/admin profiles may not have one)
        const existingUser = await tx.user.findUnique({ where: { id: targetUserId } });
        if (existingUser) {
          await tx.user.update({ where: { id: targetUserId }, data: userPatch });
        }
      }

      const profilePatch: any = {};
      if (patch.status) {
        const low = patch.status.toLowerCase();
        profilePatch.status = low === 'available' ? 'Available' : low === 'busy' ? 'Busy' : low === 'break' || low === 'on_leave' ? 'Break' : 'Offline';
      }
      if (patch.availability) profilePatch.availability = patch.availability;
      if (patch.locationId || patch.location) {
        profilePatch.location = userPatch.locationId;
      }
      if (patch.branchId) {
        profilePatch.branchId = patch.branchId;
      }

      if (Object.keys(profilePatch).length > 0) {
        await tx.counselorProfile.update({ where: { id: profile.id }, data: profilePatch });
      }

      return tx.counselorProfile.findUnique({ where: { id: profile.id }, include: { user: true } });
    });

    return NextResponse.json({
      success: true,
      counselor: {
        id: updated.id,
        name: updated.user.name,
        branchId: updated.user.branchId || updated.branchId,
        branchName: getBranchName(updated.user.branchId || updated.branchId),
        location: updated.user.locationId || updated.location,
        status: updated.status,
        availability: updated.availability,
      }
    });
  } catch (err: any) {
    console.error('Update counselor error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update counselor details.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const counselorId = (await params).id;

    await prisma.$transaction(async (tx: any) => {
      // Find profile first
      const profile = await tx.counselorProfile.findFirst({
        where: { OR: [{ id: counselorId }, { userId: counselorId }] },
      });
      if (!profile) throw new Error('Counselor not found.');

      // Nullify assignedStudentId references in sessions
      await tx.session.updateMany({
        where: { counselorId: profile.id },
        data: { counselorId: null },
      }).catch(() => {}); // soft-fail if no sessions column

      // Delete the profile (cascade will handle related records if set in schema)
      await tx.counselorProfile.delete({ where: { id: profile.id } });
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Delete counselor error:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete counselor.' }, { status: 500 });
  }
}

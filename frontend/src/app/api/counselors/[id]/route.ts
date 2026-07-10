import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getBranchName } from '@/lib/constants';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const counselorId = (await params).id;
    const patch = await req.json();

    const updated = await prisma.$transaction(async (tx: any) => {
      const profile = await tx.counselorProfile.findUnique({ where: { id: counselorId } });
      if (!profile) throw new Error('Counselor not found.');

      const userPatch: any = {};
      if (patch.branchId) userPatch.branchId = patch.branchId;
      if (patch.locationId || patch.location) {
        const loc = patch.locationId || patch.location;
        userPatch.locationId = loc === 'Vijayawada' ? 'loc_vij' : (loc === 'Visakhapatnam' ? 'loc_vsp' : 'loc_hyd');
      }
      if (Object.keys(userPatch).length > 0) await tx.user.update({ where: { id: counselorId }, data: userPatch });

      const profilePatch: any = {};
      if (patch.status) {
        const low = patch.status.toLowerCase();
        profilePatch.status = low === 'available' ? 'Available' : low === 'busy' ? 'Busy' : low === 'break' || low === 'on_leave' ? 'Break' : 'Offline';
      }
      if (patch.availability) profilePatch.availability = patch.availability;
      if (Object.keys(profilePatch).length > 0) await tx.counselorProfile.update({ where: { id: counselorId }, data: profilePatch });

      return tx.counselorProfile.findUnique({ where: { id: counselorId }, include: { user: true } });
    });

    return NextResponse.json({ success: true, counselor: {
      id: updated.id, name: updated.user.name,
      branchId: updated.user.branchId, branchName: getBranchName(updated.user.branchId),
      location: updated.user.locationId, status: updated.status, availability: updated.availability,
    } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update counselor details.' }, { status: 500 });
  }
}

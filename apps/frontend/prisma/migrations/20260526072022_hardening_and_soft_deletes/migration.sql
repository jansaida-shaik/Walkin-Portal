-- AlterTable
ALTER TABLE "CounselingSession" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "CounselorProfile" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "QueueEntry" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "WebhookSubscription" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "CounselingSession_studentId_counselorId_status_deletedAt_idx" ON "CounselingSession"("studentId", "counselorId", "status", "deletedAt");

-- CreateIndex
CREATE INDEX "CounselingSession_createdAt_deletedAt_idx" ON "CounselingSession"("createdAt", "deletedAt");

-- CreateIndex
CREATE INDEX "CounselorProfile_status_deletedAt_idx" ON "CounselorProfile"("status", "deletedAt");

-- CreateIndex
CREATE INDEX "QueueEntry_status_deletedAt_idx" ON "QueueEntry"("status", "deletedAt");

-- CreateIndex
CREATE INDEX "Student_branchId_status_deletedAt_idx" ON "Student"("branchId", "status", "deletedAt");

-- CreateIndex
CREATE INDEX "Student_createdAt_deletedAt_idx" ON "Student"("createdAt", "deletedAt");

-- CreateIndex
CREATE INDEX "User_branchId_deletedAt_idx" ON "User"("branchId", "deletedAt");

-- CreateIndex
CREATE INDEX "WebhookLog_subscriptionId_status_triggeredAt_idx" ON "WebhookLog"("subscriptionId", "status", "triggeredAt");

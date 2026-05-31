-- DropIndex
DROP INDEX "location_zip_idx";

-- CreateIndex
CREATE INDEX "member_userId_idx" ON "member"("userId");

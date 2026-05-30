-- CreateTable
CREATE TABLE "blockuser" (
    "id" TEXT NOT NULL,
    "sourceMemberId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "blockedMemberId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "blockuser_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "blockuser" ADD CONSTRAINT "blockuser_sourceMemberId_fkey" FOREIGN KEY ("sourceMemberId") REFERENCES "member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blockuser" ADD CONSTRAINT "blockuser_blockedMemberId_fkey" FOREIGN KEY ("blockedMemberId") REFERENCES "member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

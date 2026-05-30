-- AlterTable
ALTER TABLE "member" ADD COLUMN     "aboutUs" TEXT,
ADD COLUMN     "whatWeAreLookingFor" TEXT;

-- CreateTable
CREATE TABLE "likes" (
    "id" SERIAL NOT NULL,
    "LikedMemberId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "LikedById" TEXT,
    "dateRead" TIMESTAMP(3),

    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_LikedMemberId_fkey" FOREIGN KEY ("LikedMemberId") REFERENCES "member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_LikedById_fkey" FOREIGN KEY ("LikedById") REFERENCES "member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

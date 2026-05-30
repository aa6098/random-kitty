/*
  Warnings:

  - A unique constraint covering the columns `[LikedMemberId,LikedById]` on the table `likes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "likes_LikedMemberId_LikedById_key" ON "likes"("LikedMemberId", "LikedById");

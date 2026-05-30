/*
  Warnings:

  - You are about to drop the column `aboutUs` on the `member` table. All the data in the column will be lost.
  - You are about to drop the column `whatWeAreLookingFor` on the `member` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "member" DROP COLUMN "aboutUs",
DROP COLUMN "whatWeAreLookingFor",
ADD COLUMN     "whatareWelookingFor" TEXT;

/*
  Warnings:

  - You are about to alter the column `type` on the `message` table. The data in that column could be lost. The data in that column will be cast from `Char(3)` to `Char(1)`.

*/
-- AlterTable
ALTER TABLE "message" ADD COLUMN     "subject" CHAR(50),
ALTER COLUMN "type" SET DATA TYPE CHAR(1);

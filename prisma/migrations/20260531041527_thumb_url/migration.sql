/*
  Warnings:

  - Added the required column `thumburl` to the `photo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "photo" ADD COLUMN     "thumburl" TEXT NOT NULL;

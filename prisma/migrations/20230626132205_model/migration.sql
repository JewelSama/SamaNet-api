/*
  Warnings:

  - You are about to drop the `Image` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN "img_path" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Image";
PRAGMA foreign_keys=on;

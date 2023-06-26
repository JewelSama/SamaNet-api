/*
  Warnings:

  - A unique constraint covering the columns `[postId]` on the table `Savedpost` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Savedpost_postId_key" ON "Savedpost"("postId");

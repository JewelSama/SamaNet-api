/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[postId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[commentId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_key" ON "Like"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_postId_key" ON "Like"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_commentId_key" ON "Like"("commentId");

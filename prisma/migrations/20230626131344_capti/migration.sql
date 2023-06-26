/*
  Warnings:

  - A unique constraint covering the columns `[postId]` on the table `Comment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[postId]` on the table `Image` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Comment_postId_key" ON "Comment"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "Image_postId_key" ON "Image"("postId");

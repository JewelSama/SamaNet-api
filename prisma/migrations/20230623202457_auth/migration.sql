/*
  Warnings:

  - Made the column `expiration` on table `S_EmailToken` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_S_EmailToken" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL DEFAULT 'EmailToken',
    "emailToken" TEXT NOT NULL,
    "valid" BOOLEAN NOT NULL DEFAULT true,
    "expiration" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "S_EmailToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_S_EmailToken" ("createdAt", "emailToken", "expiration", "id", "type", "updatedAt", "userId", "valid") SELECT "createdAt", "emailToken", "expiration", "id", "type", "updatedAt", "userId", "valid" FROM "S_EmailToken";
DROP TABLE "S_EmailToken";
ALTER TABLE "new_S_EmailToken" RENAME TO "S_EmailToken";
CREATE UNIQUE INDEX "S_EmailToken_emailToken_key" ON "S_EmailToken"("emailToken");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

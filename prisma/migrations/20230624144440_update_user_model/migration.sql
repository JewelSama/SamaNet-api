/*
  Warnings:

  - You are about to drop the `S_AuthToken` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `authToken` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenExpiration` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "S_AuthToken";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "subscribed" BOOLEAN NOT NULL DEFAULT false,
    "profile_views" INTEGER NOT NULL DEFAULT 0,
    "phone_number" TEXT,
    "display_phone_num" BOOLEAN NOT NULL DEFAULT false,
    "authToken" TEXT NOT NULL,
    "tokenExpiration" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "display_phone_num", "email", "firstname", "id", "isVerified", "lastname", "password", "phone_number", "profile_views", "subscribed", "updatedAt", "username") SELECT "createdAt", "display_phone_num", "email", "firstname", "id", "isVerified", "lastname", "password", "phone_number", "profile_views", "subscribed", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

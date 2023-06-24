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
    "authToken" TEXT,
    "tokenExpiration" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("authToken", "createdAt", "display_phone_num", "email", "firstname", "id", "isVerified", "lastname", "password", "phone_number", "profile_views", "subscribed", "tokenExpiration", "updatedAt", "username") SELECT "authToken", "createdAt", "display_phone_num", "email", "firstname", "id", "isVerified", "lastname", "password", "phone_number", "profile_views", "subscribed", "tokenExpiration", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

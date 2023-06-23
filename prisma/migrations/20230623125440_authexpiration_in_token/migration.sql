-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Token" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "emailToken" TEXT,
    "authToken" TEXT,
    "valid" BOOLEAN NOT NULL DEFAULT true,
    "authTokenValid" BOOLEAN NOT NULL DEFAULT true,
    "expiration" DATETIME,
    "authExpiration" DATETIME,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Token" ("authToken", "createdAt", "emailToken", "expiration", "id", "type", "updatedAt", "userId", "valid") SELECT "authToken", "createdAt", "emailToken", "expiration", "id", "type", "updatedAt", "userId", "valid" FROM "Token";
DROP TABLE "Token";
ALTER TABLE "new_Token" RENAME TO "Token";
CREATE UNIQUE INDEX "Token_emailToken_key" ON "Token"("emailToken");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

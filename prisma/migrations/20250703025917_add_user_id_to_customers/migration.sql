/*
  Warnings:

  - Added the required column `userId` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Migration modified to handle existing customers by assigning them to first available user.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

-- Get the first user ID (if any users exist)
-- If no users exist, we'll delete existing customers
CREATE TEMPORARY TABLE temp_first_user AS 
SELECT id as userId FROM "User" LIMIT 1;

-- Create new Customer table
CREATE TABLE "new_Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Copy existing customers and assign them to first user (if user exists)
-- Only copy if we have at least one user in the database
INSERT INTO "new_Customer" ("id", "userId", "name", "email", "phone", "createdAt", "updatedAt")
SELECT 
    c."id",
    COALESCE(u.userId, 'no-user') as userId,
    c."name",
    c."email", 
    c."phone",
    c."createdAt",
    c."updatedAt"
FROM "Customer" c
LEFT JOIN temp_first_user u ON 1=1
WHERE EXISTS (SELECT 1 FROM "User");

-- Clean up temporary table
DROP TABLE temp_first_user;

-- Drop old table and rename new one
DROP TABLE "Customer";
ALTER TABLE "new_Customer" RENAME TO "Customer";

-- Create the unique index
CREATE UNIQUE INDEX "Customer_userId_email_key" ON "Customer"("userId", "email");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

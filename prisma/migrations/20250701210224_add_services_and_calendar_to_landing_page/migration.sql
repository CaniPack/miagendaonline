-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LandingPage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "professionalName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "profileImage" TEXT,
    "coverImage" TEXT,
    "logo" TEXT,
    "services" TEXT NOT NULL DEFAULT '[]',
    "showCalendar" BOOLEAN NOT NULL DEFAULT true,
    "calendarDescription" TEXT,
    "buttonText" TEXT NOT NULL DEFAULT 'Agendar Hora',
    "requirePayment" BOOLEAN NOT NULL DEFAULT false,
    "formFields" TEXT NOT NULL DEFAULT '[{"name":"name","label":"Nombre","type":"text","required":true},{"name":"lastName","label":"Apellido","type":"text","required":true},{"name":"email","label":"Correo","type":"email","required":true},{"name":"comment","label":"Comentario","type":"textarea","required":false}]',
    "whatsapp" TEXT,
    "instagram" TEXT,
    "contactEmail" TEXT,
    "colorScheme" TEXT NOT NULL DEFAULT 'blue',
    "slug" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LandingPage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LandingPage" ("buttonText", "colorScheme", "contactEmail", "coverImage", "createdAt", "description", "formFields", "id", "instagram", "isPublished", "logo", "metaDescription", "metaTitle", "professionalName", "profileImage", "requirePayment", "slug", "tagline", "title", "updatedAt", "userId", "whatsapp") SELECT "buttonText", "colorScheme", "contactEmail", "coverImage", "createdAt", "description", "formFields", "id", "instagram", "isPublished", "logo", "metaDescription", "metaTitle", "professionalName", "profileImage", "requirePayment", "slug", "tagline", "title", "updatedAt", "userId", "whatsapp" FROM "LandingPage";
DROP TABLE "LandingPage";
ALTER TABLE "new_LandingPage" RENAME TO "LandingPage";
CREATE UNIQUE INDEX "LandingPage_userId_key" ON "LandingPage"("userId");
CREATE UNIQUE INDEX "LandingPage_slug_key" ON "LandingPage"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 60,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "internalComment" TEXT,
    "internalPrice" INTEGER,
    "publicPrice" INTEGER,
    "googleEventId" TEXT,
    "googleEventLink" TEXT,
    "syncedToGoogle" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Appointment" ("createdAt", "customerId", "date", "duration", "id", "internalComment", "internalPrice", "notes", "publicPrice", "status", "updatedAt", "userId") SELECT "createdAt", "customerId", "date", "duration", "id", "internalComment", "internalPrice", "notes", "publicPrice", "status", "updatedAt", "userId" FROM "Appointment";
DROP TABLE "Appointment";
ALTER TABLE "new_Appointment" RENAME TO "Appointment";
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
    "appointmentDuration" INTEGER NOT NULL DEFAULT 60,
    "bufferTime" INTEGER NOT NULL DEFAULT 0,
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
    "faqs" TEXT NOT NULL DEFAULT '[]',
    "seoKeywords" TEXT,
    "focusKeyword" TEXT,
    "customSchema" TEXT,
    "robotsDirective" TEXT NOT NULL DEFAULT 'index,follow',
    "canonicalUrl" TEXT,
    "businessType" TEXT,
    "serviceArea" TEXT,
    "specializations" TEXT NOT NULL DEFAULT '[]',
    "googleSiteVerification" TEXT,
    "bingSiteVerification" TEXT,
    "googleAnalyticsId" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LandingPage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LandingPage" ("appointmentDuration", "bufferTime", "buttonText", "calendarDescription", "colorScheme", "contactEmail", "coverImage", "createdAt", "description", "formFields", "id", "instagram", "isPublished", "logo", "metaDescription", "metaTitle", "professionalName", "profileImage", "requirePayment", "services", "showCalendar", "slug", "tagline", "title", "updatedAt", "userId", "whatsapp") SELECT "appointmentDuration", "bufferTime", "buttonText", "calendarDescription", "colorScheme", "contactEmail", "coverImage", "createdAt", "description", "formFields", "id", "instagram", "isPublished", "logo", "metaDescription", "metaTitle", "professionalName", "profileImage", "requirePayment", "services", "showCalendar", "slug", "tagline", "title", "updatedAt", "userId", "whatsapp" FROM "LandingPage";
DROP TABLE "LandingPage";
ALTER TABLE "new_LandingPage" RENAME TO "LandingPage";
CREATE UNIQUE INDEX "LandingPage_userId_key" ON "LandingPage"("userId");
CREATE UNIQUE INDEX "LandingPage_slug_key" ON "LandingPage"("slug");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CLIENT',
    "clerkId" TEXT,
    "planId" TEXT,
    "googleAccessToken" TEXT,
    "googleRefreshToken" TEXT,
    "googleCalendarId" TEXT,
    "googleCalendarSync" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("clerkId", "createdAt", "email", "id", "name", "phone", "planId", "role", "updatedAt") SELECT "clerkId", "createdAt", "email", "id", "name", "phone", "planId", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

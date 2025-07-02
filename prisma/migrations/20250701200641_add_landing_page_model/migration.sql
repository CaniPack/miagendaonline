-- CreateTable
CREATE TABLE "LandingPage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "professionalName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "profileImage" TEXT,
    "coverImage" TEXT,
    "logo" TEXT,
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

-- CreateIndex
CREATE UNIQUE INDEX "LandingPage_userId_key" ON "LandingPage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LandingPage_slug_key" ON "LandingPage"("slug");

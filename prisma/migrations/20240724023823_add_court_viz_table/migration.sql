-- CreateTable
CREATE TABLE "CourtViz" (
    "hidePb" BOOLEAN NOT NULL DEFAULT false,
    "hide10s" BOOLEAN NOT NULL DEFAULT false,
    "hideBball" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL PRIMARY KEY,
    CONSTRAINT "CourtViz_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

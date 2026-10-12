/*
  Warnings:

  - Added the required column `year` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Question" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "year" INTEGER NOT NULL,
    "questionNo" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "choiceA" TEXT NOT NULL,
    "choiceB" TEXT NOT NULL,
    "choiceC" TEXT NOT NULL,
    "choiceD" TEXT NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Question" ("category", "choiceA", "choiceB", "choiceC", "choiceD", "correctAnswer", "createdAt", "difficulty", "explanation", "id", "questionNo", "questionText", "updatedAt") SELECT "category", "choiceA", "choiceB", "choiceC", "choiceD", "correctAnswer", "createdAt", "difficulty", "explanation", "id", "questionNo", "questionText", "updatedAt" FROM "Question";
DROP TABLE "Question";
ALTER TABLE "new_Question" RENAME TO "Question";
CREATE INDEX "Question_category_idx" ON "Question"("category");
CREATE INDEX "Question_year_idx" ON "Question"("year");
CREATE UNIQUE INDEX "Question_year_questionNo_key" ON "Question"("year", "questionNo");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

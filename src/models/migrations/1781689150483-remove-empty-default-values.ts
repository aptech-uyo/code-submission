import { MigrationInterface, QueryRunner } from 'typeorm'

export class RemoveEmptyDefaultValues1781689150483 implements MigrationInterface {
  name = 'RemoveEmptyDefaultValues1781689150483'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_submission" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "questionId" integer NOT NULL, "language" varchar NOT NULL, "codeText" text NOT NULL, "studentId" integer NOT NULL, CONSTRAINT "FK_a174d175dc504dce8df5c217014" FOREIGN KEY ("studentId") REFERENCES "student" ("id") ON DELETE SET NULL ON UPDATE CASCADE)`
    )
    await queryRunner.query(
      `INSERT INTO "temporary_submission"("id", "createdAt", "questionId", "language", "codeText", "studentId") SELECT "id", "createdAt", "questionId", "language", "codeText", "studentId" FROM "submission"`
    )
    await queryRunner.query(`DROP TABLE "submission"`)
    await queryRunner.query(`ALTER TABLE "temporary_submission" RENAME TO "submission"`)
    await queryRunner.query(
      `CREATE TABLE "temporary_question" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "statement" varchar NOT NULL, "inputFormatStatement" varchar NOT NULL, "outputFormatStatement" varchar NOT NULL, "constraintList" text, "examples" text NOT NULL, "testCases" text NOT NULL, "title" varchar NOT NULL)`
    )
    await queryRunner.query(
      `INSERT INTO "temporary_question"("id", "createdAt", "statement", "inputFormatStatement", "outputFormatStatement", "constraintList", "examples", "testCases", "title") SELECT "id", "createdAt", "statement", "inputFormatStatement", "outputFormatStatement", "constraintList", "examples", "testCases", "title" FROM "question"`
    )
    await queryRunner.query(`DROP TABLE "question"`)
    await queryRunner.query(`ALTER TABLE "temporary_question" RENAME TO "question"`)
    await queryRunner.query(
      `CREATE TABLE "temporary_submission" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "questionId" integer NOT NULL, "language" varchar NOT NULL, "codeText" text NOT NULL, "studentId" integer NOT NULL, CONSTRAINT "FK_a174d175dc504dce8df5c217014" FOREIGN KEY ("studentId") REFERENCES "student" ("id") ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT "FK_e2589bedf8766da0d54841c79df" FOREIGN KEY ("questionId") REFERENCES "question" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`
    )
    await queryRunner.query(
      `INSERT INTO "temporary_submission"("id", "createdAt", "questionId", "language", "codeText", "studentId") SELECT "id", "createdAt", "questionId", "language", "codeText", "studentId" FROM "submission"`
    )
    await queryRunner.query(`DROP TABLE "submission"`)
    await queryRunner.query(`ALTER TABLE "temporary_submission" RENAME TO "submission"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "submission" RENAME TO "temporary_submission"`)
    await queryRunner.query(
      `CREATE TABLE "submission" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "questionId" integer NOT NULL, "language" varchar NOT NULL, "codeText" text NOT NULL, "studentId" integer NOT NULL, CONSTRAINT "FK_a174d175dc504dce8df5c217014" FOREIGN KEY ("studentId") REFERENCES "student" ("id") ON DELETE SET NULL ON UPDATE CASCADE)`
    )
    await queryRunner.query(
      `INSERT INTO "submission"("id", "createdAt", "questionId", "language", "codeText", "studentId") SELECT "id", "createdAt", "questionId", "language", "codeText", "studentId" FROM "temporary_submission"`
    )
    await queryRunner.query(`DROP TABLE "temporary_submission"`)
    await queryRunner.query(`ALTER TABLE "question" RENAME TO "temporary_question"`)
    await queryRunner.query(
      `CREATE TABLE "question" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "statement" varchar NOT NULL DEFAULT (''), "inputFormatStatement" varchar NOT NULL DEFAULT (''), "outputFormatStatement" varchar NOT NULL DEFAULT (''), "constraintList" text, "examples" text NOT NULL DEFAULT (''), "testCases" text NOT NULL DEFAULT (''), "title" varchar NOT NULL DEFAULT (''))`
    )
    await queryRunner.query(
      `INSERT INTO "question"("id", "createdAt", "statement", "inputFormatStatement", "outputFormatStatement", "constraintList", "examples", "testCases", "title") SELECT "id", "createdAt", "statement", "inputFormatStatement", "outputFormatStatement", "constraintList", "examples", "testCases", "title" FROM "temporary_question"`
    )
    await queryRunner.query(`DROP TABLE "temporary_question"`)
    await queryRunner.query(`ALTER TABLE "submission" RENAME TO "temporary_submission"`)
    await queryRunner.query(
      `CREATE TABLE "submission" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "questionId" integer NOT NULL, "language" varchar NOT NULL, "codeText" text NOT NULL, "studentId" integer NOT NULL, CONSTRAINT "FK_e2589bedf8766da0d54841c79df" FOREIGN KEY ("questionId") REFERENCES "temporary_question" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_a174d175dc504dce8df5c217014" FOREIGN KEY ("studentId") REFERENCES "student" ("id") ON DELETE SET NULL ON UPDATE CASCADE)`
    )
    await queryRunner.query(
      `INSERT INTO "submission"("id", "createdAt", "questionId", "language", "codeText", "studentId") SELECT "id", "createdAt", "questionId", "language", "codeText", "studentId" FROM "temporary_submission"`
    )
    await queryRunner.query(`DROP TABLE "temporary_submission"`)
  }
}

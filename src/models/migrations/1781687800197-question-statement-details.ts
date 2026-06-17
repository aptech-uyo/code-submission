import { MigrationInterface, QueryRunner } from 'typeorm'

export class QuestionStatementDetails1781687800197 implements MigrationInterface {
  name = 'QuestionStatementDetails1781687800197'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_question" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`
    )
    await queryRunner.query(
      `INSERT INTO "temporary_question"("id", "createdAt") SELECT "id", "createdAt" FROM "question"`
    )
    await queryRunner.query(`DROP TABLE "question"`)
    await queryRunner.query(`ALTER TABLE "temporary_question" RENAME TO "question"`)
    await queryRunner.query(
      `CREATE TABLE "temporary_question" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "statement" varchar NOT NULL DEFAULT (''), "inputFormatStatement" varchar NOT NULL DEFAULT (''), "outputFormatStatement" varchar NOT NULL DEFAULT (''), "constraintList" text, "examples" text NOT NULL DEFAULT (''), "testCases" text NOT NULL DEFAULT (''))`
    )
    await queryRunner.query(
      `INSERT INTO "temporary_question"("id", "createdAt") SELECT "id", "createdAt" FROM "question"`
    )
    await queryRunner.query(`DROP TABLE "question"`)
    await queryRunner.query(`ALTER TABLE "temporary_question" RENAME TO "question"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "question" RENAME TO "temporary_question"`)
    await queryRunner.query(
      `CREATE TABLE "question" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`
    )
    await queryRunner.query(
      `INSERT INTO "question"("id", "createdAt") SELECT "id", "createdAt" FROM "temporary_question"`
    )
    await queryRunner.query(`DROP TABLE "temporary_question"`)
    await queryRunner.query(`ALTER TABLE "question" RENAME TO "temporary_question"`)
    await queryRunner.query(
      `CREATE TABLE "question" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "inputLineCount" integer NOT NULL, "outputLineCount" integer NOT NULL)`
    )
    await queryRunner.query(
      `INSERT INTO "question"("id", "createdAt") SELECT "id", "createdAt" FROM "temporary_question"`
    )
    await queryRunner.query(`DROP TABLE "temporary_question"`)
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddTitleFieldToQuestionTable1781688927120 implements MigrationInterface {
  name = 'AddTitleFieldToQuestionTable1781688927120'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_question" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "statement" varchar NOT NULL DEFAULT (''), "inputFormatStatement" varchar NOT NULL DEFAULT (''), "outputFormatStatement" varchar NOT NULL DEFAULT (''), "constraintList" text, "examples" text NOT NULL DEFAULT (''), "testCases" text NOT NULL DEFAULT (''), "title" varchar NOT NULL DEFAULT (''))`
    )
    await queryRunner.query(
      `INSERT INTO "temporary_question"("id", "createdAt", "statement", "inputFormatStatement", "outputFormatStatement", "constraintList", "examples", "testCases") SELECT "id", "createdAt", "statement", "inputFormatStatement", "outputFormatStatement", "constraintList", "examples", "testCases" FROM "question"`
    )
    await queryRunner.query(`DROP TABLE "question"`)
    await queryRunner.query(`ALTER TABLE "temporary_question" RENAME TO "question"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "question" RENAME TO "temporary_question"`)
    await queryRunner.query(
      `CREATE TABLE "question" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "statement" varchar NOT NULL DEFAULT (''), "inputFormatStatement" varchar NOT NULL DEFAULT (''), "outputFormatStatement" varchar NOT NULL DEFAULT (''), "constraintList" text, "examples" text NOT NULL DEFAULT (''), "testCases" text NOT NULL DEFAULT (''))`
    )
    await queryRunner.query(
      `INSERT INTO "question"("id", "createdAt", "statement", "inputFormatStatement", "outputFormatStatement", "constraintList", "examples", "testCases") SELECT "id", "createdAt", "statement", "inputFormatStatement", "outputFormatStatement", "constraintList", "examples", "testCases" FROM "temporary_question"`
    )
    await queryRunner.query(`DROP TABLE "temporary_question"`)
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm'

export class JsonFieldsUseJsonType1781691186013 implements MigrationInterface {
  name = 'JsonFieldsUseJsonType1781691186013'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_question" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "statement" varchar NOT NULL, "inputFormatStatement" varchar NOT NULL, "outputFormatStatement" varchar NOT NULL, "constraintList" json, "examples" json NOT NULL, "testCases" json NOT NULL, "title" varchar NOT NULL)`
    )
    await queryRunner.query(
      `INSERT INTO "temporary_question"("id", "createdAt", "statement", "inputFormatStatement", "outputFormatStatement", "constraintList", "examples", "testCases", "title") SELECT "id", "createdAt", "statement", "inputFormatStatement", "outputFormatStatement", "constraintList", "examples", "testCases", "title" FROM "question"`
    )
    await queryRunner.query(`DROP TABLE "question"`)
    await queryRunner.query(`ALTER TABLE "temporary_question" RENAME TO "question"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "question" RENAME TO "temporary_question"`)
    await queryRunner.query(
      `CREATE TABLE "question" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "statement" varchar NOT NULL, "inputFormatStatement" varchar NOT NULL, "outputFormatStatement" varchar NOT NULL, "constraintList" text, "examples" text NOT NULL, "testCases" text NOT NULL, "title" varchar NOT NULL)`
    )
    await queryRunner.query(
      `INSERT INTO "question"("id", "createdAt", "statement", "inputFormatStatement", "outputFormatStatement", "constraintList", "examples", "testCases", "title") SELECT "id", "createdAt", "statement", "inputFormatStatement", "outputFormatStatement", "constraintList", "examples", "testCases", "title" FROM "temporary_question"`
    )
    await queryRunner.query(`DROP TABLE "temporary_question"`)
  }
}

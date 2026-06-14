import { MigrationInterface, QueryRunner } from 'typeorm'

export class QuestionIoLineCounts1781481150094 implements MigrationInterface {
  name = 'QuestionIoLineCounts1781481150094'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_question" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" text NOT NULL DEFAULT ('now'), "updatedAt" text NOT NULL DEFAULT ('now'), "inputLineCount" integer NOT NULL, "outputLineCount" integer NOT NULL)`
    )
    await queryRunner.query(
      `INSERT INTO "temporary_question"("id", "createdAt", "updatedAt") SELECT "id", "createdAt", "updatedAt" FROM "question"`
    )
    await queryRunner.query(`DROP TABLE "question"`)
    await queryRunner.query(`ALTER TABLE "temporary_question" RENAME TO "question"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "question" RENAME TO "temporary_question"`)
    await queryRunner.query(
      `CREATE TABLE "question" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" text NOT NULL DEFAULT ('now'), "updatedAt" text NOT NULL DEFAULT ('now'))`
    )
    await queryRunner.query(
      `INSERT INTO "question"("id", "createdAt", "updatedAt") SELECT "id", "createdAt", "updatedAt" FROM "temporary_question"`
    )
    await queryRunner.query(`DROP TABLE "temporary_question"`)
  }
}

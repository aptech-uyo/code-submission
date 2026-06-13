import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateInitialTables1781342376260 implements MigrationInterface {
  name = 'CreateInitialTables1781342376260'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "student" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" text NOT NULL DEFAULT ('now'), "updatedAt" text NOT NULL DEFAULT ('now'), "aptechId" varchar NOT NULL, "firstName" varchar NOT NULL, "middleName" varchar NOT NULL, "lastName" varchar NOT NULL, CONSTRAINT "UQ_96ef316574c082a1a3902e252fb" UNIQUE ("aptechId"))`
    )
    await queryRunner.query(
      `CREATE TABLE "question" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" text NOT NULL DEFAULT ('now'), "updatedAt" text NOT NULL DEFAULT ('now'))`
    )
    await queryRunner.query(
      `CREATE TABLE "submission" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" text NOT NULL DEFAULT ('now'), "updatedAt" text NOT NULL DEFAULT ('now'), "questionId" integer NOT NULL, "language" varchar NOT NULL, "codeText" varchar NOT NULL)`
    )
    await queryRunner.query(
      `CREATE TABLE "execution" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" text NOT NULL DEFAULT ('now'), "updatedAt" text NOT NULL DEFAULT ('now'), "status" varchar NOT NULL)`
    )
    await queryRunner.query(
      `CREATE TABLE "temporary_submission" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" text NOT NULL DEFAULT ('now'), "updatedAt" text NOT NULL DEFAULT ('now'), "questionId" integer NOT NULL, "language" varchar NOT NULL, "codeText" varchar NOT NULL, CONSTRAINT "FK_e2589bedf8766da0d54841c79df" FOREIGN KEY ("questionId") REFERENCES "question" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`
    )
    await queryRunner.query(
      `INSERT INTO "temporary_submission"("id", "createdAt", "updatedAt", "questionId", "language", "codeText") SELECT "id", "createdAt", "updatedAt", "questionId", "language", "codeText" FROM "submission"`
    )
    await queryRunner.query(`DROP TABLE "submission"`)
    await queryRunner.query(`ALTER TABLE "temporary_submission" RENAME TO "submission"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "submission" RENAME TO "temporary_submission"`)
    await queryRunner.query(
      `CREATE TABLE "submission" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" text NOT NULL DEFAULT ('now'), "updatedAt" text NOT NULL DEFAULT ('now'), "questionId" integer NOT NULL, "language" varchar NOT NULL, "codeText" varchar NOT NULL)`
    )
    await queryRunner.query(
      `INSERT INTO "submission"("id", "createdAt", "updatedAt", "questionId", "language", "codeText") SELECT "id", "createdAt", "updatedAt", "questionId", "language", "codeText" FROM "temporary_submission"`
    )
    await queryRunner.query(`DROP TABLE "temporary_submission"`)
    await queryRunner.query(`DROP TABLE "execution"`)
    await queryRunner.query(`DROP TABLE "submission"`)
    await queryRunner.query(`DROP TABLE "question"`)
    await queryRunner.query(`DROP TABLE "student"`)
  }
}

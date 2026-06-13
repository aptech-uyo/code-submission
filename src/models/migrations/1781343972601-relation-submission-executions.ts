import { MigrationInterface, QueryRunner } from 'typeorm'

export class RelationSubmissionExecutions1781343972601 implements MigrationInterface {
  name = 'RelationSubmissionExecutions1781343972601'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_execution" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" text NOT NULL DEFAULT ('now'), "updatedAt" text NOT NULL DEFAULT ('now'), "status" varchar NOT NULL, "submissionId" integer NOT NULL)`
    )
    await queryRunner.query(
      `INSERT INTO "temporary_execution"("id", "createdAt", "updatedAt", "status") SELECT "id", "createdAt", "updatedAt", "status" FROM "execution"`
    )
    await queryRunner.query(`DROP TABLE "execution"`)
    await queryRunner.query(`ALTER TABLE "temporary_execution" RENAME TO "execution"`)
    await queryRunner.query(
      `CREATE TABLE "temporary_execution" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" text NOT NULL DEFAULT ('now'), "updatedAt" text NOT NULL DEFAULT ('now'), "status" varchar NOT NULL, "submissionId" integer NOT NULL, CONSTRAINT "FK_044cac0b16be8c22c54e4807d89" FOREIGN KEY ("submissionId") REFERENCES "submission" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`
    )
    await queryRunner.query(
      `INSERT INTO "temporary_execution"("id", "createdAt", "updatedAt", "status", "submissionId") SELECT "id", "createdAt", "updatedAt", "status", "submissionId" FROM "execution"`
    )
    await queryRunner.query(`DROP TABLE "execution"`)
    await queryRunner.query(`ALTER TABLE "temporary_execution" RENAME TO "execution"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "execution" RENAME TO "temporary_execution"`)
    await queryRunner.query(
      `CREATE TABLE "execution" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" text NOT NULL DEFAULT ('now'), "updatedAt" text NOT NULL DEFAULT ('now'), "status" varchar NOT NULL, "submissionId" integer NOT NULL)`
    )
    await queryRunner.query(
      `INSERT INTO "execution"("id", "createdAt", "updatedAt", "status", "submissionId") SELECT "id", "createdAt", "updatedAt", "status", "submissionId" FROM "temporary_execution"`
    )
    await queryRunner.query(`DROP TABLE "temporary_execution"`)
    await queryRunner.query(`ALTER TABLE "execution" RENAME TO "temporary_execution"`)
    await queryRunner.query(
      `CREATE TABLE "execution" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" text NOT NULL DEFAULT ('now'), "updatedAt" text NOT NULL DEFAULT ('now'), "status" varchar NOT NULL)`
    )
    await queryRunner.query(
      `INSERT INTO "execution"("id", "createdAt", "updatedAt", "status") SELECT "id", "createdAt", "updatedAt", "status" FROM "temporary_execution"`
    )
    await queryRunner.query(`DROP TABLE "temporary_execution"`)
  }
}

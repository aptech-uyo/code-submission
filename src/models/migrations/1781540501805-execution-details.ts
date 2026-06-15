import { MigrationInterface, QueryRunner } from "typeorm";

export class ExecutionDetails1781540501805 implements MigrationInterface {
    name = 'ExecutionDetails1781540501805'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_student" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" text NOT NULL DEFAULT ('now'), "updatedAt" text NOT NULL DEFAULT ('now'), "aptechId" varchar NOT NULL, "firstName" varchar NOT NULL, "middleName" varchar NOT NULL, "lastName" varchar NOT NULL, CONSTRAINT "UQ_96ef316574c082a1a3902e252fb" UNIQUE ("aptechId"))`);
        await queryRunner.query(`INSERT INTO "temporary_student"("id", "createdAt", "updatedAt", "aptechId", "firstName", "middleName", "lastName") SELECT "id", "createdAt", "updatedAt", "aptechId", "firstName", "middleName", "lastName" FROM "student"`);
        await queryRunner.query(`DROP TABLE "student"`);
        await queryRunner.query(`ALTER TABLE "temporary_student" RENAME TO "student"`);
        await queryRunner.query(`CREATE TABLE "temporary_submission" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" text NOT NULL DEFAULT ('now'), "updatedAt" text NOT NULL DEFAULT ('now'), "questionId" integer NOT NULL, "language" varchar NOT NULL, "codeText" varchar NOT NULL, "studentId" integer NOT NULL, CONSTRAINT "FK_e2589bedf8766da0d54841c79df" FOREIGN KEY ("questionId") REFERENCES "question" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`);
        await queryRunner.query(`INSERT INTO "temporary_submission"("id", "createdAt", "updatedAt", "questionId", "language", "codeText") SELECT "id", "createdAt", "updatedAt", "questionId", "language", "codeText" FROM "submission"`);
        await queryRunner.query(`DROP TABLE "submission"`);
        await queryRunner.query(`ALTER TABLE "temporary_submission" RENAME TO "submission"`);
        await queryRunner.query(`CREATE TABLE "temporary_execution" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" text NOT NULL DEFAULT ('now'), "updatedAt" text NOT NULL DEFAULT ('now'), "status" varchar NOT NULL, "submissionId" integer NOT NULL, "output" text, "errorMessage" text, CONSTRAINT "FK_044cac0b16be8c22c54e4807d89" FOREIGN KEY ("submissionId") REFERENCES "submission" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`);
        await queryRunner.query(`INSERT INTO "temporary_execution"("id", "createdAt", "updatedAt", "status", "submissionId") SELECT "id", "createdAt", "updatedAt", "status", "submissionId" FROM "execution"`);
        await queryRunner.query(`DROP TABLE "execution"`);
        await queryRunner.query(`ALTER TABLE "temporary_execution" RENAME TO "execution"`);
        await queryRunner.query(`CREATE TABLE "temporary_student" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" text NOT NULL DEFAULT ('now'), "updatedAt" text NOT NULL DEFAULT ('now'), "aptechId" varchar NOT NULL, "firstName" varchar NOT NULL, "middleName" varchar, "lastName" varchar NOT NULL, CONSTRAINT "UQ_96ef316574c082a1a3902e252fb" UNIQUE ("aptechId"))`);
        await queryRunner.query(`INSERT INTO "temporary_student"("id", "createdAt", "updatedAt", "aptechId", "firstName", "middleName", "lastName") SELECT "id", "createdAt", "updatedAt", "aptechId", "firstName", "middleName", "lastName" FROM "student"`);
        await queryRunner.query(`DROP TABLE "student"`);
        await queryRunner.query(`ALTER TABLE "temporary_student" RENAME TO "student"`);
        await queryRunner.query(`CREATE TABLE "temporary_submission" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" text NOT NULL DEFAULT ('now'), "updatedAt" text NOT NULL DEFAULT ('now'), "questionId" integer NOT NULL, "language" varchar NOT NULL, "codeText" text NOT NULL, "studentId" integer NOT NULL, CONSTRAINT "FK_e2589bedf8766da0d54841c79df" FOREIGN KEY ("questionId") REFERENCES "question" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`);
        await queryRunner.query(`INSERT INTO "temporary_submission"("id", "createdAt", "updatedAt", "questionId", "language", "codeText", "studentId") SELECT "id", "createdAt", "updatedAt", "questionId", "language", "codeText", "studentId" FROM "submission"`);
        await queryRunner.query(`DROP TABLE "submission"`);
        await queryRunner.query(`ALTER TABLE "temporary_submission" RENAME TO "submission"`);
        await queryRunner.query(`CREATE TABLE "temporary_submission" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" text NOT NULL DEFAULT ('now'), "updatedAt" text NOT NULL DEFAULT ('now'), "questionId" integer NOT NULL, "language" varchar NOT NULL, "codeText" text NOT NULL, "studentId" integer NOT NULL, CONSTRAINT "FK_e2589bedf8766da0d54841c79df" FOREIGN KEY ("questionId") REFERENCES "question" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_a174d175dc504dce8df5c217014" FOREIGN KEY ("studentId") REFERENCES "student" ("id") ON DELETE SET NULL ON UPDATE CASCADE)`);
        await queryRunner.query(`INSERT INTO "temporary_submission"("id", "createdAt", "updatedAt", "questionId", "language", "codeText", "studentId") SELECT "id", "createdAt", "updatedAt", "questionId", "language", "codeText", "studentId" FROM "submission"`);
        await queryRunner.query(`DROP TABLE "submission"`);
        await queryRunner.query(`ALTER TABLE "temporary_submission" RENAME TO "submission"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "submission" RENAME TO "temporary_submission"`);
        await queryRunner.query(`CREATE TABLE "submission" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" text NOT NULL DEFAULT ('now'), "updatedAt" text NOT NULL DEFAULT ('now'), "questionId" integer NOT NULL, "language" varchar NOT NULL, "codeText" text NOT NULL, "studentId" integer NOT NULL, CONSTRAINT "FK_e2589bedf8766da0d54841c79df" FOREIGN KEY ("questionId") REFERENCES "question" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`);
        await queryRunner.query(`INSERT INTO "submission"("id", "createdAt", "updatedAt", "questionId", "language", "codeText", "studentId") SELECT "id", "createdAt", "updatedAt", "questionId", "language", "codeText", "studentId" FROM "temporary_submission"`);
        await queryRunner.query(`DROP TABLE "temporary_submission"`);
        await queryRunner.query(`ALTER TABLE "submission" RENAME TO "temporary_submission"`);
        await queryRunner.query(`CREATE TABLE "submission" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" text NOT NULL DEFAULT ('now'), "updatedAt" text NOT NULL DEFAULT ('now'), "questionId" integer NOT NULL, "language" varchar NOT NULL, "codeText" varchar NOT NULL, "studentId" integer NOT NULL, CONSTRAINT "FK_e2589bedf8766da0d54841c79df" FOREIGN KEY ("questionId") REFERENCES "question" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`);
        await queryRunner.query(`INSERT INTO "submission"("id", "createdAt", "updatedAt", "questionId", "language", "codeText", "studentId") SELECT "id", "createdAt", "updatedAt", "questionId", "language", "codeText", "studentId" FROM "temporary_submission"`);
        await queryRunner.query(`DROP TABLE "temporary_submission"`);
        await queryRunner.query(`ALTER TABLE "student" RENAME TO "temporary_student"`);
        await queryRunner.query(`CREATE TABLE "student" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" text NOT NULL DEFAULT ('now'), "updatedAt" text NOT NULL DEFAULT ('now'), "aptechId" varchar NOT NULL, "firstName" varchar NOT NULL, "middleName" varchar NOT NULL, "lastName" varchar NOT NULL, CONSTRAINT "UQ_96ef316574c082a1a3902e252fb" UNIQUE ("aptechId"))`);
        await queryRunner.query(`INSERT INTO "student"("id", "createdAt", "updatedAt", "aptechId", "firstName", "middleName", "lastName") SELECT "id", "createdAt", "updatedAt", "aptechId", "firstName", "middleName", "lastName" FROM "temporary_student"`);
        await queryRunner.query(`DROP TABLE "temporary_student"`);
        await queryRunner.query(`ALTER TABLE "execution" RENAME TO "temporary_execution"`);
        await queryRunner.query(`CREATE TABLE "execution" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" text NOT NULL DEFAULT ('now'), "updatedAt" text NOT NULL DEFAULT ('now'), "status" varchar NOT NULL, "submissionId" integer NOT NULL, CONSTRAINT "FK_044cac0b16be8c22c54e4807d89" FOREIGN KEY ("submissionId") REFERENCES "submission" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`);
        await queryRunner.query(`INSERT INTO "execution"("id", "createdAt", "updatedAt", "status", "submissionId") SELECT "id", "createdAt", "updatedAt", "status", "submissionId" FROM "temporary_execution"`);
        await queryRunner.query(`DROP TABLE "temporary_execution"`);
        await queryRunner.query(`ALTER TABLE "submission" RENAME TO "temporary_submission"`);
        await queryRunner.query(`CREATE TABLE "submission" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" text NOT NULL DEFAULT ('now'), "updatedAt" text NOT NULL DEFAULT ('now'), "questionId" integer NOT NULL, "language" varchar NOT NULL, "codeText" varchar NOT NULL, CONSTRAINT "FK_e2589bedf8766da0d54841c79df" FOREIGN KEY ("questionId") REFERENCES "question" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`);
        await queryRunner.query(`INSERT INTO "submission"("id", "createdAt", "updatedAt", "questionId", "language", "codeText") SELECT "id", "createdAt", "updatedAt", "questionId", "language", "codeText" FROM "temporary_submission"`);
        await queryRunner.query(`DROP TABLE "temporary_submission"`);
        await queryRunner.query(`ALTER TABLE "student" RENAME TO "temporary_student"`);
        await queryRunner.query(`CREATE TABLE "student" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" text NOT NULL DEFAULT ('now'), "updatedAt" text NOT NULL DEFAULT ('now'), "aptechId" varchar NOT NULL, "firstName" varchar NOT NULL, "middleName" varchar NOT NULL, "lastName" varchar NOT NULL, CONSTRAINT "UQ_96ef316574c082a1a3902e252fb" UNIQUE ("aptechId"))`);
        await queryRunner.query(`INSERT INTO "student"("id", "createdAt", "updatedAt", "aptechId", "firstName", "middleName", "lastName") SELECT "id", "createdAt", "updatedAt", "aptechId", "firstName", "middleName", "lastName" FROM "temporary_student"`);
        await queryRunner.query(`DROP TABLE "temporary_student"`);
    }

}

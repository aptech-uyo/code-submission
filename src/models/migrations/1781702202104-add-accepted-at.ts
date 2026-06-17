import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAcceptedAt1781702202104 implements MigrationInterface {
    name = 'AddAcceptedAt1781702202104'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_submission" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "questionId" integer NOT NULL, "language" varchar NOT NULL, "codeText" text NOT NULL, "studentId" integer NOT NULL, "acceptedAt" datetime, CONSTRAINT "FK_e2589bedf8766da0d54841c79df" FOREIGN KEY ("questionId") REFERENCES "question" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_a174d175dc504dce8df5c217014" FOREIGN KEY ("studentId") REFERENCES "student" ("id") ON DELETE SET NULL ON UPDATE CASCADE)`);
        await queryRunner.query(`INSERT INTO "temporary_submission"("id", "createdAt", "questionId", "language", "codeText", "studentId") SELECT "id", "createdAt", "questionId", "language", "codeText", "studentId" FROM "submission"`);
        await queryRunner.query(`DROP TABLE "submission"`);
        await queryRunner.query(`ALTER TABLE "temporary_submission" RENAME TO "submission"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "submission" RENAME TO "temporary_submission"`);
        await queryRunner.query(`CREATE TABLE "submission" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "questionId" integer NOT NULL, "language" varchar NOT NULL, "codeText" text NOT NULL, "studentId" integer NOT NULL, CONSTRAINT "FK_e2589bedf8766da0d54841c79df" FOREIGN KEY ("questionId") REFERENCES "question" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_a174d175dc504dce8df5c217014" FOREIGN KEY ("studentId") REFERENCES "student" ("id") ON DELETE SET NULL ON UPDATE CASCADE)`);
        await queryRunner.query(`INSERT INTO "submission"("id", "createdAt", "questionId", "language", "codeText", "studentId") SELECT "id", "createdAt", "questionId", "language", "codeText", "studentId" FROM "temporary_submission"`);
        await queryRunner.query(`DROP TABLE "temporary_submission"`);
    }

}

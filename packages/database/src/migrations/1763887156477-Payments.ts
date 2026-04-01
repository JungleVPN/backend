import { MigrationInterface, QueryRunner } from 'typeorm';

export class Payments1763887156477 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "payments" (
                "id" character varying NOT NULL,
                "userId" character varying,
                "provider" character varying NOT NULL,
                "amount" character varying NOT NULL,
                "currency" character varying NOT NULL,
                "status" character varying NOT NULL DEFAULT 'pending',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "paidAt" TIMESTAMP NOT NULL DEFAULT now(),
                "url" character varying,
                CONSTRAINT "PK_197ab7af18c93fbb4c940a4260e" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "payments"`);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSavedPaymentMethodsTable1775070000000 implements MigrationInterface {
  name = 'AddSavedPaymentMethodsTable1775070000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "saved_payment_methods" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" character varying NOT NULL,
        "provider" character varying NOT NULL DEFAULT 'yookassa',
        "paymentMethodId" character varying NOT NULL,
        "paymentMethodType" character varying NOT NULL,
        "title" character varying,
        "card" jsonb,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_saved_payment_methods" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_saved_payment_methods_userId" ON "saved_payment_methods" ("userId")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_saved_payment_methods_paymentMethodId"
      ON "saved_payment_methods" ("paymentMethodId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_saved_payment_methods_paymentMethodId"`);
    await queryRunner.query(`DROP INDEX "IDX_saved_payment_methods_userId"`);
    await queryRunner.query(`DROP TABLE "saved_payment_methods"`);
  }
}

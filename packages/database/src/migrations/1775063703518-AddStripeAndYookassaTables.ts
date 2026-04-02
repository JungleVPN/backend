import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStripeAndYookassaTables1775063703518 implements MigrationInterface {
  name = 'AddStripeAndYookassaTables1775063703518';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "stripe_payments" ("id" character varying NOT NULL, "userId" character varying, "customer" character varying, "stripeSubscriptionId" character varying, "amount" integer, "currency" character varying NOT NULL DEFAULT 'EUR', "status" character varying NOT NULL DEFAULT 'pending', "url" character varying, "invoiceUrl" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "paidAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_9dd455cd741fb7a463c2cb47927" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "yookassa_payments" ("id" character varying NOT NULL, "userId" character varying, "amount" integer, "currency" character varying NOT NULL DEFAULT 'RUB', "status" character varying NOT NULL DEFAULT 'pending', "url" character varying, "description" character varying, "metadata" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "paidAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_c9d132f8113c5de8efc54e0e7a8" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "yookassa_payments"`);
    await queryRunner.query(`DROP TABLE "stripe_payments"`);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1765207405708 implements MigrationInterface {
  name = 'Migration1765207405708';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // add new columns
    await queryRunner.query(`
      ALTER TABLE "payments"
      ADD COLUMN IF NOT EXISTS "stripeCustomerId" character varying,
      ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" character varying,
      ADD COLUMN IF NOT EXISTS "invoiceUrl" character varying,
      ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    `);

    // change amount type
    await queryRunner.query(`
      ALTER TABLE "payments"
      ALTER COLUMN "amount" TYPE integer USING "amount"::integer
    `);

    // currency becomes nullable
    await queryRunner.query(`
      ALTER TABLE "payments"
      ALTER COLUMN "currency" DROP NOT NULL
    `);

    // timestamps → with time zone
    await queryRunner.query(`
      ALTER TABLE "payments"
      ALTER COLUMN "createdAt" TYPE TIMESTAMP WITH TIME ZONE USING "createdAt" AT TIME ZONE 'UTC',
      ALTER COLUMN "paidAt" DROP NOT NULL,
      ALTER COLUMN "paidAt" DROP DEFAULT,
      ALTER COLUMN "paidAt" TYPE TIMESTAMP WITH TIME ZONE USING "paidAt" AT TIME ZONE 'UTC'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // revert timestamps
    await queryRunner.query(`
      ALTER TABLE "payments"
      ALTER COLUMN "createdAt" TYPE TIMESTAMP USING "createdAt",
      ALTER COLUMN "paidAt" TYPE TIMESTAMP USING "paidAt",
      ALTER COLUMN "paidAt" SET DEFAULT now(),
      ALTER COLUMN "paidAt" SET NOT NULL
    `);

    // revert currency
    await queryRunner.query(`
      ALTER TABLE "payments"
      ALTER COLUMN "currency" SET NOT NULL
    `);

    // revert amount
    await queryRunner.query(`
      ALTER TABLE "payments"
      ALTER COLUMN "amount" TYPE character varying USING "amount"::text
    `);

    // drop added columns
    await queryRunner.query(`
      ALTER TABLE "payments"
      DROP COLUMN IF EXISTS "stripeCustomerId",
      DROP COLUMN IF EXISTS "stripeSubscriptionId",
      DROP COLUMN IF EXISTS "invoiceUrl",
      DROP COLUMN IF EXISTS "updatedAt"
    `);
  }
}

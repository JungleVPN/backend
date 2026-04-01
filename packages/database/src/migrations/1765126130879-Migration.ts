import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1765126130879 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Using IF NOT EXISTS to prevent errors if the column was already added by a previous (failed/partial) migration
    await queryRunner.query(
      `ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "stripeCustomerId" varchar`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" varchar`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN IF EXISTS "stripeCustomerId"`);
    await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN IF EXISTS "stripeSubscriptionId"`);
  }
}

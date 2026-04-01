import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixAmountType1763887156478 implements MigrationInterface {
  name = 'FixAmountType1763887156478';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop constraint if it exists (for safety, though implicit with type change usually fine for simple types)
    // ALTER COLUMN type automatically handles conversion if possible.
    // Since "99.00" (string) might be in there if it was varchar before, or integer 99 if integer.
    // Postgres allows casting integer to varchar freely.
    await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "amount" TYPE character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverting to integer might fail if there are non-integer strings like "99.00"
    // But for completeness:
    await queryRunner.query(
      `ALTER TABLE "payments" ALTER COLUMN "amount" TYPE integer USING "amount"::integer`,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1764450951447 implements MigrationInterface {
  name = 'Migration1764450951447';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "amount"`);
    await queryRunner.query(`ALTER TABLE "payments" ADD "amount" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "amount"`);
    await queryRunner.query(`ALTER TABLE "payments" ADD "amount" character varying`);
  }
}

import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1769619095837 implements MigrationInterface {
    name = 'Migration1769619095837'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "referrals" DROP CONSTRAINT "UQ_2c1ee5e67f6364c1f1193174be8"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "referrals" ADD CONSTRAINT "UQ_2c1ee5e67f6364c1f1193174be8" UNIQUE ("inviterId")`);
    }

}

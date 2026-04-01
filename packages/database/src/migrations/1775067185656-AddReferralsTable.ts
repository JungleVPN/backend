import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReferralsTable1775067185656 implements MigrationInterface {
    name = 'AddReferralsTable1775067185656'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "referrals" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "referrals" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "referrals" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "referrals" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

}

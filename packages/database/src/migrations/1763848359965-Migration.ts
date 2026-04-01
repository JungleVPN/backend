import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1763848359965 implements MigrationInterface {
    name = 'Migration1763848359965'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "referrals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "inviterId" bigint NOT NULL, "invitedId" bigint NOT NULL, "status" character varying NOT NULL DEFAULT 'PENDING', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_2c1ee5e67f6364c1f1193174be8" UNIQUE ("inviterId"), CONSTRAINT "UQ_6de61a8c3f58b6f3597775b992f" UNIQUE ("invitedId"), CONSTRAINT "PK_ea9980e34f738b6252817326c08" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "referrals"`);
    }

}

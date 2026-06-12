import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration17812833362131781283336213 implements MigrationInterface {
    name = 'Migration17812833362131781283336213'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "person_address" DROP CONSTRAINT "FK_f79a1d5a864499940a8ecf95f83"`);
        await queryRunner.query(`ALTER TABLE "person_address" DROP COLUMN "personId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "person_address" ADD "personId" integer`);
        await queryRunner.query(`ALTER TABLE "person_address" ADD CONSTRAINT "FK_f79a1d5a864499940a8ecf95f83" FOREIGN KEY ("personId") REFERENCES "person"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}

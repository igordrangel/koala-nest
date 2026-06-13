import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPersonActive1781284000000 implements MigrationInterface {
  name = 'AddPersonActive1781284000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "person" ADD "active" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "person" DROP COLUMN "active"`);
  }
}

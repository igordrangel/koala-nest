import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPersonAddressRelation1781282000000 implements MigrationInterface {
  name = 'AddPersonAddressRelation1781282000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "person" ADD "addressId" integer`);
    await queryRunner.query(
      `ALTER TABLE "person" ADD CONSTRAINT "FK_person_addressId" FOREIGN KEY ("addressId") REFERENCES "person_address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "person" DROP CONSTRAINT "FK_person_addressId"`,
    );
    await queryRunner.query(`ALTER TABLE "person" DROP COLUMN "addressId"`);
  }
}

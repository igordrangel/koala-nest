import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration17812830673611781283067361 implements MigrationInterface {
  name = 'Migration17812830673611781283067361';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "person_contact" DROP CONSTRAINT "FK_df8723423f0c007013d5b8574d3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "person" DROP CONSTRAINT "FK_person_addressId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "person" ADD CONSTRAINT "UQ_a793ed25458ce9bc1584889cb13" UNIQUE ("addressId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "person_contact" ADD CONSTRAINT "FK_df8723423f0c007013d5b8574d3" FOREIGN KEY ("personId") REFERENCES "person"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "person" ADD CONSTRAINT "FK_a793ed25458ce9bc1584889cb13" FOREIGN KEY ("addressId") REFERENCES "person_address"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "person" DROP CONSTRAINT "FK_a793ed25458ce9bc1584889cb13"`,
    );
    await queryRunner.query(
      `ALTER TABLE "person_contact" DROP CONSTRAINT "FK_df8723423f0c007013d5b8574d3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "person" DROP CONSTRAINT "UQ_a793ed25458ce9bc1584889cb13"`,
    );
    await queryRunner.query(
      `ALTER TABLE "person" ADD CONSTRAINT "FK_person_addressId" FOREIGN KEY ("addressId") REFERENCES "person_address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "person_contact" ADD CONSTRAINT "FK_df8723423f0c007013d5b8574d3" FOREIGN KEY ("personId") REFERENCES "person"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1781281330533 implements MigrationInterface {
  name = 'Init1781281330533';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "person_address" ("id" SERIAL NOT NULL, "address" character varying NOT NULL, CONSTRAINT "PK_cd587348ca3fec07931de208299" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "person" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_5fdaf670315c4b7e70cce85daa3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "person_contact" ("id" SERIAL NOT NULL, "contact" character varying NOT NULL, "personId" integer, CONSTRAINT "PK_1094fd036d694f9949ef1c19e39" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "person_contact" ADD CONSTRAINT "FK_df8723423f0c007013d5b8574d3" FOREIGN KEY ("personId") REFERENCES "person"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "person_contact" DROP CONSTRAINT "FK_df8723423f0c007013d5b8574d3"`,
    );
    await queryRunner.query(`DROP TABLE "person_contact"`);
    await queryRunner.query(`DROP TABLE "person"`);
    await queryRunner.query(`DROP TABLE "person_address"`);
  }
}

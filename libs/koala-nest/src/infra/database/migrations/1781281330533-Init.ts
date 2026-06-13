import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1781281330533 implements MigrationInterface {
  name = 'Init1781281330533';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "person_address" ("id" SERIAL NOT NULL, "address" character varying NOT NULL, CONSTRAINT "PK_cd587348ca3fec07931de208299" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "person" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "active" boolean NOT NULL DEFAULT true, "addressId" integer, CONSTRAINT "PK_5fdaf670315c4b7e70cce85daa3" PRIMARY KEY ("id"), CONSTRAINT "UQ_a793ed25458ce9bc1584889cb13" UNIQUE ("addressId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "person_contact" ("id" SERIAL NOT NULL, "contact" character varying NOT NULL, "personId" integer, CONSTRAINT "PK_1094fd036d694f9949ef1c19e39" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "person_contact" ADD CONSTRAINT "FK_df8723423f0c007013d5b8574d3" FOREIGN KEY ("personId") REFERENCES "person"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "person" ADD CONSTRAINT "FK_a793ed25458ce9bc1584889cb13" FOREIGN KEY ("addressId") REFERENCES "person_address"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "login" character varying NOT NULL,
        "password" character varying NOT NULL,
        "profile" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'active',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "UQ_users_login" UNIQUE ("login"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      INSERT INTO "users" ("name", "email", "login", "password", "profile", "status")
      VALUES (
        'Admin Demo',
        'admin@example.com',
        'admin.demo',
        '$2b$06$eyA412UuUAPsAOBREzXPue1AJW.GLAwjenHRSBVCc1.gB1AcASWo6',
        'admin',
        'active'
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(
      `ALTER TABLE "person" DROP CONSTRAINT "FK_a793ed25458ce9bc1584889cb13"`,
    );
    await queryRunner.query(
      `ALTER TABLE "person_contact" DROP CONSTRAINT "FK_df8723423f0c007013d5b8574d3"`,
    );
    await queryRunner.query(`DROP TABLE "person_contact"`);
    await queryRunner.query(`DROP TABLE "person"`);
    await queryRunner.query(`DROP TABLE "person_address"`);
  }
}

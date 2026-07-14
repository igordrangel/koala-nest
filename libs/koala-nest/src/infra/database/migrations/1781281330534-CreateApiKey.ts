import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateApiKey1781281330534 implements MigrationInterface {
  name = 'CreateApiKey1781281330534';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "api_key" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "type" character varying NOT NULL,
        "origin" character varying NOT NULL,
        "key" character varying NOT NULL,
        "user_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_api_key_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_api_key_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_api_key_user_id" ON "api_key" ("user_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_api_key_user_id"`);
    await queryRunner.query(`DROP TABLE "api_key"`);
  }
}

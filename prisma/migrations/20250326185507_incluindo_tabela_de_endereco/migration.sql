/*
  Warnings:

  - Added the required column `person_address_id` to the `person` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "person" ADD COLUMN     "person_address_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "person_address" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "person_address_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "person" ADD CONSTRAINT "person_person_address_id_fkey" FOREIGN KEY ("person_address_id") REFERENCES "person_address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

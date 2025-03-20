/*
  Warnings:

  - You are about to drop the `Person` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PersonPhone` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PersonPhone" DROP CONSTRAINT "PersonPhone_personId_fkey";

-- DropTable
DROP TABLE "Person";

-- DropTable
DROP TABLE "PersonPhone";

-- CreateTable
CREATE TABLE "person" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_phone" (
    "id" SERIAL NOT NULL,
    "phone" TEXT NOT NULL,
    "person_id" INTEGER NOT NULL,

    CONSTRAINT "person_phone_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "person_phone" ADD CONSTRAINT "person_phone_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

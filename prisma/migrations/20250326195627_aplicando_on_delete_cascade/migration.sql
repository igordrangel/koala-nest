-- DropForeignKey
ALTER TABLE "person" DROP CONSTRAINT "person_person_address_id_fkey";

-- AddForeignKey
ALTER TABLE "person" ADD CONSTRAINT "person_person_address_id_fkey" FOREIGN KEY ("person_address_id") REFERENCES "person_address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

import { createE2EDatabase } from '@koalarx/nest/test/utils/create-e2e-database'
import { dropE2EDatabase } from '@koalarx/nest/test/utils/drop-e2e-database'

let schemaId: string

beforeAll(async () => {
  schemaId = await createE2EDatabase('bun')
}, 60000)

afterAll(async () => {
  await dropE2EDatabase(schemaId)
})

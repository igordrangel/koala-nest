import { createE2EDatabase } from '@koalarx/nest/test/utils/create-e2e-database'
import { dropE2EDatabase } from '@koalarx/nest/test/utils/drop-e2e-database'

let schemaId: string

beforeAll(() => (schemaId = createE2EDatabase()), 40000)
afterAll(async () => dropE2EDatabase(schemaId))

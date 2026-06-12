import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { getSourceCodePath } from "./get-source-code-path";
import { resolveProjectPath } from "./resolve-project-pach";
import { formatCode } from "./format-code";
import { getPackageManager } from "./get-package-manager";

export async function removeSampleParts(projectName: string) {
  const repositoryModuleContent = readFileSync(
    path.join(
      getSourceCodePath(),
      "src/infra/repositories/repository.module.ts",
    ),
    "utf8",
  )
    .replace(
      "import { IPersonRepository } from '@/domain/repositories/iperson.repository';",
      "",
    )
    .replace("import { PersonRepository } from './person.repository';", "")
    .replace(
      "providers: [{ provide: IPersonRepository, useClass: PersonRepository }],\n",
      "",
    )
    .replace(", IPersonRepository", "");

  writeFileSync(
    path.join(
      resolveProjectPath(projectName),
      "src/infra/repositories/repository.module.ts",
    ),
    repositoryModuleContent,
    "utf8",
  );

  const dataSourceFactoryContent = readFileSync(
    path.join(getSourceCodePath(), "src/infra/database/data-source-factory.ts"),
    "utf8",
  )
    .replace(
      "import { Person } from '@/domain/entities/person/person';\nimport { PersonAddress } from '@/domain/entities/person/person-address';\nimport { PersonContact } from '@/domain/entities/person/person-contact';\n",
      "",
    )
    .replace(
      "entities: [Person, PersonAddress, PersonContact],",
      "entities: [],",
    );

  writeFileSync(
    path.join(
      resolveProjectPath(projectName),
      "src/infra/database/data-source-factory.ts",
    ),
    dataSourceFactoryContent,
    "utf8",
  );

  await formatCode(projectName);
}

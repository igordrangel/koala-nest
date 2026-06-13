import { readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { formatCode } from "./format-code";
import { resolveProjectPath } from "./resolve-project-pach";

interface PartsToRemove {
  path: string;
  removeImports?: string[];
  replace?: {
    from: string;
    to: string;
  }[];
}

const partsToRemove: PartsToRemove[] = [
  {
    path: "src/infra/repositories/repository.module.ts",
    removeImports: [
      "@/domain/repositories/iperson.repository",
      "./person.repository",
    ],
    replace: [
      {
        from: "providers: [{ provide: IPersonRepository, useClass: PersonRepository }],\n",
        to: "",
      },
      { from: ", IPersonRepository", to: "" },
    ],
  },
  {
    path: "src/infra/database/data-source-factory.ts",
    removeImports: [
      "@/domain/entities/person/person",
      "@/domain/entities/person/person-address",
      "@/domain/entities/person/person-contact",
    ],
    replace: [
      {
        from: "entities: [Person, PersonAddress, PersonContact],",
        to: "entities: [],",
      },
    ],
  },
  {
    path: "src/host/app.module.ts",
    removeImports: ["./controllers/person/person.module"],
    replace: [{ from: "PersonModule,\n", to: "" }],
  },
  {
    path: "src/application/mapping/mapping.provider.ts",
    removeImports: ["./person.mapper"],
    replace: [{ from: "PersonMapper.createMap();", to: "" }],
  },
];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function removeImportLines(content: string, moduleSpecifiers: string[]) {
  let result = content;

  for (const specifier of moduleSpecifiers) {
    const pattern = new RegExp(
      `^import\\s+(?:type\\s+)?(?:[^'";\\n]+|\\{[^}]*\\})\\s+from\\s+['"][^'"]*${escapeRegExp(specifier)}['"];?\\r?\\n`,
      "gm",
    );

    result = result.replace(pattern, "");
  }

  return result;
}

export async function removeSampleParts(projectName: string) {
  for (const part of partsToRemove) {
    const partPath = path.join(resolveProjectPath(projectName), part.path);

    let content = readFileSync(partPath, "utf8");

    if (part.removeImports?.length) {
      content = removeImportLines(content, part.removeImports);
    }

    for (const replace of part.replace ?? []) {
      content = content.replace(replace.from, replace.to);
    }

    writeFileSync(partPath, content, "utf8");
  }

  rmSync(path.join(resolveProjectPath(projectName), "src/test/application"), {
    recursive: true,
    force: true,
  });

  await formatCode(projectName);
}

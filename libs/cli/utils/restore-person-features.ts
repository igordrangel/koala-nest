import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { getSourceCodePath } from "./get-source-code-path";
import { resolveProjectPath } from "./resolve-project-path";

function projectFile(projectName: string, relativePath: string) {
  return path.join(resolveProjectPath(projectName), relativePath);
}

export function copyFromTemplate(relativePath: string, projectName = "") {
  const sourcePath = path.join(getSourceCodePath(), relativePath);
  const targetPath = projectFile(projectName, relativePath);

  mkdirSync(path.dirname(targetPath), { recursive: true });
  cpSync(sourcePath, targetPath, { recursive: true, force: true });
}

function readPersonModule(projectName: string) {
  return readFileSync(
    projectFile(projectName, "src/host/controllers/person/person.module.ts"),
    "utf8",
  );
}

function writePersonModule(projectName: string, content: string) {
  writeFileSync(
    projectFile(projectName, "src/host/controllers/person/person.module.ts"),
    content,
  );
}

function ensureImport(content: string, importLine: string) {
  if (content.includes(importLine)) {
    return content;
  }

  return content.replace(
    "import { Module } from '@nestjs/common';",
    `${importLine}\nimport { Module } from '@nestjs/common';`,
  );
}

function ensureProvider(content: string, providerName: string) {
  if (content.includes(`${providerName},`)) {
    return content;
  }

  return content.replace(
    "  providers: [",
    `  providers: [\n    ${providerName},`,
  );
}

function ensureExport(content: string, exportName: string) {
  if (content.includes(`${exportName},`)) {
    return content;
  }

  return content.replace("  exports: [", `  exports: [\n    ${exportName},`);
}

export async function restorePersonCacheFeatures(projectName: string) {
  if (
    !existsSync(
      projectFile(projectName, "src/host/controllers/person/person.module.ts"),
    )
  ) {
    return;
  }

  const files = [
    "src/application/person/create/create-person.handler.ts",
    "src/application/person/update/update-person.handler.ts",
    "src/application/person/delete/delete-person.handler.ts",
    "src/application/person/read-many/read-many-person.handler.ts",
    "src/application/person/events/inactive-person.handler.ts",
    "src/core/utils/person-list-cache.ts",
    "src/core/utils/build-list-cache-key.ts",
  ];

  for (const file of files) {
    copyFromTemplate(file, projectName);
  }
}

export async function restorePersonCronJobs(projectName: string) {
  if (
    !existsSync(
      projectFile(projectName, "src/host/controllers/person/person.module.ts"),
    )
  ) {
    return;
  }

  copyFromTemplate("src/application/person/jobs", projectName);

  let content = readPersonModule(projectName);
  content = ensureImport(
    content,
    "import { CreatePersonJob } from '@/application/person/jobs/create-person.job';",
  );
  content = ensureImport(
    content,
    "import { DeleteInactiveJob } from '@/application/person/jobs/delete-inactive.job';",
  );
  content = ensureProvider(content, "CreatePersonJob");
  content = ensureProvider(content, "DeleteInactiveJob");
  content = ensureExport(content, "CreatePersonJob");
  content = ensureExport(content, "DeleteInactiveJob");
  writePersonModule(projectName, content);
}

export async function restorePersonEventJobs(projectName: string) {
  if (
    !existsSync(
      projectFile(projectName, "src/host/controllers/person/person.module.ts"),
    )
  ) {
    return;
  }

  copyFromTemplate("src/application/person/events", projectName);

  let content = readPersonModule(projectName);
  content = ensureImport(
    content,
    "import { InactivePersonHandler } from '@/application/person/events/inactive-person.handler';",
  );
  content = ensureProvider(content, "InactivePersonHandler");
  content = ensureExport(content, "InactivePersonHandler");
  writePersonModule(projectName, content);
}

export async function restorePersonAuthExample(projectName: string) {
  const controllerPath =
    "src/host/controllers/person/delete-person.controller.ts";

  if (
    !existsSync(
      projectFile(projectName, "src/host/controllers/person/person.module.ts"),
    )
  ) {
    return;
  }

  copyFromTemplate(controllerPath, projectName);
}

export async function upgradeCacheToRedis(projectName: string) {
  copyFromTemplate("src/infra/common/redis-cache.service.ts", projectName);
  copyFromTemplate("src/infra/common/cache-service.provider.ts", projectName);
}

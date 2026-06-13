export function patchAppModuleForHealth(content: string) {
  if (content.includes("HealthCheckModule")) {
    return content;
  }

  return content
    .replace(
      "import { Module } from '@nestjs/common';",
      "import { Module } from '@nestjs/common';\nimport { HealthCheckModule } from './controllers/health-check/health-check.module';",
    )
    .replace(
      /(ConfigModule\.forRoot\(\{[\s\S]*?\}\),)\n/,
      "$1\n    HealthCheckModule,\n",
    );
}

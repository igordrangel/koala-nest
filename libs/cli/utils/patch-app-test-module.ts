import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { resolveProjectPath } from './resolve-project-path';

const defaultAppTestModule = `import { envSchema } from '@/core/env';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InfraModule } from '@/infra/infra.module';
import { e2eDatabaseUrl } from '@/test/e2e-context';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
      validate: () =>
        envSchema.parse({
          PORT: 3000,
          NODE_ENV: 'test',
          DATABASE_URL: e2eDatabaseUrl,
        }),
    }),
    InfraModule,
  ],
})
export class AppTestModule {}
`;

export function patchAppTestModuleForDefault(projectName: string): void {
  writeFileSync(
    path.join(resolveProjectPath(projectName), 'src/test/app-test.module.ts'),
    defaultAppTestModule,
  );
}

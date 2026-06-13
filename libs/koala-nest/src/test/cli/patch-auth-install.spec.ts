import { describe, expect, it } from "bun:test";
import { patchAppModuleForAuth } from "../../../../cli/utils/patch-auth-install.ts";

const crudAppModule = `import { envSchema } from '@/core/env';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PersonModule } from './controllers/person/person.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => envSchema.parse(config),
    }),
    PersonModule,
  ],
})
export class AppModule {}
`;

const defaultAppModule = `import { envSchema } from '@/core/env';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => envSchema.parse(config),
    }),
  ],
})
export class AppModule {}
`;

describe("patchAppModuleForAuth", () => {
  it("registra SecurityModule e AuthModule no template CRUD", () => {
    const patched = patchAppModuleForAuth(crudAppModule);

    expect(patched).toContain("import { AuthModule }");
    expect(patched).toContain("import { SecurityModule }");
    expect(patched.indexOf("SecurityModule")).toBeLessThan(
      patched.indexOf("PersonModule,"),
    );
    expect(patched.indexOf("AuthModule")).toBeLessThan(
      patched.indexOf("PersonModule,"),
    );
  });

  it("registra SecurityModule e AuthModule no template padrão sem PersonModule", () => {
    const patched = patchAppModuleForAuth(defaultAppModule);

    expect(patched).toContain("SecurityModule,");
    expect(patched).toContain("AuthModule,");
    expect(patched).not.toContain("PersonModule");
  });

  it("não duplica módulos quando patch é aplicado novamente", () => {
    const once = patchAppModuleForAuth(defaultAppModule);
    const twice = patchAppModuleForAuth(once);

    expect(twice.match(/import \{ SecurityModule \}/g)?.length).toBe(1);
    expect(twice.match(/^\s+SecurityModule,$/gm)?.length).toBe(1);
  });
});

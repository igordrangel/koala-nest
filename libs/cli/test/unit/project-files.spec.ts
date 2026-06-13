import { describe, expect, it } from 'bun:test';
import { removeImportLines } from '@cli/utils/project-files.ts';

describe('removeImportLines', () => {
  it('remove imports pelo specifier do módulo', () => {
    const content = `import { Alpha } from '@/domain/alpha';
import { Beta } from '@/domain/beta';
import { Gamma } from '@/domain/gamma';

export class Example {}
`;

    expect(removeImportLines(content, ['@/domain/beta', '@/domain/gamma']))
      .toBe(`import { Alpha } from '@/domain/alpha';

export class Example {}
`);
  });

  it('remove imports type-only', () => {
    const content = `import type { Foo } from '@/domain/foo';
import { Bar } from '@/domain/bar';

export class Example {}
`;

    expect(removeImportLines(content, ['@/domain/foo']))
      .toBe(`import { Bar } from '@/domain/bar';

export class Example {}
`);
  });
});

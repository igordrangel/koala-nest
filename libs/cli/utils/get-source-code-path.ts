import { existsSync } from 'node:fs';
import path from 'node:path';
import { getPackageRoot } from './get-package-root';

export function getSourceCodePath(): string {
  const root = getPackageRoot(import.meta.url);
  const publishedTemplate = path.join(root, 'koala-nest');

  if (existsSync(publishedTemplate)) {
    return publishedTemplate;
  }

  return path.join(root, 'libs', 'koala-nest');
}

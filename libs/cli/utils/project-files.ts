export function removeImportLines(content: string, moduleSpecifiers: string[]) {
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

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

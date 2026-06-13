function resolveRelativeLink(
  target: string,
  currentCategory: string,
  locale: string,
): string {
  if (target.startsWith('http://') || target.startsWith('https://')) {
    return target;
  }

  if (target.startsWith('/')) {
    return target;
  }

  const clean = target.replace(/^\.\//, '').replace(/\.md$/, '');
  if (target.startsWith('../')) {
    const parts = target.split('/');
    const file = parts.pop()!.replace(/\.md$/, '');
    const parent = parts[parts.length - 1];
    return `/${locale}/docs/${parent}/${file}`;
  }

  return `/${locale}/docs/${currentCategory}/${clean}`;
}

export function transformMarkdownLinks(
  content: string,
  currentCategory: string,
  locale: string,
): string {
  return content
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, href) => {
      if (!href.endsWith('.md') && !href.startsWith('./') && !href.startsWith('../')) {
        return match;
      }
      const route = resolveRelativeLink(href, currentCategory, locale);
      return `[${label}](${route})`;
    })
    .replace(/^# .+\n\n/, '');
}

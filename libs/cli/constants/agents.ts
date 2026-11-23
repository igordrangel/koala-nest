/** Paths gerados por `kl-nest add agents` / `kl-nest new` (contexto AI IDE-agnóstico). */
export const AGENTS_FILE_PATH = 'AGENTS.md';

export const AGENTS_INSTRUCTIONS_DIR = '.agents/instructions';

export const AGENTS_SKILLS_DIR = '.agents/skills';

/** Marcador de instalação: pasta de instructions criada pela CLI. */
export const AGENTS_MARKER_PATH = `${AGENTS_INSTRUCTIONS_DIR}/hard-constraints.md`;

export const AGENTS_CODE_REVIEW_SKILL_PATH = `${AGENTS_SKILLS_DIR}/code-review.md`;

export const AGENTS_INSTRUCTION_PATHS = [
  `${AGENTS_INSTRUCTIONS_DIR}/docs-first.md`,
  `${AGENTS_INSTRUCTIONS_DIR}/hard-constraints.md`,
  `${AGENTS_INSTRUCTIONS_DIR}/layers-ddd.md`,
  `${AGENTS_INSTRUCTIONS_DIR}/new-resource.md`,
  `${AGENTS_INSTRUCTIONS_DIR}/class-members.md`,
  `${AGENTS_INSTRUCTIONS_DIR}/library-usage.md`,
] as const;

export const AGENTS_SKILL_PATHS = [AGENTS_CODE_REVIEW_SKILL_PATH] as const;

/** Arquivos relativos copiados do asset root para a raiz do projeto. */
export const AGENTS_ASSET_RELATIVE_PATHS = [
  AGENTS_FILE_PATH,
  ...AGENTS_INSTRUCTION_PATHS,
  ...AGENTS_SKILL_PATHS,
] as const;

/** Paths legados de `ai-context` (Cursor / Copilot) removidos no purge. */
export const LEGACY_AI_CONTEXT_CURSOR_RULE_PATHS = [
  '.cursor/rules/koala-layers.mdc',
  '.cursor/rules/koala-application.mdc',
  '.cursor/rules/koala-domain.mdc',
  '.cursor/rules/koala-host.mdc',
  '.cursor/rules/koala-class-members.mdc',
] as const;

export const LEGACY_AI_CONTEXT_GITHUB_PATH =
  '.github/copilot-instructions.md' as const;

export const AGENTS_LABEL = 'Agentes de IA (AGENTS.md + .agents/)';

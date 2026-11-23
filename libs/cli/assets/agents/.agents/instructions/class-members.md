# Class member order

1. **Visibility (attributes and methods):** `private` → `protected` → `public`
2. **Structure:** attributes (private → protected → public) → constructor → methods (private → protected → public)
3. **Dependency:** within the same group, the member that is used comes before the one that uses it

Applies to TypeScript under `src/**/*.ts`.

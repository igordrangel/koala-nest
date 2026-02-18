# @koalarx/nest

## 3.1.23

### Patch Changes

- 377efa0: fix: corrigir a construção da chave de cache para incluir o nome da entidade
- 2da69ed: fix: atualizar a versão do pacote @scalar/nestjs-api-reference para 1.0.24

## 3.1.22

### Patch Changes

- e45e6df: refactor: simplificar lógica de seleção e carregamento de relações no repositório

## 3.1.21

### Patch Changes

- be99c7c: refactor: atualizar lógica de criação e deleção de relações no repositório

## 3.1.20

### Patch Changes

- dc3ed4c: refactor: melhorar a lógica para obter o nome da propriedade da fonte da entidade

## 3.1.19

### Patch Changes

- 9970384: Ajuste repository in memory

## 3.1.18

### Patch Changes

- 3384588: Corrigido um erro na persistência dos dados devido as alterações anteriores de relacionamentos

## 3.1.17

### Patch Changes

- c9583a4: Ajuste de performance no carregamento de relacionamento em RepositoryBase

## 3.1.16

### Patch Changes

- c9b35f6: Ajuste no carregamento de relacionamento pelo RepositoryBase

## 3.1.15

### Patch Changes

- 2ddbff5: Ajustes no setup de testes e update de relacionamentos em RepositoryBase

## 3.1.14

### Patch Changes

- 7f20189: Ajuste LazyLoading RepositoryBase

## 3.1.13

### Patch Changes

- 49d1aea: Ajuste LazyLoading de N:N
- dff1496: Ajustes LazyLoading do RepositoryBase

## 3.1.12

### Patch Changes

- 1723ebb: Ajustes LazyLoading de métodos find no RepositoryBase

## 3.1.11

### Patch Changes

- 114af03: Ajuste lazyLoading RepositoryBase

## 3.1.10

### Patch Changes

- a2eb71f: Ajustes na busca por lazyLoading no RepositoryBase

## 3.1.9

### Patch Changes

- df61fa6: Ajustes RepositoryBase

## 3.1.8

### Patch Changes

- bb3d518: Melhorias de performance nas buscas do RepositoryBase

## 3.1.7

### Patch Changes

- 345add6: ajuste removeMany de dependências

## 3.1.6

### Patch Changes

- 5380446: ajuste removeMany de dependências

## 3.1.5

### Patch Changes

- bbef04f: Ajuste saveChanges

## 3.1.4

### Patch Changes

- 9327b27: Corrigido um bug que duplicava entidades em relacionamentos de N:N

## 3.1.3

### Patch Changes

- 8ab1cb3: Ajuste deepinclude para listas

## 3.1.2

### Patch Changes

- 4be2d3f: Ajuste geração automática de include do Prisma

## 3.1.1

### Patch Changes

- 120f41a: Ajuste no gerador automático de include do prisma no RepositoryBase

## 3.1.0

### Minor Changes

- 0edec4f: Removida a necessidade de passar o include no constructor do repository, agora ele é gerado automaticamente

## 3.0.11

### Patch Changes

- 2989056: Ajuste SaveChanges de relacionamentos profundos e otimização nas buscar de lista

## 3.0.10

### Patch Changes

- 4bdf56c: Ajuste SaveChanges de dependências profundas

## 3.0.9

### Patch Changes

- bc57404: Ajuste saveChanges para relacionamentos profundos

## 3.0.8

### Patch Changes

- 1d44d77: Ajustes

## 3.0.7

### Patch Changes

- 544f647: Ajustes CLI

## 3.0.6

### Patch Changes

- 9b535e5: Ajustes no package.json de koala-nest

## 3.0.5

### Patch Changes

- 442e197: Ajustes de publicação

## 3.0.4

### Patch Changes

- 8be2e67: Ajustes de publicação

## 3.0.3

### Patch Changes

- c87bce1: Ajuste no README ao realizar o build do KoalaNest

## 3.0.2

### Patch Changes

- a446e40: Incluindo README.md

## 3.0.1

### Patch Changes

- 3532e0d: Nova tentativa de publish
- 276bc25: Teste de publicação do koala-nest
- 9f4d18c: Adicionado link da dock no README inicial

## 3.0.0

### Major Changes

- 9c3cdf1: CLI migrada para este repositório em estrutura de monorepo, atualizações de eslint e ajustes na documentação

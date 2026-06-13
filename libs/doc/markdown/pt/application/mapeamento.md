---
title: Sistema de mapeamento
slug: mapeamento
category: application
docKey: application/mapeamento
order: 4
description: AutoMap, createMap, AutoMapper e registro de mapeamentos entre classes.
---

# Sistema de mapeamento

O Koala Nest inclui um sistema de mapeamento inspirado em AutoMapper (.NET). Ele converte objetos entre entidades, requests, responses e DTOs de forma declarativa.

## Componentes

| Componente | Função |
| --- | --- |
| `@AutoMap()` | Marca propriedades mapeáveis em uma classe |
| `createMap()` | Registra mapeamento entre origem e destino |
| `forMember()` | Customiza mapeamento de propriedades específicas |
| `AutoMapper.map()` | Executa conversão entre duas classes |
| `MappingStore` | Armazena metadados de mapeamento em memória |
| `MappingProvider` | Registra mapeamentos na inicialização da app |

## Decorador AutoMap

```typescript
export function AutoMap<T>(config?: AutoMapConfig<T>) {
  return function (target: any, propertyKey: string) {
    const compositionType: (() => any) | undefined = config?.type;

    MappingStore.setProp(target.constructor, propertyKey, compositionType);
  };
}
```

Uso em entidade:

```typescript
@OneToMany(() => PersonContact, (contact) => contact.person, {
  cascade: true,
  eager: true,
  onDelete: 'CASCADE',
})
@AutoMap({ type: () => PersonContact })
contacts: PersonContact[];
```

## Registrar mapeamentos

Crie uma classe mapper por recurso com método estático `createMap()`:

```typescript
export class PersonMapper {
  static createMap() {
    createMap(Person, CreatePersonResponse);

    createMap(Person, ReadPersonResponse);
    createMap(PersonAddress, ReadPersonAddressResponse);
    createMap(PersonContact, ReadPersonContactResponse);

    createMap(CreatePersonRequest, Person);
    createMap(CreatePersonAddressRequest, PersonAddress);
    createMap(CreatePersonContactRequest, PersonContact);

    createMap(UpdatePersonRequest, Person);
    createMap(UpdatePersonAddressRequest, PersonAddress);
    createMap(UpdatePersonContactRequest, PersonContact);

    createMap(ReadManyPersonRequest, PersonQueryDto);
    createMap(Person, ReadManyPersonResponseItem);
  }
}
```

> No fluxo CRUD atual, o `UpdatePersonHandler` aplica os campos manualmente (merge de contatos). Os maps de update ficam registrados para reutilização em outros handlers.

Registre no `MappingProvider` (carregado pelo `ControllerModule`):

```typescript
@Injectable()
export class MappingProvider {
  constructor() {
    PersonMapper.createMap();
  }
}
```

## Executar mapeamento

```typescript
const person = AutoMapper.map(
  new CreatePersonValidator(req).validate(),
  CreatePersonRequest,
  Person,
);

return AutoMapper.map(createdPerson, Person, CreatePersonResponse);
```

O `AutoMapper` resolve propriedades pelo nome, mapeia objetos aninhados recursivamente e itera arrays automaticamente.

## Customizar com forMember

A função `forMember` permite customizar o mapeamento de uma propriedade. Não é usada no `PersonMapper` do template, mas está disponível em `src/core/tools/mapping/for-member.ts`:

```typescript
export function forMember<TTarget, TSource>(
  targetProp: keyof TTarget,
  map: (source: TSource) => TTarget[keyof TTarget],
): Partial<ForMemberResult<TTarget, TSource>> {
  return {
    [targetProp]: map,
  } as Partial<ForMemberResult<TTarget, TSource>>;
}
```

Passe o resultado como terceiro argumento de `createMap()`.

## Erros comuns

- **`Mapping not found for {TargetClass}`**: o par origem→destino não foi registrado com `createMap()`.
- **`Target properties not found for {TargetClass}`**: a classe destino não possui propriedades marcadas com `@AutoMap()`.

Sempre registre novos pares de mapeamento ao adicionar requests, responses ou entidades.

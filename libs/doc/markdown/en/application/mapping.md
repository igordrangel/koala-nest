---
title: Mapping system
slug: mapping
category: application
docKey: application/mapeamento
order: 4
description: AutoMap, createMap, AutoMapper, and mapping registration between classes.
---

# Mapping system

Koala Nest includes a mapping system inspired by AutoMapper (.NET). It converts objects between entities, requests, responses, and DTOs declaratively.

## Components

| Component | Function |
| --- | --- |
| `@AutoMap()` | Marks mappable properties on a class |
| `createMap()` | Registers mapping between source and destination |
| `forMember()` | Customizes mapping of specific properties |
| `AutoMapper.map()` | Performs conversion between two classes |
| `MappingStore` | Stores mapping metadata in memory |
| `MappingProvider` | Registers mappings on application startup |

## AutoMap decorator

```typescript
export function AutoMap<T>(config?: AutoMapConfig<T>) {
  return function (target: any, propertyKey: string) {
    const compositionType: (() => any) | undefined = config?.type;

    MappingStore.setProp(target.constructor, propertyKey, compositionType);
  };
}
```

Usage in entity:

```typescript
@OneToMany(() => PersonContact, (contact) => contact.person, {
  cascade: true,
  eager: true,
  onDelete: 'CASCADE',
})
@AutoMap({ type: () => PersonContact })
contacts: PersonContact[];
```

## Registering mappings

Create one mapper class per resource with a static `createMap()` method:

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

> In the current CRUD flow, `UpdatePersonHandler` applies fields manually (contact merge). Update maps remain registered for reuse in other handlers.

Register in `MappingProvider` (loaded by `ControllerModule`):

```typescript
@Injectable()
export class MappingProvider {
  constructor() {
    PersonMapper.createMap();
  }
}
```

## Executing mapping

```typescript
const person = AutoMapper.map(
  new CreatePersonValidator(req).validate(),
  CreatePersonRequest,
  Person,
);

return AutoMapper.map(createdPerson, Person, CreatePersonResponse);
```

`AutoMapper` resolves properties by name, maps nested objects recursively, and iterates arrays automatically.

## Customizing with forMember

The `forMember` function allows customizing the mapping of a property. It is not used in the template's `PersonMapper`, but is available in `src/core/tools/mapping/for-member.ts`:

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

Pass the result as the third argument to `createMap()`.

## Common errors

- **`Mapping not found for {TargetClass}`**: the source→destination pair was not registered with `createMap()`.
- **`Target properties not found for {TargetClass}`**: the destination class has no properties marked with `@AutoMap()`.

Always register new mapping pairs when adding requests, responses, or entities.

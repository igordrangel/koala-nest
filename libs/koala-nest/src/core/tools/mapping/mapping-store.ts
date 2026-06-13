import { Type } from '@nestjs/common';
import { ForMemberDefinition } from './for-member';

interface EntityPropDefs {
  name: string;
  type: Type<any> | (() => Type<any>);
  isArray: boolean;
}

interface MappingDefinition {
  source: Type<any>;
  target: Type<any>;
  formMember: ForMemberDefinition<any, any>;
}

export class MappingStore {
  private static readonly _entities = new Map<Type<any>, EntityPropDefs[]>();
  private static readonly _mappings = new Map<
    Type<any>,
    Map<Type<any>, MappingDefinition>
  >();

  static setProp(
    entity: Type<any>,
    propName: string,
    compositionType?: () => Type<any>,
  ) {
    const propType = Reflect.getMetadata(
      'design:type',
      entity.prototype,
      propName,
    );
    const isArray = propType === Array;
    const type = isArray ? (compositionType ?? propType) : propType;

    const props = this._entities.get(entity) || [];

    props.push({
      name: propName,
      type,
      isArray,
    });

    this._entities.set(entity, props);
  }

  static getProps(entity: Type<any>) {
    const props: EntityPropDefs[] = [];
    const seen = new Set<string>();
    let current: Type<any> | null = entity;

    while (current?.prototype) {
      for (const prop of this._entities.get(current) ?? []) {
        if (!seen.has(prop.name)) {
          seen.add(prop.name);
          props.push(prop);
        }
      }

      current = Object.getPrototypeOf(current) as Type<any> | null;
    }

    return props;
  }

  static getPropType(entity: Type<any>, propName: string) {
    const prop = this._entities.get(entity)?.find((p) => p.name === propName);

    if (!prop) {
      throw new Error(
        `Property ${propName} not found in entity ${entity.name}`,
      );
    }

    const { type, isArray } = prop;

    if (!type) {
      return null;
    }

    if (isArray && type instanceof Function) {
      return (type as () => Type<any>)();
    }

    return type;
  }

  static add(
    source: Type<any>,
    target: Type<any>,
    ...formMember: ForMemberDefinition<any, any>
  ) {
    const targetMappings =
      this._mappings.get(source) ?? new Map<Type<any>, MappingDefinition>();

    targetMappings.set(target, {
      source,
      target,
      formMember,
    });

    this._mappings.set(source, targetMappings);
  }

  static getMapping(source: Type<any>, target: Type<any>) {
    return this._mappings.get(source)?.get(target) ?? null;
  }

  /** Compatibilidade com chave legada usada em testes. */
  static getMappingByName(mapName: string) {
    for (const targetMappings of this._mappings.values()) {
      for (const mapping of targetMappings.values()) {
        if (`${mapping.source.name}To${mapping.target.name}` === mapName) {
          return mapping;
        }
      }
    }

    return null;
  }
}

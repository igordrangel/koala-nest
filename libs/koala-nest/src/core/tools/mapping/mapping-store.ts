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
  private static readonly _entities = new Map<string, EntityPropDefs[]>();
  private static readonly _mappings = new Map<string, MappingDefinition>();

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

    const props = this._entities.get(entity.name) || [];

    props.push({
      name: propName,
      type,
      isArray,
    });

    this._entities.set(entity.name, props);
  }

  static getProps(entity: Type<any>) {
    return this._entities.get(entity.name) ?? [];
  }

  static getPropType(entity: Type<any>, propName: string) {
    const prop = this._entities
      .get(entity.name)
      ?.find((p) => p.name === propName);

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
    const mapName = `${source.name}To${target.name}`;
    this._mappings.set(mapName, {
      source,
      target,
      formMember,
    });
  }

  static getMapping(mapName: string) {
    return this._mappings.get(mapName) ?? null;
  }
}

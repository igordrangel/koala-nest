import { Type } from '@nestjs/common';
import { MappingStore } from './mapping-store';

export class AutoMapper {
  private static isEntity(value: any) {
    const primitiveTypes = [String, Number, Boolean, Date];

    return (
      value instanceof Object &&
      value !== null &&
      !Array.isArray(value) &&
      !primitiveTypes.includes(value)
    );
  }

  private static isClass(value: any) {
    return value instanceof Function && !value.prototype;
  }

  private static toClass(type: Type<any> | (() => Type<any>)) {
    return this.isClass(type)
      ? (type as () => Type<any>)()
      : (type as Type<any>);
  }

  static map<S, R>(data: any, source: Type<S>, target: Type<R>): R {
    const mapName = `${source.name}To${target.name}`;
    const mapping = MappingStore.getMapping(mapName);

    const targetInstance = new target();

    if (!mapping) {
      throw new Error(`Mapping not found for ${target.name}`);
    }

    const sourceProps = MappingStore.getProps(source);
    const targetProps = MappingStore.getProps(target);

    if (!targetProps) {
      throw new Error(`Target properties not found for ${target.name}`);
    }

    const customTargetProps = new Set<string>();

    for (const member of mapping.formMember) {
      for (const [targetProp, mapFn] of Object.entries(member)) {
        if (typeof mapFn === 'function') {
          targetInstance[targetProp] = mapFn(data);
          customTargetProps.add(targetProp);
        }
      }
    }

    for (const sourceProp of sourceProps) {
      const targetProp = targetProps.find((p) => p.name === sourceProp.name);

      if (!targetProp || customTargetProps.has(targetProp.name)) {
        continue;
      }

      const targetPropName = targetProp.name;
      const sourcePropTypeClass = this.toClass(sourceProp.type);

      if (!sourceProp.isArray && this.isEntity(sourcePropTypeClass)) {
        const sourcePropType = MappingStore.getPropType(
          sourcePropTypeClass,
          sourceProp.name,
        );

        if (!sourcePropType) {
          continue;
        }

        const targetPropType = targetProps.find(
          (p) => p.name === targetPropName,
        )?.type;

        if (!targetPropType) {
          continue;
        }

        const targetClass: Type<any> = this.toClass(targetPropType);

        targetInstance[targetPropName] = this.map(
          data[sourceProp.name],
          sourcePropTypeClass,
          targetClass,
        );
        continue;
      }

      if (sourceProp.isArray) {
        targetInstance[targetPropName] = data[sourceProp.name].map(
          (item: unknown) => {
            const targetItemType = targetProps.find(
              (p) => p.name === targetPropName,
            )!.type;

            const targetClassType = this.toClass(targetItemType);

            return this.map(item, sourcePropTypeClass, targetClassType);
          },
        );
        continue;
      }

      targetInstance[targetPropName] = data[sourceProp.name];
    }

    return targetInstance;
  }
}

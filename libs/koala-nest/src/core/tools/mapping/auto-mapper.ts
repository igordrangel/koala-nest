import { initializeUndefinedArrayProps } from '@/core/utils/initialize-undefined-array-props';
import { Type } from '@nestjs/common';
import { MappingStore } from './mapping-store';

export class AutoMapper {
  private static isEntity(value: any) {
    const nonEntityTypes = [String, Number, Boolean, Date, Object, Function];

    return (
      value instanceof Object &&
      value !== null &&
      !Array.isArray(value) &&
      !nonEntityTypes.includes(value)
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
    const mapping = MappingStore.getMapping(source, target);
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
        const targetPropType = targetProps.find(
          (p) => p.name === targetPropName,
        )?.type;

        if (!targetPropType) {
          continue;
        }

        const targetClass: Type<any> = this.toClass(targetPropType);
        const sourceValue = data[sourceProp.name];

        if (sourceValue === undefined) {
          continue;
        }

        targetInstance[targetPropName] = this.map(
          sourceValue,
          sourcePropTypeClass,
          targetClass,
        );
        continue;
      }

      if (sourceProp.isArray) {
        const sourceArray = data[sourceProp.name];

        if (sourceArray === undefined) {
          continue;
        }

        targetInstance[targetPropName] = sourceArray.map((item: unknown) => {
          const targetItemType = targetProps.find(
            (p) => p.name === targetPropName,
          )!.type;

          const targetClassType = this.toClass(targetItemType);

          return this.map(item, sourcePropTypeClass, targetClassType);
        });
        continue;
      }

      const sourceValue = data[sourceProp.name];

      if (sourceValue !== undefined) {
        targetInstance[targetPropName] = sourceValue;
      }
    }

    initializeUndefinedArrayProps(
      targetInstance as Record<string, unknown>,
      target,
    );

    return targetInstance;
  }
}

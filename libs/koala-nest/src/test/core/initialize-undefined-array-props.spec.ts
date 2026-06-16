/// <reference types="bun-types/test-globals" />

import { initializeUndefinedArrayProps } from '@/core/utils/initialize-undefined-array-props';
import { AutoMap } from '@/core/tools/mapping';
import { MappingStore } from '@/core/tools/mapping/mapping-store';
import { describe, expect, it } from 'bun:test';

class ChildItem {
  @AutoMap()
  name!: string;
}

class EntityWithArrays {
  @AutoMap()
  title!: string;

  @AutoMap({ type: () => ChildItem })
  children!: ChildItem[];
}

describe('initializeUndefinedArrayProps', () => {
  it('inicializa props de array mapeadas como [] quando undefined', () => {
    const target = { title: 'Test' } as Record<string, unknown>;

    initializeUndefinedArrayProps(target, EntityWithArrays);

    expect(target.children).toEqual([]);
  });

  it('respeita onlyProps quando informado', () => {
    const target = { title: 'Test' } as Record<string, unknown>;

    initializeUndefinedArrayProps(target, EntityWithArrays, ['title']);

    expect(target.children).toBeUndefined();
  });

  it('não sobrescreve array já definido', () => {
    const existing: ChildItem[] = [];
    const target = { title: 'Test', children: existing } as Record<
      string,
      unknown
    >;

    initializeUndefinedArrayProps(target, EntityWithArrays);

    expect(target.children).toBe(existing);
  });

  it('detecta arrays via metadata composition:type', () => {
    class DtoWithExplicitArray {
      @AutoMap({ type: () => ChildItem, isArray: true })
      items!: ChildItem[];
    }

    MappingStore.getAllProps(DtoWithExplicitArray);

    const target = {} as Record<string, unknown>;
    initializeUndefinedArrayProps(target, DtoWithExplicitArray);

    expect(target.items).toEqual([]);
  });
});

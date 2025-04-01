import { Type } from '@nestjs/common'
import { List } from '../utils/list'
import { AutoMappingClassContext } from './auto-mapping-class-context'
import { AutoMappingContext } from './auto-mapping-context'
import { ForMemberDefinition } from './for-member'

interface AutoMappingGetContext {
  mapContext: AutoMappingContext | null
  propSourceContext: AutoMappingClassContext | null
  propTargetContext: AutoMappingClassContext | null
}

export class AutoMappingList {
  private static _mappedPropList = new List(AutoMappingClassContext)
  private static _mappingProfileList = new List(AutoMappingContext)

  static add(
    source: Type<any>,
    target: Type<any>,
    ...forMember: ForMemberDefinition<any, any>
  ) {
    this._mappingProfileList.add(
      new AutoMappingContext(source, target, forMember),
    )
    this._mappedPropList.add(new AutoMappingClassContext(source))
    this._mappedPropList.add(new AutoMappingClassContext(target))

    this.addExtendedPropsIntoSubClass(source)
    this.addExtendedPropsIntoSubClass(target)
  }

  static get(source: Type<any>, target: Type<any>): AutoMappingGetContext {
    return {
      mapContext: this._mappingProfileList.find(
        (mp) =>
          (mp.source.name === source.name ||
            Object.getPrototypeOf(mp.source.prototype.constructor) ===
              source) &&
          mp.target.name === target.name,
      ),
      propSourceContext: this._mappedPropList.find(
        (mp) => mp.source.name === source.name,
      ),
      propTargetContext: this._mappedPropList.find(
        (mp) => mp.source.name === target.name,
      ),
    }
  }

  static getSourceByName(sourceName: string) {
    return this._mappingProfileList.find(
      (mp) =>
        mp.source.name === sourceName ||
        Object.getPrototypeOf(mp.source.prototype.constructor).name ===
          sourceName,
    )?.source
  }

  static getPropDefinitions(source: Type<any>, propName: string) {
    return this._mappedPropList
      .find((mp) => mp.source.name === source.name)
      ?.props.find((prop) => prop.name === propName)
  }

  static getTargets(source: Type<any>) {
    return this._mappingProfileList
      .filter(
        (mp) =>
          mp.source.name === source.name ||
          Object.getPrototypeOf(mp.source.prototype.constructor) === source,
      )
      .map((mp) => mp.target)
      .toArray()
  }

  static addMappedProp(source: Type<any>, propName: string) {
    let mappedClass = this._mappedPropList.find(
      (mp) => mp.source.name === source.name,
    )

    if (!mappedClass) {
      mappedClass = new AutoMappingClassContext(source)

      const mappedExtendedClass = this._mappedPropList.find(
        (mp) =>
          mp.source === Object.getPrototypeOf(source.prototype.constructor),
      )

      if (mappedExtendedClass) {
        mappedClass.props.setList(mappedExtendedClass.props.toArray())
      }

      this._mappedPropList.add(mappedClass)
    }

    const metadata = Reflect.getMetadata(
      'design:type',
      source.prototype,
      propName,
    )
    const compositionType = Reflect.getMetadata(
      'composition:type',
      source.prototype,
      propName,
    )
    const compositionAction = Reflect.getMetadata(
      'composition:action',
      source.prototype,
      propName,
    )
    const type = metadata?.name

    mappedClass.props.add({
      name: propName,
      type,
      compositionType,
      compositionAction,
    })
  }

  static addExtendedPropsIntoSubClass(source: Type<any>) {
    const mappedExtendedClass = this._mappedPropList.find(
      (mp) => mp.source === Object.getPrototypeOf(source.prototype.constructor),
    )
    if (mappedExtendedClass) {
      const mappedClass = this._mappedPropList.find(
        (mp) => mp.source.name === source.name,
      )
      if (mappedClass) {
        mappedExtendedClass.props
          .toArray()
          .forEach((prop) => mappedClass.props.add(prop))
      }
    }
  }
}

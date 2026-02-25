import { isPlainObject } from './is-plain-object'

const handle = {
  get(target: any, prop: any) {
    // Definimos uma "chave secreta" para identificação
    if (prop === '__isProxy') return true
    return target[prop]
  },
  set(target: any, prop: any, value: any) {
    target[prop] = value
    return true
  },
}

export function createProxy(target: any) {
  const proxy = new Proxy(target, handle)

  Object.keys(proxy).forEach((key) => {
    if (isPlainObject(proxy[key])) {
      proxy[key] = new Proxy(proxy[key], handle)
    } else if (Array.isArray(proxy[key])) {
      proxy[key] = proxy[key].map((item: any) =>
        isPlainObject(item) ? new Proxy(item, handle) : item,
      )
    }
  })

  return proxy
}

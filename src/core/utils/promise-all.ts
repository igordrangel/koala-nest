type PromisesResponseType<T> = {
  [K in keyof T]: Awaited<T[K]>
}

export class Promises {
  static async result<T>(requests: T): Promise<PromisesResponseType<T>> {
    const promises: Array<any> = []

    Object.values(requests as any).forEach((promise) => promises.push(promise))

    return Promise.all(promises).then((result) => {
      let currentIndex = 0

      const response = {} as PromisesResponseType<T>

      Object.keys(requests as any).forEach((propName) => {
        response[propName] = result[currentIndex]
        currentIndex++
      })

      return response
    })
  }
}

export class EnvConfig {
  static get isEnvTest() {
    return process.env.NODE_ENV === 'test'
  }

  static get isEnvDevelop() {
    return process.env.NODE_ENV === 'develop'
  }

  static get isEnvStaging() {
    return process.env.NODE_ENV === 'staging'
  }

  static get isEnvProduction() {
    return process.env.NODE_ENV === 'production'
  }
}

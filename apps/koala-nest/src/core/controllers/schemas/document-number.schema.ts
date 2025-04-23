import { validateCnpj, validateCpf } from '@koalarx/utils/KlString'

export function documentNumberSchema(value: string) {
  if (value !== '' && value !== 'undefined' && value !== 'null') {
    if (value.includes('.')) {
      if (value.length === 14) {
        return validateCpf(value)
      } else if (value.length === 18) {
        return validateCnpj(value)
      }
    } else {
      if (value.length === 11) {
        return validateCpf(value)
      } else if (value.length === 14) {
        return validateCnpj(value)
      }
    }

    return false
  }

  return true
}

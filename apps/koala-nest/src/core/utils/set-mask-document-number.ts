import { maskCnpj, maskCpf } from '@koalarx/utils/KlString'

export function setMaskDocumentNumber(document?: string) {
  if (!document) {
    return ''
  }

  const documentWithoutMask = document.replace(/[^0-9]/g, '')

  return documentWithoutMask.length === 11
    ? maskCpf(documentWithoutMask)
    : maskCnpj(documentWithoutMask)
}

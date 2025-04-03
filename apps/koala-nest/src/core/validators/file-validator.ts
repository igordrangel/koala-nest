import { FileValidator } from '@nestjs/common'
import { FileType } from '..'

type FileTypeInternal = FileType | FileType[] | Record<string, FileType[]>
type Result = { errorFileName?: string; isValid: boolean }

const runFileValidation = async (args: {
  multiple: boolean
  file: FileTypeInternal
  validator: (file: FileType) => Promise<boolean> | boolean
}): Promise<Result> => {
  if (args.multiple) {
    const fileFields = Object.keys(args.file)
    for (const field of fileFields) {
      const fieldFile = args.file[field]
      if (Array.isArray(fieldFile)) {
        for (const f of fieldFile) {
          if (!args.validator(f)) {
            return { errorFileName: f.originalname, isValid: false }
          }
        }
      } else {
        if (!args.validator(fieldFile)) {
          return { errorFileName: fieldFile.originalname, isValid: false }
        }
      }
    }
    return { isValid: true }
  }

  if (Array.isArray(args.file)) {
    for (const f of args.file) {
      if (!args.validator(f)) {
        return { errorFileName: f.originalname, isValid: false }
      }
    }
    return { isValid: true }
  }

  if (args.validator(args.file as any)) {
    return { errorFileName: args.file.originalname as string, isValid: false }
  }

  return { isValid: true }
}

export class FileSizeValidator extends FileValidator {
  private maxSizeBytes: number
  private multiple: boolean
  private errorFileName: string

  constructor(args: { maxSizeBytes: number; multiple: boolean }) {
    super({})
    this.maxSizeBytes = args.maxSizeBytes
    this.multiple = args.multiple
  }

  async isValid(file?: FileTypeInternal): Promise<boolean> {
    if (!file) {
      return true
    }

    const result = await runFileValidation({
      file,
      multiple: this.multiple,
      validator: (f) => f.size < this.maxSizeBytes,
    })
    this.errorFileName = result.errorFileName ?? ''
    return result.isValid
  }

  buildErrorMessage(file: any): string {
    return (
      `file ${this.errorFileName || ''} exceeded the size limit ` +
      parseFloat((this.maxSizeBytes / 1024 / 1024).toFixed(2)) +
      'MB'
    )
  }
}

export class FileTypeValidator extends FileValidator {
  private multiple: boolean
  private errorFileName: string
  private filetype: RegExp | string

  constructor(args: { multiple: boolean; filetype: RegExp | string }) {
    super({})
    this.multiple = args.multiple
    this.filetype = args.filetype
  }

  isMimeTypeValid(file: FileType) {
    return file.mimetype.search(this.filetype) === 0
  }

  async isValid(file?: FileTypeInternal): Promise<boolean> {
    if (!file) {
      return true
    }

    const result = await runFileValidation({
      multiple: this.multiple,
      file,
      validator: (f) => this.isMimeTypeValid(f),
    })
    this.errorFileName = result.errorFileName ?? ''
    return result.isValid
  }

  buildErrorMessage(file: any): string {
    return `file ${this.errorFileName || ''} must be of type ${this.filetype}`
  }
}

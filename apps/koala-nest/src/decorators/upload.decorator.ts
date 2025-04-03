import { ParseFilePipe, UploadedFiles } from '@nestjs/common'
import {
  FileSizeValidator,
  FileTypeValidator,
} from '../core/validators/file-validator'

export function UploadDecorator(maxSizeInKb: number) {
  const maxSizeBytes = maxSizeInKb * 1024

  return UploadedFiles(
    new ParseFilePipe({
      validators: [
        new FileSizeValidator({ maxSizeBytes, multiple: true }),
        new FileTypeValidator({
          filetype: /^image\/(png|jpeg|jpg)$/i,
          multiple: true,
        }),
      ],
      fileIsRequired: false,
    }),
  )
}

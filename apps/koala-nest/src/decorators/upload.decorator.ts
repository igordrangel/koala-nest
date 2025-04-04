import { ParseFilePipe, UploadedFiles } from '@nestjs/common'
import {
  FileSizeValidator,
  FileTypeValidator,
} from '../core/validators/file-validator'

/**
 * Um decorator personalizado para lidar com o upload de arquivos em um controlador NestJS.
 *
 * @param {number} maxSizeInKb - O tamanho máximo permitido para os arquivos em kilobytes.
 * @param {RegExp} filetype - Um padrão de expressão regular para validar os tipos de arquivo permitidos.
 *
 * Este decorator utiliza o `UploadedFiles` do NestJS para processar múltiplos arquivos enviados em uma requisição.
 * Ele valida os arquivos com base no tamanho máximo permitido e no tipo de arquivo especificado.
 */
export function UploadDecorator(maxSizeInKb: number, filetype: RegExp) {
  const maxSizeBytes = maxSizeInKb * 1024

  return UploadedFiles(
    new ParseFilePipe({
      validators: [
        new FileSizeValidator({ maxSizeBytes, multiple: true }),
        new FileTypeValidator({
          filetype,
          multiple: true,
        }),
      ],
      fileIsRequired: false,
    }),
  )
}

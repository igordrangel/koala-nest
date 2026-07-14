import { generateKeyPairSync } from 'node:crypto';

export type JwtKeyPairBase64 = {
  privateKey: string;
  publicKey: string;
};

/** Gera par RS256 (PEM) e retorna cada chave em base64, como espera o SecurityModule. */
export function generateJwtKeyPairBase64(): JwtKeyPairBase64 {
  const pair = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  return {
    privateKey: Buffer.from(pair.privateKey).toString('base64'),
    publicKey: Buffer.from(pair.publicKey).toString('base64'),
  };
}

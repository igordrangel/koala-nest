import { generateKeyPairSync } from 'node:crypto';

type JwtTestKeys = {
  privateKey: string;
  publicKey: string;
};

let cachedKeys: JwtTestKeys | null = null;

export function getJwtTestKeys(): JwtTestKeys {
  if (cachedKeys) {
    return cachedKeys;
  }

  const pair = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  cachedKeys = {
    privateKey: Buffer.from(pair.privateKey).toString('base64'),
    publicKey: Buffer.from(pair.publicKey).toString('base64'),
  };

  return cachedKeys;
}

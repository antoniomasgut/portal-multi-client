import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key || key.length !== 64) {
    throw new Error('ENCRYPTION_KEY ha de ser un hex de 32 bytes (64 caràcters)')
  }
  return Buffer.from(key, 'hex')
}

export function encrypt(plaintext: string): { encryptedVal: string; iv: string; tag: string } {
  const iv     = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  return {
    encryptedVal: encrypted.toString('hex'),
    iv:           iv.toString('hex'),
    tag:          cipher.getAuthTag().toString('hex'),
  }
}

export function decrypt(data: { encryptedVal: string; iv: string; tag: string }): string {
  const decipher = createDecipheriv(ALGORITHM, getKey(), Buffer.from(data.iv, 'hex'))
  decipher.setAuthTag(Buffer.from(data.tag, 'hex'))
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(data.encryptedVal, 'hex')),
    decipher.final(),
  ])
  return decrypted.toString('utf8')
}

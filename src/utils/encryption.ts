/**
 * Utilitários de Criptografia
 * AES-256-GCM para dados sensíveis
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Deriva chave a partir do secret
 */
function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY;

  if (!secret || secret.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters');
  }

  return crypto.scryptSync(secret, 'salt', KEY_LENGTH);
}

/**
 * Criptografa dados sensíveis
 */
export function encrypt(text: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();

  // Formato: iv:tag:encrypted
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * Descriptografa dados
 */
export function decrypt(encryptedData: string): string {
  const key = getKey();
  const parts = encryptedData.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const tag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Hash de senha com bcrypt (importar bcrypt)
 */
import { hash, compare } from 'bcrypt';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

/**
 * Gerar token seguro
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Verificar força da senha
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 12) {
    errors.push('Senha deve ter no mínimo 12 caracteres');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter letras minúsculas');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter letras maiúsculas');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Senha deve conter números');
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Senha deve conter caracteres especiais');
  }

  // Verificar senhas comuns
  const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('Senha muito comum, escolha uma mais segura');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

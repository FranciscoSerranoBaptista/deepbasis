// src/common/utils/helpers.ts

import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

/**
 * Hashes a password using bcrypt.
 * @param password The plain text password.
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compares a plain text password with a hashed password.
 * @param password The plain text password.
 * @param hash The hashed password.
 */
export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generates a JWT token.
 * @param payload The payload to include in the token.
 * @param secret The secret key to sign the token.
 * @param expiresIn The expiration time (e.g., '1h', '15m').
 */
export function generateJWT(payload: object, secret: string, expiresIn: string): string {
  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Verifies a JWT token.
 * @param token The JWT token to verify.
 * @param secret The secret key to verify the token.
 */
export function verifyJWT(token: string, secret: string): any {
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}


/**
 * Safely parses a JSON string.
 * @param str The JSON string to parse.
 * @param defaultValue The default value to return if parsing fails.
 */
export function safeJsonParse<T>(str: string, defaultValue: T): T {
  try {
    return JSON.parse(str) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Generates a UUID.
 */
export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    /* eslint-disable */
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    /* eslint-enable */
    return v.toString(16);
  });
}

// Add other helper functions as needed

const crypto = require('crypto');

class EncryptionService {
  /**
   * Generate a shared key from user IDs
   * Must match frontend key derivation
   */
  static generateSharedKey(senderId, receiverId) {
    const salt = process.env.ENCRYPTION_SALT || process.env.JWT_SECRET || 'default-salt';
    const keyMaterial = `${senderId}:${receiverId}:${salt}`;
    console.log('🔑 Backend generating key with material:', keyMaterial.substring(0, 30) + '...');
    const key = crypto.createHash('sha256').update(keyMaterial).digest();
    console.log('✅ Backend key generated, length:', key.length);
    return key;
  }

  /**
   * Encrypt a message using AES-256-GCM
   * Must match frontend encryption
   */
  static encrypt(text, senderId, receiverId) {
    try {
      console.log('🔐 Backend encrypting for:', { senderId, receiverId });
      
      const key = this.generateSharedKey(senderId, receiverId);
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-gcm', key, iv, { authTagLength: 16 });
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const authTag = cipher.getAuthTag();
      
      const result = {
        encrypted,
        iv: iv.toString('hex'),
        salt: null,
        authTag: authTag.toString('hex'),
      };
      
      console.log('✅ Backend encryption complete');
      return result;
    } catch (error) {
      console.error('Backend encryption error:', error);
      throw new Error('Failed to encrypt message');
    }
  }

  /**
   * Decrypt a message using AES-256-GCM
   * Must match frontend decryption
   */
  static decrypt(encryptedData, senderId, receiverId) {
    try {
      console.log('🔓 Backend decrypting for:', { senderId, receiverId });
      
      const { encrypted, iv, authTag } = encryptedData;
      const key = this.generateSharedKey(senderId, receiverId);
      
      const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        key,
        Buffer.from(iv, 'hex'),
        { authTagLength: 16 }
      );
      decipher.setAuthTag(Buffer.from(authTag, 'hex'));
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      console.log('✅ Backend decryption complete');
      return decrypted;
    } catch (error) {
      console.error('Backend decryption error:', error);
      return '[Decryption failed]';
    }
  }

  /**
   * Alias for generateSharedKey - for backward compatibility
   */
  static deriveKey(keyMaterial) {
    console.log('🔑 Backend deriving key from material');
    // If keyMaterial is a string, use it directly
    if (typeof keyMaterial === 'string') {
      const key = crypto.createHash('sha256').update(keyMaterial).digest();
      console.log('✅ Backend key derived, length:', key.length);
      return key;
    }
    // If it's already a buffer, return it
    if (Buffer.isBuffer(keyMaterial)) {
      return keyMaterial;
    }
    // Fallback
    const key = crypto.createHash('sha256').update(String(keyMaterial)).digest();
    console.log('✅ Backend key derived (fallback), length:', key.length);
    return key;
  }

  /**
   * Encrypt with a custom key
   */
  static encryptWithKey(text, key) {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-gcm', key, iv, { authTagLength: 16 });
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const authTag = cipher.getAuthTag();
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        salt: null,
        authTag: authTag.toString('hex'),
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt message');
    }
  }

  /**
   * Decrypt with a custom key
   */
  static decryptWithKey(encryptedData, key) {
    try {
      const { encrypted, iv, authTag } = encryptedData;
      
      const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        key,
        Buffer.from(iv, 'hex'),
        { authTagLength: 16 }
      );
      decipher.setAuthTag(Buffer.from(authTag, 'hex'));
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      return '[Decryption failed]';
    }
  }
}

module.exports = EncryptionService;
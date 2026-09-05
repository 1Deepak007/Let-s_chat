/**
 * Encryption utilities using Web Crypto API
 * Must match backend encryption (AES-256-GCM)
 */

// Convert hex string to ArrayBuffer
const hexToBuffer = (hex) => {
  if (!hex) return new ArrayBuffer(0);
  // Remove any whitespace or newlines
  hex = hex.trim();
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes.buffer;
};

// Convert ArrayBuffer to hex string
const bufferToHex = (buffer) => {
  if (!buffer) return '';
  const bytes = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
};

// Convert string to ArrayBuffer
const stringToBuffer = (str) => {
  return new TextEncoder().encode(str);
};

// Convert ArrayBuffer to string
const bufferToString = (buffer) => {
  return new TextDecoder().decode(buffer);
};

/**
 * Generate a shared secret key from user IDs
 * MUST match backend's key derivation
 */
export const generateSharedKey = async (senderId, receiverId) => {
  // Backend uses: `${senderId}:${receiverId}:${process.env.JWT_SECRET}`
  const salt = import.meta.env.VITE_ENCRYPTION_SALT || 'default-salt';
  const keyMaterial = `${senderId}:${receiverId}:${salt}`;
  
  console.log('🔑 Generating key with material:', keyMaterial.substring(0, 30) + '...');
  
  const encoder = new TextEncoder();
  const keyData = encoder.encode(keyMaterial);
  
  // Use SHA-256 to derive a 32-byte key (matching backend)
  const hash = await crypto.subtle.digest('SHA-256', keyData);
  console.log('✅ Key generated, length:', hash.byteLength);
  
  return hash;
};

/**
 * Derive AES key from shared secret
 */
export const deriveAESKey = async (sharedSecret) => {
  return crypto.subtle.importKey(
    'raw',
    sharedSecret,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
};

/**
 * Encrypt a message using AES-256-GCM
 * MUST match backend encryption method
 */
export const encryptMessage = async (text, senderId, receiverId) => {
  try {
    if (!text || !text.trim()) {
      return null;
    }

    console.log('🔐 Encrypting message for:', { senderId, receiverId });
    console.log('📝 Text to encrypt:', text);

    // Generate shared key
    const sharedSecret = await generateSharedKey(senderId, receiverId);
    const key = await deriveAESKey(sharedSecret);
    
    // Generate random IV (16 bytes for GCM)
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const ivHex = bufferToHex(iv.buffer);
    
    // Encrypt the message with GCM
    const encodedText = new TextEncoder().encode(text);
    console.log('📏 Encoded text length:', encodedText.length);
    
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128,
      },
      key,
      encodedText
    );
    
    console.log('📏 Encrypted buffer length:', encrypted.byteLength);
    
    // The encrypted data includes the auth tag at the end
    const encryptedBuffer = new Uint8Array(encrypted);
    const dataLength = encryptedBuffer.length - 16;
    const encryptedData = encryptedBuffer.slice(0, dataLength);
    const authTag = encryptedBuffer.slice(dataLength);
    
    console.log('📏 Encrypted data length:', encryptedData.length);
    console.log('📏 Auth tag length:', authTag.length);
    
    const result = {
      encrypted: bufferToHex(encryptedData.buffer),
      iv: ivHex,
      salt: null,
      authTag: bufferToHex(authTag.buffer),
    };
    
    console.log('✅ Message encrypted, result:', {
      encryptedLength: result.encrypted.length,
      ivLength: result.iv.length,
      authTagLength: result.authTag.length,
    });
    
    return result;
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
};
/**
 * Decrypt a message using AES-256-GCM
 * MUST match backend decryption method
 */
export const decryptMessage = async (encryptedData, senderId, receiverId) => {
  try {
    if (!encryptedData || !encryptedData.encrypted) {
      console.warn('⚠️ No encrypted data to decrypt');
      return null;
    }

    console.log('🔓 Decrypting message for:', { senderId, receiverId });
    console.log('📦 Encrypted data:', {
      encryptedLength: encryptedData.encrypted?.length || 0,
      ivLength: encryptedData.iv?.length || 0,
      authTagLength: encryptedData.authTag?.length || 0,
    });

    // Check if all required fields exist
    if (!encryptedData.encrypted || !encryptedData.iv || !encryptedData.authTag) {
      console.error('❌ Missing required fields in encrypted data');
      return '🔒 [Invalid encrypted data]';
    }

    // Generate shared key
    const sharedSecret = await generateSharedKey(senderId, receiverId);
    const key = await deriveAESKey(sharedSecret);
    
    // Convert hex to buffers
    const encryptedBuffer = hexToBuffer(encryptedData.encrypted);
    const ivBuffer = hexToBuffer(encryptedData.iv);
    const authTagBuffer = hexToBuffer(encryptedData.authTag);
    
    console.log('📊 Buffer sizes:', {
      encryptedBuffer: encryptedBuffer.byteLength,
      ivBuffer: ivBuffer.byteLength,
      authTagBuffer: authTagBuffer.byteLength,
    });

    // Combine encrypted data and auth tag (backend separates them)
    const combinedBuffer = new Uint8Array(
      encryptedBuffer.byteLength + authTagBuffer.byteLength
    );
    combinedBuffer.set(new Uint8Array(encryptedBuffer), 0);
    combinedBuffer.set(new Uint8Array(authTagBuffer), encryptedBuffer.byteLength);
    
    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBuffer,
        tagLength: 128,
      },
      key,
      combinedBuffer
    );
    
    const result = new TextDecoder().decode(decrypted);
    console.log('✅ Message decrypted successfully');
    return result;
  } catch (error) {
    console.error('❌ Decryption error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
    });
    // Return a fallback message instead of throwing
    return '🔒 [Encrypted message]';
  }
};

/**
 * Test function to verify encryption/decryption works
 */
export const testEncryption = async (text, senderId, receiverId) => {
  try {
    console.log('🧪 Testing encryption...');
    const encrypted = await encryptMessage(text, senderId, receiverId);
    console.log('📦 Encrypted:', encrypted);
    
    const decrypted = await decryptMessage(encrypted, senderId, receiverId);
    console.log('📝 Decrypted:', decrypted);
    
    const success = decrypted === text;
    console.log('✅ Test result:', success ? 'SUCCESS' : 'FAILED');
    return { success, encrypted, decrypted };
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error };
  }
};
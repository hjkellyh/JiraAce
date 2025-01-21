// Derive a cryptographic key from a passphrase
export async function deriveKey(passphrase) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode(passphrase),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: enc.encode("some-salt"), // Use a constant salt
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
}

// Encrypt data
export async function encryptData(key, data) {
    const encoded = new TextEncoder().encode(data);
    const iv = crypto.getRandomValues(new Uint8Array(12)); // Initialization vector
    const encrypted = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        key,
        encoded
    );
    return { iv: Array.from(iv), data: Array.from(new Uint8Array(encrypted)) };
}

// Decrypt data
export async function decryptData(key, encryptedData) {
    const { iv, data } = encryptedData;
    const decrypted = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: new Uint8Array(iv),
        },
        key,
        new Uint8Array(data)
    );
    return new TextDecoder().decode(decrypted);
}

// Function to generate a random passphrase
export function generateRandomPassphrase(length) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => ('0' + byte.toString(16)).slice(-2)).join('');
}

// Function to send a message to background.js to derive a key
export function deriveKeyInBackground(passphrase) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            { action: 'deriveKey', passphrase },
            (response) => {
                if (response.error) {
                    reject(response.error);
                } else {
                    resolve(response.key);
                }
            }
        );
    });
}

// Function to send a message to background.js to encrypt data
export function encryptDataInBackground(key, data) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            { action: 'encrypt', key, data },
            (response) => {
                if (response.error) {
                    reject(response.error);
                } else {
                    resolve(response.encryptedData);
                }
            }
        );
    });
}

// Function to send a message to background.js to decrypt data
export function decryptDataInBackground(key, encryptedData) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            { action: 'decrypt', key, encryptedData },
            (response) => {
                if (response.error) {
                    reject(response.error);
                } else {
                    resolve(response.decryptedData);
                }
            }
        );
    });
}
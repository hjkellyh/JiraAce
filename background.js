import { deriveKey, encryptData, decryptData, generateRandomPassphrase } from './crypto.js';

// Generate a random passphrase and store it in Chrome's storage
const passphrase = generateRandomPassphrase(16); // Generate a 16-byte passphrase
chrome.storage.local.set({ passphrase });
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'openOptionsPage') {
        chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
    }
});

// Handle messages from content scripts and options page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'deriveKey') {
        const { passphrase } = message;
        deriveKey(passphrase).then(key => {
            // Export the key to a format that can be sent via messaging
            return crypto.subtle.exportKey('jwk', key);
        }).then(exportedKey => {
            sendResponse({ key: exportedKey });
        }).catch(error => {
            console.error('Error deriving key:', error);
            sendResponse({ error: 'Error deriving key' });
        });
        return true; // Indicates that the response will be sent asynchronously
    } else if (message.action === 'encrypt') {
        const { key, data } = message;
        // Import the key from the JWK format
        crypto.subtle.importKey('jwk', key, { name: 'AES-GCM' }, true, ['encrypt', 'decrypt']).then(importedKey => {
            return encryptData(importedKey, data);
        }).then(encryptedData => {
            sendResponse({ encryptedData });
        }).catch(error => {
            console.error('Error encrypting data:', error);
            sendResponse({ error: 'Error encrypting data' });
        });
        return true; // Indicates that the response will be sent asynchronously
    } else if (message.action === 'decrypt') {
        const { key, encryptedData } = message;
        // Import the key from the JWK format
        crypto.subtle.importKey('jwk', key, { name: 'AES-GCM' }, true, ['encrypt', 'decrypt']).then(importedKey => {
            return decryptData(importedKey, encryptedData);
        }).then(decryptedData => {
            sendResponse({ decryptedData });
        }).catch(error => {
            console.error('Error decrypting data:', error);
            sendResponse({ error: 'Error decrypting data' });
        });
        return true; // Indicates that the response will be sent asynchronously
    }
});